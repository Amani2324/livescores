import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { JsonLd, buildMatchSportsEventJsonLd } from "@/components/seo/JsonLd";
import { LineupsBlock } from "@/components/match/LineupsBlock";
import { OddsPanel } from "@/components/match/OddsPanel";
import { StatsBlock } from "@/components/match/StatsBlock";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { WidgetFixture } from "@/components/widgets/WidgetFixture";
import { getFixtureById } from "@/lib/data/fixtures";
import { getLeagueById } from "@/lib/data/leagues";
import { isCuratedLeagueId } from "@/lib/leagues/curated";
import {
  getOdds,
  getPredictions,
  getPreviewForFixture,
  getRecentFormBundle,
  getStandingsForTeams,
} from "@/lib/data/match";
import { getPublicSiteUrl } from "@/lib/env";
import { fixtureDescription, fixtureTitle, leaguePath, teamPath } from "@/lib/seo/paths";
import { hydrateFixtureFromApiIfSparse } from "@/lib/sync/match-page-enrich";
import type { FixtureRow } from "@/types/database";

type Props = { params: Promise<{ fixtureId: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { fixtureId } = await params;
  const id = Number(fixtureId);
  if (!Number.isFinite(id)) return { title: "Match" };
  const fixture = await getFixtureById(id);
  if (!fixture) return { title: "Match not found" };
  if (!isCuratedLeagueId(fixture.league_id)) return { title: "Match" };
  return {
    title: fixtureTitle(fixture),
    description: fixtureDescription(fixture),
    openGraph: {
      title: fixtureTitle(fixture),
      description: fixtureDescription(fixture),
      type: "article",
    },
  };
}

export default async function MatchPage({ params }: Props) {
  const { fixtureId } = await params;
  const id = Number(fixtureId);
  if (!Number.isFinite(id)) notFound();

  const initial = await getFixtureById(id);
  if (!initial) notFound();
  if (!isCuratedLeagueId(initial.league_id)) notFound();

  await hydrateFixtureFromApiIfSparse(id, initial);
  const fixture: FixtureRow = (await getFixtureById(id)) ?? initial;

  const [league, prediction, odds, preview, form, standings] = await Promise.all([
    getLeagueById(fixture.league_id),
    getPredictions(fixture.id),
    getOdds(fixture.id),
    getPreviewForFixture(fixture.id),
    getRecentFormBundle(fixture),
    getStandingsForTeams(
      fixture.league_id,
      fixture.season,
      fixture.home_team_id,
      fixture.away_team_id,
    ),
  ]);

  const siteUrl = getPublicSiteUrl();
  const jsonLd = buildMatchSportsEventJsonLd(siteUrl, fixture);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8">
      <JsonLd data={jsonLd} />
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          {league ? (
            <Link href={leaguePath(league.id)} className="rounded-full bg-white/5 px-3 py-1 hover:text-white">
              {league.name}
            </Link>
          ) : null}
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300">
            {fixture.is_live ? "Live" : fixture.status_short}
          </span>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Link href={teamPath(fixture.home_team_id)} className="block text-lg font-semibold hover:text-emerald-300">
              {fixture.home_team_name}
            </Link>
            <Link href={teamPath(fixture.away_team_id)} className="block text-lg font-semibold hover:text-emerald-300">
              {fixture.away_team_name}
            </Link>
          </div>
          <div className="flex items-center gap-6 text-5xl font-black tabular-nums tracking-tight">
            <span>{fixture.goals_home}</span>
            <span className="text-zinc-600">:</span>
            <span>{fixture.goals_away}</span>
          </div>
        </div>
        <p className="text-sm text-zinc-500">
          {new Date(fixture.date).toLocaleString()} · {fixture.venue_name ?? "Venue TBC"}
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-4">
          <SectionTitle title="Standings snapshot" />
          {standings.home && standings.away ? (
            <div className="space-y-3 text-sm text-zinc-200">
              <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-3 py-2">
                <span>{fixture.home_team_name}</span>
                <span className="text-xs text-zinc-400">
                  #{standings.home.rank} · {standings.home.points} pts
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-3 py-2">
                <span>{fixture.away_team_name}</span>
                <span className="text-xs text-zinc-400">
                  #{standings.away.rank} · {standings.away.points} pts
                </span>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Standings not synced"
              description="Run the standings cron again (it now uses each league’s API season). Or this league has no standings rows yet."
            />
          )}
        </div>
        <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-4">
          <SectionTitle title="Recent form" />
          <div className="grid gap-3 text-sm text-zinc-200 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-zinc-500">{fixture.home_team_name}</p>
              <p className="mt-1 text-2xl font-semibold tracking-[0.3em] text-emerald-300">{form.home}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-zinc-500">{fixture.away_team_name}</p>
              <p className="mt-1 text-2xl font-semibold tracking-[0.3em] text-emerald-300">{form.away}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            H2H sample: {fixture.home_team_name} {form.h2h.homeWins} — {form.h2h.draws} — {fixture.away_team_name}{" "}
            {form.h2h.awayWins} ({form.h2h.sample} matches)
          </p>
          <p className="mt-2 text-xs text-zinc-600">
            Form uses finished matches already stored in your database. Sync more past results for richer W/D/L strings.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-4">
          <SectionTitle title="Lineups" />
          <LineupsBlock fixture={fixture} />
        </div>
        <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-4">
          <SectionTitle title="Match statistics" />
          <StatsBlock statistics={fixture.statistics} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-4">
          <SectionTitle title="Odds (1X2 highlight)" />
          <OddsPanel odds={odds} />
        </div>
        <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-4">
          <SectionTitle title="Predictions" />
          {prediction ? (
            <div className="space-y-2 text-sm text-zinc-200">
              <p className="text-xs uppercase text-zinc-500">Model lean</p>
              <p className="text-lg font-semibold text-white">{prediction.winner_name ?? "No clear lean"}</p>
              <p className="text-zinc-400">{prediction.winner_comment}</p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-zinc-400">
                <div className="rounded-xl border border-white/5 bg-black/30 py-2">
                  <div className="text-[10px] uppercase">Home</div>
                  <div className="text-base text-emerald-300">{prediction.percent_home ?? "—"}</div>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/30 py-2">
                  <div className="text-[10px] uppercase">Draw</div>
                  <div className="text-base text-emerald-300">{prediction.percent_draw ?? "—"}</div>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/30 py-2">
                  <div className="text-[10px] uppercase">Away</div>
                  <div className="text-base text-emerald-300">{prediction.percent_away ?? "—"}</div>
                </div>
              </div>
              {prediction.advice ? <p className="text-xs text-zinc-500">{prediction.advice}</p> : null}
            </div>
          ) : (
            <EmptyState title="Predictions missing" description="API may not return predictions for this fixture, or odds package tier excludes them." />
          )}
        </div>
      </section>

      <WidgetFixture fixtureId={fixture.id} title="Official match center" />

      <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <SectionTitle title="AI-generated preview" />
        {preview ? (
          <div className="space-y-2">
            <p className="text-lg font-semibold text-white">{preview.title}</p>
            <p className="text-sm leading-relaxed text-zinc-200">{preview.body}</p>
          </div>
        ) : (
          <EmptyState title="Preview not generated yet" description="Run previews cron after standings exist." />
        )}
      </section>

      <section className="rounded-3xl border border-white/5 bg-zinc-900/40 p-4">
        <SectionTitle title="Bettor insights" />
        {preview?.bettor_insights ? (
          <p className="text-sm text-zinc-200">{preview.bettor_insights}</p>
        ) : (
          <EmptyState title="Insights pending" description="Generated alongside previews from odds + model advice." />
        )}
      </section>
    </main>
  );
}
