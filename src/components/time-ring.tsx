import { cn } from "@/lib/utils";
import { clamp } from "@/lib/utils";

/**
 * A quiet circular gauge that makes remaining time visible — the single
 * biggest thing visual planners get right for time blindness. `progress` is
 * the fraction REMAINING (1 = full, 0 = out of time) so the ring drains.
 */
export function TimeRing({
  progress,
  label,
  sublabel,
  size = 76,
  stroke = 7,
  tone = "hero",
  className,
}: {
  progress: number;
  label: string;
  sublabel?: string;
  size?: number;
  stroke?: number;
  tone?: "hero" | "card";
  className?: string;
}) {
  const p = clamp(progress, 0, 1);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const track = tone === "hero" ? "hsl(var(--hero-foreground) / 0.16)" : "hsl(var(--secondary))";
  const fill = tone === "hero" ? "hsl(var(--hero-accent))" : "hsl(var(--primary))";
  const text = tone === "hero" ? "hsl(var(--hero-foreground))" : "hsl(var(--foreground))";
  const subText = tone === "hero" ? "hsl(var(--hero-foreground) / 0.7)" : "hsl(var(--muted-foreground))";

  return (
    <div
      role="img"
      aria-label={sublabel ? `${label} ${sublabel}` : label}
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={fill}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - p)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold leading-none tabular-nums" style={{ color: text }}>
          {label}
        </span>
        {sublabel ? (
          <span className="mt-0.5 text-[0.6rem] font-medium uppercase tracking-wide" style={{ color: subText }}>
            {sublabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
