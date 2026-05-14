import type { Metadata } from "next";
import { RefreshTicker } from "@/components/livescores/RefreshTicker";
import { MatchRow } from "@/components/match/MatchRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { WidgetGames } from "@/components/widgets/WidgetGames";
import { getLiveFixtures } from "@/lib/data/fixtures";

export const metadata: Metadata = {
  title: "Live scores",
  description: "All live matches with automatic refresh every 30 seconds.",
};

export const revalidate = 30;

export default async function LiveScoresPage() {
  const live = await getLiveFixtures();

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <RefreshTicker intervalMs={30_000} />
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-emerald-300">Live desk</p>
        <h1 className="text-3xl font-bold text-white">All live games</h1>
        <p className="text-sm text-zinc-500">This page auto-refreshes every 30 seconds.</p>
      </header>
      <SectionTitle title="In play" />
      {live.length ? (
        <div className="space-y-2">
          {live.map((f) => (
            <MatchRow key={f.id} fixture={f} />
          ))}
        </div>
      ) : (
        <EmptyState title="No live matches" description="Kick off the live sync cron to populate Supabase." />
      )}

      <div className="pt-4">
        <WidgetGames title="Live & upcoming (widget)" />
      </div>
    </main>
  );
}
