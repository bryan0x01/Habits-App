import type {
  BlockCategory,
  Importance,
  Routine,
  RoutineBlock,
  Weekday,
} from "@/lib/types";

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

const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5];
const WEEKEND: Weekday[] = [0, 6];
const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

function defaultNotify(importance: Importance): number | undefined {
  if (importance === "high") return 15;
  if (importance === "medium") return 10;
  return undefined;
}

function buildBlocks(routineId: string, day: Weekday, seeds: BlockSeed[]): RoutineBlock[] {
  return seeds.map((seed) => ({
    id: `${routineId}-${day}-${seed.start.replace(":", "")}`,
    day,
    title: seed.title,
    start: seed.start,
    end: seed.end,
    category: seed.category,
    importance: seed.importance,
    tinyStart: seed.tinyStart,
    backup: seed.backup,
    notificationMinutesBefore: seed.notify ?? defaultNotify(seed.importance),
    notes: seed.notes,
  }));
}

function weeklyRoutine(input: {
  id: string;
  name: string;
  description: string;
  emoji: string;
  weekdays: BlockSeed[];
  weekend: BlockSeed[];
}): Routine {
  return {
    id: input.id,
    name: input.name,
    description: input.description,
    emoji: input.emoji,
    seeded: true,
    blocks: [
      ...WEEKDAYS.flatMap((day) => buildBlocks(input.id, day, input.weekdays)),
      ...WEEKEND.flatMap((day) => buildBlocks(input.id, day, input.weekend)),
    ],
  };
}

export const BALANCED_ROUTINE_ID = "balanced-week";

const balancedRoutine = weeklyRoutine({
  id: BALANCED_ROUTINE_ID,
  name: "Balanced week",
  description: "A flexible workday with food, focus, recovery, and a clear stopping point.",
  emoji: "balance",
  weekdays: [
    { start: "07:30", end: "08:15", title: "Start gently", category: "reset", importance: "high", tinyStart: "Water, light, then get dressed.", backup: "Water and one essential are enough." },
    { start: "09:00", end: "10:30", title: "First focus", category: "work", importance: "high", tinyStart: "Open the one outcome before messages.", backup: "Ten focused minutes counts." },
    { start: "10:30", end: "11:00", title: "Messages and admin", category: "work", importance: "medium", tinyStart: "Reply, schedule, or archive the top three." },
    { start: "12:30", end: "13:15", title: "Lunch away", category: "reset", importance: "high", tinyStart: "Leave the work surface and eat." },
    { start: "14:00", end: "15:15", title: "Second focus", category: "project", importance: "medium", tinyStart: "Resume from the next written action.", backup: "Finish one small artifact." },
    { start: "17:30", end: "18:00", title: "Move or decompress", category: "gym", importance: "low", tinyStart: "Step outside or stretch for five minutes." },
    { start: "21:30", end: "22:00", title: "Close the day", category: "sleep", importance: "high", tinyStart: "Prepare one cue for tomorrow, then lower the lights." },
  ],
  weekend: [
    { start: "09:30", end: "10:00", title: "Slow start", category: "reset", importance: "high", tinyStart: "Water and food before decisions." },
    { start: "11:00", end: "11:30", title: "One home reset", category: "chores", importance: "medium", tinyStart: "Set a ten-minute timer on one surface." },
    { start: "14:00", end: "15:00", title: "Rest, people, or movement", category: "social", importance: "low", tinyStart: "Choose the option that gives energy back." },
    { start: "21:30", end: "22:00", title: "Gentle close", category: "sleep", importance: "high", tinyStart: "Check tomorrow's first commitment." },
  ],
});

const studentRoutine = weeklyRoutine({
  id: "student-week",
  name: "Student week",
  description: "Classes, short recall sessions, assignments, movement, and a steady close.",
  emoji: "student",
  weekdays: [
    { start: "07:30", end: "08:15", title: "Wake, eat, pack", category: "reset", importance: "high", tinyStart: "Water, food, then check the bag." },
    { start: "09:00", end: "14:00", title: "Classes / campus", category: "class", importance: "high", tinyStart: "Open today's schedule and go to the first place." },
    { start: "15:00", end: "15:25", title: "Recall today", category: "study", importance: "high", tinyStart: "Write what you remember before opening notes.", backup: "Answer three questions from memory." },
    { start: "15:40", end: "16:30", title: "Assignment focus", category: "study", importance: "medium", tinyStart: "Open the nearest deadline and read the first prompt." },
    { start: "16:30", end: "16:45", title: "Move and reset", category: "gym", importance: "low", tinyStart: "Stand up and walk for five minutes." },
    { start: "19:00", end: "19:25", title: "Spaced review", category: "study", importance: "medium", tinyStart: "Review one older topic.", backup: "Do five flashcards." },
    { start: "21:30", end: "22:00", title: "Pack tomorrow", category: "sleep", importance: "high", tinyStart: "Pack the bag and choose the first study question." },
  ],
  weekend: [
    { start: "10:00", end: "10:25", title: "Weekly recall", category: "study", importance: "high", tinyStart: "List the week's topics without notes." },
    { start: "10:40", end: "11:30", title: "One assignment push", category: "study", importance: "medium", tinyStart: "Pick the closest deadline and open it." },
    { start: "12:00", end: "12:25", title: "Place next reviews", category: "reset", importance: "medium", tinyStart: "Schedule the next review only." },
    { start: "15:00", end: "16:00", title: "Move or connect", category: "social", importance: "low", tinyStart: "Text someone or step outside." },
  ],
});

const shiftRoutine = weeklyRoutine({
  id: "shift-week",
  name: "Shift week",
  description: "Prep, protected breaks, decompression, and one home essential.",
  emoji: "shift",
  weekdays: [
    { start: "07:00", end: "07:30", title: "Shift prep", category: "reset", importance: "high", tinyStart: "Water, food, clothes, keys." },
    { start: "08:00", end: "12:00", title: "Shift — first half", category: "work", importance: "high", tinyStart: "Clock in and confirm the first responsibility." },
    { start: "12:00", end: "12:30", title: "Meal and real break", category: "reset", importance: "high", tinyStart: "Step away and eat if you can.", notes: "Move this to match the break your workplace actually allows." },
    { start: "12:30", end: "16:30", title: "Shift — second half", category: "work", importance: "high", tinyStart: "Return to the next concrete responsibility." },
    { start: "17:00", end: "17:20", title: "Decompress", category: "reset", importance: "high", tinyStart: "Change clothes and take ten minutes without decisions." },
    { start: "18:00", end: "18:30", title: "One home essential", category: "chores", importance: "medium", tinyStart: "Choose food, laundry, or cleanup — one only." },
    { start: "21:30", end: "22:00", title: "Next-shift setup", category: "sleep", importance: "high", tinyStart: "Check the next shift and prepare essentials." },
  ],
  weekend: [
    { start: "09:30", end: "10:00", title: "Slow start", category: "reset", importance: "high", tinyStart: "Water and breakfast before plans." },
    { start: "11:00", end: "11:30", title: "Life admin", category: "chores", importance: "medium", tinyStart: "Handle the one thing that could become a problem." },
    { start: "14:00", end: "15:00", title: "Recovery or people", category: "social", importance: "low", tinyStart: "Choose rest, movement, or someone you like." },
  ],
});

const focusWorkRoutine = weeklyRoutine({
  id: "focus-work",
  name: "Focus work",
  description: "Protected focus, communication windows, lunch, and a clean shutdown.",
  emoji: "focus-work",
  weekdays: [
    { start: "08:30", end: "08:45", title: "Choose the outcome", category: "work", importance: "high", tinyStart: "Write the one deliverable that makes today useful." },
    { start: "09:00", end: "10:30", title: "Protected focus", category: "work", importance: "high", tinyStart: "Open the deliverable before chat or email." },
    { start: "10:30", end: "11:00", title: "Communication window", category: "work", importance: "medium", tinyStart: "Reply, delegate, or schedule." },
    { start: "11:00", end: "12:30", title: "Meetings / collaboration", category: "work", importance: "medium", tinyStart: "Open the agenda and name the decision needed." },
    { start: "12:30", end: "13:15", title: "Lunch away", category: "reset", importance: "high", tinyStart: "Leave the work surface and eat." },
    { start: "13:30", end: "15:00", title: "Second focus", category: "project", importance: "medium", tinyStart: "Resume from the next written action." },
    { start: "16:30", end: "17:00", title: "Close the loop", category: "sleep", importance: "high", tinyStart: "Write what moved and tomorrow's first action." },
  ],
  weekend: [
    { start: "10:00", end: "10:30", title: "Personal reset", category: "reset", importance: "high", tinyStart: "Choose one home task, then stop." },
    { start: "11:00", end: "12:00", title: "Move", category: "gym", importance: "medium", tinyStart: "Shoes on and outside." },
    { start: "14:00", end: "16:00", title: "Offline time", category: "social", importance: "low", tinyStart: "Put work apps away." },
  ],
});

const ownerRoutine = weeklyRoutine({
  id: "self-employed",
  name: "Self-employed",
  description: "Separate delivery, sales, operations, money, and recovery.",
  emoji: "self-employed",
  weekdays: [
    { start: "08:00", end: "08:20", title: "Owner check-in", category: "work", importance: "high", tinyStart: "Check commitments and the one real constraint." },
    { start: "08:30", end: "10:30", title: "Create or deliver", category: "project", importance: "high", tinyStart: "Open the customer-visible deliverable before messages." },
    { start: "10:45", end: "11:30", title: "Sales and follow-up", category: "work", importance: "high", tinyStart: "Follow up with one real lead." },
    { start: "12:00", end: "12:45", title: "Lunch away", category: "reset", importance: "high", tinyStart: "Leave the work surface and eat." },
    { start: "13:00", end: "14:30", title: "Operations", category: "work", importance: "medium", tinyStart: "Pick the bottleneck that repeats most often." },
    { start: "14:45", end: "15:15", title: "Money pulse", category: "work", importance: "medium", tinyStart: "Open the cash view and record one decision." },
    { start: "16:30", end: "17:00", title: "Delegate and detach", category: "sleep", importance: "high", tinyStart: "Write tomorrow's first move and close work channels." },
  ],
  weekend: [
    { start: "10:00", end: "10:20", title: "Urgent-only pulse", category: "work", importance: "low", tinyStart: "Check only customer or cash emergencies." },
    { start: "11:00", end: "12:00", title: "Movement", category: "gym", importance: "medium", tinyStart: "Go outside for ten minutes." },
    { start: "13:00", end: "17:00", title: "Detach from work", category: "social", importance: "high", tinyStart: "Silence business notifications." },
  ],
});

export const MINIMUM_ROUTINE_ID = "low-capacity-day";
const minimumSeeds: BlockSeed[] = [
  { start: "08:00", end: "08:20", title: "Water, food, essentials", category: "reset", importance: "high", tinyStart: "Drink water and choose the easiest food." },
  { start: "09:00", end: "09:20", title: "Basic care", category: "reset", importance: "high", tinyStart: "Start the smallest care step." },
  { start: "11:00", end: "11:25", title: "One useful move", category: "work", importance: "high", tinyStart: "Pick the single thing that reduces pressure.", backup: "Ten minutes still counts." },
  { start: "17:00", end: "17:15", title: "Change state", category: "gym", importance: "low", tinyStart: "Stand by a window, stretch, or step outside." },
  { start: "21:30", end: "22:00", title: "Prepare rest", category: "sleep", importance: "high", tinyStart: "Lower the lights and set one cue for tomorrow." },
];
const minimumRoutine: Routine = {
  id: MINIMUM_ROUTINE_ID,
  name: "Low-capacity day",
  description: "Five anchors for days when the normal plan is too much.",
  emoji: "minimum",
  seeded: true,
  blocks: ALL_DAYS.flatMap((day) => buildBlocks(MINIMUM_ROUTINE_ID, day, minimumSeeds)),
};

export const VACATION_ROUTINE_ID = "vacation-rhythm";
const vacationRoutine = weeklyRoutine({
  id: VACATION_ROUTINE_ID,
  name: "Vacation rhythm",
  description: "Four loose anchors: care, one highlight, movement, and a gentle close.",
  emoji: "vacation",
  weekdays: [
    { start: "09:00", end: "09:30", title: "Morning anchor", category: "reset", importance: "high", tinyStart: "Water, food, essentials — then choose freely." },
    { start: "11:00", end: "13:00", title: "One trip highlight", category: "social", importance: "medium", tinyStart: "Pick one thing worth being present for." },
    { start: "16:00", end: "16:30", title: "Move or reset", category: "gym", importance: "low", tinyStart: "Walk, swim, stretch, or rest on purpose." },
    { start: "22:00", end: "22:20", title: "Loose close", category: "sleep", importance: "high", tinyStart: "Check tomorrow's first commitment, then put planning away." },
  ],
  weekend: [
    { start: "09:00", end: "09:30", title: "Morning anchor", category: "reset", importance: "high", tinyStart: "Water, food, essentials — then choose freely." },
    { start: "11:00", end: "13:00", title: "One trip highlight", category: "social", importance: "medium", tinyStart: "Pick one thing worth being present for." },
    { start: "16:00", end: "16:30", title: "Move or reset", category: "gym", importance: "low", tinyStart: "Walk, swim, stretch, or rest on purpose." },
    { start: "22:00", end: "22:20", title: "Loose close", category: "sleep", importance: "high", tinyStart: "Check tomorrow's first commitment, then put planning away." },
  ],
});

export const LIFE_ROUTINE_TEMPLATES: Routine[] = [
  balancedRoutine,
  studentRoutine,
  shiftRoutine,
  focusWorkRoutine,
  ownerRoutine,
  minimumRoutine,
  vacationRoutine,
];

export const ROUTINE_TEMPLATES: Routine[] = [balancedRoutine, minimumRoutine];
export const DEFAULT_ROUTINE_ID = BALANCED_ROUTINE_ID;

export function cloneRoutineTemplate(template: Routine): Routine {
  return typeof structuredClone === "function"
    ? structuredClone(template)
    : (JSON.parse(JSON.stringify(template)) as Routine);
}

export function lifeRoutineTemplate(id: string): Routine | null {
  const template = LIFE_ROUTINE_TEMPLATES.find((routine) => routine.id === id);
  return template ? cloneRoutineTemplate(template) : null;
}

export function seedRoutines(): Routine[] {
  return ROUTINE_TEMPLATES.map(cloneRoutineTemplate);
}

export function blocksForDay(routine: Routine, day: Weekday): RoutineBlock[] {
  return routine.blocks
    .filter((block) => block.day === day)
    .sort((a, b) => a.start.localeCompare(b.start));
}
