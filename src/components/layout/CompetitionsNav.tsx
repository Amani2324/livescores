"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getCuratedLeaguesByGroup } from "@/lib/leagues/curated";
import { leaguePath } from "@/lib/seo/paths";

function CompetitionList({ onPick }: { onPick: () => void }) {
  const sections = getCuratedLeaguesByGroup();
  return (
    <div className="grid gap-6 p-4 sm:p-6">
      {sections.map(({ group, leagues }) => (
        <div key={group}>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">{group}</h3>
          <ul className="grid gap-1 sm:grid-cols-2">
            {leagues.map((l) => (
              <li key={l.id}>
                <Link
                  href={leaguePath(l.id)}
                  className="block rounded-xl px-3 py-2.5 text-sm text-zinc-200 transition hover:bg-white/10 hover:text-white"
                  onClick={onPick}
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function CompetitionsNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const desktopPanelRef = useRef<HTMLDivElement>(null);
  const desktopBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!desktopOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (desktopPanelRef.current?.contains(t) || desktopBtnRef.current?.contains(t)) return;
      setDesktopOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [desktopOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop: dropdown */}
      <div className="relative hidden lg:block">
        <button
          ref={desktopBtnRef}
          type="button"
          onClick={() => setDesktopOpen((o) => !o)}
          className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:border-emerald-500/40 hover:text-white"
          aria-expanded={desktopOpen}
          aria-haspopup="true"
        >
          Competitions
          <span className="text-[10px] text-zinc-500" aria-hidden>
            {desktopOpen ? "▲" : "▼"}
          </span>
        </button>
        {desktopOpen ? (
          <div
            ref={desktopPanelRef}
            className="absolute right-0 top-[calc(100%+8px)] z-50 max-h-[min(72vh,540px)] w-[min(94vw,440px)] overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/50"
            role="menu"
          >
            <CompetitionList onPick={() => setDesktopOpen(false)} />
          </div>
        ) : null}
      </div>

      {/* Mobile: open full menu */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-zinc-200 transition hover:bg-white/5 hover:text-white"
          aria-label="Open competitions menu"
        >
          <span className="flex flex-col gap-1" aria-hidden>
            <span className="block h-0.5 w-4 rounded-full bg-current" />
            <span className="block h-0.5 w-4 rounded-full bg-current" />
            <span className="block h-0.5 w-4 rounded-full bg-current" />
          </span>
        </button>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] flex flex-col bg-zinc-950 lg:hidden">
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-sm font-semibold tracking-tight text-white">Competitions</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <CompetitionList onPick={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
