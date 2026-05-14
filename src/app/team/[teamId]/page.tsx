import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MatchRow } from "@/components/match/MatchRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getFinishedTeamForm, getTeamFixtures } from "@/lib/data/match";
import { leaguePath } from "@/lib/seo/paths";
import { getSquadPlayers, getStandingsForTeam, getTeamById } from "@/lib/data/teams";
import type { Json } from "@/types/database";

type Props = { params: Promise<{ teamId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { teamId } = await params;
  const id = Number(teamId);
  if (!Number.isFinite(id)) return { title: "Team" };
  const team = await getTeamById(id);
  if (!team) return { title: "Team not found" };
  return {
    title: `${team.name} — fixtures, form & squad`,
    description: `Fixtures, recent form, standings snapshot, squad, and injuries for ${team.name}.`,
  };
}

function InjuriesList({ injuries }: { injuries: Json | null }) {
  if (!Array.isArray(injuries) || injuries.length === 0) {
    return <EmptyState title="No injury report" description="Sync the teams cron to pull injuries." />;
  }
  return (
    <div className="space-y-2 text-sm text-zinc-200">
      {(injuries as { player?: { name?: string }; type?: string; reason?: string }[]).map((row, idx) => (
        <div key={`${row.player?.name}-${idx}`} className="rounded-2xl border border-white/5 bg-zinc-900/40 px-3 py-2">
          <p className="font-medium text-white">{row.player?.name ?? "Player"}</p>
          <p className="text-xs text-zinc-500">
            {row.type} · {row.reason}
          </p>
        </div>
      ))}
    </div>
  );
}

export default async function TeamPage({ params }: Props) {
  const { teamId } = await params;
  const id = Number(teamId);
  if (!Number.isFinite(id)) notFound();

  const team = await getTeamById(id);
  if (!team) notFound();

  const [fixtures, formFixtures, players] = await Promise.all([
    getTeamFixtures(id, 18),
    getFinishedTeamForm(id, 6),
    getSquadPlayers(id),
  ]);

  const latest = fixtures[0];
  const leagueId = latest?.league_id;
  const season = latest?.season ?? new Date().getFullYear();
  const standing =
    leagueId != null ? await getStandingsForTeam(leagueId, season, id) : null;

  const formString = formFixtures
    .map((f) => {
      const isHome = f.home_team_id === id;
      const gf = isHome ? f.goals_home : f.goals_away;
      const ga = isHome ? f.goals_away : f.goals_home;
      if (gf > ga) return "W";
      if (gf === ga) return "D";
      return "L";
    })
    .reverse()
    .join("");

  const squadFromJson = Array.isArray(team.squad)
    ? (team.squad as { id?: number; name?: string; position?: string }[])
    : [];

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-300">Team profile</p>
          <h1 className="text-3xl font-bold text-white">{team.name}</h1>
          <p className="text-sm text-zinc-500">{team.country}</p>
        </div>
        {leagueId ? (
          <Link
            href={leaguePath(leagueId)}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:border-emerald-500/40 hover:text-white"
          >
            Open league hub
          </Link>
        ) : null}
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-4 lg:col-span-1">
          <SectionTitle title="Standings snapshot" />
          {standing ? (
            <div className="space-y-2 text-sm text-zinc-200">
              <p className="text-4xl font-black text-emerald-300">#{standing.rank}</p>
              <p className="text-zinc-400">{standing.points} points</p>
              <p className="text-xs text-zinc-500">
                {standing.all_win}W {standing.all_draw}D {standing.all_lose}L · GF {standing.all_goals_for} GA{" "}
                {standing.all_goals_against}
              </p>
            </div>
          ) : (
            <EmptyState title="Standings unavailable" description="Need synced fixtures to infer league context." />
          )}
        </div>
        <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-4 lg:col-span-1">
          <SectionTitle title="Recent form" />
          <p className="text-4xl font-semibold tracking-[0.4em] text-emerald-300">{formString || "—"}</p>
          <p className="mt-2 text-xs text-zinc-500">Last {formFixtures.length} finished matches</p>
        </div>
        <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-4 lg:col-span-1">
          <SectionTitle title="Injuries" />
          <InjuriesList injuries={team.injuries} />
        </div>
      </section>

      <section className="rounded-3xl border border-white/5 bg-zinc-900/40 p-4">
        <SectionTitle title="Squad" />
        {players.length ? (
          <div className="grid gap-2 md:grid-cols-2">
            {players.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-2xl border border-white/5 px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-white">{p.name}</p>
                  <p className="text-xs text-zinc-500">{p.position}</p>
                </div>
                {p.injured ? <span className="text-xs text-amber-300">Injured</span> : null}
              </div>
            ))}
          </div>
        ) : squadFromJson.length ? (
          <div className="grid gap-2 md:grid-cols-2">
            {squadFromJson.slice(0, 24).map((p, idx) => (
              <div key={`${p.id}-${idx}`} className="rounded-2xl border border-white/5 px-3 py-2 text-sm text-white">
                {p.name}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Squad not synced" description="Run teams cron to import roster data." />
        )}
      </section>

      <section className="rounded-3xl border border-white/5 bg-zinc-900/40 p-4">
        <SectionTitle title="Fixtures" />
        {fixtures.length ? (
          <div className="space-y-2">
            {fixtures.map((f) => (
              <MatchRow key={f.id} fixture={f} />
            ))}
          </div>
        ) : (
          <EmptyState title="No fixtures" />
        )}
      </section>
    </main>
  );
}
