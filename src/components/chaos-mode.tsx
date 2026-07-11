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
 * Rescue mode strips the day down to exactly three moves so an overloaded brain
 * has nowhere to get lost: one tiny start, one minimum task, one recovery.
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
      <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-300">
        Rescue mode. Only these three are in play.
      </p>

      {/* 1 — one tiny start */}
      <Card className="border-primary/30">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Zap className="size-4" />
            </span>
            <p className="text-sm font-semibold">1 · Tiny start</p>
          </div>
          <p className="text-lg font-bold leading-snug">Don&apos;t think. Start here.</p>
          {focus ? (
            <>
              <p className="text-sm text-muted-foreground">
                {focus.tinyStart ?? `Start ${focus.title}.`}
              </p>
              <Button className="w-full" onClick={() => setBlockStatus(focus.id, "done")}>
                <CheckCircle2 className="size-5" />
                Did it — {focus.title}
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing scheduled. Drink some water — that&apos;s the start.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 2 — one minimum task */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400">
              <Check className="size-4" />
            </span>
            <p className="text-sm font-semibold">2 · One minimum</p>
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
              Minimums done — that&apos;s a saved day already.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 3 — one recovery action */}
      <Card className="border-warning/40 bg-warning/10">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-warning/20 text-warning">
              <LifeBuoy className="size-4" />
            </span>
            <p className="text-sm font-semibold">3 · Recovery</p>
          </div>
          {missed ? (
            <>
              <p className="text-sm">
                <span className="font-medium">Keep it small:</span>{" "}
                {missed.backup ?? "Do 20 minutes instead of skipping completely."}
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setBlockStatus(missed.id, "done")}>
                  Done anyway
                </Button>
                <SkipTaskButton
                  taskType="block"
                  refId={missed.id}
                  title={missed.title}
                  variant="outline"
                  size="sm"
                >
                  Let it go
                </SkipTaskButton>
              </div>
            </>
          ) : (
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <Wind className="mt-0.5 size-4 shrink-0" />
              Nothing to recover. Reset: water, three slow breaths, then one thing.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
