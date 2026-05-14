import {
  apiFootballGetFixtureById,
  apiFootballGetOdds,
  apiFootballGetPredictions,
} from "@/lib/api-football/client";
import { mapPredictionRow } from "@/lib/api-football/mappers";
import { requireAdminClient } from "@/lib/cron/auth";
import { getCuratedLeagueIds } from "@/lib/leagues/curated";
import { upsertLeagueTeamsFixture } from "@/lib/sync/upsert";

export async function enrichFixtureById(fixtureId: number) {
  const supabase = requireAdminClient();
  const full = await apiFootballGetFixtureById(fixtureId);
  if (!full) return { ok: false, reason: "not_found" };
  await upsertLeagueTeamsFixture(supabase, full);

  const pred = await apiFootballGetPredictions(fixtureId);
  if (pred) {
    await supabase
      .from("predictions")
      .upsert(mapPredictionRow(fixtureId, pred), { onConflict: "fixture_id" });
  }

  const oddsBlocks = await apiFootballGetOdds(fixtureId);
  for (const block of oddsBlocks as {
    fixture?: { id?: number };
    bookmakers?: { name: string; bets?: unknown[] }[];
  }[]) {
    const fid = block.fixture?.id ?? fixtureId;
    for (const bm of block.bookmakers ?? []) {
      await supabase.from("odds").upsert(
        {
          fixture_id: fid,
          bookmaker: bm.name,
          bets: bm.bets ?? [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "fixture_id,bookmaker" },
      );
    }
  }
  return { ok: true };
}

export async function enrichUpcomingBatch(limit = 12) {
  const supabase = requireAdminClient();
  const now = new Date().toISOString();
  const curated = getCuratedLeagueIds();
  const { data: upcoming } = await supabase
    .from("fixtures")
    .select("id")
    .in("league_id", curated)
    .gte("date", now)
    .in("status_short", ["NS", "TBD"])
    .order("date", { ascending: true })
    .limit(limit);

  const { data: liveRows } = await supabase
    .from("fixtures")
    .select("id")
    .in("league_id", curated)
    .eq("is_live", true)
    .limit(Math.max(0, limit - (upcoming?.length ?? 0)));

  const ids = [
    ...new Set([...(upcoming?.map((f) => f.id) ?? []), ...(liveRows?.map((f) => f.id) ?? [])]),
  ].slice(0, limit);

  let done = 0;
  for (const id of ids) {
    await enrichFixtureById(id);
    done += 1;
  }
  return { processed: done };
}
