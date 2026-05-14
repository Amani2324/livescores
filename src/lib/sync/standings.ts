import {
  apiFootballGetStandings,
  apiFootballGetTopScorers,
} from "@/lib/api-football/client";
import { getSyncLeagueIds } from "@/lib/env";
import { requireAdminClient } from "@/lib/cron/auth";
import {
  mapScorerEntries,
  mapStandingsRows,
  mapTeam,
} from "@/lib/api-football/mappers";

function teamsFromStandings(apiResponse: unknown[]) {
  const leagueTable =
    (apiResponse as { league?: { standings?: { team: unknown }[][] } }[])?.[0]?.league?.standings?.[0] ??
    [];
  return leagueTable.map((row: { team: unknown }) => mapTeam(row.team));
}

export async function syncStandingsAndScorers() {
  const supabase = requireAdminClient();
  const leagueIds = getSyncLeagueIds();
  for (const leagueId of leagueIds) {
    const { data: leagueRow } = await supabase
      .from("leagues")
      .select("current_season")
      .eq("id", leagueId)
      .maybeSingle();
    const season =
      typeof leagueRow?.current_season === "number" && !Number.isNaN(leagueRow.current_season)
        ? leagueRow.current_season
        : new Date().getFullYear();
    const standingsResp = await apiFootballGetStandings(leagueId, season);
    const teams = teamsFromStandings(standingsResp);
    if (teams.length) {
      await supabase.from("teams").upsert(teams, { onConflict: "id" });
    }
    const rows = mapStandingsRows(leagueId, season, standingsResp);
    if (rows.length) {
      await supabase.from("standings").upsert(rows, {
        onConflict: "league_id,season,team_id",
      });
    }
    const scorers = await apiFootballGetTopScorers(leagueId, season);
    const entries = mapScorerEntries(scorers);
    const teamsFromScorerList = scorers
      .map((s: { statistics?: { team: unknown }[] }) => s.statistics?.[0]?.team)
      .filter((t): t is { id: number; name: string; logo?: string; country?: string } =>
        Boolean(t && typeof t === "object" && "id" in (t as object)),
      )
      .map((t) =>
        mapTeam({
          id: t.id,
          name: t.name,
          logo: t.logo,
          country: t.country,
          code: null,
          founded: null,
          national: false,
          venue: null,
        }),
      );
    if (teamsFromScorerList.length) {
      await supabase.from("teams").upsert(teamsFromScorerList, { onConflict: "id" });
    }
    await supabase.from("scorers").upsert(
      {
        league_id: leagueId,
        season,
        entries,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "league_id,season" },
    );
  }
  return { leagues: leagueIds.length };
}
