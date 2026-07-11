"use client";

import * as React from "react";
import {
  ArrowRight,
  CheckCircle2,
  LifeBuoy,
  PartyPopper,
  Sparkles,
  Sunrise,
  Zap,
} from "lucide-react";

import { SkipTaskButton } from "@/components/friction-dialog";
import { DayFlowIcon } from "@/components/dayflow-icon";
import { useStore } from "@/components/store-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { categoryMeta, supportNeedMeta } from "@/lib/constants";
import { computeToday, type ScheduledBlock } from "@/lib/schedule";
import { minutesNow, prettyTime, timeRange } from "@/lib/time";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

export function WhatNowCard() {
  const now = useNow(30_000);
  const { routine, blockLogs, settings, setBlockStatus, supportNeed } = useStore();

  const view = React.useMemo(
    () => computeToday(routine, now, blockLogs, settings.minimumDay),
    [routine, now, blockLogs, settings.minimumDay],
  );

  const need = supportNeed();
  const support = supportNeedMeta(need);
  const allowBackup =
    settings.energyMode === "low" ||
    settings.energyMode === "chaos" ||
    need === "overwhelmed";

  if (view.phase === "empty") {
    return (
      <HeroShell tone="calm">
        <div className="flex items-start gap-3">
          <IconBubble>
            <Sunrise className="size-6" />
          </IconBubble>
          <div>
            <p className="text-sm font-medium text-white/80">Today</p>
            <h2 className="text-2xl font-bold">Open day</h2>
            <p className="mt-1 text-white/85">
              No blocks scheduled. Rest, or pick one small thing you&apos;d feel
              good about.
            </p>
          </div>
        </div>
      </HeroShell>
    );
  }

  if (view.allDone) {
    return (
      <HeroShell tone="win">
        <div className="flex items-start gap-3">
          <IconBubble>
            <PartyPopper className="size-6" />
          </IconBubble>
          <div>
            <p className="text-sm font-medium text-white/80">Day protected</p>
            <h2 className="text-2xl font-bold">Enough is done</h2>
            <p className="mt-1 text-white/85">
              {view.doneCount} of {view.requiredCount} done. However today went,
              you showed up — that&apos;s the win.
            </p>
          </div>
        </div>
      </HeroShell>
    );
  }

  const focus = view.focus;
  if (!focus) {
    return (
      <HeroShell tone="calm">
        <div className="flex items-start gap-3">
          <IconBubble>
            <CheckCircle2 className="size-6" />
          </IconBubble>
          <div>
            <p className="text-sm font-medium text-white/80">
              Nothing scheduled right now
            </p>
            <h2 className="text-2xl font-bold">Breathing room</h2>
            <p className="mt-1 text-white/85">
              Enjoy the gap, or get a head start on what&apos;s next.
            </p>
          </div>
        </div>
      </HeroShell>
    );
  }

  const live = focus.phase === "now";
  const minsUntil = focus.startMin - minutesNow(now);
  const eyebrow = live
    ? "Right now"
    : minsUntil > 0
      ? `Up next · in ${minsUntil} min`
      : "Up next";

  return (
    <div className="space-y-3">
      <HeroShell tone="focus">
        <FocusContent
          block={focus}
          eyebrow={eyebrow}
          live={live}
          allowBackup={allowBackup}
          emphasizeTiny={allowBackup || need === "start"}
          energyLine={
            need === "varies" && live ? "Don't think. Start here." : support.prompt
          }
          onDone={() => setBlockStatus(focus.id, "done")}
        />
      </HeroShell>

      {view.current && view.current.status === "done" && view.next ? (
        <p className="px-1 text-sm text-muted-foreground">
          <CheckCircle2 className="mr-1 inline size-4 text-success" />
          Nice — {view.current.title} done. Next up is {view.next.title}.
        </p>
      ) : live && view.next ? (
        <p className="px-1 text-sm text-muted-foreground">
          <ArrowRight className="mr-1 inline size-4" />
          Next up · {view.next.title} at {prettyTime(view.next.start)}
        </p>
      ) : null}
    </div>
  );
}

function FocusContent({
  block,
  eyebrow,
  live,
  allowBackup,
  emphasizeTiny,
  energyLine,
  onDone,
}: {
  block: ScheduledBlock;
  eyebrow: string;
  live: boolean;
  allowBackup: boolean;
  emphasizeTiny: boolean;
  energyLine: string;
  onDone: () => void;
}) {
  const [showBackup, setShowBackup] = React.useState(false);
  const cat = categoryMeta(block.category);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-white/80">{eyebrow}</span>
        <Badge className="border-white/25 bg-white/15 text-white">
          <DayFlowIcon name={block.category} /> {cat.label}
        </Badge>
      </div>

      <div>
        <h2 className="text-3xl font-bold leading-tight">
          <DayFlowIcon name={block.category} /> {block.title}
        </h2>
        <p className="mt-1 text-white/85">
          {timeRange(block.start, block.end)}
          {!live ? ` · starts ${prettyTime(block.start)}` : ""}
        </p>
      </div>

      {block.tinyStart ? (
        <div
          className={cn(
            "flex items-start gap-2 rounded-xl bg-white/15 p-3",
            emphasizeTiny && "ring-2 ring-white/40",
          )}
        >
          <Zap className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
              Tiny start
            </p>
            <p className="font-medium">{block.tinyStart}</p>
          </div>
        </div>
      ) : null}

      <p className="flex items-center gap-1.5 text-sm font-medium text-white/90">
        <Sparkles className="size-4" />
        {energyLine}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          size="lg"
          onClick={onDone}
          className="flex-1 bg-white text-primary hover:bg-white/90"
        >
          <CheckCircle2 className="size-5" />
          Done
        </Button>
        <SkipTaskButton
          taskType="block"
          refId={block.id}
          title={block.title}
          variant="ghost"
          size="lg"
          className="flex-1 bg-white/10 text-white hover:bg-white/20"
        >
          Skip
        </SkipTaskButton>
      </div>

      {allowBackup && block.backup ? (
        <div>
          <button
            type="button"
            onClick={() => setShowBackup((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-white/85 underline-offset-4 hover:underline"
          >
            <LifeBuoy className="size-4" />
            {showBackup ? "Hide the lighter version" : "Too much? Try a lighter version"}
          </button>
          {showBackup ? (
            <p className="mt-2 rounded-xl bg-white/10 p-3 text-sm">{block.backup}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Recovery prompt shown when an important block slipped past untouched. */
export function NextBestActionCard() {
  const now = useNow(30_000);
  const { routine, blockLogs, settings, setBlockStatus } = useStore();

  const view = React.useMemo(
    () => computeToday(routine, now, blockLogs, settings.minimumDay),
    [routine, now, blockLogs, settings.minimumDay],
  );

  const missed = view.missed;
  if (!missed) return null;

  const suggestion =
    missed.backup ?? "Do 20 focused minutes instead of skipping it completely.";

  return (
    <Card className="border-warning/40 bg-warning/10">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-warning/20 text-warning">
            <ArrowRight className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">The plan slipped. The day didn&apos;t.</p>
            <p className="text-xs text-muted-foreground">
              You slipped past <span className="font-medium">{missed.title}</span>.
              No spiral — the day isn&apos;t failed.
            </p>
          </div>
        </div>

        <p className="rounded-xl bg-background/60 p-3 text-sm">
          <span className="font-medium">Keep it small:</span> {suggestion}
        </p>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setBlockStatus(missed.id, "done")}>
            <CheckCircle2 className="size-4" />
            Done anyway
          </Button>
          <SkipTaskButton
            taskType="block"
            refId={missed.id}
            title={missed.title}
            variant="outline"
            size="sm"
          >
            Let it go
          </SkipTaskButton>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---- shared hero shell ------------------------------------------------ */

function HeroShell({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "focus" | "win" | "calm";
}) {
  const gradient =
    tone === "win"
      ? "from-emerald-500 to-teal-600"
      : tone === "calm"
        ? "from-sky-500 to-indigo-600"
        : "from-violet-600 to-fuchsia-600";

  return (
    <div
      className={cn(
        "animate-fade-in rounded-3xl bg-gradient-to-br p-5 text-white shadow-lg",
        gradient,
      )}
    >
      {children}
    </div>
  );
}

function IconBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/20">
      {children}
    </div>
  );
}
