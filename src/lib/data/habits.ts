import type { Habit } from "@/lib/types";

/**
 * Seeded, ADHD-friendly default habits. Small, forgiving, mostly daily.
 * `minimum: true` marks the non-negotiables that make a "Day saved".
 */
export const DEFAULT_HABITS: Habit[] = [
  { id: "habit-gym", name: "Gym or cardio", emoji: "🏋️", cadence: "daily", category: "body", minimum: true, tinyStart: "Put your gym clothes on." },
  { id: "habit-shower", name: "Shower", emoji: "🚿", cadence: "daily", category: "body", minimum: true, tinyStart: "Just start the water." },
  { id: "habit-skincare-am", name: "Skincare AM", emoji: "🧴", cadence: "daily", category: "body", tinyStart: "Splash water, then moisturizer." },
  { id: "habit-skincare-pm", name: "Skincare PM", emoji: "🌙", cadence: "daily", category: "body", tinyStart: "Just wash your face." },
  { id: "habit-review", name: "Review tasks & emails", emoji: "📥", cadence: "daily", category: "career", minimum: true, tinyStart: "Open your inbox, scan the top 5." },
  { id: "habit-study", name: "Study at least 1 hour", emoji: "📖", cadence: "daily", category: "school", minimum: true, tinyStart: "Open your notes, read one page." },
  { id: "habit-english", name: "English practice", emoji: "🗣️", cadence: "daily", category: "school", tinyStart: "One lesson or 10 minutes." },
  { id: "habit-read", name: "Read", emoji: "📚", cadence: "daily", category: "home", tinyStart: "Read one page." },
  { id: "habit-clean", name: "Clean 10 minutes", emoji: "🧹", cadence: "daily", category: "home", tinyStart: "Set a 10-minute timer." },
  { id: "habit-breakfast", name: "Prepare breakfast", emoji: "🍳", cadence: "daily", category: "home", tinyStart: "Grab something quick and easy." },
  { id: "habit-spending", name: "Spending check", emoji: "💰", cadence: "daily", category: "money", tinyStart: "Open your banking app." },
];
