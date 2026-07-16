import { addDays, startOfWeek } from "date-fns";

import { applicationsSentThisWeek } from "@/lib/applications";
import { isHabitDueOn } from "@/lib/habits";
import { dateKey, weekdayOf } from "@/lib/time";
import type {
  Application,
  BlockLog,
  FrictionLog,
  FrictionReason,
  HabitLog,
  Habit,
  Routine,
  Weekday,
} from "@/lib/types";

const WEEK_OPTS = { weekStartsOn: 1 as const };

export interface ReviewMetric {
  key: string;
  label: string;
  icon: string;
  done: number;
  total: number;
}

export interface WeeklyReviewData {
  weekKey: string;
  dayMetrics: ReviewMetric[];
  applicationsSent: number;
  projectBlocks: number;
  topFriction: { reason: FrictionReason; count: number }[];
  bestDay: { weekday: Weekday; wins: number } | null;
  suggestion: string;
  totalWins: number;
  activeDays: number;
}

const FRICTION_SUGGESTION: Record<FrictionReason, string> = {
  "too-tired": "“Too tired” came up most. Move your hardest block earlier, when energy is higher.",
  forgot: "“Forgot” led the week. Set one reminder for your keystone block.",
  "too-late": "“Too late” was common. Shift start times 15 minutes earlier to buy a buffer.",
  "no-start": "“Didn't know where to start” topped the list. Lean on tiny starts — the 2-minute version.",
  social: "Social plans pulled focus. Pre-decide which blocks flex around them.",
  "no-food": "“No food” showed up. Prep one grab-and-go breakfast the night before.",
  other: "Notice what keeps getting in the way — one small tweak next week can unlock it.",
};

/** Monday's yyyy-MM-dd for the week containing `date`. */
export function weekKeyOf(date: Date): string {
  return dateKey(startOfWeek(date, WEEK_OPTS));
}

export function computeWeeklyReview(params: {
  habits: Habit[];
  habitLogs: HabitLog[];
  routines: Routine[];
  blockLogs: BlockLog[];
  applications: Application[];
  frictionLogs: FrictionLog[];
  now: Date;
}): WeeklyReviewData {
  const { habits, habitLogs, routines, blockLogs, applications, frictionLogs, now } = params;
  const weekStart = startOfWeek(now, WEEK_OPTS);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    return { key: dateKey(d), weekday: weekdayOf(d) };
  });
  const keySet = new Set(days.map((d) => d.key));

  // Distinct done-days per habit within the week.
  const doneDays = (habitId: string) => {
    const dates = new Set<string>();
    for (const l of habitLogs) {
      if (l.habitId === habitId && l.status === "done" && keySet.has(l.date)) {
        dates.add(l.date);
      }
    }
    return dates.size;
  };

  const metricHabits = [...habits]
    .sort((a, b) => Number(Boolean(b.minimum)) - Number(Boolean(a.minimum)))
    .slice(0, 5);
  const dayMetrics: ReviewMetric[] = metricHabits.map((habit) => ({
    key: habit.id,
    label: habit.name,
    icon: habit.emoji || habit.category,
    done: doneDays(habit.id),
    total: days.filter((day) => isHabitDueOn(habit, day.weekday)).length,
  }));

  // Project blocks completed this week (across all routines).
  const blockById = new Map<string, Routine["blocks"][number]>();
  for (const r of routines) for (const b of r.blocks) blockById.set(b.id, b);
  const projectBlocks = blockLogs.filter((l) => {
    if (l.status !== "done" || !keySet.has(l.date)) return false;
    const block = blockById.get(l.blockId);
    return block?.category === "project";
  }).length;

  const applicationsSent = applicationsSentThisWeek(applications, now);

  // Friction tally.
  const frictionCounts = new Map<FrictionReason, number>();
  for (const l of frictionLogs) {
    if (keySet.has(l.date)) {
      frictionCounts.set(l.reason, (frictionCounts.get(l.reason) ?? 0) + 1);
    }
  }
  const topFriction = [...frictionCounts.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);

  // Wins per day → best day + active days.
  const winsByDate = new Map<string, number>();
  const bump = (date: string) => winsByDate.set(date, (winsByDate.get(date) ?? 0) + 1);
  for (const l of habitLogs) if (l.status === "done" && keySet.has(l.date)) bump(l.date);
  for (const l of blockLogs) if (l.status === "done" && keySet.has(l.date)) bump(l.date);

  let bestDay: WeeklyReviewData["bestDay"] = null;
  let totalWins = 0;
  let activeDays = 0;
  for (const d of days) {
    const wins = winsByDate.get(d.key) ?? 0;
    totalWins += wins;
    if (wins > 0) activeDays += 1;
    if (wins > 0 && (!bestDay || wins > bestDay.wins)) {
      bestDay = { weekday: d.weekday, wins };
    }
  }

  return {
    weekKey: dateKey(weekStart),
    dayMetrics,
    applicationsSent,
    projectBlocks,
    topFriction,
    bestDay,
    suggestion: buildSuggestion({
      dayMetrics,
      applicationsSent,
      tracksApplications: applications.length > 0,
      topFriction,
    }),
    totalWins,
    activeDays,
  };
}

function buildSuggestion({
  dayMetrics,
  applicationsSent,
  tracksApplications,
  topFriction,
}: {
  dayMetrics: ReviewMetric[];
  applicationsSent: number;
  tracksApplications: boolean;
  topFriction: { reason: FrictionReason; count: number }[];
}): string {
  if (tracksApplications && applicationsSent === 0) {
    return "No applications went out this week. Next week, aim for just one — open a saved role and apply.";
  }
  if (topFriction[0] && topFriction[0].count >= 2) {
    return FRICTION_SUGGESTION[topFriction[0].reason];
  }
  const lowest = [...dayMetrics].sort((a, b) => a.done - b.done)[0];
  if (lowest && lowest.done <= 2) {
    return `${lowest.label} happened ${lowest.done} day${lowest.done === 1 ? "" : "s"}. Make its first step visible and aim for one more day — not a perfect week.`;
  }
  return "You kept a steady shape this week. Same rhythm next week — it's working.";
}
