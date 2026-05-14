import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicOptional, getSupabaseServiceRoleOptional } from "@/lib/env";

export function createAdminSupabase() {
  const pub = getSupabasePublicOptional();
  const service = getSupabaseServiceRoleOptional();
  if (!pub || !service) return null;
  return createClient(pub.url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
