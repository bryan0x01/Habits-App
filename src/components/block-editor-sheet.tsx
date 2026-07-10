"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { useStore, type BlockInput } from "@/components/store-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { BLOCK_CATEGORIES, IMPORTANCE_META, categoryMeta } from "@/lib/constants";
import { toMinutes, WEEKDAY_LABELS, WEEK_ORDER } from "@/lib/time";
import type { BlockCategory, Importance, RoutineBlock, Weekday } from "@/lib/types";
import { cn } from "@/lib/utils";

const NOTIFY_OPTIONS = [0, 5, 10, 15, 30, 60];
const IMPORTANCE_ORDER: Importance[] = ["low", "medium", "high"];

interface FormState {
  title: string;
  category: BlockCategory;
  day: Weekday;
  start: string;
  end: string;
  importance: Importance;
  tinyStart: string;
  backup: string;
  notify: number;
  notes: string;
}

function initialForm(block?: RoutineBlock, defaultDay: Weekday = 1): FormState {
  return {
    title: block?.title ?? "",
    category: block?.category ?? "work",
    day: block?.day ?? defaultDay,
    start: block?.start ?? "09:00",
    end: block?.end ?? "10:00",
    importance: block?.importance ?? "medium",
    tinyStart: block?.tinyStart ?? "",
    backup: block?.backup ?? "",
    notify: block?.notificationMinutesBefore ?? 0,
    notes: block?.notes ?? "",
  };
}

export function BlockEditorSheet({
  open,
  onOpenChange,
  routineId,
  block,
  defaultDay = 1,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routineId: string;
  block?: RoutineBlock;
  defaultDay?: Weekday;
}) {
  const { addBlock, updateBlock, deleteBlock } = useStore();
  const [form, setForm] = React.useState<FormState>(() => initialForm(block, defaultDay));
  const [days, setDays] = React.useState<Weekday[]>([defaultDay]);

  React.useEffect(() => {
    if (open) {
      setForm(initialForm(block, defaultDay));
      setDays([block?.day ?? defaultDay]);
    }
  }, [open, block, defaultDay]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const timeInvalid = toMinutes(form.end) <= toMinutes(form.start);
  const canSave = form.title.trim().length > 0 && !timeInvalid;

  const submit = () => {
    if (!canSave) return;
    const payload: BlockInput = {
      title: form.title.trim(),
      category: form.category,
      day: form.day,
      start: form.start,
      end: form.end,
      importance: form.importance,
      tinyStart: form.tinyStart.trim() || undefined,
      backup: form.backup.trim() || undefined,
      notificationMinutesBefore: form.notify > 0 ? form.notify : undefined,
      notes: form.notes.trim() || undefined,
    };
    if (block) {
      updateBlock(routineId, block.id, payload);
    } else {
      days.forEach((day) => addBlock(routineId, { ...payload, day }));
    }
    onOpenChange(false);
  };

  const toggleDay = (day: Weekday) => {
    setDays((selected) => {
      if (selected.includes(day)) {
        return selected.length === 1 ? selected : selected.filter((item) => item !== day);
      }
      return WEEK_ORDER.filter((item) => [...selected, day].includes(item));
    });
  };

  const handleDelete = () => {
    if (block) deleteBlock(routineId, block.id);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto px-4 pb-6 pt-4">
        <SheetHeader className="mb-4 mt-2">
          <SheetTitle>{block ? "Edit block" : "New block"}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="block-title">Title</Label>
            <Input
              id="block-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Gym"
              autoFocus
            />
          </div>

          <div className={cn("grid gap-3", block ? "grid-cols-2" : "grid-cols-1")}>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => set("category", v as BlockCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {categoryMeta(c).emoji} {categoryMeta(c).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {block ? (
              <div className="space-y-1.5">
                <Label>Day</Label>
                <Select
                  value={String(form.day)}
                  onValueChange={(v) => set("day", Number(v) as Weekday)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEK_ORDER.map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        {WEEKDAY_LABELS[d]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>

          {!block ? (
            <fieldset className="space-y-1.5">
              <legend className="text-sm font-medium leading-none">Repeat on</legend>
              <div className="grid grid-cols-7 gap-1" role="group" aria-label="Repeat days">
                {WEEK_ORDER.map((day) => {
                  const selected = days.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      aria-pressed={selected}
                      aria-label={WEEKDAY_LABELS[day]}
                      onClick={() => toggleDay(day)}
                      className={cn(
                        "rounded-lg border px-1 py-2 text-xs font-medium transition-colors",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:bg-accent",
                      )}
                    >
                      {WEEKDAY_LABELS[day].slice(0, 1)}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                One block will be added to each selected day.
              </p>
            </fieldset>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="block-start">Start</Label>
              <Input
                id="block-start"
                type="time"
                value={form.start}
                onChange={(e) => set("start", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="block-end">End</Label>
              <Input
                id="block-end"
                type="time"
                value={form.end}
                onChange={(e) => set("end", e.target.value)}
                className={cn(timeInvalid && "border-destructive focus-visible:ring-destructive")}
              />
            </div>
          </div>
          {timeInvalid ? (
            <p className="-mt-2 text-xs text-destructive">
              End time must be after the start time.
            </p>
          ) : null}

          <div className="space-y-1.5">
            <Label>Importance</Label>
            <div className="grid grid-cols-3 gap-2">
              {IMPORTANCE_ORDER.map((imp) => {
                const active = form.importance === imp;
                return (
                  <button
                    key={imp}
                    type="button"
                    onClick={() => set("importance", imp)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-sm font-medium capitalize transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-accent",
                    )}
                  >
                    {IMPORTANCE_META[imp].label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              High-importance blocks stay on Minimum Days and trigger recovery prompts.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="block-tiny">Tiny start</Label>
            <Input
              id="block-tiny"
              value={form.tinyStart}
              onChange={(e) => set("tinyStart", e.target.value)}
              placeholder="The 2-minute on-ramp"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="block-backup">Backup option</Label>
            <Input
              id="block-backup"
              value={form.backup}
              onChange={(e) => set("backup", e.target.value)}
              placeholder="A lighter version for low-energy days"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Reminder</Label>
            <Select
              value={String(form.notify)}
              onValueChange={(v) => set("notify", Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NOTIFY_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n === 0 ? "No reminder" : `${n} min before`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="block-notes">Notes</Label>
            <Textarea
              id="block-notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          {block ? (
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              aria-label="Delete block"
              className="size-11 shrink-0 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-5" />
            </Button>
          ) : null}
          <Button onClick={submit} disabled={!canSave} className="flex-1">
            {block
              ? "Save changes"
              : `Add to ${days.length} day${days.length === 1 ? "" : "s"}`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
