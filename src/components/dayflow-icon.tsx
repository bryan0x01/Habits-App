import { Activity, Bookmark, BookOpen, Briefcase, Building2, CalendarDays, CircleHelp, CircleX, ClipboardCheck, Clock3, Dumbbell, GraduationCap, Home, Languages, LifeBuoy, MessageCircle, MessagesSquare, Moon, MoreHorizontal, Navigation, Send, Sparkles, Sun, Trophy, Utensils, Wallet, Wrench, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const icons = { gym: Dumbbell, work: Briefcase, class: GraduationCap, study: BookOpen, english: Languages, project: Wrench, applications: Send, social: MessageCircle, chores: Sparkles, sleep: Moon, reset: LifeBuoy, body: Activity, school: BookOpen, career: Briefcase, home: Home, money: Wallet, saved: Bookmark, applied: Send, assessment: ClipboardCheck, interview: MessagesSquare, offer: Trophy, rejected: CircleX, "too-tired": Zap, forgot: CircleHelp, "too-late": Clock3, "no-start": Navigation, "no-food": Utensils, other: MoreHorizontal, charlotte: GraduationCap, monterrey: Building2, weekend: Sun, minimum: LifeBuoy, routine: CalendarDays } as const;

export function DayFlowIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name as keyof typeof icons] ?? CalendarDays;
  return <Icon aria-hidden className={cn("size-4 shrink-0", className)} strokeWidth={1.9} />;
}
