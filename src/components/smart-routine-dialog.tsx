"use client";

import { Clock3, Plus, Route } from "lucide-react";
import * as React from "react";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { categoryMeta } from "@/lib/constants";
import {
  draftRoutineLocally,
  learnPlanningProfile,
  type LocalRoutineDraft,
} from "@/lib/local-planning-engine";
import { prettyTime, WEEKDAY_LABELS, WEEK_ORDER } from "@/lib/time";
import { useNow } from "@/lib/use-now";

const EXAMPLE =
  "I work Monday to Friday from 9 to 5. Gym on Monday, Wednesday, and Friday after work. Add a short evening reset and a calm Sunday planning block.";

export function SmartRoutineDialog({ onCreated }: { onCreated: (id: string) => void }) {
  const now = useNow(60_000);
  const { createRoutineFromDraft, routines, blockLogs, flexTasks } = useStore();
  const [open, setOpen] = React.useState(false);
  const [prompt, setPrompt] = React.useState("");
  const [draft, setDraft] = React.useState<LocalRoutineDraft | null>(null);
  const [note, setNote] = React.useState("");
  const [warnings, setWarnings] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const reset = () => {
    setPrompt("");
    setDraft(null);
    setNote("");
    setWarnings([]);
    setError(null);
  };

  const buildDraft = () => {
    const profile = learnPlanningProfile({ routines, blockLogs, flexTasks, now });
    const result = draftRoutineLocally(prompt, profile);
    if (!result.draft) {
      setError(result.note);
      setWarnings(result.warnings);
      return;
    }
    setDraft(result.draft);
    setNote(result.note);
    setWarnings(result.warnings);
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="col-span-2 w-full">
          <Route className="size-4" />
          Build from a description
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Describe your week</DialogTitle>
          <DialogDescription>
            DayFlow turns repeated days and times into an editable draft on this device.
          </DialogDescription>
        </DialogHeader>

        {!draft ? (
          <div className="space-y-3">
            <Label htmlFor="routine-description">What repeats during your week?</Label>
            <Textarea
              id="routine-description"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={EXAMPLE}
              rows={8}
              maxLength={2_000}
              autoFocus
            />
            <div className="flex items-start justify-between gap-3 text-xs text-muted-foreground">
              <p>Include fixed times, days, and words like before work, after work, morning, or evening.</p>
              <span className="shrink-0">{prompt.length}/2000</span>
            </div>
            {error ? (
              <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <Button className="w-full" disabled={prompt.trim().length < 8} onClick={buildDraft}>
              <Route className="size-4" />
              Build my draft
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Private by design. Your description never leaves DayFlow.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-base font-bold">{draft.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{draft.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {draft.blocks.length} blocks · nothing is saved until you add it
              </p>
            </div>

            {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
            {warnings.length > 0 ? (
              <ul className="space-y-1 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                {warnings.map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
            ) : null}

            <div className="space-y-3">
              {WEEK_ORDER.map((day) => {
                const blocks = draft.blocks.filter((block) => block.day === day);
                if (blocks.length === 0) return null;
                return (
                  <section key={day} className="space-y-1.5">
                    <p className="px-1 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {WEEKDAY_LABELS[day]}
                    </p>
                    {blocks.map((block, index) => {
                      const category = categoryMeta(block.category);
                      return (
                        <div key={`${day}-${block.start}-${index}`} className="rounded-xl border p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold">{block.title}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                First step: {block.tinyStart}
                              </p>
                            </div>
                            <Badge variant="secondary">{category.label}</Badge>
                          </div>
                          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock3 className="size-3" />
                            {prettyTime(block.start)}–{prettyTime(block.end)}
                          </p>
                        </div>
                      );
                    })}
                  </section>
                );
              })}
            </div>
          </div>
        )}

        {draft ? (
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>Change description</Button>
            <Button
              onClick={() => {
                const id = createRoutineFromDraft(draft);
                onCreated(id);
                setOpen(false);
                reset();
              }}
            >
              <Plus className="size-4" />
              Add routine
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
