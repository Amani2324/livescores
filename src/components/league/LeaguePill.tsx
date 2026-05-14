import Link from "next/link";
import type { LeagueRow } from "@/types/database";
import { leaguePath } from "@/lib/seo/paths";

export function LeaguePill({ league }: { league: LeagueRow }) {
  return (
    <Link
      href={leaguePath(league.id)}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-200 hover:border-emerald-500/40 hover:text-white"
    >
      {league.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={league.logo} alt="" className="h-4 w-4 rounded-full object-cover" />
      ) : null}
      <span className="max-w-[140px] truncate">{league.name}</span>
    </Link>
  );
}
