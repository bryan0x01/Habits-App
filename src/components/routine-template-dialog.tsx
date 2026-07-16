"use client";

import * as React from "react";
import { Check, WandSparkles } from "lucide-react";

import { IconTile, routineIconName } from "@/components/dayflow-icon";
import { useStore } from "@/components/store-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LIFE_ROUTINE_TEMPLATES, blocksForDay } from "@/lib/data/routines";
import { prettyTime } from "@/lib/time";

export function RoutineTemplateDialog({ onAdded }: { onAdded: (id: string) => void }) {
  const { routines, addRoutineTemplate } = useStore();
  const [open, setOpen] = React.useState(false);
  const available = LIFE_ROUTINE_TEMPLATES.filter(
    (template) => !routines.some((routine) => routine.id === template.id),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <WandSparkles className="size-4" />
          Add a template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose the closest shape</DialogTitle>
          <DialogDescription>
            Use a starting rhythm, then change the times. A template is never a rule.
          </DialogDescription>
        </DialogHeader>

        {available.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-6 text-center">
            <Check className="mx-auto size-6 text-success" />
            <p className="mt-2 text-sm font-semibold">All templates are already in your routines</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {available.map((template) => {
              const anchors = blocksForDay(template, 1).slice(0, 3);
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    const id = addRoutineTemplate(template.id);
                    if (id) onAdded(id);
                    setOpen(false);
                  }}
                  className="w-full rounded-2xl border bg-card p-3 text-left hover:border-primary/40 hover:bg-accent"
                >
                  <div className="flex items-start gap-3">
                    <IconTile name={routineIconName(template)} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{template.name}</p>
                      <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5 pl-[3.25rem]">
                    {anchors.map((anchor) => (
                      <span key={anchor.id} className="rounded-full bg-muted px-2 py-1 text-[0.65rem] text-muted-foreground">
                        {prettyTime(anchor.start)} · {anchor.title}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
