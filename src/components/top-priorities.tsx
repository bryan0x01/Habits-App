"use client";

import * as React from "react";
import { Check, Plus, Target, X } from "lucide-react";

import { useStore } from "@/components/store-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { dateKey } from "@/lib/time";
import { cn } from "@/lib/utils";

const MAX = 3;

export function TopPriorities() {
  const { priorities, addPriority, togglePriority, removePriority } = useStore();
  const today = dateKey();
  const todays = priorities.filter((p) => p.date === today);
  const [draft, setDraft] = React.useState("");

  const doneCount = todays.filter((p) => p.done).length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    addPriority(draft);
    setDraft("");
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-primary" />
            <p className="text-sm font-semibold">Top 3 today</p>
          </div>
          {todays.length > 0 ? (
            <span className="text-xs text-muted-foreground">
              {doneCount}/{todays.length} done
            </span>
          ) : null}
        </div>

        {todays.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Three things that would make today a win. Keep them small.
          </p>
        ) : (
          <ul className="space-y-2">
            {todays.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => togglePriority(p.id)}
                  aria-label={p.done ? "Mark not done" : "Mark done"}
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors",
                    p.done
                      ? "border-success bg-success text-success-foreground"
                      : "border-input",
                  )}
                >
                  {p.done ? <Check className="size-4" /> : null}
                </button>
                <span
                  className={cn(
                    "flex-1 text-sm",
                    p.done && "text-muted-foreground line-through",
                  )}
                >
                  {p.text}
                </span>
                <button
                  type="button"
                  onClick={() => removePriority(p.id)}
                  aria-label="Remove priority"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {todays.length < MAX ? (
          <form onSubmit={submit} className="flex items-center gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Add priority ${todays.length + 1}`}
              className="h-10"
              maxLength={80}
            />
            <button
              type="submit"
              aria-label="Add priority"
              disabled={!draft.trim()}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
            >
              <Plus className="size-5" />
            </button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
