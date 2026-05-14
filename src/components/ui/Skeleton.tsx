export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />;
}

export function MatchRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-zinc-900/40 p-3">
      <Skeleton className="h-3 w-10" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-6 w-12" />
    </div>
  );
}
