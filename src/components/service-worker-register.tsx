"use client";

import * as React from "react";

/**
 * Registers the service worker in production only. In development the SW is
 * skipped so it never interferes with hot-reloading.
 */
export function ServiceWorkerRegister() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration failures are non-fatal — the app still works online.
      });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register);

    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
