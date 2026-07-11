"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { useStore } from "@/components/store-provider";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreateRoutineDialog({ onCreated }: { onCreated: (id: string) => void }) {
  const { createRoutine } = useStore();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  const reset = () => {
    setName("");
    setDescription("");
  };

  const submit = () => {
    if (!name.trim()) return;
    const id = createRoutine({ name, description });
    reset();
    setOpen(false);
    onCreated(id);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Plus className="size-4" />
          New routine
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Build a routine</DialogTitle>
          <DialogDescription>
            Start with a blank week, then add only the blocks that help.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <div className="space-y-1.5">
              <Label htmlFor="new-routine-name">Name</Label>
              <Input
                id="new-routine-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submit();
                }}
                placeholder="e.g. Exam week"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="routine-description">Description (optional)</Label>
            <Textarea
              id="routine-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What kind of week is this for?"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={!name.trim()} className="w-full">
            Create and add blocks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
