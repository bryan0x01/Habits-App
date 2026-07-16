import { APP_NAME, PARENT_BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ProductSignature({
  className,
  brandClassName,
}: {
  className?: string;
  brandClassName?: string;
}) {
  return (
    <span className={cn("font-bold", className)}>
      {APP_NAME}
      <span className={cn("ml-1 font-medium text-muted-foreground", brandClassName)}>
        by {PARENT_BRAND}
      </span>
    </span>
  );
}
