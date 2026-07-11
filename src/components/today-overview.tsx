"use client";

import * as React from "react";
import { LifeBuoy, Pill } from "lucide-react";

import { CapacityIcon } from "@/components/capacity-icon";
import { SupportNeedSelector } from "@/components/support-need-selector";
import { useStore } from "@/components/store-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { ENERGY_MODES } from "@/lib/constants";
import { computeToday } from "@/lib/schedule";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

/** One compact control surface instead of three competing dashboard cards. */
export function TodayOverview() {
  const now = useNow(60_000);
  const {
    routine,
    blockLogs,
    settings,
    setEnergyMode,
    setMinimumDay,
    medicationStatus,
    setMedicationStatus,
  } = useStore();

  const view = React.useMemo(
    () => computeToday(routine, now, blockLogs, settings.minimumDay),
    [routine, now, blockLogs, settings.minimumDay],
  );

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        {view.phase !== "empty" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <p className="font-semibold">Today</p>
              <p className="text-muted-foreground">
                {view.doneCount}/{view.requiredCount} done
              </p>
            </div>
            <Progress value={view.progressPct} />
            <p className="text-xs text-muted-foreground">
              {view.remainingCount === 0
                ? "Nothing else required. You can stop here."
                : `${view.remainingCount} ${view.remainingCount === 1 ? "thing" : "things"} left`}
            </p>
          </div>
        ) : null}

        <div className={cn("space-y-2", view.phase !== "empty" && "border-t pt-4")}>
          <p className="text-sm font-semibold">Capacity right now</p>
          <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Capacity right now">
            {ENERGY_MODES.map((mode) => {
              const selected = settings.energyMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setEnergyMode(mode.id)}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-xs font-medium transition-colors",
                    selected
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                      : "border-border bg-background hover:bg-accent",
                  )}
                >
                  <CapacityIcon mode={mode.id} />
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t pt-4">
          <SupportNeedSelector compact />
        </div>

        {settings.medicationTracking ? (
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2">
              <Pill className="size-4 text-primary" />
              <p className="text-sm font-semibold">Medication context</p>
            </div>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Medication context today">
              {([['taken', 'Taken today'], ['not-taken', 'Not today']] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={medicationStatus() === value}
                  onClick={() => setMedicationStatus(medicationStatus() === value ? null : value)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm font-medium",
                    medicationStatus() === value ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Optional context only. Capacity is always set by you; DayFlow does not give medication advice.
            </p>
          </div>
        ) : null}

        <div className="flex items-center gap-3 border-t pt-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LifeBuoy className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor="today-minimum-day" className="text-sm font-semibold">
              Minimum day
            </label>
            <p className="text-xs text-muted-foreground">
              Keep only the non-negotiables.
            </p>
          </div>
          <Switch
            id="today-minimum-day"
            checked={settings.minimumDay}
            onCheckedChange={setMinimumDay}
          />
        </div>
      </CardContent>
    </Card>
  );
}
