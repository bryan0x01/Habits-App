"use client";

import * as React from "react";

import { useStore } from "@/components/store-provider";
import { Card, CardContent } from "@/components/ui/card";
import { ENERGY_MODES, energyMeta } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function EnergyModeSelector({ compact = false }: { compact?: boolean }) {
  const { settings, setEnergyMode } = useStore();
  const active = settings.energyMode;
  const meta = energyMeta(active);

  const grid = (
    <div className="grid grid-cols-4 gap-2">
      {ENERGY_MODES.map((m) => {
        const selected = m.id === active;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => setEnergyMode(m.id)}
            aria-pressed={selected}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl border p-3 transition-all active:scale-95",
              selected
                ? cn("ring-2 ring-offset-2 ring-offset-background", m.ring, m.chip)
                : "border-border bg-card hover:bg-accent",
            )}
          >
            <span className="text-2xl" aria-hidden>
              {m.emoji}
            </span>
            <span className="text-xs font-semibold">{m.label}</span>
          </button>
        );
      })}
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-2">
        {grid}
        <p className="px-1 text-sm text-muted-foreground">{meta.tagline}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Energy mode</p>
            <p className="text-xs text-muted-foreground">How much have you got right now?</p>
          </div>
          <span className="text-2xl" aria-hidden>
            {meta.emoji}
          </span>
        </div>
        {grid}
        <p className="px-1 text-sm text-muted-foreground">{meta.tagline}</p>
      </CardContent>
    </Card>
  );
}
