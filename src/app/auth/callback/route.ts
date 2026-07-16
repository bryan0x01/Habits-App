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
  // Default sign-ins back to Settings so the "Synced" state is visible.
  const next = safeNextPath(url.searchParams.get("next") ?? "/settings");

  // Supabase can redirect back with an error instead of a code (expired link,
  // redirect-URL mismatch, opened on a device without the PKCE verifier).
  const providerError =
    url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (providerError) {
    return NextResponse.redirect(new URL("/settings?auth=error", url.origin));
  }

  if (!code) {
    // No code and no error means the link never carried a session — surface it
    // rather than silently landing the user on a signed-out screen.
    return NextResponse.redirect(new URL("/settings?auth=error", url.origin));
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
  } catch {
    return NextResponse.redirect(new URL("/settings?auth=error", url.origin));
  }

  // Confirm success on the default Settings landing; leave custom paths clean.
  const target = new URL(next, url.origin);
  if (target.pathname === "/settings") target.searchParams.set("auth", "ok");
  return NextResponse.redirect(target);
}
