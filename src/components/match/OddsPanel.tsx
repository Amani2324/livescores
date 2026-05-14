import type { OddRow } from "@/types/database";

const WINNER_BET_NAMES = new Set([
  "Match Winner",
  "Full Time Result",
  "1X2",
  "Match Odds",
  "3-Way Result",
]);

type Bet = { name?: string; values?: { value: string; odd: string }[] };

function pickThreeWay(bets: Bet[] | null) {
  if (!Array.isArray(bets)) return null;
  for (const name of WINNER_BET_NAMES) {
    const mw = bets.find((b) => b.name === name);
    if (mw?.values && mw.values.length >= 2) return mw;
  }
  const guess = bets.find((b) => Array.isArray(b.values) && b.values.length >= 3);
  return guess ?? null;
}

function extractMatchWinner(odds: OddRow[]) {
  for (const row of odds) {
    const bets = row.bets as Bet[] | null;
    const mw = pickThreeWay(bets);
    if (mw?.values?.length) return { bookmaker: row.bookmaker, values: mw.values };
  }
  return null;
}

export function OddsPanel({ odds }: { odds: OddRow[] }) {
  const mw = extractMatchWinner(odds);
  if (!mw) {
    return (
      <p className="text-sm text-zinc-500">
        No 1X2 odds in cache for this match. Some API plans or bookmakers omit odds; try enrich again later.
      </p>
    );
  }
  return (
    <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
        <span>1X2</span>
        <span className="truncate">{mw.bookmaker}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-sm font-semibold text-zinc-100">
        {mw.values.map((v) => (
          <div key={v.value} className="rounded-xl border border-white/10 bg-black/30 py-2">
            <div className="text-[11px] uppercase text-zinc-500">{v.value}</div>
            <div className="tabular-nums text-lg text-emerald-300">{v.odd}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
