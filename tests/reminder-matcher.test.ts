import { describe, expect, it } from "vitest";

import {
  CATCH_UP_WINDOW_MINUTES,
  matchReminder,
  reminderDue,
} from "../supabase/functions/send-reminders/matcher";

const at = (weekday: number, hh: number, mm: number) => ({
  weekday,
  minutes: hh * 60 + mm,
});

describe("reminder matcher", () => {
  it("fires exactly at start minus lead", () => {
    const block = { day: 4, start: "15:30", notificationMinutesBefore: 15 };
    expect(reminderDue(block, at(4, 15, 15))).toBe(true);
    expect(reminderDue(block, at(4, 15, 14))).toBe(false);
  });

  it("keeps firing through the catch-up window, then stops", () => {
    const block = { day: 2, start: "09:00", notificationMinutesBefore: 10 };
    for (let late = 0; late < CATCH_UP_WINDOW_MINUTES; late++) {
      expect(reminderDue(block, at(2, 8, 50 + late))).toBe(true);
    }
    expect(reminderDue(block, at(2, 8, 50 + CATCH_UP_WINDOW_MINUTES))).toBe(false);
    expect(matchReminder(block, at(2, 8, 52))).toEqual({
      minutesLate: 2,
      minutesUntilStart: 8,
    });
  });

  it("wraps across midnight to the previous day", () => {
    // Monday 00:05 block, 15-minute lead → Sunday 23:50.
    const block = { day: 1, start: "00:05", notificationMinutesBefore: 15 };
    expect(reminderDue(block, at(0, 23, 50))).toBe(true);
    expect(reminderDue(block, at(0, 23, 52))).toBe(true); // catch-up run
    expect(reminderDue(block, at(1, 0, 5))).toBe(false); // block already started
    expect(reminderDue(block, at(1, 23, 50))).toBe(false); // wrong day
  });

  it("wraps across the week boundary", () => {
    // Sunday 00:10 block, 30-minute lead → Saturday 23:40.
    const block = { day: 0, start: "00:10", notificationMinutesBefore: 30 };
    expect(reminderDue(block, at(6, 23, 40))).toBe(true);
    expect(reminderDue(block, at(6, 23, 39))).toBe(false);
  });

  it("keeps the real block instant when catch-up crosses midnight", () => {
    // Saturday 23:59 block, 15-minute lead, cron catches up two minutes late.
    // The block still starts in 13 minutes on Saturday—not Sunday.
    const block = { day: 6, start: "23:59", notificationMinutesBefore: 15 };
    expect(matchReminder(block, at(6, 23, 46))).toEqual({
      minutesLate: 2,
      minutesUntilStart: 13,
    });
  });

  it("ignores blocks without a usable lead or start", () => {
    expect(reminderDue({ day: 1, start: "09:00" }, at(1, 8, 45))).toBe(false);
    expect(
      reminderDue({ day: 1, start: "09:00", notificationMinutesBefore: 0 }, at(1, 9, 0)),
    ).toBe(false);
    expect(
      reminderDue({ day: 1, start: "9am", notificationMinutesBefore: 10 }, at(1, 8, 50)),
    ).toBe(false);
    expect(
      reminderDue({ day: 9, start: "09:00", notificationMinutesBefore: 10 }, at(1, 8, 50)),
    ).toBe(false);
    expect(
      reminderDue({ day: 1, start: "09:00", notificationMinutesBefore: 2.5 }, at(1, 8, 57)),
    ).toBe(false);
    expect(
      reminderDue({ day: 1, start: "09:00", notificationMinutesBefore: 10 }, at(1, 8, 50), 0),
    ).toBe(false);
    expect(
      reminderDue({ day: 1, start: "09:00", notificationMinutesBefore: 1_441 }, at(0, 8, 59)),
    ).toBe(false);
    expect(
      reminderDue({ day: 1, start: "09:00", notificationMinutesBefore: 10 }, at(7, 8, 50)),
    ).toBe(false);
  });
});
