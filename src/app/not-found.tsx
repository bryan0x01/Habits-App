import Link from "next/link";
import { Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="text-4xl" aria-hidden>
        🧭
      </div>
      <div>
        <h1 className="text-xl font-bold">Off the map</h1>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          That page doesn&apos;t exist. Let&apos;s get you back to today.
        </p>
      </div>
      <Button asChild>
        <Link href="/">
          <Home className="size-4" />
          Back to Today
        </Link>
      </Button>
    </main>
  );
}
