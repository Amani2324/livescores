import Link from "next/link";
import type { FixtureRow } from "@/types/database";
import { fixturePath } from "@/lib/seo/paths";

function statusLabel(f: FixtureRow) {
  if (f.is_live) return f.status_elapsed != null ? `${f.status_elapsed}'` : "LIVE";
  return f.status_short;
}

export function MatchRow({ fixture }: { fixture: FixtureRow }) {
  const href = fixturePath(fixture.id);
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-zinc-900/40 px-3 py-3 transition hover:border-emerald-500/40 hover:bg-zinc-900/80"
    >
      <div className="w-14 shrink-0 text-center text-[11px] font-semibold uppercase text-emerald-300">
        {statusLabel(fixture)}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2 text-sm font-medium text-zinc-50">
          <span className="truncate">{fixture.home_team_name}</span>
          <span className="tabular-nums text-zinc-200">{fixture.goals_home}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-sm font-medium text-zinc-50">
          <span className="truncate">{fixture.away_team_name}</span>
          <span className="tabular-nums text-zinc-200">{fixture.goals_away}</span>
        </div>
      </div>
      <div className="hidden text-[11px] text-zinc-500 group-hover:text-zinc-300 sm:block">View</div>
    </Link>
  );
}
