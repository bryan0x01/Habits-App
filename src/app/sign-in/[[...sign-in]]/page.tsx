import { SignIn } from "@clerk/nextjs";

import { BrandIcon } from "@/components/brand-icon";
import { ProductSignature } from "@/components/product-signature";

export default function SignInPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4 py-8">
      <div className="flex items-center gap-2.5">
        <BrandIcon className="size-9" />
        <div>
          <ProductSignature className="block text-sm leading-none" />
          <p className="mt-1 text-xs text-muted-foreground">Welcome back</p>
        </div>
      </div>
      <SignIn />
    </main>
  );
}
