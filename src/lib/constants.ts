import type {
  ApplicationStatus,
  ApplicationType,
  BlockCategory,
  EnergyMode,
  FrictionReason,
  HabitCategory,
  Importance,
  SupportNeed,
} from "@/lib/types";

export const APP_NAME = "DayFlow";
export const APP_TAGLINE = "What to do now — and how to get back on track.";
export const PARENT_BRAND = "Halynt";
export const PRODUCT_NAME = `${APP_NAME} by ${PARENT_BRAND}`;
export const PRODUCT_ATTRIBUTION = `A ${PARENT_BRAND} product`;

export interface EnergyModeMeta {
  id: EnergyMode;
  label: string;
  tagline: string;
  emoji: string;
  chip: string;
  ring: string;
  dot: string;
}

export const ENERGY_MODES: EnergyModeMeta[] = [
  {
    id: "high",
    label: "High",
    tagline: "Ride the wave — take on the big stuff.",
    emoji: "⚡️",
    chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    ring: "ring-emerald-500",
    dot: "bg-emerald-500",
  },
  {
    id: "medium",
    label: "Medium",
    tagline: "Steady and solid. Keep it moving.",
    emoji: "🌊",
    chip: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
    ring: "ring-violet-500",
    dot: "bg-violet-500",
  },
  {
    id: "low",
    label: "Low",
    tagline: "Gentle mode. Small wins still count.",
    emoji: "🌤️",
    chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    ring: "ring-amber-500",
    dot: "bg-amber-500",
  },
  {
    id: "chaos",
    label: "Rescue",
    tagline: "Protect one useful move. The rest can wait.",
    emoji: "🌀",
    chip: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
    ring: "ring-rose-500",
    dot: "bg-rose-500",
  },
];

export function energyMeta(mode: EnergyMode): EnergyModeMeta {
  return ENERGY_MODES.find((m) => m.id === mode) ?? ENERGY_MODES[1];
}

export interface SupportNeedMeta {
  id: SupportNeed;
  label: string;
  shortLabel: string;
  prompt: string;
}

export const SUPPORT_NEEDS: SupportNeedMeta[] = [
  {
    id: "start",
    label: "Getting started",
    shortLabel: "Start",
    prompt: "Forget the whole task. Do only the first visible move.",
  },
  {
    id: "focus",
    label: "Staying focused",
    shortLabel: "Focus",
    prompt: "Keep this one task in view. Everything else can wait.",
  },
  {
    id: "remember",
    label: "Remembering",
    shortLabel: "Remember",
    prompt: "Leave yourself a visible cue for the next step before you move on.",
  },
  {
    id: "switch",
    label: "Switching tasks",
    shortLabel: "Switch",
    prompt: "Close the last task, take one breath, then open this one.",
  },
  {
    id: "overwhelmed",
    label: "Feeling overloaded",
    shortLabel: "Overloaded",
    prompt: "Shrink the task. A lighter version is enough today.",
  },
  {
    id: "varies",
    label: "It depends",
    shortLabel: "It varies",
    prompt: "Use the smallest useful next step and adjust as you go.",
  },
];

export function supportNeedMeta(need: SupportNeed): SupportNeedMeta {
  return SUPPORT_NEEDS.find((item) => item.id === need) ?? SUPPORT_NEEDS[5];
}

export interface FrictionReasonMeta {
  id: FrictionReason;
  label: string;
  emoji: string;
}

export const FRICTION_REASONS: FrictionReasonMeta[] = [
  { id: "too-tired", label: "Too tired", emoji: "🔋" },
  { id: "forgot", label: "Forgot", emoji: "💭" },
  { id: "too-late", label: "Too late", emoji: "⏰" },
  { id: "no-start", label: "Didn't know where to start", emoji: "🧭" },
  { id: "social", label: "Social plans", emoji: "🥂" },
  { id: "no-food", label: "No food", emoji: "🍽️" },
  { id: "other", label: "Something else", emoji: "🤷" },
];

export function frictionMeta(reason: FrictionReason): FrictionReasonMeta {
  return (
    FRICTION_REASONS.find((r) => r.id === reason) ??
    FRICTION_REASONS[FRICTION_REASONS.length - 1]
  );
}

export interface CategoryMeta {
  label: string;
  emoji: string;
  className: string;
}

export const CATEGORY_META: Record<BlockCategory, CategoryMeta> = {
  gym: { label: "Gym", emoji: "🏋️", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  work: { label: "Work", emoji: "💼", className: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  class: { label: "Class", emoji: "🎓", className: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  study: { label: "Study", emoji: "📖", className: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" },
  english: { label: "English", emoji: "🗣️", className: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300" },
  project: { label: "Project", emoji: "🛠️", className: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300" },
  applications: { label: "Applications", emoji: "📮", className: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  social: { label: "Social", emoji: "💬", className: "bg-pink-500/15 text-pink-700 dark:text-pink-300" },
  chores: { label: "Chores", emoji: "🧹", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  sleep: { label: "Sleep", emoji: "🌙", className: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
  reset: { label: "Reset", emoji: "🌿", className: "bg-teal-500/15 text-teal-700 dark:text-teal-300" },
};

export function categoryMeta(category: BlockCategory): CategoryMeta {
  return CATEGORY_META[category] ?? CATEGORY_META.reset;
}

export const BLOCK_CATEGORIES = Object.keys(CATEGORY_META) as BlockCategory[];

export const HABIT_CATEGORY_META: Record<
  HabitCategory,
  CategoryMeta
> = {
  body: { label: "Body", emoji: "💪", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  school: { label: "School", emoji: "📚", className: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" },
  career: { label: "Career", emoji: "💼", className: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  home: { label: "Home", emoji: "🏠", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  money: { label: "Money", emoji: "💰", className: "bg-green-500/15 text-green-700 dark:text-green-300" },
  sleep: { label: "Sleep", emoji: "🌙", className: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
};

export function habitCategoryMeta(category: HabitCategory): CategoryMeta {
  return HABIT_CATEGORY_META[category] ?? HABIT_CATEGORY_META.home;
}

export const HABIT_CATEGORIES = Object.keys(
  HABIT_CATEGORY_META,
) as HabitCategory[];

export interface ImportanceMeta {
  label: string;
  className: string;
  dot: string;
}

export const IMPORTANCE_META: Record<Importance, ImportanceMeta> = {
  low: { label: "Low", className: "bg-slate-500/15 text-slate-600 dark:text-slate-300", dot: "bg-slate-400" },
  medium: { label: "Medium", className: "bg-sky-500/15 text-sky-700 dark:text-sky-300", dot: "bg-sky-500" },
  high: { label: "High", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
};

export interface AppStatusMeta {
  id: ApplicationStatus;
  label: string;
  emoji: string;
  className: string;
}

export const APPLICATION_STATUSES: AppStatusMeta[] = [
  { id: "saved", label: "Saved", emoji: "🔖", className: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
  { id: "applied", label: "Applied", emoji: "📮", className: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  { id: "assessment", label: "Assessment", emoji: "📝", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  { id: "interview", label: "Interview", emoji: "🗣️", className: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  { id: "offer", label: "Offer", emoji: "🎉", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  { id: "rejected", label: "Closed", emoji: "🌱", className: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
];

export function appStatusMeta(status: ApplicationStatus): AppStatusMeta {
  return APPLICATION_STATUSES.find((s) => s.id === status) ?? APPLICATION_STATUSES[0];
}

export interface AppTypeMeta {
  id: ApplicationType;
  label: string;
}

export const APPLICATION_TYPES: AppTypeMeta[] = [
  { id: "full-time", label: "Full-time" },
  { id: "part-time", label: "Part-time" },
  { id: "contract", label: "Contract" },
  { id: "freelance", label: "Freelance" },
  { id: "internship", label: "Internship" },
  { id: "new-grad", label: "New grad" },
  { id: "co-op", label: "Co-op" },
];

export function appTypeMeta(type: ApplicationType): AppTypeMeta {
  return APPLICATION_TYPES.find((t) => t.id === type) ?? APPLICATION_TYPES[0];
}

/** Priority styling for applications (distinct from block importance colors). */
export const APP_PRIORITY_META: Record<Importance, { label: string; className: string; dot: string }> = {
  high: { label: "High", className: "bg-rose-500/15 text-rose-700 dark:text-rose-300", dot: "bg-rose-500" },
  medium: { label: "Medium", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  low: { label: "Low", className: "bg-slate-500/15 text-slate-600 dark:text-slate-300", dot: "bg-slate-400" },
};
