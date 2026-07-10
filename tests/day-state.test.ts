import { describe, expect, it } from "vitest";

import { computeHabitDay, computeWeeklyMomentum, isDayComplete } from "@/lib/day-state";
import { habit, habitLog } from "./fixtures";

const monday = new Date(2026, 6, 6, 12);
const habits = [
  habit("water", { minimum: true }),
  habit("meds", { minimum: true }),
  habit("read"),
  habit("walk"),
];

describe("habit day states", () => {
  it("moves from fresh to started to minimum saved", () => {
    expect(computeHabitDay(habits, [], monday).state).toBe("none");

    const started = computeHabitDay(habits, [habitLog("read", "2026-07-06")], monday);
    expect(started.state).toBe("started");
    expect(isDayComplete(started)).toBe(false);

    const saved = computeHabitDay(
      habits,
      [habitLog("water", "2026-07-06"), habitLog("meds", "2026-07-06")],
      monday,
    );
    expect(saved.state).toBe("saved");
    expect(isDayComplete(saved)).toBe(true);
  });

  it("recognizes strong and full days", () => {
    const strongLogs = ["water", "meds", "read"].map((id) => habitLog(id, "2026-07-06"));
    expect(computeHabitDay(habits, strongLogs, monday).state).toBe("strong");

    const fullLogs = [...strongLogs, habitLog("walk", "2026-07-06")];
    expect(computeHabitDay(habits, fullLogs, monday).state).toBe("full");
  });

  it("respects weekday and weekend cadence", () => {
    const scheduled = [
      habit("weekday", { cadence: "weekdays" }),
      habit("weekend", { cadence: "weekends" }),
    ];
    expect(computeHabitDay(scheduled, [], monday).dueCount).toBe(1);
    expect(computeHabitDay(scheduled, [], new Date(2026, 6, 5, 12)).dueCount).toBe(1);
  });

  it("counts completed days across a rolling seven-day window", () => {
    const oneMinimum = [habit("water", { minimum: true })];
    const logs = [
      habitLog("water", "2026-07-03"),
      habitLog("water", "2026-07-05"),
      habitLog("water", "2026-07-06"),
    ];
    const momentum = computeWeeklyMomentum(oneMinimum, logs, monday);
    expect(momentum.completedDays).toBe(3);
    expect(momentum.totalDays).toBe(7);
    expect(momentum.days.at(-1)).toMatchObject({ date: "2026-07-06", isToday: true });
  });
});
