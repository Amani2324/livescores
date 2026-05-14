import { unstable_cache } from "next/cache";
import { getCuratedLeagueIds } from "@/lib/leagues/curated";
import { createPublicSupabase } from "@/lib/supabase/public";
import type { FixtureRow } from "@/types/database";

async function fetchLive(): Promise<FixtureRow[]> {
  const supabase = createPublicSupabase();
  if (!supabase) return [];
  const curated = getCuratedLeagueIds();
  const { data, error } = await supabase
    .from("fixtures")
    .select("*")
    .eq("is_live", true)
    .in("league_id", curated)
    .order("date", { ascending: true });
  if (error) return [];
  return (data as FixtureRow[]) ?? [];
}

export const getLiveFixtures = unstable_cache(fetchLive, ["fixtures-live"], {
  revalidate: 30,
});

export async function getTodaysFixtures(): Promise<FixtureRow[]> {
  const supabase = createPublicSupabase();
  if (!supabase) return [];
  const curated = getCuratedLeagueIds();
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  const { data } = await supabase
    .from("fixtures")
    .select("*")
    .in("league_id", curated)
    .gte("date", start.toISOString())
    .lt("date", end.toISOString())
    .order("date", { ascending: true });
  return (data as FixtureRow[]) ?? [];
}

export async function getFeaturedFixtures(limit = 6): Promise<FixtureRow[]> {
  const supabase = createPublicSupabase();
  if (!supabase) return [];
  const curated = getCuratedLeagueIds();
  const { data } = await supabase
    .from("fixtures")
    .select("*")
    .in("league_id", curated)
    .eq("featured", true)
    .order("date", { ascending: true })
    .limit(limit);
  if (data?.length) return data as FixtureRow[];
  const { data: fallback } = await supabase
    .from("fixtures")
    .select("*")
    .in("league_id", curated)
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })
    .limit(limit);
  return (fallback as FixtureRow[]) ?? [];
}

export async function getFixtureById(id: number): Promise<FixtureRow | null> {
  const supabase = createPublicSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from("fixtures").select("*").eq("id", id).maybeSingle();
  return (data as FixtureRow) ?? null;
}

export async function getAllLiveFixtureIds(): Promise<number[]> {
  const rows = await fetchLive();
  return rows.map((r) => r.id);
}
