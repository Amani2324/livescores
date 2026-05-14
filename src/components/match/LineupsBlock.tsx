import type { FixtureRow, Json } from "@/types/database";

function namesFromLineupArray(lineups: Json | null, teamId: number) {
  if (!Array.isArray(lineups)) return null;
  const block = (lineups as { team?: { id?: number }; startXI?: { player?: { name?: string } }[] }[]).find(
    (l) => l.team?.id === teamId,
  );
  const xi = block?.startXI;
  if (!xi) return null;
  return xi.map((x) => x.player?.name).filter(Boolean) as string[];
}

export function LineupsBlock({ fixture }: { fixture: FixtureRow }) {
  const home = namesFromLineupArray(fixture.lineups, fixture.home_team_id);
  const away = namesFromLineupArray(fixture.lineups, fixture.away_team_id);
  if (!home && !away) {
    return <p className="text-sm text-zinc-500">Lineups will appear closer to kickoff after sync.</p>;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Home XI</p>
        <ol className="space-y-1 text-sm text-zinc-200">
          {(home ?? []).map((name, idx) => (
            <li key={`${name}-${idx}`} className="flex gap-2">
              <span className="w-5 text-right text-zinc-500">{idx + 1}</span>
              <span>{name}</span>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Away XI</p>
        <ol className="space-y-1 text-sm text-zinc-200">
          {(away ?? []).map((name, idx) => (
            <li key={`${name}-${idx}`} className="flex gap-2">
              <span className="w-5 text-right text-zinc-500">{idx + 1}</span>
              <span>{name}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
