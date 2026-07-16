import { BatteryFull, BatteryLow, BatteryMedium, LifeBuoy } from "lucide-react";

import type { EnergyMode } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS = {
  high: BatteryFull,
  medium: BatteryMedium,
  low: BatteryLow,
  chaos: LifeBuoy,
} as const;

export function CapacityIcon({ mode, className }: { mode: EnergyMode; className?: string }) {
  const Icon = ICONS[mode];
  return <Icon aria-hidden className={cn("size-5", className)} strokeWidth={1.9} />;
}
