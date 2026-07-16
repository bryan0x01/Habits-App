import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

/** Supabase stays the data layer; Clerk supplies the signed-in user's token. */
export function createSupabaseBrowserClient(
  accessToken: () => Promise<string | null>,
) {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase is not configured.");
  }

  return createClient(supabaseUrl, supabasePublishableKey, { accessToken });
}
