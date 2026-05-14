import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicOptional } from "@/lib/env";

export async function createServerSupabase() {
  const cfg = getSupabasePublicOptional();
  if (!cfg) return null;

  const cookieStore = await cookies();

  return createServerClient(cfg.url, cfg.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* Server Component — cookie writes ignored */
        }
      },
    },
  });
}
