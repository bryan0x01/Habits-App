"use client";

import * as React from "react";

import { useStore } from "@/components/store-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { computeToday } from "@/lib/schedule";
import { useNow } from "@/lib/use-now";

export function DayProgress() {
  const now = useNow(60_000);
  const { routine, blockLogs, settings } = useStore();

  const view = React.useMemo(
    () => computeToday(routine, now, blockLogs, settings.minimumDay),
    [routine, now, blockLogs, settings.minimumDay],
  );

  if (view.phase === "empty") return null;

  return (
    <Card>
      <CardContent className="space-y-2.5 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Today&apos;s progress</p>
          <div className="flex items-center gap-2">
            {settings.minimumDay ? (
              <Badge variant="secondary" className="text-[0.65rem]">
                Minimum day
              </Badge>
            ) : null}
            <span className="text-sm text-muted-foreground">
              {view.doneCount}/{view.requiredCount}
            </span>
          </div>
        </div>
        <Progress value={view.progressPct} />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {view.remainingCount === 0
              ? "All done — beautiful."
              : `${view.remainingCount} to go`}
          </span>
          {view.skippedCount > 0 ? (
            <span>{view.skippedCount} let go (that&apos;s okay)</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
