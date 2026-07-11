"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { useStore } from "@/components/store-provider";
import { DayFlowIcon } from "@/components/dayflow-icon";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { HABIT_CATEGORIES, habitCategoryMeta } from "@/lib/constants";
import { CADENCE_LABEL } from "@/lib/habits";
import type { HabitCadence, HabitCategory } from "@/lib/types";

export function AddHabitDialog() {
  const { addHabit } = useStore();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [cadence, setCadence] = React.useState<HabitCadence>("daily");
  const [category, setCategory] = React.useState<HabitCategory>("home");
  const [minimum, setMinimum] = React.useState(false);
  const [tinyStart, setTinyStart] = React.useState("");

  const reset = () => {
    setName("");
    setCadence("daily");
    setCategory("home");
    setMinimum(false);
    setTinyStart("");
  };

  const submit = () => {
    if (!name.trim()) return;
    addHabit({ name, cadence, category, minimum, tinyStart });
    reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <Plus className="size-4" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New habit</DialogTitle>
          <DialogDescription>
            Keep it small and specific — future you will thank you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <div className="space-y-1.5">
              <Label htmlFor="habit-name">Name</Label>
              <Input
                id="habit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Drink water"
                autoFocus
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as HabitCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HABIT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      <DayFlowIcon name={c} /> {habitCategoryMeta(c).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>How often?</Label>
              <Select
                value={cadence}
                onValueChange={(v) => setCadence(v as HabitCadence)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CADENCE_LABEL) as HabitCadence[]).map((c) => (
                    <SelectItem key={c} value={c}>
                      {CADENCE_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="habit-tiny">Tiny start (optional)</Label>
            <Input
              id="habit-tiny"
              value={tinyStart}
              onChange={(e) => setTinyStart(e.target.value)}
              placeholder="The 2-minute version"
            />
          </div>

          <label className="flex items-center justify-between rounded-xl border p-3">
            <span className="text-sm">
              <span className="font-medium">Minimum habit</span>
              <span className="block text-xs text-muted-foreground">
                Counts toward a &ldquo;Day saved&rdquo;.
              </span>
            </span>
            <Switch checked={minimum} onCheckedChange={setMinimum} />
          </label>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={!name.trim()} className="w-full">
            Add habit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
