import { getEffectiveSyncLeagueIds } from "@/lib/leagues/curated";

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export function getPublicSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Public key for official API-SPORTS embed widgets only (browser). Optional. */
export function getApiSportsWidgetPublicKeyOptional(): string | undefined {
  const v = process.env.NEXT_PUBLIC_API_FOOTBALL_WIDGET_KEY?.trim();
  return v || undefined;
}

export function getSupabasePublicOptional() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function getSupabasePublic() {
  return {
    url: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: required(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}

export function getSupabaseServiceRoleOptional(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;
}

export function getSupabaseServiceRole(): string {
  return required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getCronSecret(): string | undefined {
  return process.env.CRON_SECRET;
}

export function getSyncLeagueIds(): number[] {
  return getEffectiveSyncLeagueIds();
}
