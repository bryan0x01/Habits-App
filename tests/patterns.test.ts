import { describe, expect, it } from "vitest";

import { computePersonalPatterns } from "@/lib/patterns";
import type { Routine } from "@/lib/types";

const routine: Routine = {
  id: "workweek",
  name: "Workweek",
  description: "Test",
  emoji: "work",
  blocks: [
    {
      id: "focus",
      day: 1,
      title: "Focus block",
      start: "09:00",
      end: "10:00",
      category: "work",
      importance: "high",
    },
  ],
};

describe("computePersonalPatterns", () => {
  it("does not pretend to know a pattern without enough check-ins", () => {
    expect(computePersonalPatterns({
      routines: [routine],
      blockLogs: [],
      habitLogs: [],
      frictionLogs: [],
      energyLogs: [],
      flexTasks: [],
      now: new Date("2026-07-15T12:00:00"),
    })).toEqual([]);
  });

  it("explains a repeated completion window and block outcome", () => {
    const blockLogs = ["2026-07-01", "2026-07-08", "2026-07-15"].map((date, index) => ({
      id: `log-${index}`,
      blockId: "focus",
      date,
      status: "done" as const,
      createdAt: `${date}T15:00:00.000Z`,
    }));
    const patterns = computePersonalPatterns({
      routines: [routine],
      blockLogs,
      habitLogs: [],
      frictionLogs: [],
      energyLogs: [],
      flexTasks: [],
      now: new Date("2026-07-15T12:00:00"),
    });

    expect(patterns.map((pattern) => pattern.id)).toEqual(["time", "repeat"]);
    expect(patterns[0].evidence).toContain("3 completed blocks");
    expect(patterns[1].evidence).toContain("3 done");
  });

  it("turns repeated friction into one specific adjustment", () => {
    const patterns = computePersonalPatterns({
      routines: [routine],
      blockLogs: [],
      habitLogs: [],
      energyLogs: [],
      flexTasks: [],
      now: new Date("2026-07-15T12:00:00"),
      frictionLogs: [
        { id: "f1", date: "2026-07-14", taskTitle: "Focus", taskType: "block", reason: "no-start", createdAt: "x" },
        { id: "f2", date: "2026-07-15", taskTitle: "Focus", taskType: "block", reason: "no-start", createdAt: "y" },
      ],
    });

    expect(patterns[0]).toMatchObject({ id: "friction", confidence: "early" });
    expect(patterns[0].suggestion).toContain("first step");
  });
});
