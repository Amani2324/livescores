import type { Metadata } from "next";
import { getPublicSiteUrl } from "@/lib/env";
import { getFeaturedFixtures, getLiveFixtures, getTodaysFixtures } from "@/lib/data/fixtures";
import { getLatestPreviews, getLeagueShortcuts } from "@/lib/data/leagues";
import { LeaguePill } from "@/components/league/LeaguePill";
import { MatchRow } from "@/components/match/MatchRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { WidgetGames } from "@/components/widgets/WidgetGames";
import { fixturePath } from "@/lib/seo/paths";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Live football scores, fixtures & AI previews",
  description:
    "Mobile-first live scores, fixtures, league tables, odds context, and data-driven match previews — synced via Supabase.",
  openGraph: {
    title: "LiveScores Hub",
    description: "Modern football livescores and betting-preview platform.",
    url: getPublicSiteUrl(),
  },
};

export default async function HomePage() {
  const [live, today, featured, leagues, previews] = await Promise.all([
    getLiveFixtures(),
    getTodaysFixtures(),
    getFeaturedFixtures(),
    getLeagueShortcuts(),
    getLatestPreviews(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-8">
        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <SectionTitle title="Live matches" />
            {live.length ? (
              <div className="space-y-2">
                {live.map((f) => (
                  <MatchRow key={f.id} fixture={f} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No live matches right now"
                description="Run the live sync cron or check back during match windows."
              />
            )}
          </div>
          <aside className="space-y-4 rounded-3xl border border-white/5 bg-gradient-to-b from-emerald-500/10 to-transparent p-4">
            <SectionTitle title="League shortcuts" />
            <div className="flex flex-wrap gap-2">
              {leagues.length ? (
                leagues.map((l) => <LeaguePill key={l.id} league={l} />)
              ) : (
                <EmptyState
                  title="Leagues not synced yet"
                  description="Run fixtures + standings crons to populate shortcuts."
                />
              )}
            </div>
          </aside>
        </section>

        <WidgetGames title="Official games board" />

        <section>
          {today.length ? (
            <div className="grid gap-2 md:grid-cols-2">
              {today.slice(0, 12).map((f) => (
                <MatchRow key={f.id} fixture={f} />
              ))}
            </div>
          ) : (
            <EmptyState title="No fixtures for today in cache" description="Trigger the fixtures cron to hydrate dates." />
          )}
        </section>

        <section>
          <SectionTitle title="Featured matches" />
          {featured.length ? (
            <div className="grid gap-2 md:grid-cols-2">
              {featured.map((f) => (
                <MatchRow key={f.id} fixture={f} />
              ))}
            </div>
          ) : (
            <EmptyState title="No featured picks" description="Mark fixtures.featured in Supabase or sync more leagues." />
          )}
        </section>

        <section>
          <SectionTitle title="Latest AI previews" />
          {previews.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {previews.map((p) => (
                <Link
                  key={p.id}
                  href={fixturePath(p.fixture_id)}
                  className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4 transition hover:border-emerald-500/40"
                >
                  <p className="text-sm font-semibold text-white">{p.title}</p>
                  <p className="mt-2 line-clamp-3 text-xs text-zinc-400">{p.body}</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No previews generated" description="Run previews cron after fixtures exist." />
          )}
        </section>
      </main>
  );
}
