import type {
  BlockCategory,
  EnergyMode,
  FlexTask,
  FlexTaskDraft,
  Importance,
  TaskEffort,
} from "@/lib/types";

const CATEGORY_RULES: Array<[BlockCategory, RegExp]> = [
  ["study", /study|exam|quiz|homework|assignment|lecture|class|read|learn/i],
  ["applications", /application|apply|resume|interview|recruit/i],
  ["gym", /gym|workout|run|walk|exercise|movement/i],
  ["chores", /clean|laundry|dishes|grocer|shop|tidy/i],
  ["english", /english|language|vocabulary/i],
  ["project", /project|build|design|code|write|proposal|create/i],
  ["work", /email|call|meeting|report|work|invoice|client|sales|admin/i],
  ["sleep", /sleep|bed|wind down/i],
  ["social", /friend|family|date|social|party/i],
];

const TINY_STARTS: Record<BlockCategory, string> = {
  gym: "Put on your shoes and get water.",
  work: "Open the exact file or message you need.",
  class: "Open the class page and find the next requirement.",
  study: "Close the notes and answer one question from memory.",
  english: "Open one lesson and do the first prompt.",
  project: "Open the project and name the next visible action.",
  applications: "Open one role and the matching resume.",
  social: "Send the first message.",
  chores: "Clear one small surface.",
  sleep: "Put the phone down and lower the lights.",
  reset: "Get water and clear one small thing.",
};

function inferCategory(title: string): BlockCategory {
  return CATEGORY_RULES.find(([, rule]) => rule.test(title))?.[0] ?? "reset";
}

function inferDuration(title: string, category: BlockCategory): number {
  const hours = title.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/i);
  if (hours) return Math.max(5, Math.round(Number(hours[1]) * 60));
  const minutes = title.match(/(\d+)\s*(?:m|min|mins|minute|minutes)\b/i);
  if (minutes) return Math.max(5, Number(minutes[1]));
  if (["work", "chores", "reset", "social"].includes(category)) return 20;
  if (["study", "project", "applications", "gym"].includes(category)) return 45;
  return 25;
}

function inferImportance(title: string): Importance {
  if (/urgent|deadline|today|must|due|important/i.test(title)) return "high";
  if (/maybe|someday|optional|if i can|later/i.test(title)) return "low";
  return "medium";
}

function inferEffort(category: BlockCategory, duration: number): TaskEffort {
  if (duration <= 20 || ["chores", "reset", "social"].includes(category)) return "light";
  if (duration >= 40 && ["study", "project", "work", "applications"].includes(category)) {
    return "deep";
  }
  return "medium";
}

function cleanTitle(value: string): string {
  return value
    .replace(/^(?:[-*•]\s*|\d+[.)]\s*)/, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());
}

export function parseBrainDump(input: string): FlexTaskDraft[] {
  const rawItems = input
    .split(/\n+|;+/)
    .map(cleanTitle)
    .filter((item) => item.length >= 2)
    .slice(0, 12);

  return rawItems.map((title) => {
    const category = inferCategory(title);
    const durationMinutes = inferDuration(title, category);
    return {
      title,
      durationMinutes,
      minimumMinutes: Math.min(durationMinutes, durationMinutes <= 20 ? durationMinutes : 10),
      importance: inferImportance(title),
      effort: inferEffort(category, durationMinutes),
      category,
      tinyStart: TINY_STARTS[category],
    };
  });
}

/**
 * Loose ends visible on a given day: everything dated that day, plus any
 * unfinished task from an earlier day. Undone work carries forward instead of
 * silently disappearing at midnight; tasks moved to a future date stay hidden
 * until that date arrives. (Date keys are yyyy-MM-dd, so string order works.)
 */
export function selectFlexTasksFor(tasks: FlexTask[], dayKey: string): FlexTask[] {
  return tasks.filter(
    (task) => task.date === dayKey || (!task.done && task.date < dayKey),
  );
}

const IMPORTANCE_SCORE: Record<Importance, number> = { high: 3, medium: 2, low: 1 };
const EFFORT_SCORE: Record<TaskEffort, number> = { light: 1, medium: 2, deep: 3 };

export function prioritizeFlexTasks(tasks: FlexTask[], mode: EnergyMode): FlexTask[] {
  const preferredEffort = mode === "high" ? 3 : mode === "medium" ? 2 : 1;
  return [...tasks].sort((a, b) => {
    const importance = IMPORTANCE_SCORE[b.importance] - IMPORTANCE_SCORE[a.importance];
    if (importance !== 0) return importance;
    const aFit = Math.abs(EFFORT_SCORE[a.effort] - preferredEffort);
    const bFit = Math.abs(EFFORT_SCORE[b.effort] - preferredEffort);
    if (aFit !== bFit) return aFit - bFit;
    return a.durationMinutes - b.durationMinutes;
  });
}

export type RescueAction = "keep" | "shrink" | "move";

export interface RescueDecision {
  task: FlexTask;
  action: RescueAction;
  plannedMinutes: number;
}

export function buildRescuePlan(
  tasks: FlexTask[],
  availableMinutes: number,
  mode: EnergyMode,
): RescueDecision[] {
  const ordered = prioritizeFlexTasks(tasks.filter((task) => !task.done), mode);
  const taskLimit = mode === "chaos" ? 1 : mode === "low" ? 2 : mode === "medium" ? 3 : 4;
  let budget = Math.max(0, availableMinutes);
  let kept = 0;

  return ordered.map((task) => {
    if (kept >= taskLimit) return { task, action: "move", plannedMinutes: 0 };
    if (task.durationMinutes <= budget) {
      budget -= task.durationMinutes;
      kept += 1;
      return { task, action: "keep", plannedMinutes: task.durationMinutes };
    }
    if (task.minimumMinutes <= budget) {
      budget -= task.minimumMinutes;
      kept += 1;
      return { task, action: "shrink", plannedMinutes: task.minimumMinutes };
    }
    return { task, action: "move", plannedMinutes: 0 };
  });
}
