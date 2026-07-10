"use client";

import * as React from "react";
import { Check, Copy, Pencil, Trash2 } from "lucide-react";

import { useStore } from "@/components/store-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Routine } from "@/lib/types";

export function RoutineActionsSheet({
  routine,
  open,
  onOpenChange,
  onEdit,
}: {
  routine: Routine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (id: string) => void;
}) {
  const {
    settings,
    routines,
    setActiveRoutine,
    duplicateRoutine,
    renameRoutine,
    deleteRoutine,
  } = useStore();
  const [name, setName] = React.useState("");

  React.useEffect(() => {
    if (routine) setName(routine.name);
  }, [routine, open]);

  if (!routine) return null;

  const isActive = settings.activeRoutineId === routine.id;
  const canDelete = !routine.seeded && routines.length > 1;

  const saveName = () => {
    if (name.trim() && name.trim() !== routine.name) renameRoutine(routine.id, name);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="px-4 pb-6 pt-4">
        <SheetHeader className="mb-4 mt-2">
          <SheetTitle>
            {routine.emoji} {routine.name}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="routine-name">Name</Label>
            <div className="flex gap-2">
              <Input
                id="routine-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={saveName}
              />
              <Button
                variant="secondary"
                size="icon"
                className="size-11 shrink-0"
                aria-label="Save name"
                onClick={saveName}
              >
                <Pencil className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            {!isActive ? (
              <Button
                onClick={() => {
                  setActiveRoutine(routine.id);
                  onOpenChange(false);
                }}
              >
                <Check className="size-4" />
                Use this routine
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 py-2.5 text-sm font-medium text-primary">
                <Check className="size-4" />
                Active routine
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => {
                onEdit(routine.id);
                onOpenChange(false);
              }}
            >
              <Pencil className="size-4" />
              Edit blocks
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const id = duplicateRoutine(routine.id);
                onOpenChange(false);
                if (id) onEdit(id);
              }}
            >
              <Copy className="size-4" />
              Duplicate
            </Button>

            {canDelete ? (
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => {
                  deleteRoutine(routine.id);
                  onOpenChange(false);
                }}
              >
                <Trash2 className="size-4" />
                Delete routine
              </Button>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
