"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { useStore } from "@/components/store-provider";
import { Card, CardContent } from "@/components/ui/card";
import { computeWeeklyMomentum, type DayState } from "@/lib/day-state";
import { WEEKDAY_SHORT } from "@/lib/time";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

const STATE_FILL: Record<DayState, string> = {
  full: "bg-amber-500 text-white border-amber-500",
  strong: "bg-primary text-primary-foreground border-primary",
  saved: "bg-teal-500 text-white border-teal-500",
  started: "bg-secondary text-secondary-foreground border-border",
  none: "bg-transparent text-muted-foreground border-border",
};

export function WeeklyMomentum({ className }: { className?: string }) {
  const now = useNow(60_000);
  const { habits, habitLogs } = useStore();

  const momentum = React.useMemo(
    () => computeWeeklyMomentum(habits, habitLogs, now),
    [habits, habitLogs, now],
  );

  return (
    <Card className={className}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold">Weekly momentum</p>
            <p className="text-xs text-muted-foreground">Completed days, not streaks.</p>
          </div>
          <p className="text-sm font-semibold">
            <span className="text-2xl font-bold text-primary">
              {momentum.completedDays}
            </span>{" "}
            <span className="text-muted-foreground">/ {momentum.totalDays} days</span>
          </p>
        </div>

        <div className="flex justify-between gap-1.5">
          {momentum.days.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={cn(
                  "flex aspect-square w-full items-center justify-center rounded-xl border text-xs font-semibold transition-colors",
                  STATE_FILL[d.state],
                  d.isToday && "ring-2 ring-primary/40 ring-offset-1 ring-offset-background",
                )}
              >
                {d.complete ? (
                  <Check className="size-4" strokeWidth={3} />
                ) : (
                  WEEKDAY_SHORT[d.weekday].charAt(0)
                )}
              </div>
              <span className="text-[0.6rem] text-muted-foreground">
                {WEEKDAY_SHORT[d.weekday].charAt(0)}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Miss a day and nothing breaks. You just pick back up.
        </p>
      </CardContent>
    </Card>
  );
}
