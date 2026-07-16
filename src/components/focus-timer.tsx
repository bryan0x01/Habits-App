"use client";

import * as React from "react";
import { CheckCircle2, Square, TimerIcon } from "lucide-react";

import { TimeRing } from "@/components/time-ring";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRESETS = [10, 25, 45] as const;

function mmss(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * A one-tap focus sprint attached to the current block (the Llama Life trick,
 * DayFlow-flavored): pick a length, watch it drain, get a soft landing at the
 * end. No pause button on purpose — stop or finish, both are fine.
 */
export function FocusTimer({
  onDone,
  className,
}: {
  /** Called when the user marks the block done from the finish state. */
  onDone: () => void;
  className?: string;
}) {
  const [totalSeconds, setTotalSeconds] = React.useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = React.useState(0);
  const [endAt, setEndAt] = React.useState<number | null>(null);
  const [finished, setFinished] = React.useState(false);
  const running = totalSeconds !== null && endAt !== null && !finished;

  React.useEffect(() => {
    if (!running || endAt === null) return;
    let announced = false;
    const tick = () => {
      const next = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setSecondsLeft(next);
      if (next === 0 && !announced) {
        announced = true;
        setFinished(true);
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate?.([120, 80, 120]);
        }
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endAt, running]);

  const start = (minutes: number) => {
    setTotalSeconds(minutes * 60);
    setSecondsLeft(minutes * 60);
    setEndAt(Date.now() + minutes * 60_000);
    setFinished(false);
  };

  const reset = () => {
    setTotalSeconds(null);
    setSecondsLeft(0);
    setEndAt(null);
    setFinished(false);
  };

  if (totalSeconds === null) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-hero-foreground/70">
          <TimerIcon className="size-3.5" />
          Focus
        </span>
        <div className="flex gap-1.5" role="group" aria-label="Start a focus timer">
          {PRESETS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => start(minutes)}
              className="rounded-full border border-hero-foreground/25 px-3 py-1.5 text-xs font-semibold text-hero-foreground/90 transition-colors hover:bg-hero-foreground/10"
            >
              {minutes}m
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <p className="min-w-0 flex-1 text-sm font-medium">
          Time. That focus counted — close it out?
        </p>
        <Button
          size="sm"
          onClick={() => {
            onDone();
            reset();
          }}
          className="bg-hero-foreground text-hero hover:bg-hero-foreground/90"
        >
          <CheckCircle2 className="size-4" />
          Done
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={reset}
          className="text-hero-foreground/80 hover:bg-hero-foreground/10 hover:text-hero-foreground"
        >
          Keep going
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <TimeRing
        progress={secondsLeft / totalSeconds}
        label={mmss(secondsLeft)}
        sublabel="focus"
        size={64}
        stroke={6}
        tone="hero"
      />
      <p className="min-w-0 flex-1 text-sm text-hero-foreground/80">
        Just this, until the ring runs out.
      </p>
      <Button
        size="sm"
        variant="ghost"
        onClick={reset}
        aria-label="Stop focus timer"
        className="text-hero-foreground/80 hover:bg-hero-foreground/10 hover:text-hero-foreground"
      >
        <Square className="size-4" />
        Stop
      </Button>
    </div>
  );
}
