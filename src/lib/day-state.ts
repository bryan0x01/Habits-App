import { subDays } from "date-fns";
import { isHabitDueOn } from "@/lib/habits";
import { dateKey, weekdayOf } from "@/lib/time";
import type { Habit, HabitLog, Weekday } from "@/lib/types";

/**
 * Habit completion states — the emotional core of the app.
 *
 * The ladder is intentionally forgiving: doing your handful of "minimum"
 * habits already earns a "Day saved", so a rough day still counts. No streaks,
 * no punishment.
 */
export type DayState = "none" | "started" | "saved" | "strong" | "full";

/** Ratio of done/due at/above which a day is "strong". */
const STRONG_THRESHOLD = 0.7;

export interface HabitDaySummary {
  date: string;
  dueCount: number;
  doneCount: number;
  skippedCount: number;
  minimumTotal: number;
  minimumDone: number;
  ratio: number;
  state: DayState;
}

export interface DayStateCopy {
  label: string;
  emoji: string;
  microcopy: string;
}

export const DAY_STATE_COPY: Record<DayState, DayStateCopy> = {
  none: { label: "Fresh page", emoji: "✨", microcopy: "Pick one small thing. That's all it takes to start." },
  started: { label: "Moving", emoji: "🌱", microcopy: "You're on the board. Stack one more." },
  saved: { label: "Minimum saved", emoji: "🛟", microcopy: "Minimum saved. That counts — genuinely." },
  strong: { label: "Strong day", emoji: "💪", microcopy: "Strong day. You're most of the way there." },
  full: { label: "Full win", emoji: "🏆", microcopy: "Full win. Every habit done. Take the W." },
};

export function computeHabitDay(
  habits: Habit[],
  habitLogs: HabitLog[],
  date: Date = new Date(),
): HabitDaySummary {
  const key = dateKey(date);
  const weekday = weekdayOf(date);
  const due = habits.filter((h) => isHabitDueOn(h, weekday));

  const statusFor = (habitId: string) =>
    habitLogs.find((l) => l.habitId === habitId && l.date === key)?.status ?? null;

  const doneCount = due.filter((h) => statusFor(h.id) === "done").length;
  const skippedCount = due.filter((h) => statusFor(h.id) === "skipped").length;

  const minimums = due.filter((h) => h.minimum);
  const minimumTotal = minimums.length;
  const minimumDone = minimums.filter((h) => statusFor(h.id) === "done").length;

  const ratio = due.length === 0 ? 0 : doneCount / due.length;
  const minimumMet = minimumTotal > 0 && minimumDone === minimumTotal;

  let state: DayState = "none";
  if (due.length > 0 && doneCount === due.length) state = "full";
  else if (ratio >= STRONG_THRESHOLD && doneCount > 0) state = "strong";
  else if (minimumMet) state = "saved";
  else if (doneCount > 0) state = "started";

  return {
    date: key,
    dueCount: due.length,
    doneCount,
    skippedCount,
    minimumTotal,
    minimumDone,
    ratio,
    state,
  };
}

/** A day "counts" toward weekly momentum once the minimum is saved. */
export function isDayComplete(summary: HabitDaySummary): boolean {
  return summary.state === "saved" || summary.state === "strong" || summary.state === "full";
}

export interface WeeklyMomentum {
  completedDays: number;
  totalDays: number;
  days: {
    date: string;
    weekday: Weekday;
    state: DayState;
    complete: boolean;
    isToday: boolean;
  }[];
}

export function computeWeeklyMomentum(
  habits: Habit[],
  habitLogs: HabitLog[],
  today: Date = new Date(),
): WeeklyMomentum {
  const todayKey = dateKey(today);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    const summary = computeHabitDay(habits, habitLogs, d);
    return {
      date: summary.date,
      weekday: weekdayOf(d),
      state: summary.state,
      complete: isDayComplete(summary),
      isToday: summary.date === todayKey,
    };
  });

  return {
    completedDays: days.filter((d) => d.complete).length,
    totalDays: 7,
    days,
  };
}
