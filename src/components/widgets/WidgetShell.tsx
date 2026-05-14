"use client";

export function WidgetShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const key = process.env.NEXT_PUBLIC_API_FOOTBALL_WIDGET_KEY?.trim();
  if (!key) {
    return (
      <section className="rounded-3xl border border-dashed border-white/15 bg-zinc-900/30 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">{title}</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Add{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-emerald-200">
            NEXT_PUBLIC_API_FOOTBALL_WIDGET_KEY
          </code>{" "}
          to <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">.env.local</code> (same value as
          your API-FOOTBALL key is fine) to enable official API-SPORTS embed widgets.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 shadow-inner shadow-black/20">
      <div className="border-b border-white/5 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">{title}</h2>
        {subtitle ? <p className="mt-1 text-xs text-zinc-600">{subtitle}</p> : null}
      </div>
      <div className="min-h-[280px] p-2 sm:p-3 [&_api-sports-widget]:block [&_api-sports-widget]:min-h-[260px]">
        {children}
      </div>
    </section>
  );
}
