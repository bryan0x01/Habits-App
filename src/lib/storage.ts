import type {
  Application,
  BlockLog,
  DayFlowSnapshot,
  EnergyLog,
  FlexTask,
  FrictionLog,
  Habit,
  HabitLog,
  Priority,
  Routine,
  UserSettings,
  WeekPlan,
} from "@/lib/types";

/**
 * Thin, typed wrapper around localStorage.
 *
 * Everything the app persists flows through here so that swapping the backend
 * later (e.g. Supabase) is a matter of reimplementing these functions rather
 * than hunting for `localStorage` calls across the codebase.
 */

const PREFIX = "dayflow";
export const SNAPSHOT_VERSION = 2;
/** Bump when persisted shapes change incompatibly (triggers a reseed). */
export const SCHEMA_VERSION = 2;

export const STORAGE_KEYS = {
  schema: `${PREFIX}:schemaVersion`,
  settings: `${PREFIX}:settings`,
  routines: `${PREFIX}:routines`,
  habits: `${PREFIX}:habits`,
  habitLogs: `${PREFIX}:habitLogs`,
  blockLogs: `${PREFIX}:blockLogs`,
  priorities: `${PREFIX}:priorities`,
  applications: `${PREFIX}:applications`,
  energyLogs: `${PREFIX}:energyLogs`,
  frictionLogs: `${PREFIX}:frictionLogs`,
  weekPlans: `${PREFIX}:weekPlans`,
  flexTasks: `${PREFIX}:flexTasks`,
} as const;

export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadItem<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable (private mode) — fail quietly.
  }
}

export function removeItem(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(removeItem);
}

/**
 * Reconcile old localStorage with the current schema. When the schema version
 * changes, data whose shape changed (habits, routines, and their logs) is
 * dropped so fresh seeds can take over; user content with a stable shape
 * (applications) is preserved.
 */
export function migrateIfNeeded(): void {
  if (!isBrowser()) return;
  const stored = loadItem<number | null>(STORAGE_KEYS.schema, null);
  if (stored === SCHEMA_VERSION) return;

  removeItem(STORAGE_KEYS.routines);
  removeItem(STORAGE_KEYS.habits);
  removeItem(STORAGE_KEYS.habitLogs);
  removeItem(STORAGE_KEYS.blockLogs);
  saveItem(STORAGE_KEYS.schema, SCHEMA_VERSION);
}

export function buildSnapshot(): DayFlowSnapshot {
  return {
    version: SNAPSHOT_VERSION,
    exportedAt: new Date().toISOString(),
    settings: loadItem<UserSettings>(STORAGE_KEYS.settings, {} as UserSettings),
    routines: loadItem<Routine[]>(STORAGE_KEYS.routines, []),
    habits: loadItem<Habit[]>(STORAGE_KEYS.habits, []),
    habitLogs: loadItem<HabitLog[]>(STORAGE_KEYS.habitLogs, []),
    blockLogs: loadItem<BlockLog[]>(STORAGE_KEYS.blockLogs, []),
    priorities: loadItem<Priority[]>(STORAGE_KEYS.priorities, []),
    applications: loadItem<Application[]>(STORAGE_KEYS.applications, []),
    energyLogs: loadItem<EnergyLog[]>(STORAGE_KEYS.energyLogs, []),
    frictionLogs: loadItem<FrictionLog[]>(STORAGE_KEYS.frictionLogs, []),
    weekPlans: loadItem<WeekPlan[]>(STORAGE_KEYS.weekPlans, []),
    flexTasks: loadItem<FlexTask[]>(STORAGE_KEYS.flexTasks, []),
  };
}

export function exportSnapshotJSON(): string {
  return JSON.stringify(buildSnapshot(), null, 2);
}

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
const APPLICATION_TYPES = ["internship", "new-grad", "co-op", "part-time"] as const;
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
    (value.medication === undefined || isOneOf(value.medication, ["taken", "not-taken"] as const)) &&
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

/** Validate imported data before replacing any local state. */
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
    (settings.defaultSupportNeed !== undefined &&
      !isOneOf(settings.defaultSupportNeed, SUPPORT_NEEDS)) ||
    (settings.vacationMode !== undefined && typeof settings.vacationMode !== "boolean") ||
    !isOptionalString(settings.routineBeforeVacationId)
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

/**
 * Restore a previously exported snapshot. Returns false on malformed input so
 * callers can surface a friendly error instead of corrupting state.
 */
export function importSnapshotJSON(json: string): boolean {
  try {
    const data: unknown = JSON.parse(json);
    if (!isDayFlowSnapshot(data)) return false;

    saveItem(STORAGE_KEYS.settings, data.settings);
    saveItem(STORAGE_KEYS.routines, data.routines);
    saveItem(STORAGE_KEYS.habits, data.habits);
    saveItem(STORAGE_KEYS.habitLogs, data.habitLogs);
    saveItem(STORAGE_KEYS.blockLogs, data.blockLogs);
    saveItem(STORAGE_KEYS.priorities, data.priorities);
    saveItem(STORAGE_KEYS.applications, data.applications);
    saveItem(STORAGE_KEYS.energyLogs, data.energyLogs);
    saveItem(STORAGE_KEYS.frictionLogs, data.frictionLogs);
    saveItem(STORAGE_KEYS.weekPlans, data.weekPlans);
    saveItem(STORAGE_KEYS.flexTasks, data.flexTasks ?? []);
    saveItem(STORAGE_KEYS.schema, SCHEMA_VERSION);
    return true;
  } catch {
    return false;
  }
}
