export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950/60 py-8 text-xs text-zinc-500">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between">
        <p>Data cached from official providers via scheduled sync. Not for wagering advice.</p>
        <p className="text-zinc-600">© {new Date().getFullYear()} LiveScores Hub</p>
      </div>
    </footer>
  );
}
