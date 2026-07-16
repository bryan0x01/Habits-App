"use client";

import { Check, Clock3, RotateCcw, Trash2 } from "lucide-react";

import { BrainDumpDialog } from "@/components/brain-dump-dialog";
import { RescuePlanDialog } from "@/components/rescue-plan-dialog";
import { useStore } from "@/components/store-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { categoryMeta } from "@/lib/constants";
import { prioritizeFlexTasks, selectFlexTasksFor } from "@/lib/planner";
import { dateKey } from "@/lib/time";
import { cn } from "@/lib/utils";

export function FlexPlan() {
  const { flexTasks, settings, setFlexTaskDone, removeFlexTask } = useStore();
  const today = dateKey();
  const tasks = prioritizeFlexTasks(
    selectFlexTasksFor(flexTasks, today),
    settings.energyMode,
  );
  const openTasks = tasks.filter((task) => !task.done);

  return (
    <Card className="overflow-hidden border-foreground/15">
      <CardContent className="p-0">
        <div className="flex items-center gap-3 border-b bg-foreground px-4 py-3 text-background dark:bg-foreground dark:text-background">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Loose ends</p>
            <p className="text-xs opacity-70">
              {tasks.length === 0 ? "Write it down when you need to." : `${openTasks.length} left`}
            </p>
          </div>
          {openTasks.length > 0 ? <RescuePlanDialog tasks={openTasks} /> : null}
          <BrainDumpDialog compact />
        </div>

        {tasks.length === 0 ? (
          <div className="px-4 py-5">
            <p className="text-sm font-medium">Add anything you still need to do.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Put one task on each line. DayFlow will help sort the list.
            </p>
          </div>
        ) : (
          <ol>
            {tasks.map((task, index) => {
              const category = categoryMeta(task.category);
              return (
                <li
                  key={task.id}
                  className={cn(
                    "flex items-center gap-3 border-b px-4 py-3 last:border-b-0",
                    task.done && "bg-muted/40 text-muted-foreground",
                  )}
                >
                  <span className="w-5 shrink-0 text-center text-xs font-semibold text-muted-foreground">
                    {task.done ? <Check className="size-4 text-success" /> : index + 1}
                  </span>
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setFlexTaskDone(task.id, !task.done)}
                  >
                    <p className={cn("truncate text-sm font-semibold", task.done && "line-through")}>{task.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary" className="h-5 px-1.5 text-[0.65rem]">{category.label}</Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock3 className="size-3" /> {task.durationMinutes}m
                      </span>
                      <span className="text-xs text-muted-foreground">{task.effort}</span>
                    </div>
                    {!task.done ? (
                      <p className="mt-1.5 truncate text-xs text-muted-foreground">First step: {task.tinyStart}</p>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    aria-label={task.done ? `Restore ${task.title}` : `Remove ${task.title}`}
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => task.done ? setFlexTaskDone(task.id, false) : removeFlexTask(task.id)}
                  >
                    {task.done ? <RotateCcw className="size-4" /> : <Trash2 className="size-4" />}
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
