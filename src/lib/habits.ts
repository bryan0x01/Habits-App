import type { Habit, Weekday } from "@/lib/types";

/** Whether a habit is "due" on the given weekday, per its cadence. */
export function isHabitDueOn(habit: Habit, weekday: Weekday): boolean {
  switch (habit.cadence) {
    case "daily":
      return true;
    case "weekdays":
      return weekday >= 1 && weekday <= 5;
    case "weekends":
      return weekday === 0 || weekday === 6;
    case "weekly":
      // Not pinned to a specific day — always available to check off.
      return true;
    default:
      return true;
  }
}

export const CADENCE_LABEL: Record<Habit["cadence"], string> = {
  daily: "Every day",
  weekdays: "Weekdays",
  weekends: "Weekends",
  weekly: "Weekly",
};
