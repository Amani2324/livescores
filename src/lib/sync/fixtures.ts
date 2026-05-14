import type { SupabaseClient } from "@supabase/supabase-js";
import {
  apiFootballGetFixturesByDateAndLeague,
  apiFootballGetFixturesByLeague,
} from "@/lib/api-football/client";
import { getSyncLeagueIds } from "@/lib/env";
import { requireAdminClient } from "@/lib/cron/auth";
import { upsertManyFixtures } from "@/lib/sync/upsert";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function leagueSeason(supabase: SupabaseClient, leagueId: number) {
  const { data: row } = await supabase
    .from("leagues")
    .select("current_season")
    .eq("id", leagueId)
    .maybeSingle();
  return typeof row?.current_season === "number" && !Number.isNaN(row.current_season)
    ? row.current_season
    : new Date().getFullYear();
}

/** Only curated leagues; avoids syncing every competition on Earth for “today”. */
export async function syncTodaysFixtures() {
  const supabase = requireAdminClient();
  const date = todayISO();
  const leagueIds = getSyncLeagueIds();
  const seen = new Set<number>();
  const merged: unknown[] = [];
  for (const leagueId of leagueIds) {
    const items = await apiFootballGetFixturesByDateAndLeague(date, leagueId);
    for (const it of items as { fixture?: { id?: number } }[]) {
      const id = it.fixture?.id;
      if (typeof id === "number" && !seen.has(id)) {
        seen.add(id);
        merged.push(it);
      }
    }
  }
  await upsertManyFixtures(supabase, merged);
  return { date, count: merged.length, leagues: leagueIds.length };
}

export async function syncLeagueUpcoming() {
  const supabase = requireAdminClient();
  const leagueIds = getSyncLeagueIds();
  let total = 0;
  for (const leagueId of leagueIds) {
    const season = await leagueSeason(supabase, leagueId);
    const items = await apiFootballGetFixturesByLeague(leagueId, season, 30);
    await upsertManyFixtures(supabase, items);
    total += items.length;
  }
  return { leagues: leagueIds.length, count: total };
}
