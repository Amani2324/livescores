export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-10 text-center">
      <p className="text-sm font-medium text-zinc-200">{title}</p>
      {description ? <p className="mt-2 text-xs text-zinc-500">{description}</p> : null}
    </div>
  );
}
