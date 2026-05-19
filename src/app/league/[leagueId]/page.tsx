import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MatchRow } from "@/components/match/MatchRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { WidgetGames } from "@/components/widgets/WidgetGames";
import { WidgetStandings } from "@/components/widgets/WidgetStandings";
import {
  getLeagueFixtures,
  getLeagueRecentResults,
  getLeagueStandingsResolved,
} from "@/lib/data/match";
import { resolveLeagueForPage } from "@/lib/data/leagues";
import { isCuratedLeagueId } from "@/lib/leagues/curated";
import { getScorers, getTeamsByIds } from "@/lib/data/teams";
import { teamPath } from "@/lib/seo/paths";
import type { Json } from "@/types/database";

type Props = { params: Promise<{ leagueId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { leagueId } = await params;
  const id = Number(leagueId);
  if (!Number.isFinite(id)) return { title: "League" };
  if (!isCuratedLeagueId(id)) return { title: "League" };
  const resolved = await resolveLeagueForPage(id);
  if (!resolved) return { title: "League not found" };
  const { league } = resolved;
  return {
    title: `${league.name} — standings & fixtures`,
    description: `Standings, fixtures, top scorers, and recent results for ${league.name}.`,
  };
}

function ScorersList({ entries }: { entries: Json }) {
  if (!Array.isArray(entries)) return <EmptyState title="No scorer data" />;
  const rows = entries as {
    player?: { name?: string; photo?: string };
    team?: { name?: string };
    goals?: number;
    assists?: number;
  }[];
  return (
    <div className="space-y-2">
      {rows.slice(0, 15).map((row, idx) => (
        <div
          key={`${row.player?.name}-${idx}`}
          className="flex items-center justify-between rounded-2xl border border-white/5 bg-zinc-900/40 px-3 py-2 text-sm"
        >
          <div>
            <p className="font-medium text-white">{row.player?.name}</p>
            <p className="text-xs text-zinc-500">{row.team?.name}</p>
          </div>
          <div className="text-right text-xs text-zinc-400">
            <div className="text-base font-semibold text-emerald-300">{row.goals ?? 0} goals</div>
            <div>{row.assists ?? 0} ast</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function LeaguePage({ params }: Props) {
  const { leagueId } = await params;
  const id = Number(leagueId);
  if (!Number.isFinite(id)) notFound();
  if (!isCuratedLeagueId(id)) notFound();
  const resolved = await resolveLeagueForPage(id);
  if (!resolved) notFound();
  const { league, synced } = resolved;

  const season = league.current_season ?? new Date().getFullYear();
  const [table, fixtures, results, scorers] = await Promise.all([
    getLeagueStandingsResolved(id, season),
    getLeagueFixtures(id, 40),
    getLeagueRecentResults(id, 20),
    getScorers(id, season),
  ]);

  const teamMap = await getTeamsByIds(table.map((t) => t.team_id));
  const now = Date.now();
  const upcoming = fixtures
    .filter((f) => new Date(f.date).getTime() >= now - 1000 * 60 * 60 * 6)
    .filter((f) => f.status_short === "NS" || f.status_short === "TBD" || f.is_live)
    .slice(0, 12);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-emerald-300">League center</p>
        <h1 className="text-3xl font-bold text-white">{league.name}</h1>
        <p className="text-sm text-zinc-500">
          {league.country}
          {!synced ? (
            <span className="ml-2 text-zinc-600">· Cached tables empty — run fixtures/standings sync or use widgets below</span>
          ) : null}
        </p>
      </header>

      <section className="rounded-3xl border border-white/5 bg-zinc-900/40 p-4">
        <SectionTitle title="Standings" />
        {table.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm text-zinc-200">
              <thead className="text-xs uppercase text-zinc-500">
                <tr>
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Team</th>
                  <th className="py-2 pr-3">P</th>
                  <th className="py-2 pr-3">W</th>
                  <th className="py-2 pr-3">D</th>
                  <th className="py-2 pr-3">L</th>
                  <th className="py-2 pr-3">GF</th>
                  <th className="py-2 pr-3">GA</th>
                  <th className="py-2 pr-3">GD</th>
                  <th className="py-2">Pts</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row) => (
                  <tr key={row.team_id} className="border-t border-white/5">
                    <td className="py-2 pr-3 text-zinc-400">{row.rank}</td>
                    <td className="py-2 pr-3">
                      <Link href={teamPath(row.team_id)} className="font-medium text-white hover:text-emerald-300">
                        {teamMap[row.team_id]?.name ?? `Team ${row.team_id}`}
                      </Link>
                    </td>
                    <td className="py-2 pr-3">{row.all_played}</td>
                    <td className="py-2 pr-3">{row.all_win}</td>
                    <td className="py-2 pr-3">{row.all_draw}</td>
                    <td className="py-2 pr-3">{row.all_lose}</td>
                    <td className="py-2 pr-3">{row.all_goals_for}</td>
                    <td className="py-2 pr-3">{row.all_goals_against}</td>
                    <td className="py-2 pr-3">{row.goals_diff}</td>
                    <td className="py-2 font-semibold text-emerald-300">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Standings not synced" description="Run standings cron for this league id." />
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-4">
          <SectionTitle title="Upcoming fixtures" />
          {upcoming.length ? (
            <div className="space-y-2">
              {upcoming.map((f) => (
                <MatchRow key={f.id} fixture={f} />
              ))}
            </div>
          ) : (
            <EmptyState title="No upcoming fixtures" />
          )}
        </div>
        <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-4">
          <SectionTitle title="Top scorers" />
          {scorers ? <ScorersList entries={scorers.entries} /> : <EmptyState title="Scorers not synced" />}
        </div>
      </section>

      <section className="rounded-3xl border border-white/5 bg-zinc-900/40 p-4">
        <SectionTitle title="Recent results" />
        {results.length ? (
          <div className="grid gap-2 md:grid-cols-2">
            {results.map((f) => (
              <MatchRow key={f.id} fixture={f} />
            ))}
          </div>
        ) : (
          <EmptyState title="No recent results" />
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <WidgetStandings leagueId={id} season={season} title="Table (widget)" />
        <WidgetGames leagueId={id} title="Fixtures & results (widget)" />
      </section>
    </main>
  );
}
