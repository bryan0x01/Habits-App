"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

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
      <div className="text-4xl" aria-hidden>
        😵‍💫
      </div>
      <div>
        <h1 className="text-xl font-bold">Something glitched</h1>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Your data is safe on this device. Let&apos;s try that again.
        </p>
      </div>
      <Button onClick={reset}>
        <RotateCcw className="size-4" />
        Try again
      </Button>
    </main>
  );
}
