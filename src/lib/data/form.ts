import type { SupabaseClient } from "@supabase/supabase-js";
import type { FixtureRow } from "@/types/database";

function resultLetter(f: FixtureRow, teamId: number): "W" | "D" | "L" | "?" {
  if (f.status_short !== "FT") return "?";
  const isHome = f.home_team_id === teamId;
  const gf = isHome ? f.goals_home : f.goals_away;
  const ga = isHome ? f.goals_away : f.goals_home;
  if (gf > ga) return "W";
  if (gf === ga) return "D";
  return "L";
}

export async function recentFormForTeam(
  supabase: SupabaseClient,
  teamId: number,
  take = 5,
): Promise<string> {
  const { data } = await supabase
    .from("fixtures")
    .select("*")
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .eq("status_short", "FT")
    .order("date", { ascending: false })
    .limit(take);

  const rows = (data ?? []) as FixtureRow[];
  if (!rows.length) return "—";
  return rows
    .map((f) => resultLetter(f, teamId))
    .reverse()
    .join("");
}

export async function h2hSummary(
  supabase: SupabaseClient,
  homeId: number,
  awayId: number,
  take = 5,
): Promise<{ homeWins: number; awayWins: number; draws: number; sample: number }> {
  const { data: a } = await supabase
    .from("fixtures")
    .select("*")
    .eq("home_team_id", homeId)
    .eq("away_team_id", awayId)
    .eq("status_short", "FT")
    .order("date", { ascending: false })
    .limit(take);
  const { data: b } = await supabase
    .from("fixtures")
    .select("*")
    .eq("home_team_id", awayId)
    .eq("away_team_id", homeId)
    .eq("status_short", "FT")
    .order("date", { ascending: false })
    .limit(take);
  const rows = [...(a ?? []), ...(b ?? [])] as FixtureRow[];
  rows.sort((x, y) => (x.date < y.date ? 1 : -1));
  const trimmed = rows.slice(0, take);
  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;
  for (const f of trimmed) {
    if (f.goals_home === f.goals_away) {
      draws += 1;
      continue;
    }
    const winner =
      f.goals_home > f.goals_away ? f.home_team_id : f.away_team_id;
    if (winner === homeId) homeWins += 1;
    else if (winner === awayId) awayWins += 1;
  }
  return { homeWins, awayWins, draws, sample: trimmed.length };
}
