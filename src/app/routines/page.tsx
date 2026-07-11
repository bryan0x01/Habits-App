"use client";

import * as React from "react";
import { DayFlowIcon } from "@/components/dayflow-icon";
import { Check, MoreHorizontal, Pencil, Plus, Zap } from "lucide-react";

import { BlockEditorSheet } from "@/components/block-editor-sheet";
import { CreateRoutineDialog } from "@/components/create-routine-dialog";
import { PageContainer, LoadingCards } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { RoutineActionsSheet } from "@/components/routine-actions-sheet";
import { useStore } from "@/components/store-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { categoryMeta, IMPORTANCE_META } from "@/lib/constants";
import { blocksForDay } from "@/lib/data/routines";
import { prettyTime, WEEKDAY_SHORT, WEEK_ORDER, weekdayOf } from "@/lib/time";
import type { Routine, RoutineBlock, Weekday } from "@/lib/types";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

export default function RoutinesPage() {
  const now = useNow(60_000);
  const { hydrated, routines, settings } = useStore();

  const [editingId, setEditingId] = React.useState(settings.activeRoutineId);
  const [day, setDay] = React.useState<Weekday>(() => weekdayOf(now));
  const [actionsFor, setActionsFor] = React.useState<Routine | null>(null);
  const [blockEditor, setBlockEditor] = React.useState<{
    open: boolean;
    block?: RoutineBlock;
  }>({ open: false });

  // Point the editor at the active routine once data has hydrated.
  React.useEffect(() => {
    if (hydrated) setEditingId(settings.activeRoutineId);
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const editing =
    routines.find((r) => r.id === editingId) ??
    routines.find((r) => r.id === settings.activeRoutineId) ??
    routines[0];

  const dayBlocks = editing ? blocksForDay(editing, day) : [];

  return (
    <>
      <PageHeader title="Routines" subtitle="Templates you can make your own" />
      <PageContainer className="space-y-5">
        {!hydrated || !editing ? (
          <LoadingCards />
        ) : (
          <>
            <section className="space-y-2">
              <div className="flex items-center justify-between px-1 pb-1">
                <div>
                  <h2 className="text-sm font-semibold">Your routines</h2>
                  <p className="text-xs text-muted-foreground">
                    Pick a template or start with a blank week.
                  </p>
                </div>
                <CreateRoutineDialog onCreated={setEditingId} />
              </div>
              {routines.map((r) => {
                const active = r.id === settings.activeRoutineId;
                const isEditing = r.id === editing.id;
                return (
                  <Card
                    key={r.id}
                    className={cn(
                      "transition-colors",
                      isEditing ? "border-primary/60 ring-1 ring-primary/30" : "",
                    )}
                  >
                    <CardContent className="flex items-center gap-3 p-3">
                      <button
                        type="button"
                        onClick={() => setEditingId(r.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span className="text-3xl" aria-hidden>
                          <DayFlowIcon name={r.id.includes("charlotte") ? "charlotte" : r.id.includes("monterrey") ? "monterrey" : r.id.includes("weekend") ? "weekend" : r.id.includes("minimum") ? "minimum" : "routine"} className="size-5" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-semibold">{r.name}</p>
                            {active ? (
                              <Badge className="shrink-0 px-1.5 py-0 text-[0.6rem]">
                                Active
                              </Badge>
                            ) : null}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {r.blocks.length} blocks · {r.description}
                          </p>
                        </div>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Options for ${r.name}`}
                        className="size-9 shrink-0"
                        onClick={() => setActionsFor(r)}
                      >
                        <MoreHorizontal className="size-5" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold">
                  Editing · {editing.name}
                </h2>
                <button
                  type="button"
                  onClick={() => setActionsFor(editing)}
                  className="flex items-center gap-1 text-sm font-medium text-primary"
                >
                  <Pencil className="size-3.5" />
                  Rename
                </button>
              </div>

              <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
                {WEEK_ORDER.map((d) => {
                  const selected = d === day;
                  const isToday = d === weekdayOf(now);
                  const count = blocksForDay(editing, d).length;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDay(d)}
                      className={cn(
                        "flex min-w-[3.25rem] flex-col items-center gap-0.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:bg-accent",
                      )}
                    >
                      {WEEKDAY_SHORT[d]}
                      <span
                        className={cn(
                          "text-[0.6rem]",
                          selected ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {count > 0 ? count : "–"}
                      </span>
                      {isToday ? (
                        <span
                          className={cn(
                            "size-1 rounded-full",
                            selected ? "bg-primary-foreground" : "bg-primary",
                          )}
                        />
                      ) : (
                        <span className="size-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              {dayBlocks.length === 0 ? (
                <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No blocks on this day yet. Add one below. 🌿
                </p>
              ) : (
                <ol className="space-y-2">
                  {dayBlocks.map((block) => {
                    const cat = categoryMeta(block.category);
                    const imp = IMPORTANCE_META[block.importance];
                    return (
                      <li key={block.id}>
                        <button
                          type="button"
                          onClick={() => setBlockEditor({ open: true, block })}
                          className="flex w-full items-center gap-3 rounded-2xl border bg-card p-3 text-left transition-colors hover:bg-accent"
                        >
                          <span
                            className={cn("size-2 shrink-0 rounded-full", imp.dot)}
                            title={`${imp.label} importance`}
                          />
                          <div className="w-14 shrink-0">
                            <p className="text-sm font-semibold tabular-nums">
                              {prettyTime(block.start)}
                            </p>
                            <p className="text-[0.65rem] text-muted-foreground tabular-nums">
                              {prettyTime(block.end)}
                            </p>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p className="font-medium">{block.title}</p>
                              <Badge
                                variant="secondary"
                                className={cn("border-0", cat.className)}
                              >
                                <DayFlowIcon name={block.category} /> {cat.label}
                              </Badge>
                            </div>
                            {block.tinyStart ? (
                              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                                <Zap className="size-3 shrink-0 text-primary" />
                                {block.tinyStart}
                              </p>
                            ) : null}
                          </div>
                          <Pencil className="size-4 shrink-0 text-muted-foreground" />
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}

              <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={() => setBlockEditor({ open: true, block: undefined })}
              >
                <Plus className="size-4" />
                Add block to {WEEKDAY_SHORT[day]}
              </Button>
            </section>
          </>
        )}
      </PageContainer>

      <RoutineActionsSheet
        routine={actionsFor}
        open={actionsFor !== null}
        onOpenChange={(o) => !o && setActionsFor(null)}
        onEdit={(id) => setEditingId(id)}
      />

      {editing ? (
        <BlockEditorSheet
          open={blockEditor.open}
          onOpenChange={(o) => setBlockEditor((s) => ({ ...s, open: o }))}
          routineId={editing.id}
          block={blockEditor.block}
          defaultDay={day}
        />
      ) : null}
    </>
  );
}
