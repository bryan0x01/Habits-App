import type { DayFlowSnapshot } from "@/lib/types";

/**
 * Snapshot validation and file serialization.
 *
 * DayFlow no longer persists product data in browser storage. Supabase owns
 * the private account snapshot; this module only protects the boundary where
 * JSON enters the app (cloud reads and backup imports).
 */

export const SNAPSHOT_VERSION = 2;

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasStrings(value: JsonRecord, fields: string[]): boolean {
  return fields.every((field) => typeof value[field] === "string");
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === "string";
}

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === "string" && options.includes(value as T);
}

const ENERGY_MODES = ["high", "medium", "low", "chaos"] as const;
const SUPPORT_NEEDS = ["start", "focus", "remember", "switch", "overwhelmed", "varies"] as const;
const THEMES = ["light", "dark", "system"] as const;
const INTERFACE_COLORS = ["iris", "blue", "teal", "rose", "amber"] as const;
const LOG_STATUSES = ["done", "skipped"] as const;
const IMPORTANCE = ["low", "medium", "high"] as const;
const BLOCK_CATEGORIES = [
  "gym", "work", "class", "study", "english", "project", "applications",
  "social", "chores", "sleep", "reset",
] as const;
const HABIT_CADENCES = ["daily", "weekdays", "weekends", "weekly"] as const;
const HABIT_CATEGORIES = ["body", "school", "career", "home", "money", "sleep"] as const;
const APPLICATION_STATUSES = [
  "saved", "applied", "assessment", "interview", "offer", "rejected",
] as const;
const APPLICATION_TYPES = [
  "full-time",
  "part-time",
  "contract",
  "freelance",
  "internship",
  "new-grad",
  "co-op",
] as const;
const FRICTION_REASONS = [
  "too-tired", "forgot", "too-late", "no-start", "social", "no-food", "other",
] as const;

function isRoutine(value: unknown): boolean {
  if (!isRecord(value) || !hasStrings(value, ["id", "name", "description", "emoji"])) {
    return false;
  }
  if (!Array.isArray(value.blocks)) return false;
  return value.blocks.every((block) => {
    if (!isRecord(block)) return false;
    return (
      hasStrings(block, ["id", "title", "start", "end"]) &&
      Number.isInteger(block.day) &&
      Number(block.day) >= 0 &&
      Number(block.day) <= 6 &&
      isOneOf(block.category, BLOCK_CATEGORIES) &&
      isOneOf(block.importance, IMPORTANCE) &&
      isOptionalString(block.tinyStart) &&
      isOptionalString(block.backup) &&
      isOptionalString(block.notes) &&
      (block.notificationMinutesBefore === undefined ||
        (typeof block.notificationMinutesBefore === "number" &&
          Number.isFinite(block.notificationMinutesBefore) &&
          block.notificationMinutesBefore >= 0))
    );
  });
}

function isHabit(value: unknown): boolean {
  return (
    isRecord(value) &&
    hasStrings(value, ["id", "name", "emoji"]) &&
    isOneOf(value.cadence, HABIT_CADENCES) &&
    isOneOf(value.category, HABIT_CATEGORIES) &&
    isOptionalString(value.tinyStart) &&
    (value.minimum === undefined || typeof value.minimum === "boolean") &&
    (value.custom === undefined || typeof value.custom === "boolean")
  );
}

function isDatedLog(value: unknown, referenceField: "habitId" | "blockId"): boolean {
  return (
    isRecord(value) &&
    hasStrings(value, ["id", referenceField, "date", "createdAt"]) &&
    isOneOf(value.status, LOG_STATUSES)
  );
}

function isPriority(value: unknown): boolean {
  return (
    isRecord(value) &&
    hasStrings(value, ["id", "date", "text", "createdAt"]) &&
    typeof value.done === "boolean"
  );
}

function isApplication(value: unknown): boolean {
  return (
    isRecord(value) &&
    hasStrings(value, ["id", "company", "role", "createdAt", "updatedAt"]) &&
    isOneOf(value.status, APPLICATION_STATUSES) &&
    (value.type === undefined || isOneOf(value.type, APPLICATION_TYPES)) &&
    (value.priority === undefined || isOneOf(value.priority, IMPORTANCE)) &&
    [
      "location", "link", "deadline", "resumeVersion", "referralContact",
      "followUpDate", "nextAction", "notes", "appliedOn",
    ].every((field) => isOptionalString(value[field]))
  );
}

function isEnergyLog(value: unknown): boolean {
  return (
    isRecord(value) &&
    hasStrings(value, ["id", "date", "createdAt"]) &&
    isOneOf(value.mode, ENERGY_MODES) &&
    (value.medication === undefined ||
      isOneOf(value.medication, ["taken", "not-taken"] as const)) &&
    (value.supportNeed === undefined || isOneOf(value.supportNeed, SUPPORT_NEEDS))
  );
}

function isFlexTask(value: unknown): boolean {
  return (
    isRecord(value) &&
    hasStrings(value, ["id", "date", "title", "tinyStart", "createdAt"]) &&
    typeof value.durationMinutes === "number" &&
    Number.isFinite(value.durationMinutes) &&
    value.durationMinutes > 0 &&
    typeof value.minimumMinutes === "number" &&
    Number.isFinite(value.minimumMinutes) &&
    value.minimumMinutes > 0 &&
    value.minimumMinutes <= value.durationMinutes &&
    isOneOf(value.importance, IMPORTANCE) &&
    isOneOf(value.effort, ["light", "medium", "deep"] as const) &&
    isOneOf(value.category, BLOCK_CATEGORIES) &&
    typeof value.done === "boolean"
  );
}

function isFrictionLog(value: unknown): boolean {
  return (
    isRecord(value) &&
    hasStrings(value, ["id", "date", "taskTitle", "createdAt"]) &&
    isOneOf(value.taskType, ["block", "habit"] as const) &&
    isOneOf(value.reason, FRICTION_REASONS) &&
    isOptionalString(value.refId) &&
    isOptionalString(value.note)
  );
}

function isWeekPlan(value: unknown): boolean {
  return isRecord(value) && hasStrings(value, ["weekKey", "school", "health", "career"]);
}

/** Validate cloud or imported data before it can replace in-memory state. */
export function isDayFlowSnapshot(value: unknown): value is DayFlowSnapshot {
  if (!isRecord(value)) return false;
  if (value.version !== SNAPSHOT_VERSION || typeof value.exportedAt !== "string") return false;

  const settings = value.settings;
  if (
    !isRecord(settings) ||
    typeof settings.activeRoutineId !== "string" ||
    !isOneOf(settings.energyMode, ENERGY_MODES) ||
    typeof settings.minimumDay !== "boolean" ||
    typeof settings.onboarded !== "boolean" ||
    (settings.medicationTracking !== undefined && typeof settings.medicationTracking !== "boolean") ||
    (settings.defaultSupportNeed !== undefined && !isOneOf(settings.defaultSupportNeed, SUPPORT_NEEDS)) ||
    (settings.vacationMode !== undefined && typeof settings.vacationMode !== "boolean") ||
    !isOptionalString(settings.routineBeforeVacationId) ||
    (settings.theme !== undefined && !isOneOf(settings.theme, THEMES)) ||
    (settings.interfaceColor !== undefined && !isOneOf(settings.interfaceColor, INTERFACE_COLORS))
  ) {
    return false;
  }

  const arrays: [unknown, (item: unknown) => boolean][] = [
    [value.routines, isRoutine],
    [value.habits, isHabit],
    [value.habitLogs, (item) => isDatedLog(item, "habitId")],
    [value.blockLogs, (item) => isDatedLog(item, "blockId")],
    [value.priorities, isPriority],
    [value.applications, isApplication],
    [value.energyLogs, isEnergyLog],
    [value.frictionLogs, isFrictionLog],
    [value.weekPlans, isWeekPlan],
  ];
  const requiredArraysValid = arrays.every(
    ([items, validate]) => Array.isArray(items) && items.every(validate),
  );
  const flexTasksValid =
    value.flexTasks === undefined ||
    (Array.isArray(value.flexTasks) && value.flexTasks.every(isFlexTask));
  return requiredArraysValid && flexTasksValid;
}

export function parseSnapshotJSON(json: string): DayFlowSnapshot | null {
  try {
    const parsed: unknown = JSON.parse(json);
    return isDayFlowSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function serializeSnapshot(snapshot: DayFlowSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}
