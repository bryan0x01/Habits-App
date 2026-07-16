"use client";

import * as React from "react";
import { ArrowRight, CheckCircle2, LifeBuoy, Zap } from "lucide-react";

import { SkipTaskButton } from "@/components/friction-dialog";
import { DayFlowIcon, IconTile } from "@/components/dayflow-icon";
import { FocusTimer } from "@/components/focus-timer";
import { TimeRing } from "@/components/time-ring";
import { useStore } from "@/components/store-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { categoryMeta, supportNeedMeta } from "@/lib/constants";
import { computeToday, type ScheduledBlock } from "@/lib/schedule";
import { humanDuration, minutesNow, prettyTime, timeRange } from "@/lib/time";
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
      <HeroSurface>
        <QuietHero
          mark="none"
          eyebrow="Today"
          title="Open water"
          body="No blocks scheduled. Rest, or pick one small thing you'd feel good about."
        />
      </HeroSurface>
    );
  }

  if (view.allDone) {
    return (
      <HeroSurface>
        <QuietHero
          mark="full"
          eyebrow="Day protected"
          title="Enough is done"
          body={`${view.doneCount} of ${view.requiredCount} done. However today went, you showed up — that's the win.`}
        />
      </HeroSurface>
    );
  }

  const focus = view.focus;
  if (!focus) {
    return (
      <HeroSurface>
        <QuietHero
          mark="saved"
          eyebrow="Nothing scheduled right now"
          title="Breathing room"
          body="Enjoy the gap, or get a head start on what's next."
        />
      </HeroSurface>
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
      <HeroSurface>
        <FocusContent
          block={focus}
          eyebrow={eyebrow}
          live={live}
          now={now}
          allowBackup={allowBackup}
          emphasizeTiny={allowBackup || need === "start"}
          energyLine={
            need === "varies" && live ? "Don't think. Start here." : support.prompt
          }
          onDone={() => setBlockStatus(focus.id, "done")}
        />
      </HeroSurface>

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
  now,
  allowBackup,
  emphasizeTiny,
  energyLine,
  onDone,
}: {
  block: ScheduledBlock;
  eyebrow: string;
  live: boolean;
  now: Date;
  allowBackup: boolean;
  emphasizeTiny: boolean;
  energyLine: string;
  onDone: () => void;
}) {
  const [showBackup, setShowBackup] = React.useState(false);
  const cat = categoryMeta(block.category);

  // Make time visible: live blocks drain toward their end; near-term blocks
  // count down to their start. Beyond 90 minutes a ring reads as noise.
  const nowMin = minutesNow(now);
  let ring: { progress: number; label: string; sublabel: string } | null = null;
  if (live) {
    const total = Math.max(1, block.endMin - block.startMin);
    const left = Math.max(0, block.endMin - nowMin);
    ring = { progress: left / total, label: humanDuration(left), sublabel: "left" };
  } else {
    const until = block.startMin - nowMin;
    if (until > 0 && until <= 90) {
      ring = { progress: until / 90, label: humanDuration(until), sublabel: "until" };
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-hero-foreground/75">{eyebrow}</span>
        <Badge className="border-hero-foreground/20 bg-hero-foreground/10 text-hero-foreground">
          <DayFlowIcon name={block.category} /> {cat.label}
        </Badge>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            {block.title}
          </h2>
          <p className="mt-1.5 text-hero-foreground/75">
            {timeRange(block.start, block.end)}
          </p>
        </div>
        {ring ? (
          <TimeRing
            progress={ring.progress}
            label={ring.label}
            sublabel={ring.sublabel}
            tone="hero"
          />
        ) : null}
      </div>

      {block.tinyStart ? (
        <div
          className={cn(
            "flex items-start gap-2.5 rounded-2xl bg-hero-soft p-3.5",
            emphasizeTiny && "ring-1 ring-hero-accent/60",
          )}
        >
          <Zap className="mt-0.5 size-5 shrink-0 text-hero-accent" />
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-hero-foreground/60">
              Tiny start
            </p>
            <p className="mt-0.5 font-medium">{block.tinyStart}</p>
          </div>
        </div>
      ) : null}

      <p className="text-sm font-medium text-hero-foreground/80">{energyLine}</p>

      <div className="flex flex-wrap gap-2">
        <Button
          size="lg"
          onClick={onDone}
          className="flex-1 bg-hero-foreground text-hero hover:bg-hero-foreground/90"
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
          className="flex-1 bg-hero-foreground/10 text-hero-foreground hover:bg-hero-foreground/20"
        >
          Skip
        </SkipTaskButton>
      </div>

      {live ? (
        <FocusTimer onDone={onDone} className="border-t border-hero-foreground/10 pt-3.5" />
      ) : null}

      {allowBackup && block.backup ? (
        <div>
          <button
            type="button"
            onClick={() => setShowBackup((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-hero-foreground/80 underline-offset-4 hover:underline"
          >
            <LifeBuoy className="size-4" />
            {showBackup ? "Hide the lighter version" : "Too much? Try a lighter version"}
          </button>
          {showBackup ? (
            <p className="mt-2 rounded-2xl bg-hero-soft p-3.5 text-sm">{block.backup}</p>
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

/* ---- the ink surface --------------------------------------------------- */

/**
 * One surface for the one thing that matters right now. Deep ink, a single
 * deep ink and one clipped corner keep it distinct without decorative noise.
 */
function HeroSurface({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in overflow-hidden rounded-[1.75rem] rounded-br-lg border border-hero-foreground/10 bg-hero p-5 text-hero-foreground shadow-sm">
      <div>{children}</div>
    </div>
  );
}

function QuietHero({
  mark,
  eyebrow,
  title,
  body,
}: {
  mark: "none" | "started" | "saved" | "strong" | "full";
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-hero-soft text-hero-accent">
        <IconTile
          name={mark === "none" ? "fresh" : mark === "saved" ? "done" : mark}
          className="size-11 bg-transparent text-hero-accent"
          iconClassName="size-7"
        />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-hero-foreground/75">{eyebrow}</p>
        <h2 className="mt-0.5 text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-hero-foreground/80">{body}</p>
      </div>
    </div>
  );
}
