import { getOdds, getPredictions } from "@/lib/data/match";
import { enrichFixtureById } from "@/lib/sync/enrich";
import { createAdminSupabase } from "@/lib/supabase/admin";
import type { FixtureRow } from "@/types/database";

function lineupsLookEmpty(lineups: FixtureRow["lineups"]) {
  if (lineups == null) return true;
  if (Array.isArray(lineups) && lineups.length === 0) return true;
  return false;
}

/**
 * When viewing a match, fill gaps from API-FOOTBALL (server-only): lineups, stats, odds, predictions.
 * Skips if service role / API not configured, or if DB already looks complete (saves quota).
 */
export async function hydrateFixtureFromApiIfSparse(
  fixtureId: number,
  snapshot: FixtureRow,
): Promise<void> {
  if (!createAdminSupabase()) return;

  const [odds, pred] = await Promise.all([
    getOdds(fixtureId),
    getPredictions(fixtureId),
  ]);

  const needs = odds.length === 0 || pred == null || lineupsLookEmpty(snapshot.lineups);

  if (!needs) return;

  try {
    await enrichFixtureById(fixtureId);
  } catch {
    /* missing API key, rate limit, or upstream error */
  }
}
