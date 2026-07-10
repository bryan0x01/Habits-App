import { format, getDay, parse } from "date-fns";
import type { Weekday } from "@/lib/types";

/** Canonical yyyy-MM-dd key used for all date-scoped logs. */
export function dateKey(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

export function weekdayOf(date: Date = new Date()): Weekday {
  return getDay(date) as Weekday;
}

/** "HH:mm" -> minutes since midnight. */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Minutes since midnight for the given moment. */
export function minutesNow(date: Date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** "07:00" -> "7:00 AM" */
export function prettyTime(hhmm: string): string {
  const parsed = parse(hhmm, "HH:mm", new Date());
  return format(parsed, "h:mm a");
}

export function timeRange(start: string, end: string): string {
  return `${prettyTime(start)} – ${prettyTime(end)}`;
}

/** Whole minutes between two "HH:mm" times (end assumed same day). */
export function durationMinutes(start: string, end: string): number {
  return Math.max(0, toMinutes(end) - toMinutes(start));
}

export function humanDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function greeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Winding down";
}

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

/** Week order starting Monday, for review/routine grids. */
export const WEEK_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

export function longDate(date: Date = new Date()): string {
  return format(date, "EEEE, MMMM d");
}
