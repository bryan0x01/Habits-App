import Link from "next/link";
import { Compass, Home } from "lucide-react";

import { BrandIcon } from "@/components/brand-icon";
import { ProductSignature } from "@/components/product-signature";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="relative">
        <BrandIcon className="size-14" />
        <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-lg border bg-background text-primary">
          <Compass className="size-3.5" aria-hidden />
        </span>
      </div>
      <div>
        <ProductSignature className="text-xs" />
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
