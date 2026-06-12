export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-12 w-full" style={{ animationDelay: `${i * 80}ms` }} />
      ))}
    </div>
  );
}

export function KpiSkeletonGrid({ count = 4 }: { count?: number }) {
  const gridClass = count >= 5 ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4" : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4";

  return (
    <div className={gridClass}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="surface-panel rounded-2xl p-5 overflow-hidden relative">
          <div className="absolute left-0 right-0 top-0 h-[2px] bg-white/6" />
          <div className="skeleton h-3 w-24 mb-4" />
          <div className="skeleton h-9 w-28 mb-4" />
          <div className="skeleton h-6 w-24" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="surface-panel rounded-2xl overflow-hidden">
      <div className="border-b border-white/6 bg-black/10 px-5 py-4">
        <div className="skeleton h-4 w-40" />
      </div>
      <div className="px-5 py-3 space-y-3">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="skeleton h-3 w-3/4" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="grid gap-3 py-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }).map((_, c) => (
              <div key={c} className="skeleton h-8 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="surface-panel chart-surface rounded-2xl p-5">
      <div className="skeleton h-4 w-44 mb-5" />
      <div className="grid grid-cols-12 items-end gap-2 h-52">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="skeleton rounded-t-xl"
            style={{ height: `${40 + ((i * 17) % 80)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function LoadingSpinner({ message = "Loading data..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
      </div>
      <p className="text-sm text-slate-400 font-medium">{message}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="surface-panel rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-4">
      <div className="text-4xl">⚠️</div>
      <div>
        <p className="text-sm text-critical font-medium mb-1">Failed to load data</p>
        <p className="text-xs text-slate-500 max-w-md">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-primary/20 text-accent hover:bg-primary/30 transition-all duration-200 btn-elevate"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title = "No data",
  message = "There are no records to display.",
  icon = "📭",
}: {
  title?: string;
  message?: string;
  icon?: string;
}) {
  return (
    <div className="surface-panel rounded-2xl py-14 px-6 text-center flex flex-col items-center justify-center gap-3 border border-primary/20 shadow-[0_0_0_1px_rgba(47,93,138,0.15),0_12px_32px_rgba(0,0,0,0.22)]">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">
        {icon}
      </div>
      <p className="text-base text-white font-semibold tracking-[-0.02em]">{title}</p>
      <p className="text-sm text-slate-500 max-w-md leading-6">{message}</p>
    </div>
  );
}
