"use client";

import { LifeBuoy } from "lucide-react";

import { useStore } from "@/components/store-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function MinimumDayToggle() {
  const { settings, setMinimumDay } = useStore();

  return (
    <Card className={settings.minimumDay ? "border-primary/40 bg-primary/5" : undefined}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LifeBuoy className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <Label htmlFor="minimum-day" className="text-sm font-semibold">
            Protect the day
          </Label>
          <p className="text-xs text-muted-foreground">
            Rough day? Shrink it to just the non-negotiables. Everything else
            becomes optional.
          </p>
        </div>
        <Switch
          id="minimum-day"
          checked={settings.minimumDay}
          onCheckedChange={setMinimumDay}
        />
      </CardContent>
    </Card>
  );
}
