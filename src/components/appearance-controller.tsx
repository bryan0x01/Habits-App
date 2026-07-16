"use client";

import * as React from "react";

import { useStore } from "@/components/store-provider";

/** Applies the account-synced appearance without any browser persistence. */
export function AppearanceController() {
  const { settings } = useStore();

  React.useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const theme = settings.theme ?? "system";

    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      root.classList.toggle("dark", dark);
      root.dataset.accent = settings.interfaceColor ?? "iris";
      root.style.colorScheme = dark ? "dark" : "light";
    };

    apply();
    if (theme !== "system") return;
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [settings.interfaceColor, settings.theme]);

  return null;
}
