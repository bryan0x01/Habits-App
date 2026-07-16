import { Waves } from "lucide-react";

import { cn } from "@/lib/utils";

export function BrandIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20",
        className,
      )}
    >
      <Waves className="size-[58%]" strokeWidth={2.3} />
    </span>
  );
}
