"use client";

import * as React from "react";
import { DayFlowIcon } from "@/components/dayflow-icon";
import { Check, CheckCircle2, LifeBuoy, Wind, Zap } from "lucide-react";

import { SkipTaskButton } from "@/components/friction-dialog";
import { useStore } from "@/components/store-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { computeToday } from "@/lib/schedule";
import { isHabitDueOn } from "@/lib/habits";
import { weekdayOf } from "@/lib/time";
import { useNow } from "@/lib/use-now";

/**
 * Very-low mode keeps only three choices on screen.
 */
export function ChaosMode() {
  const now = useNow(30_000);
  const {
    routine,
    blockLogs,
    settings,
    habits,
    habitStatus,
    setHabitStatus,
    setBlockStatus,
    setEnergyMode,
  } = useStore();

  const view = React.useMemo(
    () => computeToday(routine, now, blockLogs, settings.minimumDay),
    [routine, now, blockLogs, settings.minimumDay],
  );

  const weekday = weekdayOf(now);
  const minimums = habits.filter((h) => h.minimum && isHabitDueOn(h, weekday));
  const nextMinimum = minimums.find((h) => habitStatus(h.id) !== "done") ?? null;

  const focus = view.focus;
  const missed = view.missed;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
        <p className="min-w-0 flex-1 font-medium">Keeping today simple. Start with one.</p>
        <button
          type="button"
          onClick={() => setEnergyMode("low")}
          className="shrink-0 rounded-xl bg-background/80 px-3 py-2 text-xs font-semibold text-foreground shadow-sm"
        >
          Show more
        </button>
      </div>

      {/* 1 — one tiny start */}
      <Card data-rescue-card className="border-primary/30">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Zap className="size-4" />
            </span>
            <p className="text-sm font-semibold">1 · Start here</p>
          </div>
          <p className="text-lg font-bold leading-snug">Do this first.</p>
          {focus ? (
            <>
              <p className="text-sm text-muted-foreground">
                {focus.tinyStart ?? `Start ${focus.title}.`}
              </p>
              <Button className="w-full" onClick={() => setBlockStatus(focus.id, "done")}>
                <CheckCircle2 className="size-5" />
                Done — {focus.title}
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing is planned right now. Drink some water or take a short break.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 2 — one minimum task */}
      <Card data-rescue-card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400">
              <Check className="size-4" />
            </span>
            <p className="text-sm font-semibold">2 · One basic</p>
          </div>
          {nextMinimum ? (
            <>
              <p className="text-lg font-bold leading-snug">
                <DayFlowIcon name={nextMinimum.category} /> {nextMinimum.name}
              </p>
              {nextMinimum.tinyStart ? (
                <p className="text-sm text-muted-foreground">{nextMinimum.tinyStart}</p>
              ) : null}
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setHabitStatus(nextMinimum.id, "done")}
              >
                <Check className="size-5" />
                Done
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your basics are done.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 3 — one recovery action */}
      <Card data-rescue-card className="border-warning/40 bg-warning/10">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-warning/20 text-warning">
              <LifeBuoy className="size-4" />
            </span>
            <p className="text-sm font-semibold">3 · One missed task</p>
          </div>
          {missed ? (
            <>
              <p className="text-sm">
                <span className="font-medium">Short option:</span>{" "}
                {missed.backup ?? "Do 20 minutes instead of skipping completely."}
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setBlockStatus(missed.id, "done")}>
                  Mark done
                </Button>
                <SkipTaskButton
                  taskType="block"
                  refId={missed.id}
                  title={missed.title}
                  variant="outline"
                  size="sm"
                >
                  Skip it
                </SkipTaskButton>
              </div>
            </>
          ) : (
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <Wind className="mt-0.5 size-4 shrink-0" />
              Nothing needs catching up. Take a break or choose one small task.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
