"use client";

import * as React from "react";

/**
 * A ticking clock. Returns the current Date and refreshes on an interval so
 * time-aware UI (What now / Next up) stays honest without a manual refresh.
 */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = React.useState<Date>(() => new Date());

  React.useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, intervalMs);

    // Re-sync the moment the tab/app regains focus.
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs]);

  return now;
}
