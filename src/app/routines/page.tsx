"use client";

import * as React from "react";
import { Check, MoreHorizontal, Pencil, Plus, Zap } from "lucide-react";

import { BlockEditorSheet } from "@/components/block-editor-sheet";
import { CreateRoutineDialog } from "@/components/create-routine-dialog";
import { IconTile, routineIconName } from "@/components/dayflow-icon";
import { PageContainer, LoadingCards } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { RoutineActionsSheet } from "@/components/routine-actions-sheet";
import { RoutineTemplateDialog } from "@/components/routine-template-dialog";
import { useStore } from "@/components/store-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { blocksForDay } from "@/lib/data/routines";
import { prettyTime, WEEKDAY_SHORT, WEEK_ORDER, weekdayOf } from "@/lib/time";
import type { Routine, RoutineBlock, Weekday } from "@/lib/types";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

export default function RoutinesPage() {
  const now = useNow(60_000);
  const { hydrated, routines, settings, setActiveRoutine } = useStore();
  const [editingId, setEditingId] = React.useState(settings.activeRoutineId);
  const [day, setDay] = React.useState<Weekday>(() => weekdayOf(now));
  const [actionsFor, setActionsFor] = React.useState<Routine | null>(null);
  const [blockEditor, setBlockEditor] = React.useState<{ open: boolean; block?: RoutineBlock }>({ open: false });

  React.useEffect(() => {
    if (hydrated) setEditingId(settings.activeRoutineId);
  }, [hydrated, settings.activeRoutineId]);

  const active = routines.find((routine) => routine.id === settings.activeRoutineId) ?? routines[0];
  const editing = routines.find((routine) => routine.id === editingId) ?? active;
  const dayBlocks = editing ? blocksForDay(editing, day) : [];

  return (
    <>
      <PageHeader title="Routines" subtitle="Build the sequence, not a perfect day" />
      <PageContainer className="space-y-5">
        {!hydrated || !active || !editing ? (
          <LoadingCards />
        ) : (
          <>
            <Card className="overflow-hidden border-primary/20 bg-primary/[0.035]">
              <CardContent className="space-y-4 p-4">
                <div className="flex items-start gap-3">
                  <IconTile name={routineIconName(active)} className="size-12 rounded-2xl" iconClassName="size-6" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-primary">Current rhythm</p>
                    <h2 className="mt-0.5 truncate text-xl font-bold tracking-tight">{active.name}</h2>
                    <p className="mt-1 text-sm leading-snug text-muted-foreground">{active.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border/70 pt-3 text-xs text-muted-foreground">
                  <span>{active.blocks.length} scheduled anchors</span>
                  <button type="button" onClick={() => setActionsFor(active)} className="font-semibold text-primary">
                    Manage
                  </button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-2">
              <RoutineTemplateDialog onAdded={setEditingId} />
              <CreateRoutineDialog onCreated={setEditingId} />
            </div>

            <section className="space-y-3">
              <div className="space-y-2 px-1">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold">Edit schedule</h2>
                    <p className="text-xs text-muted-foreground">Change one day at a time.</p>
                  </div>
                  <Button variant="ghost" size="icon" aria-label={`Options for ${editing.name}`} onClick={() => setActionsFor(editing)}>
                    <MoreHorizontal className="size-5" />
                  </Button>
                </div>
                <Select value={editing.id} onValueChange={setEditingId}>
                  <SelectTrigger aria-label="Routine to edit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {routines.map((routine) => (
                      <SelectItem key={routine.id} value={routine.id}>{routine.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editing.id !== active.id ? (
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveRoutine(editing.id)}>
                    <Check className="size-4" />
                    Make this my current routine
                  </Button>
                ) : null}
              </div>

              <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                {WEEK_ORDER.map((weekday) => {
                  const selected = weekday === day;
                  const isToday = weekday === weekdayOf(now);
                  const count = blocksForDay(editing, weekday).length;
                  return (
                    <button
                      key={weekday}
                      type="button"
                      onClick={() => setDay(weekday)}
                      aria-pressed={selected}
                      className={cn(
                        "flex min-w-14 flex-col items-center rounded-2xl border px-3 py-2 text-xs font-semibold",
                        selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
                      )}
                    >
                      {WEEKDAY_SHORT[weekday]}
                      <span className={cn("mt-0.5 text-[0.65rem]", selected ? "text-primary-foreground/75" : "text-muted-foreground")}>
                        {count || "—"}
                      </span>
                      <span className={cn("mt-1 size-1 rounded-full", isToday ? (selected ? "bg-primary-foreground" : "bg-primary") : "bg-transparent")} />
                    </button>
                  );
                })}
              </div>

              {dayBlocks.length === 0 ? (
                <div className="rounded-3xl border border-dashed p-6 text-center">
                  <p className="font-semibold">Nothing scheduled here</p>
                  <p className="mt-1 text-sm text-muted-foreground">Blank space can be intentional. Add an anchor only if it helps.</p>
                </div>
              ) : (
                <ol className="space-y-2">
                  {dayBlocks.map((block) => (
                    <li key={block.id}>
                      <button
                        type="button"
                        onClick={() => setBlockEditor({ open: true, block })}
                        className="flex w-full items-center gap-3 rounded-2xl border bg-card p-3 text-left hover:bg-accent"
                      >
                        <IconTile name={block.category} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate font-semibold">{block.title}</p>
                            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                              {prettyTime(block.start)}–{prettyTime(block.end)}
                            </span>
                          </div>
                          {block.tinyStart ? (
                            <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                              <Zap className="size-3 shrink-0 text-primary" />
                              {block.tinyStart}
                            </p>
                          ) : null}
                        </div>
                        <Pencil className="size-4 shrink-0 text-muted-foreground" />
                      </button>
                    </li>
                  ))}
                </ol>
              )}

              <Button variant="outline" className="w-full border-dashed" onClick={() => setBlockEditor({ open: true })}>
                <Plus className="size-4" />
                Add an anchor to {WEEKDAY_SHORT[day]}
              </Button>
            </section>
          </>
        )}
      </PageContainer>

      <RoutineActionsSheet
        routine={actionsFor}
        open={actionsFor !== null}
        onOpenChange={(open) => !open && setActionsFor(null)}
        onEdit={setEditingId}
      />

      {editing ? (
        <BlockEditorSheet
          open={blockEditor.open}
          onOpenChange={(open) => setBlockEditor((state) => ({ ...state, open }))}
          routineId={editing.id}
          block={blockEditor.block}
          defaultDay={day}
        />
      ) : null}
    </>
  );
}
