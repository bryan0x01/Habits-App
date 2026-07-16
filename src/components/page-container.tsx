import * as React from "react";

import { cn } from "@/lib/utils";

export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("mx-auto w-full max-w-md px-4 pb-nav pt-4", className)}>
      {children}
    </main>
  );
}

/** Lightweight placeholder shown while account data is being prepared. */
export function LoadingCards({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      <div className="h-40 animate-pulse rounded-3xl bg-muted" />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}
