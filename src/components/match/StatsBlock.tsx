import type { Json } from "@/types/database";

export function StatsBlock({ statistics }: { statistics: Json | null }) {
  if (!Array.isArray(statistics)) {
    return <p className="text-sm text-zinc-500">Statistics will populate after the match progresses.</p>;
  }
  const rows = statistics as { team: { name: string }; statistics: { type: string; value: number | string | null }[] }[];
  if (!rows.length) {
    return <p className="text-sm text-zinc-500">No statistics yet.</p>;
  }
  const homeTeam = rows[0]?.team?.name ?? "Home";
  const awayTeam = rows[1]?.team?.name ?? "Away";
  const homeStats = rows[0]?.statistics ?? [];
  const awayStats = rows[1]?.statistics ?? [];
  const types = new Set<string>();
  homeStats.forEach((s) => types.add(s.type));
  awayStats.forEach((s) => types.add(s.type));
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
        <span className="truncate text-left">{homeTeam}</span>
        <span className="text-center">Metric</span>
        <span className="truncate text-right">{awayTeam}</span>
      </div>
      {[...types].map((type) => {
        const hv = homeStats.find((s) => s.type === type)?.value ?? "—";
        const av = awayStats.find((s) => s.type === type)?.value ?? "—";
        return (
          <div
            key={type}
            className="grid grid-cols-3 items-center gap-2 rounded-xl border border-white/5 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200"
          >
            <span className="tabular-nums">{hv}</span>
            <span className="text-center text-xs text-zinc-500">{type}</span>
            <span className="text-right tabular-nums">{av}</span>
          </div>
        );
      })}
    </div>
  );
}
