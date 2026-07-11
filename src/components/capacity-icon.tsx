import type { EnergyMode } from "@/lib/types";
import { cn } from "@/lib/utils";

/** DayFlow-owned capacity marks: one visual language, no platform-dependent emoji. */
export function CapacityIcon({
  mode,
  className,
}: {
  mode: EnergyMode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("size-5", className)}
    >
      {mode === "high" ? (
        <path d="M13.5 2.75 5.8 13h5.7l-1 8.25L18.2 11h-5.7l1-8.25Z" />
      ) : null}
      {mode === "medium" ? (
        <>
          <path d="M3 9.25c2.25 0 2.25-2.5 4.5-2.5s2.25 2.5 4.5 2.5 2.25-2.5 4.5-2.5 2.25 2.5 4.5 2.5" />
          <path d="M3 14.75c2.25 0 2.25-2.5 4.5-2.5s2.25 2.5 4.5 2.5 2.25-2.5 4.5-2.5 2.25 2.5 4.5 2.5" />
        </>
      ) : null}
      {mode === "low" ? (
        <>
          <path d="M6.5 16.5h10.25a3.25 3.25 0 0 0 .35-6.48A5.25 5.25 0 0 0 7.23 8.8 3.9 3.9 0 0 0 6.5 16.5Z" />
          <path d="M9 19.5h6" />
        </>
      ) : null}
      {mode === "chaos" ? (
        <path d="M12 12c0-2.2 3.5-2.25 3.5.25 0 3.2-5.5 4.25-7.6 1.45C4.1 15.3 5.95 7 12.25 7c5.4 0 7.4 6.6 3.2 10.15-3.6 3.05-9.35.3-8.2-4.4.75-3.05 4.75-3.7 6.55-1.3" />
      ) : null}
    </svg>
  );
}
