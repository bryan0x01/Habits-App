"use client";

import * as React from "react";
import { BriefcaseBusiness, Building2, GraduationCap, Palmtree, Store, WandSparkles } from "lucide-react";

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
import { LIFE_ROUTINE_TEMPLATES } from "@/lib/data/routines";

const ICONS = [GraduationCap, Store, Building2, BriefcaseBusiness, Palmtree];

export function RoutineTemplateDialog({ onAdded }: { onAdded: (id: string) => void }) {
  const { routines, addRoutineTemplate } = useStore();
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <WandSparkles className="size-4" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a starting rhythm</DialogTitle>
          <DialogDescription>
            Research-informed defaults, built to edit. Your actual class, shift, and break times win.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {LIFE_ROUTINE_TEMPLATES.map((template, index) => {
            const Icon = ICONS[index];
            const added = routines.some((routine) => routine.id === template.id);
            return (
              <div key={template.id} className="flex items-center gap-3 rounded-md border p-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
                <Button
                  size="sm"
                  variant={added ? "secondary" : "default"}
                  onClick={() => {
                    const id = addRoutineTemplate(template.id);
                    if (id) onAdded(id);
                    setOpen(false);
                  }}
                >
                  {added ? "Open" : "Add"}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
