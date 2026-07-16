import { describe, expect, it } from "vitest";

import { computeWeeklyReview, weekKeyOf } from "@/lib/review";
import type { FrictionLog } from "@/lib/types";
import { application, block, blockLog, habit, habitLog, routine } from "./fixtures";

const thursday = new Date(2026, 6, 9, 12);

describe("weekly review", () => {
  it("uses Monday as the week key", () => {
    expect(weekKeyOf(thursday)).toBe("2026-07-06");
    expect(weekKeyOf(new Date(2026, 6, 12, 12))).toBe("2026-07-06");
  });

  it("aggregates distinct habit days, project blocks, applications, and best day", () => {
    const project = block("project-1", "09:00", "10:00", "high", { category: "project" });
    const data = computeWeeklyReview({
      now: thursday,
      habits: [habit("habit-move"), habit("habit-focus"), habit("habit-wind-down")],
      routines: [routine([project])],
      habitLogs: [
        habitLog("habit-move", "2026-07-06"),
        habitLog("habit-move", "2026-07-06"),
        habitLog("habit-move", "2026-07-07"),
        habitLog("habit-focus", "2026-07-06"),
        habitLog("habit-read", "2026-07-01"),
      ],
      blockLogs: [blockLog("project-1", "2026-07-06")],
      applications: [application({ appliedOn: "2026-07-08" })],
      frictionLogs: [],
    });

    expect(data.dayMetrics.find((metric) => metric.key === "habit-move")?.done).toBe(2);
    expect(data.projectBlocks).toBe(1);
    expect(data.applicationsSent).toBe(1);
    expect(data.bestDay).toEqual({ weekday: 1, wins: 4 });
    expect(data.activeDays).toBe(2);
    expect(data.totalWins).toBe(5);
  });

  it("prioritizes actionable suggestions", () => {
    const base = {
      now: thursday,
      habits: [habit("habit-reset", { name: "Reset one space" })],
      routines: [],
      habitLogs: [],
      blockLogs: [],
      frictionLogs: [] as FrictionLog[],
    };
    const noApps = computeWeeklyReview({ ...base, applications: [] });
    expect(noApps.suggestion).toContain("Put the first step for Reset one space");

    const friction = (id: string, date: string): FrictionLog => ({
      id,
      date,
      taskTitle: "Study",
      taskType: "habit",
      reason: "too-tired",
      createdAt: `${date}T12:00:00Z`,
    });
    const repeatedFriction = computeWeeklyReview({
      ...base,
      applications: [application({ appliedOn: "2026-07-08" })],
      frictionLogs: [friction("one", "2026-07-07"), friction("two", "2026-07-08")],
    });
    expect(repeatedFriction.suggestion).toContain("hardest task earlier");
    expect(repeatedFriction.topFriction[0]).toEqual({ reason: "too-tired", count: 2 });
  });
});
