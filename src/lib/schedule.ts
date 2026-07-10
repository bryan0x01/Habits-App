import { blocksForDay } from "@/lib/data/routines";
import { dateKey, minutesNow, toMinutes, weekdayOf } from "@/lib/time";
import type { BlockLog, LogStatus, Routine, RoutineBlock } from "@/lib/types";

export type BlockPhase = "past" | "now" | "upcoming";

export interface ScheduledBlock extends RoutineBlock {
  status: LogStatus | null;
  phase: BlockPhase;
  /** Non-essential block while "minimum day" is on (importance !== high). */
  optional: boolean;
  startMin: number;
  endMin: number;
}

export type DayPhase = "before" | "during" | "after" | "empty";

export interface TodayView {
  blocks: ScheduledBlock[];
  /** The block whose time window contains "now" (may already be done). */
  current: ScheduledBlock | null;
  /** What to actually do right now (active-and-unfinished, else next required). */
  focus: ScheduledBlock | null;
  /** Next upcoming block after now. */
  next: ScheduledBlock | null;
  /** Most recent important block that already ended untouched — a recovery target. */
  missed: ScheduledBlock | null;
  doneCount: number;
  skippedCount: number;
  requiredCount: number;
  remainingCount: number;
  progressPct: number;
  allDone: boolean;
  phase: DayPhase;
}

export function computeToday(
  routine: Routine,
  date: Date,
  blockLogs: BlockLog[],
  minimumDay: boolean,
): TodayView {
  const day = weekdayOf(date);
  const key = dateKey(date);
  const now = minutesNow(date);

  const statusByBlock = new Map<string, LogStatus>();
  for (const log of blockLogs) {
    if (log.date === key) statusByBlock.set(log.blockId, log.status);
  }

  const blocks: ScheduledBlock[] = blocksForDay(routine, day).map((b) => {
    const startMin = toMinutes(b.start);
    const endMin = toMinutes(b.end);
    const phase: BlockPhase =
      now < startMin ? "upcoming" : now < endMin ? "now" : "past";
    return {
      ...b,
      startMin,
      endMin,
      status: statusByBlock.get(b.id) ?? null,
      phase,
      optional: minimumDay && b.importance !== "high",
    };
  });

  const isRequired = (b: ScheduledBlock) => !b.optional;
  const isImportant = (b: ScheduledBlock) => b.importance !== "low";

  const current = blocks.find((b) => b.phase === "now") ?? null;
  const next = blocks.find((b) => b.phase === "upcoming") ?? null;

  // "Missed" = an important, required block that ended and was never acted on.
  const missed =
    [...blocks]
      .reverse()
      .find(
        (b) =>
          b.phase === "past" &&
          b.status === null &&
          isRequired(b) &&
          isImportant(b),
      ) ?? null;

  const nextRequired = blocks.find(
    (b) => b.phase === "upcoming" && isRequired(b),
  );
  let focus: ScheduledBlock | null = null;
  if (current && current.status !== "done" && isRequired(current)) {
    focus = current;
  } else {
    // Minimum Day deliberately removes optional work from the recommendation,
    // while keeping it visible in the timeline for context.
    focus = nextRequired ?? (minimumDay ? null : next) ?? null;
  }

  const required = blocks.filter(isRequired);
  const doneCount = required.filter((b) => b.status === "done").length;
  const skippedCount = required.filter((b) => b.status === "skipped").length;
  const requiredCount = required.length;
  const remainingCount = required.filter((b) => b.status !== "done").length;
  const progressPct =
    requiredCount === 0 ? 0 : Math.round((doneCount / requiredCount) * 100);
  const allDone = requiredCount > 0 && doneCount === requiredCount;

  let phase: DayPhase = "during";
  if (blocks.length === 0) {
    phase = "empty";
  } else if (now < blocks[0].startMin) {
    phase = "before";
  } else if (now >= blocks[blocks.length - 1].endMin) {
    phase = "after";
  }

  return {
    blocks,
    current,
    focus,
    next,
    missed,
    doneCount,
    skippedCount,
    requiredCount,
    remainingCount,
    progressPct,
    allDone,
    phase,
  };
}
