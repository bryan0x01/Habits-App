import type { Habit } from "@/lib/types";

/**
 * Seeded, ADHD-friendly default habits. Small, forgiving, mostly daily.
 * `minimum: true` marks the non-negotiables that make a "Day saved".
 */
export const DEFAULT_HABITS: Habit[] = [
  { id: "habit-fuel", name: "Water + first meal", emoji: "fuel", cadence: "daily", category: "body", minimum: true, tinyStart: "Take one sip and choose the easiest food." },
  { id: "habit-care", name: "Basic care", emoji: "care", cadence: "daily", category: "body", minimum: true, tinyStart: "Start the smallest care step." },
  { id: "habit-focus", name: "Start one focus block", emoji: "focus", cadence: "weekdays", category: "career", minimum: true, tinyStart: "Open the task and work for two minutes." },
  { id: "habit-move", name: "Move for 10 minutes", emoji: "move", cadence: "daily", category: "body", tinyStart: "Stand up, stretch, or put shoes on." },
  { id: "habit-reset", name: "Reset one small space", emoji: "reset", cadence: "daily", category: "home", tinyStart: "Clear one surface for two minutes." },
  { id: "habit-tomorrow", name: "Prepare tomorrow", emoji: "tomorrow", cadence: "daily", category: "home", minimum: true, tinyStart: "Put one needed item where you will see it." },
  { id: "habit-wind-down", name: "Start winding down", emoji: "sleep", cadence: "daily", category: "sleep", tinyStart: "Lower one light and put the phone farther away." },
  { id: "habit-money", name: "Money check-in", emoji: "money", cadence: "weekly", category: "money", tinyStart: "Open the balance and notice — no fixing required." },
];
