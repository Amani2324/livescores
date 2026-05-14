import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicOptional } from "@/lib/env";

/** Anonymous reads without cookies — safe for `unstable_cache` and static SEO paths. */
export function createPublicSupabase() {
  const cfg = getSupabasePublicOptional();
  if (!cfg) return null;
  return createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
