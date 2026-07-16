import { subDays } from "date-fns";

import { dateKey } from "@/lib/time";
import type {
  BlockLog,
  EnergyLog,
  FlexTask,
  FrictionLog,
  HabitLog,
  Routine,
} from "@/lib/types";

export interface PersonalPattern {
  id: "time" | "friction" | "repeat" | "task-size" | "energy";
  title: string;
  evidence: string;
  suggestion: string;
  confidence: "early" | "steady";
}

const FRICTION_ADJUSTMENT: Record<FrictionLog["reason"], string> = {
  "too-tired": "Move one demanding block earlier or give it a 10-minute version.",
  forgot: "Add one reminder to the item that is easiest to miss.",
  "too-late": "Leave a little more space before the block that keeps starting late.",
  "no-start": "Write a first step that can be done without deciding anything else.",
  social: "Keep one open block on days that already have plans.",
  "no-food": "Put an easy meal or snack before the part of the day that drops off.",
  other: "Change one repeated point of friction and watch what happens next week.",
};

function withinWindow(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

function timeBand(hour: number): { key: string; label: string } {
  if (hour < 11) return { key: "morning", label: "before 11 AM" };
  if (hour < 15) return { key: "midday", label: "between 11 AM and 3 PM" };
  if (hour < 19) return { key: "afternoon", label: "between 3 PM and 7 PM" };
  return { key: "evening", label: "after 7 PM" };
}

function confidence(sample: number): PersonalPattern["confidence"] {
  return sample >= 7 ? "steady" : "early";
}

/**
 * Transparent, on-device adaptation from explicit check-ins. These are observed
 * correlations, never medical conclusions or silent schedule changes.
 */
export function computePersonalPatterns(params: {
  routines: Routine[];
  blockLogs: BlockLog[];
  habitLogs: HabitLog[];
  frictionLogs: FrictionLog[];
  energyLogs: EnergyLog[];
  flexTasks: FlexTask[];
  now: Date;
}): PersonalPattern[] {
  const { routines, blockLogs, habitLogs, frictionLogs, energyLogs, flexTasks, now } = params;
  const start = dateKey(subDays(now, 27));
  const end = dateKey(now);
  const recentBlockLogs = blockLogs.filter((log) => withinWindow(log.date, start, end));
  const recentHabitLogs = habitLogs.filter((log) => withinWindow(log.date, start, end));
  const blockById = new Map(routines.flatMap((routine) => routine.blocks).map((block) => [block.id, block]));
  const patterns: PersonalPattern[] = [];

  const bandCounts = new Map<string, { label: string; count: number }>();
  for (const log of recentBlockLogs) {
    if (log.status !== "done") continue;
    const block = blockById.get(log.blockId);
    if (!block) continue;
    const band = timeBand(Number(block.start.slice(0, 2)));
    const current = bandCounts.get(band.key) ?? { label: band.label, count: 0 };
    current.count += 1;
    bandCounts.set(band.key, current);
  }
  const strongestBand = [...bandCounts.values()].sort((a, b) => b.count - a.count)[0];
  if (strongestBand && strongestBand.count >= 3) {
    patterns.push({
      id: "time",
      title: "Your completed blocks cluster at a certain time",
      evidence: `${strongestBand.count} completed blocks happened ${strongestBand.label}.`,
      suggestion: "Try placing one important block in that window and see if the pattern holds.",
      confidence: confidence(strongestBand.count),
    });
  }

  const frictionCounts = new Map<FrictionLog["reason"], number>();
  for (const log of frictionLogs) {
    if (!withinWindow(log.date, start, end)) continue;
    frictionCounts.set(log.reason, (frictionCounts.get(log.reason) ?? 0) + 1);
  }
  const topFriction = [...frictionCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topFriction && topFriction[1] >= 2) {
    patterns.push({
      id: "friction",
      title: "One obstacle is showing up more than once",
      evidence: `${topFriction[1]} check-ins named the same kind of friction.`,
      suggestion: FRICTION_ADJUSTMENT[topFriction[0]],
      confidence: confidence(topFriction[1]),
    });
  }

  const outcomesByBlock = new Map<string, { done: number; skipped: number }>();
  for (const log of recentBlockLogs) {
    const outcome = outcomesByBlock.get(log.blockId) ?? { done: 0, skipped: 0 };
    outcome[log.status === "done" ? "done" : "skipped"] += 1;
    outcomesByBlock.set(log.blockId, outcome);
  }
  const repeated = [...outcomesByBlock.entries()]
    .map(([blockId, outcome]) => ({ block: blockById.get(blockId), ...outcome }))
    .filter((item) => item.block && item.done + item.skipped >= 3)
    .sort((a, b) => b.done + b.skipped - (a.done + a.skipped))[0];
  if (repeated?.block) {
    const total = repeated.done + repeated.skipped;
    const mostlyDone = repeated.done / total >= 0.7;
    patterns.push({
      id: "repeat",
      title: mostlyDone ? "One block is holding up well" : "One block may need a different shape",
      evidence: `${repeated.block.title}: ${repeated.done} done and ${repeated.skipped} skipped.`,
      suggestion: mostlyDone
        ? "Keep its time and first step stable for another week."
        : "Try shortening it, moving it, or changing only its first step.",
      confidence: confidence(total),
    });
  }

  const completedTasks = flexTasks
    .filter((task) => task.done && withinWindow(task.date, start, end))
    .map((task) => task.durationMinutes)
    .sort((a, b) => a - b);
  if (patterns.length < 3 && completedTasks.length >= 3) {
    const median = completedTasks[Math.floor(completedTasks.length / 2)];
    patterns.push({
      id: "task-size",
      title: "A task size is working for loose ends",
      evidence: `The middle completed task was about ${median} minutes.`,
      suggestion: `When a task feels vague, try making the next piece about ${median} minutes.`,
      confidence: confidence(completedTasks.length),
    });
  }

  if (patterns.length < 3) {
    const energyByDate = new Map(
      energyLogs.filter((log) => withinWindow(log.date, start, end)).map((log) => [log.date, log.mode]),
    );
    const outcomeByEnergy = new Map<string, { done: number; total: number }>();
    for (const log of [...recentBlockLogs, ...recentHabitLogs]) {
      const mode = energyByDate.get(log.date);
      if (!mode) continue;
      const outcome = outcomeByEnergy.get(mode) ?? { done: 0, total: 0 };
      outcome.total += 1;
      if (log.status === "done") outcome.done += 1;
      outcomeByEnergy.set(mode, outcome);
    }
    const lowEnergy = ["low", "chaos"]
      .map((mode) => outcomeByEnergy.get(mode))
      .filter((value): value is { done: number; total: number } => Boolean(value))
      .reduce((sum, value) => ({ done: sum.done + value.done, total: sum.total + value.total }), { done: 0, total: 0 });
    if (lowEnergy.total >= 4) {
      const rate = Math.round((lowEnergy.done / lowEnergy.total) * 100);
      patterns.push({
        id: "energy",
        title: "Very-low-energy days have their own pace",
        evidence: `${rate}% of checked items were completed on those days.`,
        suggestion: rate >= 60
          ? "Your lighter plan is still moving. Keep the basics small and visible."
          : "Start those days with one basic task and leave the rest optional.",
        confidence: confidence(lowEnergy.total),
      });
    }
  }

  return patterns.slice(0, 3);
}
