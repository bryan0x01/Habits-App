/**
 * DayFlow data models.
 *
 * These types are the single source of truth for everything persisted in
 * localStorage today. They are intentionally plain and serializable so the
 * exact same shapes can later back a Supabase schema without a rewrite.
 */

/** date-fns getDay() convention: 0 = Sunday … 6 = Saturday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type EnergyMode = "high" | "medium" | "low" | "chaos";

/** The kind of practical support that would help most right now. */
export type SupportNeed =
  | "start"
  | "focus"
  | "remember"
  | "switch"
  | "overwhelmed"
  | "varies";

/** Categories for routine blocks. */
export type BlockCategory =
  | "gym"
  | "work"
  | "class"
  | "study"
  | "english"
  | "project"
  | "applications"
  | "social"
  | "chores"
  | "sleep"
  | "reset";

/** Categories for habits (a separate taxonomy from blocks). */
export type HabitCategory =
  | "body"
  | "school"
  | "career"
  | "home"
  | "money"
  | "sleep";

export type Importance = "low" | "medium" | "high";

export type LogStatus = "done" | "skipped";

export type TaskEffort = "light" | "medium" | "deep";

/** A task without a fixed clock time, usually captured from a brain dump. */
export interface FlexTask {
  id: string;
  /** yyyy-MM-dd */
  date: string;
  title: string;
  durationMinutes: number;
  minimumMinutes: number;
  importance: Importance;
  effort: TaskEffort;
  category: BlockCategory;
  tinyStart: string;
  done: boolean;
  createdAt: string;
}

export type FlexTaskDraft = Omit<FlexTask, "id" | "date" | "done" | "createdAt">;

/** A single scheduled block within a routine, tied to a weekday. */
export interface RoutineBlock {
  id: string;
  day: Weekday;
  title: string;
  /** 24h "HH:mm". */
  start: string;
  /** 24h "HH:mm". */
  end: string;
  category: BlockCategory;
  /** A ~2-minute on-ramp so starting is frictionless. */
  tinyStart?: string;
  /** A lighter alternative when the full block feels like too much. */
  backup?: string;
  /** Drives the "minimum day" filter and Next Best Action. */
  importance: Importance;
  /** Minutes before start to (eventually) fire a reminder. */
  notificationMinutesBefore?: number;
  notes?: string;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  emoji: string;
  blocks: RoutineBlock[];
  /** True for the seeded starter templates. */
  seeded?: boolean;
}

export type HabitCadence = "daily" | "weekdays" | "weekends" | "weekly";

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  cadence: HabitCadence;
  category: HabitCategory;
  tinyStart?: string;
  /** Counts toward the "minimum saved" day state. */
  minimum?: boolean;
  /** True for user-created habits (vs. seeded defaults). */
  custom?: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  /** yyyy-MM-dd */
  date: string;
  status: LogStatus;
  /** ISO timestamp */
  createdAt: string;
}

/** Completion state for a routine block on a given day. */
export interface BlockLog {
  id: string;
  blockId: string;
  /** yyyy-MM-dd */
  date: string;
  status: LogStatus;
  createdAt: string;
}

/** One of the day's Top 3 priorities. */
export interface Priority {
  id: string;
  /** yyyy-MM-dd */
  date: string;
  text: string;
  done: boolean;
  createdAt: string;
}

export type ApplicationStatus =
  | "saved"
  | "applied"
  | "assessment"
  | "interview"
  | "offer"
  | "rejected";

export type ApplicationType = "internship" | "new-grad" | "co-op" | "part-time";

export interface Application {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  type?: ApplicationType;
  priority?: Importance;
  location?: string;
  link?: string;
  /** yyyy-MM-dd */
  deadline?: string;
  resumeVersion?: string;
  referralContact?: string;
  /** yyyy-MM-dd */
  followUpDate?: string;
  nextAction?: string;
  notes?: string;
  /** yyyy-MM-dd */
  appliedOn?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnergyLog {
  id: string;
  /** yyyy-MM-dd */
  date: string;
  mode: EnergyMode;
  /** Optional context only; DayFlow never interprets this as medical advice. */
  medication?: "taken" | "not-taken";
  /** User-chosen functional context, never a diagnostic classification. */
  supportNeed?: SupportNeed;
  createdAt: string;
}

export type FrictionReason =
  | "too-tired"
  | "forgot"
  | "too-late"
  | "no-start"
  | "social"
  | "no-food"
  | "other";

/** Captured — gently, without judgment — when a task is skipped. */
export interface FrictionLog {
  id: string;
  /** yyyy-MM-dd */
  date: string;
  taskTitle: string;
  taskType: "block" | "habit";
  /** blockId or habitId */
  refId?: string;
  reason: FrictionReason;
  note?: string;
  createdAt: string;
}

export interface UserSettings {
  activeRoutineId: string;
  energyMode: EnergyMode;
  minimumDay: boolean;
  onboarded: boolean;
  medicationTracking?: boolean;
  /** Fallback used until the user makes today's functional check-in. */
  defaultSupportNeed?: SupportNeed;
  vacationMode?: boolean;
  routineBeforeVacationId?: string;
}

/** Draft priorities for the upcoming week, set from the Weekly Review. */
export interface WeekPlan {
  /** yyyy-MM-dd of the week's Monday. */
  weekKey: string;
  school: string;
  health: string;
  career: string;
}

/** Full serializable snapshot — used for export / import / future sync. */
export interface DayFlowSnapshot {
  version: number;
  exportedAt: string;
  settings: UserSettings;
  routines: Routine[];
  habits: Habit[];
  habitLogs: HabitLog[];
  blockLogs: BlockLog[];
  priorities: Priority[];
  applications: Application[];
  energyLogs: EnergyLog[];
  frictionLogs: FrictionLog[];
  weekPlans: WeekPlan[];
  /** Optional for backwards-compatible imports from before flexible tasks. */
  flexTasks?: FlexTask[];
}
