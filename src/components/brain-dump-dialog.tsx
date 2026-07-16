"use client";

import * as React from "react";
import { Brain, Clock3, ListFilter, Plus, X } from "lucide-react";

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
import { learnPlanningProfile, organizeBrainDumpLocally } from "@/lib/local-planning-engine";
import { useNow } from "@/lib/use-now";
import type { FlexTaskDraft } from "@/lib/types";

export function BrainDumpDialog({ compact = false }: { compact?: boolean }) {
  const now = useNow(60_000);
  const { addFlexTasks, settings, supportNeed, routines, blockLogs, flexTasks } = useStore();
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [drafts, setDrafts] = React.useState<FlexTaskDraft[]>([]);
  const [notice, setNotice] = React.useState<string | null>(null);

  const reset = () => {
    setInput("");
    setDrafts([]);
    setNotice(null);
  };

  const organizeList = () => {
    if (!input.trim()) return;
    const profile = learnPlanningProfile({ routines, blockLogs, flexTasks, now });
    setDrafts(organizeBrainDumpLocally({
      input,
      energyMode: settings.energyMode,
      supportNeed: supportNeed(),
      profile,
    }));
    setNotice(profile.sampleSize >= 3
      ? `Organized on this device using ${profile.sampleSize} recent check-ins.`
      : "Organized on this device. DayFlow will tune the order as you complete or skip blocks.");
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
        <Button variant={compact ? "ghost" : "default"} size="sm">
          <Brain className="size-4" />
          Clear my head
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Write down what&apos;s on your mind</DialogTitle>
          <DialogDescription>
            Add one item per line. DayFlow will turn it into a short, editable list.
          </DialogDescription>
        </DialogHeader>

        {drafts.length === 0 ? (
          <div className="space-y-3">
            <Label htmlFor="brain-dump">What needs to get out of your head?</Label>
            <Textarea
              id="brain-dump"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={7}
              autoFocus
              placeholder={"Study chapter 4 for 45 min\nEmail Ana today\nLaundry\nPrepare interview questions"}
            />
            <p className="text-xs text-muted-foreground">
              Add a duration or words like today, deadline, optional, study, email, gym, or project to improve the estimate.
            </p>
            <Button className="w-full" disabled={!input.trim()} onClick={organizeList}>
              <ListFilter className="size-4" />
              Organize my list
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Nothing is uploaded. DayFlow uses simple rules plus your own check-ins.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notice ? (
              <p className="rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">{notice}</p>
            ) : null}
            {drafts.map((draft, index) => {
              const category = categoryMeta(draft.category);
              return (
                <div key={`${draft.title}-${index}`} className="rounded-md border p-3">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{draft.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary">{category.label}</Badge>
                        <Badge variant="outline">{draft.effort}</Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock3 className="size-3" />
                          {draft.durationMinutes} min · minimum {draft.minimumMinutes}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        First step: {draft.tinyStart}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${draft.title}`}
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setDrafts((list) => list.filter((_, itemIndex) => itemIndex !== index))}
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {drafts.length > 0 ? (
          <DialogFooter>
            <Button variant="outline" onClick={() => setDrafts([])}>Back</Button>
            <Button
              onClick={() => {
                addFlexTasks(drafts);
                setOpen(false);
                reset();
              }}
            >
              <Plus className="size-4" />
              Add {drafts.length} to today
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
