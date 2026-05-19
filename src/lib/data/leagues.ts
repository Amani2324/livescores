import {
  CURATED_LEAGUES,
  getCuratedLeagueIds,
  isCuratedLeagueId,
  sortLeaguesByCuratedOrder,
} from "@/lib/leagues/curated";
import { createPublicSupabase } from "@/lib/supabase/public";
import type { LeagueRow, PreviewRow } from "@/types/database";

export function getCuratedLeagueMeta(id: number) {
  return CURATED_LEAGUES.find((l) => l.id === id) ?? null;
}

/** DB row when synced; otherwise a stub from curated list so /league/[id] never 404s for menu links. */
export async function resolveLeagueForPage(
  id: number,
): Promise<{ league: LeagueRow; synced: boolean } | null> {
  if (!isCuratedLeagueId(id)) return null;
  const fromDb = await getLeagueById(id);
  if (fromDb) return { league: fromDb, synced: true };
  const meta = getCuratedLeagueMeta(id);
  if (!meta) return null;
  const season = new Date().getFullYear();
  return {
    synced: false,
    league: {
      id: meta.id,
      name: meta.name,
      country: meta.group,
      logo: null,
      flag: null,
      type: null,
      current_season: season,
      updated_at: new Date().toISOString(),
    },
  };
}

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
