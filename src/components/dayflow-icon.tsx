import {
  Activity,
  AlarmClock,
  BadgeCheck,
  BedDouble,
  Bookmark,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarRange,
  CircleHelp,
  CircleX,
  ClipboardCheck,
  Clock3,
  Coffee,
  Compass,
  Dumbbell,
  Focus,
  GraduationCap,
  Hammer,
  HeartPulse,
  Home,
  Languages,
  LifeBuoy,
  ListRestart,
  MessageCircle,
  MessagesSquare,
  Moon,
  MoreHorizontal,
  Navigation,
  Palmtree,
  Send,
  Sparkles,
  Store,
  Sun,
  Trophy,
  Utensils,
  WalletCards,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  gym: Dumbbell,
  work: BriefcaseBusiness,
  class: GraduationCap,
  study: BookOpenCheck,
  english: Languages,
  project: Hammer,
  applications: Send,
  social: MessageCircle,
  chores: ListRestart,
  sleep: BedDouble,
  reset: Compass,
  body: HeartPulse,
  school: GraduationCap,
  career: BriefcaseBusiness,
  home: Home,
  money: WalletCards,
  saved: Bookmark,
  applied: Send,
  assessment: ClipboardCheck,
  interview: MessagesSquare,
  offer: Trophy,
  rejected: CircleX,
  "too-tired": Zap,
  forgot: CircleHelp,
  "too-late": Clock3,
  "no-start": Navigation,
  "no-food": Utensils,
  other: MoreHorizontal,
  fuel: Utensils,
  care: HeartPulse,
  focus: Focus,
  move: Activity,
  tomorrow: AlarmClock,
  balance: Compass,
  student: GraduationCap,
  shift: Clock3,
  "focus-work": Focus,
  "self-employed": Store,
  vacation: Palmtree,
  minimum: LifeBuoy,
  weekend: Coffee,
  routine: CalendarRange,
  done: BadgeCheck,
  fresh: Sun,
  started: Activity,
  strong: Sparkles,
  full: Trophy,
  night: Moon,
};

const TONES: Record<string, string> = {
  gym: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  body: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  move: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  work: "bg-blue-500/12 text-blue-700 dark:text-blue-300",
  career: "bg-blue-500/12 text-blue-700 dark:text-blue-300",
  focus: "bg-blue-500/12 text-blue-700 dark:text-blue-300",
  class: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  study: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  school: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  project: "bg-orange-500/12 text-orange-700 dark:text-orange-300",
  applications: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  social: "bg-pink-500/12 text-pink-700 dark:text-pink-300",
  chores: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  home: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  money: "bg-teal-500/12 text-teal-700 dark:text-teal-300",
  sleep: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300",
  reset: "bg-primary/10 text-primary",
};

export function routineIconName(input: { id: string; emoji?: string }): string {
  if (input.emoji && icons[input.emoji]) return input.emoji;
  if (input.id.includes("student")) return "student";
  if (input.id.includes("shift")) return "shift";
  if (input.id.includes("focus")) return "focus-work";
  if (input.id.includes("employed") || input.id.includes("owner")) return "self-employed";
  if (input.id.includes("vacation")) return "vacation";
  if (input.id.includes("capacity") || input.id.includes("minimum")) return "minimum";
  if (input.id.includes("weekend")) return "weekend";
  if (input.id.includes("balanced")) return "balance";
  return "routine";
}

export function DayFlowIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? CalendarRange;
  return <Icon aria-hidden className={cn("size-4 shrink-0", className)} strokeWidth={1.9} />;
}

export function IconTile({
  name,
  className,
  iconClassName,
}: {
  name: string;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl",
        TONES[name] ?? "bg-primary/10 text-primary",
        className,
      )}
    >
      <DayFlowIcon name={name} className={cn("size-5", iconClassName)} />
    </span>
  );
}
