import * as React from "react";

import { ThemeToggle } from "@/components/theme-toggle";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-lg safe-top">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {action}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
