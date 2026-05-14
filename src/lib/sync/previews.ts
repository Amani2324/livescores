import { getCuratedLeagueIds } from "@/lib/leagues/curated";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildPreviewTexts, type PreviewLocale } from "@/lib/preview/rules-engine";
import { h2hSummary, recentFormForTeam } from "@/lib/data/form";
import { createAdminSupabase } from "@/lib/supabase/admin";
import type { FixtureRow, StandingRow } from "@/types/database";

async function standingFor(
  supabase: SupabaseClient,
  leagueId: number,
  season: number,
  teamId: number,
): Promise<StandingRow | null> {
  const { data } = await supabase
    .from("standings")
    .select("*")
    .eq("league_id", leagueId)
    .eq("season", season)
    .eq("team_id", teamId)
    .maybeSingle();
  return (data as StandingRow) ?? null;
}

function goalsPerGame(s: StandingRow | null): number | null {
  if (!s || !s.all_played) return null;
  return s.all_goals_for / s.all_played;
}

export async function upsertPreviewForFixture(
  supabase: SupabaseClient,
  fixture: FixtureRow,
  locale: PreviewLocale = "en",
) {
  const formHome = await recentFormForTeam(supabase, fixture.home_team_id);
  const formAway = await recentFormForTeam(supabase, fixture.away_team_id);
  const h2h = await h2hSummary(supabase, fixture.home_team_id, fixture.away_team_id);
  const sh = await standingFor(supabase, fixture.league_id, fixture.season, fixture.home_team_id);
  const sa = await standingFor(supabase, fixture.league_id, fixture.season, fixture.away_team_id);

  const { data: league } = await supabase
    .from("leagues")
    .select("name")
    .eq("id", fixture.league_id)
    .maybeSingle();

  const { data: pred } = await supabase
    .from("predictions")
    .select("advice")
    .eq("fixture_id", fixture.id)
    .maybeSingle();

  const texts = buildPreviewTexts({
    locale,
    homeName: fixture.home_team_name,
    awayName: fixture.away_team_name,
    leagueName: league?.name ?? "Competition",
    formHome,
    formAway,
    h2h,
    rankHome: sh?.rank ?? null,
    rankAway: sa?.rank ?? null,
    pointsHome: sh?.points ?? null,
    pointsAway: sa?.points ?? null,
    goalsHomeAvg: goalsPerGame(sh),
    goalsAwayAvg: goalsPerGame(sa),
    predictionAdvice: pred?.advice ?? null,
  });

  await supabase.from("previews").upsert(
    {
      fixture_id: fixture.id,
      locale,
      title: texts.title,
      body: texts.body,
      bettor_insights: texts.bettor_insights,
      source: "rules_engine",
      model_version: "v1",
      meta: { formHome, formAway, h2h },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "fixture_id" },
  );
}

export async function generateMissingPreviews(limit = 10) {
  const supabase = createAdminSupabase();
  if (!supabase) throw new Error("Admin supabase unavailable");

  const now = new Date().toISOString();
  const curated = getCuratedLeagueIds();
  const { data: upcoming } = await supabase
    .from("fixtures")
    .select("*")
    .in("league_id", curated)
    .gte("date", now)
    .in("status_short", ["NS", "TBD"])
    .order("date", { ascending: true })
    .limit(limit * 2);

  const fixtures = (upcoming ?? []) as FixtureRow[];
  let written = 0;
  for (const fx of fixtures) {
    if (written >= limit) break;
    const { data: existing } = await supabase
      .from("previews")
      .select("id")
      .eq("fixture_id", fx.id)
      .maybeSingle();
    if (existing) continue;
    await upsertPreviewForFixture(supabase, fx, "en");
    written += 1;
  }
  return { generated: written };
}
