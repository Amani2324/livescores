import { getCuratedLeagueIds, sortLeaguesByCuratedOrder } from "@/lib/leagues/curated";
import { createPublicSupabase } from "@/lib/supabase/public";
import type { LeagueRow, PreviewRow } from "@/types/database";

export async function getLeagueShortcuts(): Promise<LeagueRow[]> {
  const supabase = createPublicSupabase();
  if (!supabase) return [];
  const ids = getCuratedLeagueIds();
  const { data } = await supabase.from("leagues").select("*").in("id", ids);
  return sortLeaguesByCuratedOrder((data as LeagueRow[]) ?? []);
}

export async function getLeagueById(id: number): Promise<LeagueRow | null> {
  const supabase = createPublicSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from("leagues").select("*").eq("id", id).maybeSingle();
  return (data as LeagueRow) ?? null;
}

export async function getLatestPreviews(limit = 6): Promise<PreviewRow[]> {
  const supabase = createPublicSupabase();
  if (!supabase) return [];
  const curated = new Set(getCuratedLeagueIds());
  const { data: previews } = await supabase
    .from("previews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(40);
  const list = (previews as PreviewRow[]) ?? [];
  if (!list.length) return [];
  const fixtureIds = [...new Set(list.map((p) => p.fixture_id))];
  const { data: fxRows } = await supabase.from("fixtures").select("id, league_id").in("id", fixtureIds);
  const leagueByFx = new Map(
    (fxRows as { id: number; league_id: number }[] | null)?.map((r) => [r.id, r.league_id]) ?? [],
  );
  const filtered = list.filter((p) => curated.has(leagueByFx.get(p.fixture_id) ?? -1));
  return filtered.slice(0, limit);
}
