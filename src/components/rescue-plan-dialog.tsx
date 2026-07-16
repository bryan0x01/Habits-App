"use client";

import * as React from "react";
import { ArrowRight, Clock3, LifeBuoy, Minimize2 } from "lucide-react";
import { addDays } from "date-fns";

import { useStore } from "@/components/store-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buildRescuePlan } from "@/lib/planner";
import { dateKey } from "@/lib/time";
import type { FlexTask } from "@/lib/types";
import { cn } from "@/lib/utils";

const WINDOWS = [15, 30, 60, 120] as const;

export function RescuePlanDialog({ tasks }: { tasks: FlexTask[] }) {
  const { settings, updateFlexTask } = useStore();
  const [open, setOpen] = React.useState(false);
  const [minutes, setMinutes] = React.useState<number>(30);
  const plan = React.useMemo(
    () => buildRescuePlan(tasks, minutes, settings.energyMode),
    [minutes, settings.energyMode, tasks],
  );

  const apply = () => {
    const tomorrow = dateKey(addDays(new Date(), 1));
    plan.forEach(({ task, action, plannedMinutes }) => {
      if (action === "shrink") updateFlexTask(task.id, { durationMinutes: plannedMinutes });
      if (action === "move") updateFlexTask(task.id, { date: tomorrow });
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LifeBuoy className="size-4" />
          Adjust plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Make the rest of today fit</DialogTitle>
          <DialogDescription>
            Choose how much time you have. DayFlow will keep what fits and move the rest to tomorrow.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2" role="group" aria-label="Time available">
          {WINDOWS.map((window) => (
            <button
              key={window}
              type="button"
              aria-pressed={minutes === window}
              onClick={() => setMinutes(window)}
              className={cn(
                "rounded-md border px-2 py-2 text-sm font-medium",
                minutes === window ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent",
              )}
            >
              {window < 60 ? `${window}m` : `${window / 60}h`}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {plan.map(({ task, action, plannedMinutes }) => (
            <div key={task.id} className="flex items-center gap-3 rounded-md border p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{task.title}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock3 className="size-3" />
                  {action === "move" ? "Tomorrow" : `${plannedMinutes} min`}
                </p>
              </div>
              <Badge variant={action === "keep" ? "default" : "secondary"}>
                {action === "keep" ? "Keep" : action === "shrink" ? "Shrink" : "Move"}
              </Badge>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
          <Minimize2 className="mt-0.5 size-4 shrink-0" />
          With less energy, fewer tasks stay on today&apos;s list.
        </div>
        <DialogFooter>
          <Button onClick={apply} className="w-full">
            Update today
            <ArrowRight className="size-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
