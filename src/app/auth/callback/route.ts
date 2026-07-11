import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Only allow same-origin relative paths: a single leading "/" and no "\".
 * Blocks protocol-relative ("//evil.com") and backslash-normalized redirects.
 */
function safeNextPath(value: string | null): string {
  if (!value || !/^\/(?!\/)/.test(value) || value.includes("\\")) return "/";
  return value;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));

  if (code) {
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.exchangeCodeForSession(code);
    } catch {
      return NextResponse.redirect(new URL("/settings?auth=error", url.origin));
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
