"use client";

import * as React from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

import { BrandIcon } from "@/components/brand-icon";
import { ProductSignature } from "@/components/product-signature";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Surface the error for debugging; in production this could go to a service.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="relative">
        <BrandIcon className="size-14" />
        <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-lg border bg-background text-amber-500">
          <TriangleAlert className="size-3.5" aria-hidden />
        </span>
      </div>
      <div>
        <ProductSignature className="text-xs" />
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Your saved plan is safe. Try again.
        </p>
      </div>
      <Button onClick={reset}>
        <RotateCcw className="size-4" />
        Try again
      </Button>
    </main>
  );
}
