"use client";

import {
  ArrowLeftRight,
  Brain,
  Focus,
  Gauge,
  ListStart,
  StickyNote,
  type LucideIcon,
} from "lucide-react";

import { useStore } from "@/components/store-provider";
import { Card, CardContent } from "@/components/ui/card";
import { SUPPORT_NEEDS, supportNeedMeta } from "@/lib/constants";
import type { SupportNeed } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<SupportNeed, LucideIcon> = {
  start: ListStart,
  focus: Focus,
  remember: StickyNote,
  switch: ArrowLeftRight,
  overwhelmed: Gauge,
  varies: Brain,
};

export function SupportNeedSelector({ compact = false }: { compact?: boolean }) {
  const { supportNeed, setSupportNeed } = useStore();
  const selected = supportNeed();
  const content = (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold">What would help right now?</p>
        <p className="text-xs text-muted-foreground">
          Pick one. This only changes the prompt you see.
        </p>
      </div>
      <div
        className="grid grid-cols-3 gap-2"
        role="group"
        aria-label="Support needed right now"
      >
        {SUPPORT_NEEDS.map((item) => {
          const Icon = ICONS[item.id];
          const active = selected === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => setSupportNeed(item.id)}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 rounded-md border px-1.5 py-2 text-center text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                  : "border-border bg-background hover:bg-accent",
              )}
            >
              <Icon className="size-4" />
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {supportNeedMeta(selected).prompt}
      </p>
    </div>
  );

  if (compact) return content;

  return (
    <Card>
      <CardContent className="p-4">{content}</CardContent>
    </Card>
  );
}

export function DefaultSupportNeedSelector() {
  const { settings, setDefaultSupportNeed } = useStore();
  const selected = settings.defaultSupportNeed ?? "varies";

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="text-sm font-semibold">Default support</p>
          <p className="text-xs text-muted-foreground">
            Used until you choose what feels hard today.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Default support">
          {SUPPORT_NEEDS.map((item) => {
            const Icon = ICONS[item.id];
            const active = selected === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setDefaultSupportNeed(item.id)}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 rounded-md border px-1.5 py-2 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-accent",
                )}
              >
                <Icon className="size-4" />
                {item.shortLabel}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
