"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <span className="inline-flex h-9 w-16 rounded-full border border-white/10 bg-white/5" />
    );
  }
  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium text-zinc-200 hover:bg-white/10"
      aria-label="Toggle color theme"
    >
      <span className="text-[11px] uppercase tracking-wide">{theme === "system" ? "Auto" : isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
