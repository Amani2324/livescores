import { createPublicSupabase } from "@/lib/supabase/public";
import type { PlayerRow, ScorerRow, StandingRow, TeamRow } from "@/types/database";

export async function getTeamById(id: number): Promise<TeamRow | null> {
  const supabase = createPublicSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from("teams").select("*").eq("id", id).maybeSingle();
  return (data as TeamRow) ?? null;
}

export async function getStandingsForTeam(
  leagueId: number,
  season: number,
  teamId: number,
): Promise<StandingRow | null> {
  const supabase = createPublicSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("standings")
    .select("*")
    .eq("league_id", leagueId)
    .eq("season", season)
    .eq("team_id", teamId)
    .maybeSingle();
  return (data as StandingRow) ?? null;
}

export async function getScorers(leagueId: number, season: number): Promise<ScorerRow | null> {
  const supabase = createPublicSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("scorers")
    .select("*")
    .eq("league_id", leagueId)
    .eq("season", season)
    .maybeSingle();
  return (data as ScorerRow) ?? null;
}

export async function getSquadPlayers(teamId: number): Promise<PlayerRow[]> {
  const supabase = createPublicSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("team_id", teamId)
    .order("name", { ascending: true })
    .limit(40);
  return (data as PlayerRow[]) ?? [];
}

export async function getTeamsByIds(ids: number[]): Promise<Record<number, TeamRow>> {
  const supabase = createPublicSupabase();
  const uniq = [...new Set(ids)];
  if (!supabase || !uniq.length) return {};
  const { data } = await supabase.from("teams").select("*").in("id", uniq);
  const map: Record<number, TeamRow> = {};
  for (const row of (data as TeamRow[]) ?? []) {
    map[row.id] = row;
  }
  return map;
}
