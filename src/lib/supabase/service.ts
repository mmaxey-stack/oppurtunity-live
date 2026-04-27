import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let service: SupabaseClient | null = null;

/** Service role client for server-only operations (bypasses RLS). Optional — set SUPABASE_SERVICE_ROLE_KEY. */
export function getSupabaseServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!service) {
    service = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return service;
}
