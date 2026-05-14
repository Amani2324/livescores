/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapFixtureRow,
  mapLeagueFromFixture,
  mapTeam,
} from "@/lib/api-football/mappers";

export async function upsertLeagueTeamsFixture(
  supabase: SupabaseClient,
  item: any,
) {
  const leagueRow = mapLeagueFromFixture(item.league);
  const home = mapTeam(item.teams.home);
  const away = mapTeam(item.teams.away);
  const fixtureRow = mapFixtureRow(item);

  await supabase.from("leagues").upsert(leagueRow, { onConflict: "id" });
  await supabase.from("teams").upsert([home, away], { onConflict: "id" });
  await supabase.from("fixtures").upsert(fixtureRow, { onConflict: "id" });
}

export async function upsertManyFixtures(supabase: SupabaseClient, items: any[]) {
  for (const item of items) {
    await upsertLeagueTeamsFixture(supabase, item);
  }
}
