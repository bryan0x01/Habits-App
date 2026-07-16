/**
 * Pure reminder-matching logic for the send-reminders edge function.
 *
 * Kept free of Deno/npm imports so the Vitest suite can regression-test it
 * (see tests/reminder-matcher.test.ts) even though the function itself runs
 * on Deno.
 *
 * Design notes:
 * - The cron fires roughly every minute, but cold starts, retries, or a
 *   skipped tick must not silently drop a reminder. Instead of demanding an
 *   exact minute match, a reminder is "due" for a short catch-up window after
 *   its target time. The notification_deliveries primary key already
 *   deduplicates, so firing checks inside the window can never double-send.
 * - All math happens on a minutes-of-week circle (0..10079) so a reminder for
 *   an early-morning block correctly lands late the previous evening
 *   (e.g. 00:05 block with a 15-minute lead → Sunday 23:50 for a Monday
 *   block) instead of never firing.
 */

export interface ReminderBlock {
  day: number;
  start: string;
  notificationMinutesBefore?: unknown;
}

export interface LocalInstant {
  /** 0 = Sunday … 6 = Saturday, in the subscriber's timezone. */
  weekday: number;
  /** Minutes since local midnight. */
  minutes: number;
}

export interface ReminderMatch {
  /** Whole minutes elapsed since the reminder target (0 = exactly due). */
  minutesLate: number;
  /** Signed whole minutes from this cron run to the block's real start. */
  minutesUntilStart: number;
}

/** How many minutes after the target a reminder may still fire. */
export const CATCH_UP_WINDOW_MINUTES = 3;

const WEEK_MINUTES = 7 * 24 * 60;
const MAX_LEAD_MINUTES = 24 * 60;

/** Normalize a (day, minutes) pair onto the 0..10079 minutes-of-week circle. */
function weekMinutes(day: number, minutes: number): number {
  const raw = day * 1440 + minutes;
  return ((raw % WEEK_MINUTES) + WEEK_MINUTES) % WEEK_MINUTES;
}

/** Parse "HH:mm"; returns null on anything malformed. */
function startMinutes(start: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(start));
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * Whether a block's reminder is due at the given local instant: the target
 * (start − lead, wrapped across midnight/week) was now or within the last
 * `windowMinutes` minutes.
 */
export function matchReminder(
  block: ReminderBlock,
  local: LocalInstant,
  windowMinutes: number = CATCH_UP_WINDOW_MINUTES,
): ReminderMatch | null {
  const lead = block.notificationMinutesBefore;
  if (
    typeof lead !== "number" ||
    !Number.isFinite(lead) ||
    !Number.isInteger(lead) ||
    lead <= 0 ||
    lead > MAX_LEAD_MINUTES
  ) {
    return null;
  }
  if (!Number.isInteger(block.day) || block.day < 0 || block.day > 6) return null;
  if (!Number.isInteger(windowMinutes) || windowMinutes <= 0) return null;
  if (
    !Number.isInteger(local.weekday) ||
    local.weekday < 0 ||
    local.weekday > 6 ||
    !Number.isInteger(local.minutes) ||
    local.minutes < 0 ||
    local.minutes >= 24 * 60
  ) {
    return null;
  }

  const start = startMinutes(block.start);
  if (start === null) return null;

  const target = weekMinutes(block.day, start - lead);
  const now = weekMinutes(local.weekday, local.minutes);
  const minutesSinceTarget = (now - target + WEEK_MINUTES) % WEEK_MINUTES;
  return minutesSinceTarget < windowMinutes
    ? {
        minutesLate: minutesSinceTarget,
        minutesUntilStart: lead - minutesSinceTarget,
      }
    : null;
}

export function reminderDue(
  block: ReminderBlock,
  local: LocalInstant,
  windowMinutes: number = CATCH_UP_WINDOW_MINUTES,
): boolean {
  return matchReminder(block, local, windowMinutes) !== null;
}
