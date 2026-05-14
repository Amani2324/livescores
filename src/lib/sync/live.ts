import { apiFootballGetLiveFixtures } from "@/lib/api-football/client";
import { getCuratedLeagueIds } from "@/lib/leagues/curated";
import { requireAdminClient } from "@/lib/cron/auth";
import { upsertManyFixtures } from "@/lib/sync/upsert";

export async function syncLiveMatches() {
  const supabase = requireAdminClient();
  const curated = new Set(getCuratedLeagueIds());
  const allLive = await apiFootballGetLiveFixtures();
  const live = allLive.filter((x: { league?: { id?: number } }) =>
    curated.has(x.league?.id ?? -1),
  );

  if (live.length === 0) {
    await supabase
      .from("fixtures")
      .update({ is_live: false, updated_at: new Date().toISOString() })
      .eq("is_live", true)
      .in("league_id", [...curated]);
    return { synced: 0, cleared: true };
  }
  await upsertManyFixtures(supabase, live);
  const ids = [...new Set(live.map((x: { fixture: { id: number } }) => x.fixture.id))];
  const inList = `(${ids.join(",")})`;
  await supabase
    .from("fixtures")
    .update({ is_live: false, updated_at: new Date().toISOString() })
    .eq("is_live", true)
    .in("league_id", [...curated])
    .not("id", "in", inList);
  return { synced: live.length };
}
