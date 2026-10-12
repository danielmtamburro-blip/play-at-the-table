import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

let browserClient: SupabaseClient | null = null;

/** Browser client (singleton). Returns null when env vars are missing. */
export function getBrowserClient(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!browserClient) browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  return browserClient;
}
