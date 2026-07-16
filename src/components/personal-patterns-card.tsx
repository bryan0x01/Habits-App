"use client";

import { BrainCircuit, Eye, Lightbulb } from "lucide-react";
import * as React from "react";

import { useStore } from "@/components/store-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { computePersonalPatterns } from "@/lib/patterns";

export function PersonalPatternsCard({ now }: { now: Date }) {
  const {
    routines,
    blockLogs,
    habitLogs,
    frictionLogs,
    energyLogs,
    flexTasks,
  } = useStore();
  const patterns = React.useMemo(
    () => computePersonalPatterns({ routines, blockLogs, habitLogs, frictionLogs, energyLogs, flexTasks, now }),
    [blockLogs, energyLogs, flexTasks, frictionLogs, habitLogs, now, routines],
  );

  return (
    <Card className="overflow-hidden border-primary/25">
      <CardContent className="p-0">
        <div className="flex items-start gap-3 border-b bg-primary/[0.055] p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <BrainCircuit className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">What DayFlow is learning</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Patterns from your last 28 days of check-ins. This stays in DayFlow.
            </p>
          </div>
        </div>

        {patterns.length === 0 ? (
          <div className="flex items-start gap-3 p-4 text-sm text-muted-foreground">
            <Eye className="mt-0.5 size-4 shrink-0" />
            <p>Complete or skip a few items and DayFlow will start showing patterns without changing your plan.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {patterns.map((pattern) => (
              <li key={pattern.id} className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">{pattern.title}</p>
                  <Badge variant="outline" className="shrink-0 text-[0.65rem]">
                    {pattern.confidence === "steady" ? "clearer" : "early"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{pattern.evidence}</p>
                <p className="flex items-start gap-2 text-sm">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{pattern.suggestion}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
