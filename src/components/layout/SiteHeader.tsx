import Link from "next/link";
import { CompetitionsNav } from "@/components/layout/CompetitionsNav";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const nav = [
  { href: "/", label: "Home" },
  { href: "/livescores", label: "Live" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight text-white">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-sm text-emerald-300">
            LS
          </span>
          <span className="hidden sm:inline">LiveScores Hub</span>
        </Link>

        <nav className="ml-auto flex flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3" aria-label="Main">
          <div className="hidden items-center gap-1 sm:flex sm:gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <CompetitionsNav />

          <div className="flex shrink-0 items-center gap-2 border-l border-white/10 pl-2 sm:pl-3">
            <ThemeToggle />
          </div>
        </nav>
      </div>

      {/* Mobile: Home / Live under logo row for thumb reach */}
      <div className="mx-auto flex max-w-6xl gap-2 border-t border-white/5 px-4 py-2 sm:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/10"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
