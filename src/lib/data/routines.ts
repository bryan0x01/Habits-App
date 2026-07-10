import type {
  BlockCategory,
  Importance,
  Routine,
  RoutineBlock,
  Weekday,
} from "@/lib/types";

/**
 * Seeded routine templates. On first run these are deep-cloned into the store
 * so they become fully user-editable (rename, duplicate, add/edit/delete
 * blocks). Times are sensible defaults meant to be personalized.
 */

type BlockSeed = {
  start: string;
  end: string;
  title: string;
  category: BlockCategory;
  importance: Importance;
  tinyStart?: string;
  backup?: string;
  notify?: number;
  notes?: string;
};

function defaultNotify(importance: Importance): number | undefined {
  if (importance === "high") return 15;
  if (importance === "medium") return 10;
  return undefined;
}

function buildBlocks(
  routineId: string,
  day: Weekday,
  seeds: BlockSeed[],
): RoutineBlock[] {
  return seeds.map((s) => ({
    id: `${routineId}-${day}-${s.start.replace(":", "")}`,
    day,
    title: s.title,
    start: s.start,
    end: s.end,
    category: s.category,
    importance: s.importance,
    tinyStart: s.tinyStart,
    backup: s.backup,
    notificationMinutesBefore: s.notify ?? defaultNotify(s.importance),
    notes: s.notes,
  }));
}

/* ------------------------------------------------------------------ */
/* Charlotte routine                                                  */
/* ------------------------------------------------------------------ */

const CHARLOTTE = "charlotte";

const charlotteWorkClassDay = (day: Weekday): RoutineBlock[] =>
  buildBlocks(CHARLOTTE, day, [
    { start: "06:15", end: "07:15", title: "Gym", category: "gym", importance: "high", tinyStart: "Put your gym shoes on.", backup: "A 10-minute walk or stretch counts." },
    { start: "08:00", end: "16:30", title: "Work", category: "work", importance: "high", tinyStart: "Open your laptop and the first task.", backup: "Just clear email + one priority." },
    { start: "17:30", end: "18:45", title: "Class", category: "class", importance: "high", tinyStart: "Sit down, open the syllabus.", backup: "Show up — notes are optional." },
    { start: "19:15", end: "20:15", title: "Study", category: "study", importance: "medium", tinyStart: "Open notes, review one page.", backup: "Skim today's notes for 5 minutes." },
    { start: "20:15", end: "21:00", title: "Dinner", category: "reset", importance: "medium", tinyStart: "Pick something easy to make." },
    { start: "21:30", end: "22:00", title: "Shutdown", category: "sleep", importance: "high", tinyStart: "Write tomorrow's top 3.", backup: "Just lay out tomorrow's clothes." },
  ]);

const charlotteTuesday = (): RoutineBlock[] =>
  buildBlocks(CHARLOTTE, 2, [
    { start: "06:15", end: "07:15", title: "Gym", category: "gym", importance: "high", tinyStart: "Shoes on, water bottle filled.", backup: "10 minutes of movement is a win." },
    { start: "08:30", end: "17:15", title: "Classes", category: "class", importance: "high", tinyStart: "Pack your bag, head to the first class.", backup: "Attend the must-be-there ones." },
    { start: "17:45", end: "18:45", title: "Study", category: "study", importance: "medium", tinyStart: "Review one lecture's notes.", backup: "Read one page of notes." },
    { start: "19:15", end: "20:30", title: "Technical skills", category: "project", importance: "medium", tinyStart: "Open the editor, run one example.", backup: "Watch one short tutorial." },
    { start: "21:30", end: "22:00", title: "Shutdown", category: "sleep", importance: "high", tinyStart: "Write tomorrow's top 3." },
  ]);

const charlotteThursday = (): RoutineBlock[] =>
  buildBlocks(CHARLOTTE, 4, [
    { start: "06:15", end: "07:00", title: "Cardio", category: "gym", importance: "high", tinyStart: "Shoes on, 5-minute warm-up.", backup: "A brisk 15-minute walk." },
    { start: "08:30", end: "17:15", title: "Classes", category: "class", importance: "high", tinyStart: "Head to the first class.", backup: "Attend the must-be-there ones." },
    { start: "17:45", end: "19:00", title: "Halynt / project", category: "project", importance: "medium", tinyStart: "Open the board, pick one task.", backup: "Just review yesterday's progress." },
    { start: "19:30", end: "20:15", title: "English", category: "english", importance: "medium", tinyStart: "One lesson or 10 minutes of reading.", backup: "Watch a show in English." },
    { start: "21:30", end: "22:00", title: "Shutdown", category: "sleep", importance: "high", tinyStart: "Write tomorrow's top 3." },
  ]);

const charlotteFriday = (): RoutineBlock[] =>
  buildBlocks(CHARLOTTE, 5, [
    { start: "06:15", end: "07:15", title: "Gym", category: "gym", importance: "high", tinyStart: "Put your gym shoes on.", backup: "A short walk still counts." },
    { start: "08:00", end: "12:00", title: "Work", category: "work", importance: "high", tinyStart: "Open your laptop, first task.", backup: "Clear the essentials." },
    { start: "13:00", end: "14:30", title: "Applications", category: "applications", importance: "medium", tinyStart: "Open one saved job and apply.", backup: "Just save 3 roles for later." },
    { start: "14:45", end: "16:00", title: "Halynt", category: "project", importance: "medium", tinyStart: "Pick one project task." },
    { start: "16:15", end: "17:15", title: "Technical skills", category: "project", importance: "low", tinyStart: "One coding kata.", backup: "Watch a 10-minute tutorial." },
    { start: "19:00", end: "21:30", title: "Social", category: "social", importance: "low", tinyStart: "Text a friend to make a plan.", backup: "A short call counts." },
  ]);

const charlotteSaturday = (): RoutineBlock[] =>
  buildBlocks(CHARLOTTE, 6, [
    { start: "09:00", end: "10:00", title: "Gym", category: "gym", importance: "high", tinyStart: "Shoes on, head out.", backup: "A walk works too." },
    { start: "10:30", end: "12:30", title: "Halynt / project", category: "project", importance: "medium", tinyStart: "Open the project, one task." },
    { start: "13:30", end: "14:30", title: "Chores", category: "chores", importance: "low", tinyStart: "Set a 15-minute timer, start anywhere.", backup: "Just dishes + one laundry load." },
    { start: "15:00", end: "16:30", title: "Homework", category: "study", importance: "medium", tinyStart: "Open the assignment, read the prompt." },
    { start: "19:00", end: "22:00", title: "Social", category: "social", importance: "low", tinyStart: "Say yes to one plan." },
  ]);

const charlotteSunday = (): RoutineBlock[] =>
  buildBlocks(CHARLOTTE, 0, [
    { start: "09:00", end: "09:45", title: "Cardio", category: "gym", importance: "high", tinyStart: "Shoes on, 5-minute warm-up.", backup: "A brisk walk counts." },
    { start: "10:30", end: "11:30", title: "Reset", category: "reset", importance: "high", tinyStart: "Clear one surface, start a laundry load.", backup: "Make the bed + tidy the desk." },
    { start: "11:30", end: "12:15", title: "Planning", category: "reset", importance: "high", tinyStart: "Open the week, block your must-dos.", backup: "Just pick 3 priorities." },
    { start: "13:30", end: "14:30", title: "Applications", category: "applications", importance: "medium", tinyStart: "Apply to one role." },
    { start: "15:00", end: "16:00", title: "Reading", category: "reset", importance: "low", tinyStart: "Read one chapter.", backup: "10 minutes counts." },
    { start: "21:00", end: "21:45", title: "Shutdown", category: "sleep", importance: "high", tinyStart: "Set out tomorrow, then wind down." },
  ]);

const charlotteRoutine: Routine = {
  id: CHARLOTTE,
  name: "Charlotte",
  description: "Work + school weeks: gym, classes, study, projects, and applications.",
  emoji: "🎓",
  seeded: true,
  blocks: [
    ...charlotteWorkClassDay(1),
    ...charlotteTuesday(),
    ...charlotteWorkClassDay(3),
    ...charlotteThursday(),
    ...charlotteFriday(),
    ...charlotteSaturday(),
    ...charlotteSunday(),
  ],
};

/* ------------------------------------------------------------------ */
/* Monterrey routine                                                  */
/* ------------------------------------------------------------------ */

const MONTERREY = "monterrey";

const monterreyWeekday = (day: Weekday): RoutineBlock[] => {
  const focusIsApplications = day === 1 || day === 3 || day === 5;
  const focus: BlockSeed = focusIsApplications
    ? { start: "16:30", end: "18:00", title: "Applications", category: "applications", importance: "medium", tinyStart: "Open one saved job and apply.", backup: "Just save 3 roles for later." }
    : { start: "16:30", end: "18:00", title: "Projects", category: "project", importance: "medium", tinyStart: "Open the project, pick one task.", backup: "Review yesterday's progress." };

  return buildBlocks(MONTERREY, day, [
    { start: "07:00", end: "07:20", title: "Wake up", category: "reset", importance: "high", tinyStart: "Feet on the floor, curtains open.", backup: "Sit up and drink a glass of water." },
    { start: "07:20", end: "07:50", title: "Shower & skincare", category: "reset", importance: "high", tinyStart: "Start the shower." },
    { start: "08:15", end: "08:55", title: "Commute", category: "reset", importance: "low", tinyStart: "Grab your bag and headphones.", backup: "Queue a podcast for the ride." },
    { start: "09:00", end: "14:00", title: "CEMEX", category: "work", importance: "high", tinyStart: "Open your laptop, first task.", backup: "Focus on the one must-do deliverable." },
    { start: "14:00", end: "15:00", title: "Lunch & reset", category: "reset", importance: "medium", tinyStart: "Step away from the desk to eat." },
    { start: "15:30", end: "16:15", title: "English", category: "english", importance: "high", tinyStart: "One lesson or 10 minutes of reading.", backup: "Watch something in English." },
    focus,
    { start: "19:30", end: "20:15", title: "Dinner", category: "reset", importance: "low", tinyStart: "Keep it simple." },
    { start: "21:30", end: "22:00", title: "Shutdown", category: "sleep", importance: "high", tinyStart: "Write tomorrow's top 3.", backup: "Lay out tomorrow's clothes." },
  ]);
};

const monterreySaturday = (): RoutineBlock[] =>
  buildBlocks(MONTERREY, 6, [
    { start: "10:00", end: "11:00", title: "Gym", category: "gym", importance: "high", tinyStart: "Shoes on, head out.", backup: "A walk works too." },
    { start: "11:30", end: "12:30", title: "Chores", category: "chores", importance: "low", tinyStart: "15-minute timer, start anywhere.", backup: "Just dishes + laundry." },
    { start: "13:30", end: "15:00", title: "Project", category: "project", importance: "medium", tinyStart: "Open the project, one task." },
    { start: "15:30", end: "16:15", title: "English", category: "english", importance: "medium", tinyStart: "One lesson." },
    { start: "19:00", end: "22:00", title: "Social", category: "social", importance: "low", tinyStart: "Say yes to one plan." },
  ]);

const monterreySunday = (): RoutineBlock[] =>
  buildBlocks(MONTERREY, 0, [
    { start: "10:00", end: "11:00", title: "Reset", category: "reset", importance: "high", tinyStart: "Clear one surface + start laundry.", backup: "Make the bed + tidy the desk." },
    { start: "11:30", end: "12:15", title: "English", category: "english", importance: "medium", tinyStart: "One lesson." },
    { start: "13:00", end: "14:30", title: "Project", category: "project", importance: "medium", tinyStart: "One task moves it forward." },
    { start: "15:00", end: "15:45", title: "Planning", category: "reset", importance: "high", tinyStart: "Block the week's must-dos.", backup: "Pick 3 priorities." },
    { start: "22:00", end: "22:30", title: "Sleep early", category: "sleep", importance: "high", tinyStart: "Screens off, lights low." },
  ]);

const monterreyRoutine: Routine = {
  id: MONTERREY,
  name: "Monterrey",
  description: "CEMEX weeks: work 9–2, English daily, and projects or applications by day.",
  emoji: "🏙️",
  seeded: true,
  blocks: [
    ...monterreyWeekday(1),
    ...monterreyWeekday(2),
    ...monterreyWeekday(3),
    ...monterreyWeekday(4),
    ...monterreyWeekday(5),
    ...monterreySaturday(),
    ...monterreySunday(),
  ],
};

/* ------------------------------------------------------------------ */
/* Weekend routine                                                    */
/* ------------------------------------------------------------------ */

const WEEKEND = "weekend";

const weekendRoutine: Routine = {
  id: WEEKEND,
  name: "Weekend",
  description: "A gentler two-day rhythm: move, reset, one project push, and real rest.",
  emoji: "🌤️",
  seeded: true,
  blocks: [
    ...buildBlocks(WEEKEND, 6, [
      { start: "09:30", end: "10:30", title: "Gym", category: "gym", importance: "high", tinyStart: "Shoes on, head out.", backup: "A 20-minute walk counts." },
      { start: "11:00", end: "12:00", title: "Reset & chores", category: "chores", importance: "medium", tinyStart: "15-minute timer, start anywhere.", backup: "Just the dishes + a load of laundry." },
      { start: "13:00", end: "14:30", title: "Project time", category: "project", importance: "medium", tinyStart: "Open the project, one task.", backup: "Review where you left off." },
      { start: "15:00", end: "15:45", title: "English", category: "english", importance: "low", tinyStart: "One lesson." },
      { start: "19:00", end: "22:00", title: "Social", category: "social", importance: "low", tinyStart: "Say yes to one plan." },
    ]),
    ...buildBlocks(WEEKEND, 0, [
      { start: "10:00", end: "11:00", title: "Slow reset", category: "reset", importance: "high", tinyStart: "Clear one surface + start laundry.", backup: "Make the bed + tidy the desk." },
      { start: "11:30", end: "12:15", title: "Plan the week", category: "reset", importance: "high", tinyStart: "Block your must-dos for the week.", backup: "Just pick 3 priorities." },
      { start: "13:00", end: "14:00", title: "Study / English", category: "english", importance: "medium", tinyStart: "One lesson or 20 minutes." },
      { start: "15:00", end: "16:00", title: "Read & recharge", category: "reset", importance: "low", tinyStart: "Read one chapter.", backup: "10 minutes counts." },
      { start: "21:30", end: "22:00", title: "Wind down", category: "sleep", importance: "high", tinyStart: "Screens off, lights low." },
    ]),
  ],
};

/* ------------------------------------------------------------------ */
/* Minimum Day routine                                                */
/* ------------------------------------------------------------------ */

const MINIMUM = "minimum";

const minimumDaySeeds: BlockSeed[] = [
  { start: "07:30", end: "07:50", title: "Wake & meds", category: "reset", importance: "high", tinyStart: "Feet on the floor, water + meds." },
  { start: "08:00", end: "08:20", title: "Shower", category: "reset", importance: "high", tinyStart: "Just start the water." },
  { start: "10:00", end: "12:00", title: "One key task", category: "work", importance: "high", tinyStart: "Pick the single most important thing.", backup: "20 focused minutes counts." },
  { start: "18:00", end: "18:20", title: "Move a little", category: "gym", importance: "medium", tinyStart: "Stretch or take a short walk." },
  { start: "21:30", end: "22:00", title: "Wind down", category: "sleep", importance: "high", tinyStart: "Lay out tomorrow, lights low." },
];

const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

const minimumRoutine: Routine = {
  id: MINIMUM,
  name: "Minimum Day",
  description: "The floor, not the ceiling. Five essentials to keep the day from slipping.",
  emoji: "🛟",
  seeded: true,
  blocks: ALL_DAYS.flatMap((d) => buildBlocks(MINIMUM, d, minimumDaySeeds)),
};

/* ------------------------------------------------------------------ */

/** Fresh, deep-clonable seed templates. */
export const ROUTINE_TEMPLATES: Routine[] = [
  charlotteRoutine,
  monterreyRoutine,
  weekendRoutine,
  minimumRoutine,
];

export const DEFAULT_ROUTINE_ID = MONTERREY;

export function seedRoutines(): Routine[] {
  // structuredClone keeps the store's copy independent of the module constant.
  return ROUTINE_TEMPLATES.map((r) =>
    typeof structuredClone === "function"
      ? structuredClone(r)
      : (JSON.parse(JSON.stringify(r)) as Routine),
  );
}

export function blocksForDay(routine: Routine, day: Weekday): RoutineBlock[] {
  return routine.blocks
    .filter((b) => b.day === day)
    .sort((a, b) => a.start.localeCompare(b.start));
}
