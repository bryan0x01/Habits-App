"use client";

import * as React from "react";
import { Check, ChevronDown, Circle, Undo2, Zap } from "lucide-react";

import { SkipTaskButton } from "@/components/friction-dialog";
import { useStore } from "@/components/store-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryMeta } from "@/lib/constants";
import { computeToday, type ScheduledBlock } from "@/lib/schedule";
import { timeRange } from "@/lib/time";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

export function TodayTimeline() {
  const now = useNow(30_000);
  const { routine, blockLogs, settings, setBlockStatus } = useStore();

  const view = React.useMemo(
    () => computeToday(routine, now, blockLogs, settings.minimumDay),
    [routine, now, blockLogs, settings.minimumDay],
  );

  if (view.blocks.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        No blocks scheduled today. Enjoy the open space. 🌿
      </p>
    );
  }

  // The "rest of the day" — what's live now and what's still ahead.
  const rest = view.blocks.filter((b) => b.phase !== "past");

  if (rest.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        That&apos;s the whole schedule. The rest of the evening is yours. 🌙
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {rest.map((block) => (
        <BlockRow
          key={block.id}
          block={block}
          onDone={() => setBlockStatus(block.id, "done")}
          onUndo={() => setBlockStatus(block.id, null)}
        />
      ))}
    </div>
  );
}

function BlockRow({
  block,
  onDone,
  onUndo,
}: {
  block: ScheduledBlock;
  onDone: () => void;
  onUndo: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const cat = categoryMeta(block.category);
  const done = block.status === "done";
  const skipped = block.status === "skipped";
  const live = block.phase === "now";
  const hasDetail = Boolean(block.tinyStart || block.backup);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-3 transition-colors",
        live && "border-primary/50 ring-1 ring-primary/30",
        (done || skipped) && "opacity-70",
        block.optional && "border-dashed",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            done
              ? "bg-success text-success-foreground"
              : skipped
                ? "bg-muted text-muted-foreground"
                : "bg-secondary text-secondary-foreground",
          )}
          aria-hidden
        >
          {done ? (
            <Check className="size-5" />
          ) : (
            <span className="text-base">{cat.emoji}</span>
          )}
        </span>

        <button
          type="button"
          onClick={() => hasDetail && setOpen((v) => !v)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "truncate font-medium",
                (done || skipped) && "line-through decoration-muted-foreground/50",
              )}
            >
              {block.title}
            </p>
            {live ? (
              <Badge className="shrink-0 px-1.5 py-0 text-[0.6rem]">now</Badge>
            ) : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {timeRange(block.start, block.end)}
            {block.optional ? " · optional" : ""}
            {skipped ? " · let go" : ""}
          </p>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          {done || skipped ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Undo"
              onClick={onUndo}
              className="size-9"
            >
              <Undo2 className="size-4" />
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Mark ${block.title} done`}
                onClick={onDone}
                className="size-9 text-success"
              >
                <Circle className="size-5" />
              </Button>
              {hasDetail ? (
                <button
                  type="button"
                  aria-label="Details"
                  onClick={() => setOpen((v) => !v)}
                  className="text-muted-foreground"
                >
                  <ChevronDown
                    className={cn("size-4 transition-transform", open && "rotate-180")}
                  />
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>

      {open && hasDetail ? (
        <div className="mt-3 space-y-2 border-t pt-3">
          {block.tinyStart ? (
            <p className="flex items-start gap-2 text-sm">
              <Zap className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                <span className="font-medium">Tiny start:</span> {block.tinyStart}
              </span>
            </p>
          ) : null}
          {block.backup ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Backup:</span>{" "}
              {block.backup}
            </p>
          ) : null}
          {!done && !skipped ? (
            <SkipTaskButton
              taskType="block"
              refId={block.id}
              title={block.title}
              variant="outline"
              size="sm"
              className="mt-1"
            >
              Skip this
            </SkipTaskButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
