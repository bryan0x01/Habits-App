import { subDays } from "date-fns";

import { parseBrainDump } from "@/lib/planner";
import { dateKey } from "@/lib/time";
import type {
  BlockCategory,
  BlockLog,
  EnergyMode,
  FlexTask,
  FlexTaskDraft,
  Importance,
  Routine,
  RoutineBlock,
  SupportNeed,
  TaskEffort,
  Weekday,
} from "@/lib/types";

const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5];
const WEEKEND: Weekday[] = [0, 6];
const EVERY_DAY: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

const DAY_ALIASES: Array<{ day: Weekday; pattern: RegExp }> = [
  { day: 0, pattern: /\b(?:sun(?:day)?|dom(?:ingo)?)\b/i },
  { day: 1, pattern: /\b(?:mon(?:day)?|lun(?:es)?)\b/i },
  { day: 2, pattern: /\b(?:tue(?:sday)?|mar(?:tes)?)\b/i },
  { day: 3, pattern: /\b(?:wed(?:nesday)?|mie(?:rcoles)?)\b/i },
  { day: 4, pattern: /\b(?:thu(?:rsday)?|jue(?:ves)?)\b/i },
  { day: 5, pattern: /\b(?:fri(?:day)?|vie(?:rnes)?)\b/i },
  { day: 6, pattern: /\b(?:sat(?:urday)?|sab(?:ado)?)\b/i },
];

const TINY_STARTS: Record<BlockCategory, string> = {
  gym: "Put on your shoes and get water.",
  work: "Open the one thing you need first.",
  class: "Open today's schedule and find the first place to be.",
  study: "Open the nearest assignment or question.",
  english: "Open one lesson and do the first prompt.",
  project: "Open the project and name the next visible action.",
  applications: "Open one role and the matching resume.",
  social: "Send the first message.",
  chores: "Clear one small surface.",
  sleep: "Put the phone down and lower the lights.",
  reset: "Get water and clear one small thing.",
};

const BACKUPS: Record<BlockCategory, string> = {
  gym: "Move for ten minutes.",
  work: "Do the first ten minutes only.",
  class: "Open the material and note what is due.",
  study: "Answer one question.",
  english: "Review five words.",
  project: "Finish one small part.",
  applications: "Save one role or update one resume line.",
  social: "Send one short check-in.",
  chores: "Set a ten-minute timer.",
  sleep: "Lower the lights and set one cue for tomorrow.",
  reset: "Drink water and reset one small thing.",
};

const DEFAULT_DURATION: Record<BlockCategory, number> = {
  gym: 45,
  work: 60,
  class: 60,
  study: 45,
  english: 25,
  project: 60,
  applications: 40,
  social: 60,
  chores: 30,
  sleep: 30,
  reset: 20,
};

const DEFAULT_START: Record<BlockCategory, number> = {
  gym: 18 * 60,
  work: 9 * 60,
  class: 9 * 60,
  study: 16 * 60,
  english: 18 * 60,
  project: 14 * 60,
  applications: 11 * 60,
  social: 18 * 60,
  chores: 10 * 60,
  sleep: 21 * 60 + 30,
  reset: 20 * 60 + 30,
};

interface ActivityRule {
  id: string;
  category: BlockCategory;
  matcher: RegExp;
  title: string;
  defaultDays: Weekday[];
  defaultStart?: number;
}

const ACTIVITY_RULES: ActivityRule[] = [
  { id: "work", category: "work", matcher: /\b(?:work|working|job|office|trabaj(?:o|ar|ando))\b/i, title: "Work", defaultDays: WEEKDAYS },
  { id: "class", category: "class", matcher: /\b(?:class(?:es)?|campus|school|clase(?:s)?|escuela|universidad)\b/i, title: "Classes", defaultDays: WEEKDAYS },
  { id: "study", category: "study", matcher: /\b(?:study|homework|assignment|exam|estudi(?:ar|o)|tarea(?:s)?|examen)\b/i, title: "Study", defaultDays: WEEKDAYS },
  { id: "gym", category: "gym", matcher: /\b(?:gym|workout|exercise|run|movement|gimnasio|entren(?:ar|amiento)|ejercicio|correr)\b/i, title: "Move", defaultDays: [1, 3, 5] },
  { id: "english", category: "english", matcher: /\b(?:english|ingles|language practice|practica de idioma)\b/i, title: "Language practice", defaultDays: [2, 4] },
  { id: "project", category: "project", matcher: /\b(?:project|build|design|code|proyecto|programar|disenar)\b/i, title: "Project time", defaultDays: [2, 4] },
  { id: "applications", category: "applications", matcher: /\b(?:applications?|apply|resume|interview|aplicaciones|postular|curriculum|entrevista)\b/i, title: "Applications", defaultDays: [2, 4] },
  { id: "chores", category: "chores", matcher: /\b(?:chores?|clean|laundry|groceries|limpiar|lavanderia|mandado(?:s)?)\b/i, title: "Home reset", defaultDays: [6] },
  { id: "social", category: "social", matcher: /\b(?:friends?|family|social|date|amigos?|familia|salir)\b/i, title: "Time with people", defaultDays: WEEKEND },
  { id: "sleep", category: "sleep", matcher: /\b(?:sleep|bedtime|wind down|dormir|sueno|acostarme|descansar)\b/i, title: "Get ready for bed", defaultDays: EVERY_DAY },
  { id: "planning", category: "reset", matcher: /\b(?:weekly planning|planning block|plan(?:ning)? (?:the )?week|planear(?: (?:la )?semana)?|planeacion(?: semanal)?)\b/i, title: "Plan the week", defaultDays: [0], defaultStart: 18 * 60 },
  { id: "reset", category: "reset", matcher: /\b(?:reset|tidy up|prepare tomorrow|reinicio|preparar manana|ordenar)\b/i, title: "Evening reset", defaultDays: WEEKDAYS },
];

export interface LearnedCategorySignal {
  done: number;
  total: number;
  completionRate: number;
}

export interface PlanningProfile {
  sampleSize: number;
  categorySignals: Partial<Record<BlockCategory, LearnedCategorySignal>>;
  preferredStartByCategory: Partial<Record<BlockCategory, string>>;
  taskMinutesByCategory: Partial<Record<BlockCategory, number>>;
}

export interface LocalRoutineDraft {
  name: string;
  emoji: string;
  description: string;
  blocks: Array<Omit<RoutineBlock, "id">>;
}

export interface LocalRoutineResult {
  draft: LocalRoutineDraft | null;
  note: string;
  warnings: string[];
}

interface CandidateBlock extends Omit<RoutineBlock, "id"> {
  flexible: boolean;
}

function normalized(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function median(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function minutesToTime(value: number): string {
  const bounded = Math.max(0, Math.min(23 * 60 + 59, Math.round(value)));
  return `${String(Math.floor(bounded / 60)).padStart(2, "0")}:${String(bounded % 60).padStart(2, "0")}`;
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function parseClock(value: string, preferEvening = false): number | null {
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2] ?? 0);
  if (hour > 24 || minute > 59) return null;
  const meridiem = match[3]?.toLowerCase();
  if (meridiem?.startsWith("p") && hour < 12) hour += 12;
  if (meridiem?.startsWith("a") && hour === 12) hour = 0;
  if (!meridiem && preferEvening && hour >= 1 && hour <= 7) hour += 12;
  return hour * 60 + minute;
}

const TIME_TOKEN = "(\\d{1,2}(?::\\d{2})?\\s*(?:a\\.?m\\.?|p\\.?m\\.?)?)";

function timeRange(text: string): { start: number; end: number } | null {
  const range = new RegExp(`(?:from|de)\\s+${TIME_TOKEN}\\s*(?:to|until|hasta|a|-)\\s*${TIME_TOKEN}`, "i").exec(text);
  if (!range) return null;
  const start = parseClock(range[1]);
  let end = parseClock(range[2]);
  if (start === null || end === null) return null;
  if (end <= start && end <= 12 * 60) end += 12 * 60;
  if (end <= start || end > 23 * 60 + 59) return null;
  return { start, end };
}

function timeAt(text: string, category: BlockCategory): number | null {
  const match = new RegExp(`(?:\\bat|a las|@)\\s*${TIME_TOKEN}`, "i").exec(text);
  if (!match) return null;
  return parseClock(match[1], ["gym", "social", "sleep", "reset", "english"].includes(category));
}

function durationFrom(text: string, category: BlockCategory): number {
  const hours = text.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours|hora|horas)\b/i);
  if (hours) return Math.max(10, Math.min(8 * 60, Math.round(Number(hours[1]) * 60)));
  const minutes = text.match(/(\d+)\s*(?:m|min|mins|minute|minutes|minuto|minutos)\b/i);
  if (minutes) return Math.max(5, Math.min(8 * 60, Number(minutes[1])));
  if (/\b(?:quick|short|breve|corto|corta)\b/i.test(text)) return 20;
  return DEFAULT_DURATION[category];
}

function daysFrom(text: string, fallback: Weekday[]): Weekday[] {
  if (/\b(?:weekdays?|entre semana|lunes\s+(?:a|hasta)\s+viernes|monday\s+(?:to|through|-)\s+friday)\b/i.test(text)) {
    return [...WEEKDAYS];
  }
  if (/\b(?:weekends?|fin(?:es)? de semana)\b/i.test(text)) return [...WEEKEND];
  if (/\b(?:daily|every day|all days|todos los dias|diario|diaria)\b/i.test(text)) return [...EVERY_DAY];
  const found = DAY_ALIASES.filter(({ pattern }) => pattern.test(text)).map(({ day }) => day);
  return found.length > 0 ? [...new Set(found)].sort((a, b) => a - b) : [...fallback];
}

function importanceFor(rule: ActivityRule, text: string): Importance {
  if (/\b(?:optional|maybe|if i can|opcional|si puedo)\b/i.test(text)) return "low";
  if (/\b(?:important|must|fixed|required|importante|tengo que|obligatorio)\b/i.test(text)) return "high";
  if (["work", "class", "sleep"].includes(rule.id)) return "high";
  return rule.id === "chores" || rule.id === "social" ? "low" : "medium";
}

function segmentFor(text: string, mentions: Array<{ index: number }>, index: number): string {
  const current = mentions[index].index;
  const previous = mentions[index - 1]?.index;
  const next = mentions[index + 1]?.index;
  const previousBreak = Math.max(text.lastIndexOf(".", current), text.lastIndexOf(";", current), text.lastIndexOf("\n", current));
  const nextBreaks = [text.indexOf(".", current), text.indexOf(";", current), text.indexOf("\n", current)].filter((value) => value >= 0);
  const nextBreak = nextBreaks.length > 0 ? Math.min(...nextBreaks) : text.length;
  const midpointStart = previous === undefined ? 0 : Math.floor((previous + current) / 2);
  const midpointEnd = next === undefined ? text.length : Math.floor((current + next) / 2);
  const start = previousBreak > (previous ?? -1) ? previousBreak + 1 : midpointStart;
  const end = nextBreak < (next ?? text.length + 1) ? nextBreak : midpointEnd;
  return text.slice(start, Math.max(start + 1, end));
}

function startFor(
  rule: ActivityRule,
  segment: string,
  duration: number,
  workAnchor: { start: number; end: number } | null,
  profile: PlanningProfile,
): { start: number; end: number; flexible: boolean } {
  const range = timeRange(segment);
  if (range) return { ...range, flexible: false };

  if (/\b(?:after work|after my shift|despues del trabajo|saliendo del trabajo)\b/i.test(segment) && workAnchor) {
    const start = workAnchor.end + 30;
    return { start, end: start + duration, flexible: false };
  }
  if (/\b(?:before work|before my shift|antes del trabajo)\b/i.test(segment) && workAnchor) {
    const end = Math.max(duration, workAnchor.start - 30);
    return { start: end - duration, end, flexible: false };
  }

  const exactStart = timeAt(segment, rule.category);
  if (exactStart !== null) return { start: exactStart, end: exactStart + duration, flexible: false };

  const periodStart = /\b(?:morning|manana)\b/i.test(segment)
    ? 8 * 60
    : /\b(?:afternoon|tarde)\b/i.test(segment)
      ? 15 * 60
      : /\b(?:evening|night|noche)\b/i.test(segment)
        ? 20 * 60
        : null;
  if (periodStart !== null) return { start: periodStart, end: periodStart + duration, flexible: true };

  const learned = profile.preferredStartByCategory[rule.category];
  const start = learned
    ? timeToMinutes(learned)
    : rule.defaultStart ?? DEFAULT_START[rule.category];
  return { start, end: start + duration, flexible: true };
}

function normalizeCandidates(candidates: CandidateBlock[]): { blocks: Array<Omit<RoutineBlock, "id">>; warnings: string[] } {
  const warnings: string[] = [];
  const blocks: Array<Omit<RoutineBlock, "id">> = [];
  for (const day of EVERY_DAY) {
    let lastEnd = -1;
    const dayCandidates = candidates
      .filter((block) => block.day === day)
      .sort((a, b) => a.start.localeCompare(b.start) || Number(a.flexible) - Number(b.flexible));

    for (const candidate of dayCandidates) {
      const duration = timeToMinutes(candidate.end) - timeToMinutes(candidate.start);
      let start = timeToMinutes(candidate.start);
      let end = timeToMinutes(candidate.end);
      if (start < lastEnd) {
        if (!candidate.flexible) {
          warnings.push(`${candidate.title} overlapped another fixed block, so it was left out.`);
          continue;
        }
        start = lastEnd + 15;
        end = start + duration;
      }
      if (end > 23 * 60 + 45 || end <= start) {
        warnings.push(`${candidate.title} did not fit cleanly and was left out.`);
        continue;
      }
      const { flexible: _flexible, ...block } = candidate;
      blocks.push({ ...block, start: minutesToTime(start), end: minutesToTime(end) });
      lastEnd = end;
    }
  }
  return { blocks: blocks.slice(0, 42), warnings: [...new Set(warnings)].slice(0, 3) };
}

export function learnPlanningProfile(params: {
  routines: Routine[];
  blockLogs: BlockLog[];
  flexTasks: FlexTask[];
  now: Date;
}): PlanningProfile {
  const { routines, blockLogs, flexTasks, now } = params;
  const firstDay = dateKey(subDays(now, 55));
  const lastDay = dateKey(now);
  const blockById = new Map(routines.flatMap((routine) => routine.blocks).map((block) => [block.id, block]));
  const outcomeByCategory = new Map<BlockCategory, { done: number; total: number }>();
  const startsByCategory = new Map<BlockCategory, number[]>();

  for (const log of blockLogs) {
    if (log.date < firstDay || log.date > lastDay) continue;
    const block = blockById.get(log.blockId);
    if (!block) continue;
    const outcome = outcomeByCategory.get(block.category) ?? { done: 0, total: 0 };
    outcome.total += 1;
    if (log.status === "done") {
      outcome.done += 1;
      const starts = startsByCategory.get(block.category) ?? [];
      starts.push(timeToMinutes(block.start));
      startsByCategory.set(block.category, starts);
    }
    outcomeByCategory.set(block.category, outcome);
  }

  const categorySignals: PlanningProfile["categorySignals"] = {};
  const preferredStartByCategory: PlanningProfile["preferredStartByCategory"] = {};
  for (const [category, outcome] of outcomeByCategory) {
    categorySignals[category] = {
      ...outcome,
      completionRate: (outcome.done + 1) / (outcome.total + 2),
    };
    const starts = startsByCategory.get(category) ?? [];
    if (starts.length >= 3) preferredStartByCategory[category] = minutesToTime(median(starts) as number);
  }

  const taskMinutesByCategory: PlanningProfile["taskMinutesByCategory"] = {};
  for (const category of Object.keys(DEFAULT_DURATION) as BlockCategory[]) {
    const durations = flexTasks
      .filter((task) => task.done && task.category === category && task.date >= firstDay && task.date <= lastDay)
      .map((task) => task.durationMinutes);
    if (durations.length >= 3) taskMinutesByCategory[category] = median(durations);
  }

  return {
    sampleSize: [...outcomeByCategory.values()].reduce((sum, outcome) => sum + outcome.total, 0),
    categorySignals,
    preferredStartByCategory,
    taskMinutesByCategory,
  };
}

export function draftRoutineLocally(prompt: string, profile: PlanningProfile): LocalRoutineResult {
  const text = normalized(prompt).replace(/\s+/g, " ").trim();
  const mentions = ACTIVITY_RULES.flatMap((rule) => {
    const match = rule.matcher.exec(text);
    return match?.index === undefined ? [] : [{ rule, index: match.index }];
  }).sort((a, b) => a.index - b.index);

  if (mentions.length === 0) {
    return {
      draft: null,
      note: "Add at least one repeated part of your week, such as work, class, exercise, or bedtime.",
      warnings: [],
    };
  }

  const workMentionIndex = mentions.findIndex(({ rule }) => rule.id === "work");
  const workSegment = workMentionIndex >= 0 ? segmentFor(text, mentions, workMentionIndex) : "";
  const workAnchor = timeRange(workSegment);
  const candidates: CandidateBlock[] = [];

  mentions.forEach(({ rule }, mentionIndex) => {
    const segment = segmentFor(text, mentions, mentionIndex);
    const duration = durationFrom(segment, rule.category);
    const days = daysFrom(segment, rule.defaultDays);
    const timing = startFor(rule, segment, duration, workAnchor, profile);
    const importance = importanceFor(rule, segment);
    const title = rule.id === "reset" && /\b(?:morning|manana)\b/i.test(segment)
      ? "Morning reset"
      : rule.title;

    for (const day of days) {
      candidates.push({
        day,
        title,
        start: minutesToTime(timing.start),
        end: minutesToTime(timing.end),
        category: rule.category,
        importance,
        tinyStart: TINY_STARTS[rule.category],
        backup: BACKUPS[rule.category],
        notificationMinutesBefore: importance === "high" ? 15 : importance === "medium" ? 10 : undefined,
        flexible: timing.flexible,
      });
    }
  });

  const { blocks, warnings } = normalizeCandidates(candidates);
  if (blocks.length === 0) {
    return {
      draft: null,
      note: "I found the activities, but the times overlap. Try naming the fixed times first.",
      warnings,
    };
  }

  const hasSchool = mentions.some(({ rule }) => rule.id === "class" || rule.id === "study");
  const hasWork = mentions.some(({ rule }) => rule.id === "work");
  return {
    draft: {
      name: hasSchool ? "My school week" : hasWork ? "My work week" : "My weekly rhythm",
      emoji: "🌱",
      description: "Built from the details you gave. Every block can be changed.",
      blocks,
    },
    note: profile.sampleSize >= 3
      ? `Used ${profile.sampleSize} recent check-ins to choose times you did not specify.`
      : "Used only the details in your description. Untimed blocks use calm starter defaults.",
    warnings,
  };
}

const IMPORTANCE_VALUE: Record<Importance, number> = { high: 3, medium: 2, low: 1 };
const EFFORT_VALUE: Record<TaskEffort, number> = { light: 1, medium: 2, deep: 3 };

export function organizeBrainDumpLocally(params: {
  input: string;
  energyMode: EnergyMode;
  supportNeed?: SupportNeed;
  profile: PlanningProfile;
}): FlexTaskDraft[] {
  const { input, energyMode, supportNeed, profile } = params;
  const preferredEffort = energyMode === "high" ? 3 : energyMode === "medium" ? 2 : 1;
  const veryLow = energyMode === "low" || energyMode === "chaos" || supportNeed === "overwhelmed";

  return parseBrainDump(input)
    .map((task) => {
      const learnedMinutes = profile.taskMinutesByCategory[task.category];
      const hasDuration = /\d+\s*(?:h|hr|hrs|hour|hours|m|min|mins|minute|minutes)\b/i.test(task.title);
      const durationMinutes = !hasDuration && learnedMinutes
        ? Math.max(5, Math.min(120, Math.round((task.durationMinutes + learnedMinutes) / 2)))
        : task.durationMinutes;
      return {
        ...task,
        durationMinutes,
        minimumMinutes: Math.min(durationMinutes, veryLow ? 5 : task.minimumMinutes),
      };
    })
    .sort((a, b) => {
      const importance = IMPORTANCE_VALUE[b.importance] - IMPORTANCE_VALUE[a.importance];
      if (importance !== 0) return importance;
      const aFit = Math.abs(EFFORT_VALUE[a.effort] - preferredEffort);
      const bFit = Math.abs(EFFORT_VALUE[b.effort] - preferredEffort);
      if (aFit !== bFit) return aFit - bFit;
      const aRate = profile.categorySignals[a.category]?.completionRate ?? 0.5;
      const bRate = profile.categorySignals[b.category]?.completionRate ?? 0.5;
      if (aRate !== bRate) return bRate - aRate;
      return a.durationMinutes - b.durationMinutes;
    });
}
