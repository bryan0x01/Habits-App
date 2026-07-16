"use client";

import * as React from "react";
import { Check, ChevronDown, Circle, Undo2, X, Zap } from "lucide-react";

import { SkipTaskButton } from "@/components/friction-dialog";
import { DayFlowIcon } from "@/components/dayflow-icon";
import { useStore } from "@/components/store-provider";
import { Button } from "@/components/ui/button";
import { categoryMeta } from "@/lib/constants";
import { computeToday, type ScheduledBlock } from "@/lib/schedule";
import { minutesNow, prettyTime } from "@/lib/time";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

/**
 * The rest of the day as a single downhill current: one rail, one node per
 * block, the live block visibly draining. No per-row cards — the hero above
 * is the only heavy surface on the dashboard.
 */
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
        No blocks scheduled today. Enjoy the open space.
      </p>
    );
  }

  const rest = view.blocks.filter((b) => b.phase !== "past");

  if (rest.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        That&apos;s the whole schedule. The rest of the evening is yours.
      </p>
    );
  }

  return (
    <ol className="relative">
      <span
        aria-hidden
        className="absolute bottom-3 left-[13px] top-3 w-px bg-border"
      />
      {rest.map((block) => (
        <FlowRow
          key={block.id}
          block={block}
          now={now}
          onDone={() => setBlockStatus(block.id, "done")}
          onUndo={() => setBlockStatus(block.id, null)}
        />
      ))}
    </ol>
  );
}

function FlowRow({
  block,
  now,
  onDone,
  onUndo,
}: {
  block: ScheduledBlock;
  now: Date;
  onDone: () => void;
  onUndo: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const cat = categoryMeta(block.category);
  const done = block.status === "done";
  const skipped = block.status === "skipped";
  const live = block.phase === "now";
  const hasDetail = Boolean(block.tinyStart || block.backup);

  // Tiimo's best idea, our way: the live block's time visibly drains.
  const elapsedPct = live
    ? Math.round(
        ((minutesNow(now) - block.startMin) /
          Math.max(1, block.endMin - block.startMin)) *
          100,
      )
    : 0;

  return (
    <li className="relative pl-9">
      {/* Node on the rail */}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-3 flex size-7 items-center justify-center rounded-full border-2 bg-background",
          done && "border-success bg-success text-success-foreground",
          skipped && "border-border bg-muted text-muted-foreground",
          live && "border-primary text-primary animate-now-pulse",
          !done && !skipped && !live && "border-border text-muted-foreground",
          block.optional && !done && !skipped && "border-dashed",
        )}
      >
        {done ? (
          <Check className="size-4" strokeWidth={3} />
        ) : skipped ? (
          <X className="size-3.5" />
        ) : live ? (
          <span className="size-2 rounded-full bg-primary" />
        ) : (
          <DayFlowIcon name={block.category} className="size-3.5" />
        )}
      </span>

      <div
        className={cn(
          "flex items-start gap-2 border-b border-border/60 py-3",
          (done || skipped) && "opacity-60",
        )}
      >
        <button
          type="button"
          onClick={() => hasDetail && setOpen((v) => !v)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex items-baseline justify-between gap-3">
            <p
              className={cn(
                "truncate font-medium",
                live && "font-semibold",
                (done || skipped) && "line-through decoration-muted-foreground/50",
              )}
            >
              {block.title}
            </p>
            <span className="shrink-0 text-[0.7rem] tabular-nums text-muted-foreground">
              {prettyTime(block.start)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {cat.label}
            {block.optional ? " · optional" : ""}
            {skipped ? " · let go" : ""}
            {live ? " · now" : ""}
          </p>
          {live && !done ? (
            <span className="mt-2 block h-1 w-full overflow-hidden rounded-full bg-secondary">
              <span
                className="block h-full rounded-full bg-primary transition-[width] duration-700"
                style={{ width: `${Math.min(100, Math.max(4, elapsedPct))}%` }}
              />
            </span>
          ) : null}
        </button>

        <div className="flex shrink-0 items-center">
          {done || skipped ? (
            <Button variant="ghost" size="icon" aria-label="Undo" onClick={onUndo} className="size-8">
              <Undo2 className="size-4" />
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Mark ${block.title} done`}
                onClick={onDone}
                className="size-8 text-success"
              >
                <Circle className="size-5" />
              </Button>
              {hasDetail ? (
                <button
                  type="button"
                  aria-label="Details"
                  aria-expanded={open}
                  onClick={() => setOpen((v) => !v)}
                  className="p-1 text-muted-foreground"
                >
                  <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>

      {open && hasDetail ? (
        <div className="space-y-2 border-b border-border/60 pb-3 pt-2 text-sm">
          {block.tinyStart ? (
            <p className="flex items-start gap-2">
              <Zap className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                <span className="font-medium">Tiny start:</span> {block.tinyStart}
              </span>
            </p>
          ) : null}
          {block.backup ? (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Backup:</span> {block.backup}
            </p>
          ) : null}
          {!done && !skipped ? (
            <SkipTaskButton
              taskType="block"
              refId={block.id}
              title={block.title}
              variant="outline"
              size="sm"
            >
              Skip this
            </SkipTaskButton>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
