import * as React from "react";

import { BrandIcon } from "@/components/brand-icon";
import { CloudStatusIndicator } from "@/components/cloud-status-indicator";
import { ProductSignature } from "@/components/product-signature";

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
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-xl safe-top">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <BrandIcon className="size-8" />
          <div className="min-w-0">
            <ProductSignature
              className="block text-[0.58rem] uppercase leading-none tracking-[0.16em] text-primary"
              brandClassName="text-muted-foreground"
            />
            <h1 className="mt-1 truncate text-lg font-bold leading-tight tracking-tight">
              {title}
            </h1>
            {subtitle ? (
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {action}
          <CloudStatusIndicator />
        </div>
      </div>
    </header>
  );
}
