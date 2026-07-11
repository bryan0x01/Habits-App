"use client";

import { Palmtree, Undo2 } from "lucide-react";

import { useStore } from "@/components/store-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export function VacationModeCard() {
  const { settings, setVacationMode } = useStore();
  const active = Boolean(settings.vacationMode);
  return (
    <Card className={active ? "border-teal-500/40 bg-teal-500/5" : undefined}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-300">
          <Palmtree className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <label htmlFor="vacation-mode" className="text-sm font-semibold">Vacation mode</label>
          <p className="text-xs text-muted-foreground">
            Four loose anchors. Work stays out unless you add it.
          </p>
        </div>
        <Switch id="vacation-mode" checked={active} onCheckedChange={setVacationMode} />
      </CardContent>
    </Card>
  );
}

export function VacationBanner() {
  const { settings, setVacationMode } = useStore();
  if (!settings.vacationMode) return null;
  return (
    <div className="flex items-center gap-3 border-y border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm">
      <Palmtree className="size-5 shrink-0 text-teal-700 dark:text-teal-300" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Vacation rhythm</p>
        <p className="text-xs text-muted-foreground">Be present. Protect only the anchors.</p>
      </div>
      <Button variant="ghost" size="sm" onClick={() => setVacationMode(false)}>
        <Undo2 className="size-4" />
        Return
      </Button>
    </div>
  );
}
