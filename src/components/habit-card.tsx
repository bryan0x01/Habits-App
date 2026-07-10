"use client";

import * as React from "react";
import { Check, Trash2, Undo2 } from "lucide-react";

import { SkipTaskButton } from "@/components/friction-dialog";
import { useStore } from "@/components/store-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { habitCategoryMeta } from "@/lib/constants";
import { CADENCE_LABEL } from "@/lib/habits";
import type { Habit } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Reusable habit row used on the Habits screen and dashboard. */
export function HabitCard({
  habit,
  date,
  showDelete = false,
}: {
  habit: Habit;
  date?: string;
  showDelete?: boolean;
}) {
  const { habitStatus, setHabitStatus, removeHabit } = useStore();
  const status = habitStatus(habit.id, date);
  const done = status === "done";
  const skipped = status === "skipped";
  const cat = habitCategoryMeta(habit.category);

  const subtitle = skipped
    ? "Let go today — no problem"
    : done
      ? "Done today 🎉"
      : habit.tinyStart || CADENCE_LABEL[habit.cadence];

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border bg-card p-3 transition-colors",
        done && "border-success/40 bg-success/5",
        skipped && "opacity-70",
      )}
    >
      <button
        type="button"
        aria-label={done ? `Mark ${habit.name} not done` : `Mark ${habit.name} done`}
        onClick={() => setHabitStatus(habit.id, done ? null : "done", date)}
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full text-xl transition-colors active:scale-95",
          done ? "bg-success text-success-foreground" : "bg-secondary",
        )}
      >
        {done ? <Check className="size-6" /> : <span aria-hidden>{habit.emoji}</span>}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p
            className={cn(
              "truncate font-medium",
              (done || skipped) && "line-through decoration-muted-foreground/40",
            )}
          >
            {habit.name}
          </p>
          {habit.minimum ? (
            <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[0.6rem]">
              min
            </Badge>
          ) : null}
        </div>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Badge
          variant="secondary"
          className={cn("border-0", cat.className)}
          title={cat.label}
        >
          {cat.emoji}
        </Badge>
        {done || skipped ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Undo"
            onClick={() => setHabitStatus(habit.id, null, date)}
            className="size-9"
          >
            <Undo2 className="size-4" />
          </Button>
        ) : (
          <SkipTaskButton
            taskType="habit"
            refId={habit.id}
            title={habit.name}
            variant="ghost"
            size="sm"
          />
        )}
        {showDelete ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${habit.name}`}
            onClick={() => removeHabit(habit.id)}
            className="size-9 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
