import { createPublicSupabase } from "@/lib/supabase/public";
import type { FixtureRow, OddRow, PredictionRow, PreviewRow, StandingRow } from "@/types/database";
import { h2hSummary, recentFormForTeam } from "@/lib/data/form";

export async function getPredictions(fixtureId: number): Promise<PredictionRow | null> {
  const supabase = createPublicSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("predictions")
    .select("*")
    .eq("fixture_id", fixtureId)
    .maybeSingle();
  return (data as PredictionRow) ?? null;
}

export async function getOdds(fixtureId: number): Promise<OddRow[]> {
  const supabase = createPublicSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("odds").select("*").eq("fixture_id", fixtureId);
  return (data as OddRow[]) ?? [];
}

export async function getStandingsForTeams(
  leagueId: number,
  season: number,
  homeId: number,
  awayId: number,
): Promise<{ home: StandingRow | null; away: StandingRow | null; table: StandingRow[] }> {
  const table = await getLeagueStandingsResolved(leagueId, season);
  return {
    home: table.find((r) => r.team_id === homeId) ?? null,
    away: table.find((r) => r.team_id === awayId) ?? null,
    table,
  };
}

export async function getLeagueStandingsTable(
  leagueId: number,
  season: number,
): Promise<StandingRow[]> {
  const supabase = createPublicSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("standings")
    .select("*")
    .eq("league_id", leagueId)
    .eq("season", season)
    .order("rank", { ascending: true });
  return (data as StandingRow[]) ?? [];
}

/** Prefer fixture season; fall back to latest season stored for this league (fixes calendar year vs API season). */
export async function getLeagueStandingsResolved(
  leagueId: number,
  preferredSeason: number,
): Promise<StandingRow[]> {
  let rows = await getLeagueStandingsTable(leagueId, preferredSeason);
  if (rows.length) return rows;

  const supabase = createPublicSupabase();
  if (!supabase) return [];

  const { data: leagueRow } = await supabase
    .from("leagues")
    .select("current_season")
    .eq("id", leagueId)
    .maybeSingle();
  const fromLeague = leagueRow?.current_season;
  if (typeof fromLeague === "number" && fromLeague !== preferredSeason) {
    rows = await getLeagueStandingsTable(leagueId, fromLeague);
    if (rows.length) return rows;
  }

  const { data: latest } = await supabase
    .from("standings")
    .select("season")
    .eq("league_id", leagueId)
    .order("season", { ascending: false })
    .limit(1)
    .maybeSingle();
  const fallback = latest?.season;
  if (typeof fallback === "number" && fallback !== preferredSeason) {
    rows = await getLeagueStandingsTable(leagueId, fallback);
  }
  return rows;
}

export async function getRecentFormBundle(fixture: FixtureRow) {
  const supabase = createPublicSupabase();
  if (!supabase) {
    return { home: "—", away: "—", h2h: { homeWins: 0, awayWins: 0, draws: 0, sample: 0 } };
  }
  const [home, away, h2h] = await Promise.all([
    recentFormForTeam(supabase, fixture.home_team_id),
    recentFormForTeam(supabase, fixture.away_team_id),
    h2hSummary(supabase, fixture.home_team_id, fixture.away_team_id, 8),
  ]);
  return { home, away, h2h };
}

export async function getLeagueFixtures(leagueId: number, take = 40): Promise<FixtureRow[]> {
  const supabase = createPublicSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("fixtures")
    .select("*")
    .eq("league_id", leagueId)
    .gte("date", new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString())
    .order("date", { ascending: true })
    .limit(take);
  return (data as FixtureRow[]) ?? [];
}

export async function getTeamFixtures(teamId: number, take = 15): Promise<FixtureRow[]> {
  const supabase = createPublicSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("fixtures")
    .select("*")
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .order("date", { ascending: false })
    .limit(take);
  return (data as FixtureRow[]) ?? [];
}

export async function getFinishedTeamForm(teamId: number, take = 5): Promise<FixtureRow[]> {
  const supabase = createPublicSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("fixtures")
    .select("*")
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .eq("status_short", "FT")
    .order("date", { ascending: false })
    .limit(take);
  return (data as FixtureRow[]) ?? [];
}

export async function getLeagueRecentResults(leagueId: number, take = 20): Promise<FixtureRow[]> {
  const supabase = createPublicSupabase();
  if (!supabase) return [];
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString();
  const { data } = await supabase
    .from("fixtures")
    .select("*")
    .eq("league_id", leagueId)
    .eq("status_short", "FT")
    .gte("date", since)
    .order("date", { ascending: false })
    .limit(take);
  return (data as FixtureRow[]) ?? [];
}

export async function getPreviewForFixture(fixtureId: number): Promise<PreviewRow | null> {
  const supabase = createPublicSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("previews")
    .select("*")
    .eq("fixture_id", fixtureId)
    .maybeSingle();
  return (data as PreviewRow) ?? null;
}
