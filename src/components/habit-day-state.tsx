"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { useStore } from "@/components/store-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DAY_STATE_COPY, computeHabitDay, type DayState } from "@/lib/day-state";
import { isHabitDueOn } from "@/lib/habits";
import { weekdayOf } from "@/lib/time";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

const STATE_ACCENT: Record<DayState, string> = {
  none: "",
  started: "",
  saved: "border-teal-500/40 bg-teal-500/5",
  strong: "border-primary/40 bg-primary/5",
  full: "border-amber-500/50 bg-amber-500/10",
};

const PROGRESS_FILL: Record<DayState, string> = {
  none: "bg-primary",
  started: "bg-primary",
  saved: "bg-teal-500",
  strong: "bg-primary",
  full: "bg-amber-500",
};

export function HabitDayStateCard({
  showMinimums = true,
  showLink = true,
}: {
  showMinimums?: boolean;
  showLink?: boolean;
}) {
  const now = useNow(60_000);
  const { habits, habitLogs, habitStatus, setHabitStatus } = useStore();
  const weekday = weekdayOf(now);

  const summary = React.useMemo(
    () => computeHabitDay(habits, habitLogs, now),
    [habits, habitLogs, now],
  );

  const copy = DAY_STATE_COPY[summary.state];
  const pct = summary.dueCount === 0 ? 0 : Math.round(summary.ratio * 100);
  const minimumHabits = habits.filter((h) => h.minimum && isHabitDueOn(h, weekday));

  return (
    <Card className={cn("transition-colors", STATE_ACCENT[summary.state])}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>
              {copy.emoji}
            </span>
            <div>
              <p className="font-semibold leading-tight">{copy.label}</p>
              <p className="text-xs text-muted-foreground">{copy.microcopy}</p>
            </div>
          </div>
          {showLink ? (
            <Link
              href="/habits"
              className="flex shrink-0 items-center text-sm font-medium text-primary"
            >
              Habits
              <ChevronRight className="size-4" />
            </Link>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Today&apos;s habits</span>
            <span>
              {summary.doneCount}/{summary.dueCount}
            </span>
          </div>
          <Progress value={pct} indicatorClassName={PROGRESS_FILL[summary.state]} />
        </div>

        {showMinimums && minimumHabits.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
              Minimums · secure a Day saved
            </p>
            <div className="flex flex-wrap gap-2">
              {minimumHabits.map((h) => {
                const done = habitStatus(h.id) === "done";
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setHabitStatus(h.id, done ? null : "done")}
                    aria-pressed={done}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all active:scale-95",
                      done
                        ? "border-teal-500/40 bg-teal-500/15 text-teal-700 dark:text-teal-300"
                        : "border-border bg-card hover:bg-accent",
                    )}
                  >
                    <span aria-hidden>{h.emoji}</span>
                    <span className={cn(done && "line-through decoration-teal-500/40")}>
                      {h.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
