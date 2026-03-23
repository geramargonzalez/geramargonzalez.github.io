export default function AnalyticsDashboardLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-10 lg:px-8">
      <div className="h-36 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-3xl border border-white/10 bg-slate-900/70" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="h-[360px] animate-pulse rounded-3xl border border-white/10 bg-slate-900/70 xl:col-span-2" />
        <div className="h-[360px] animate-pulse rounded-3xl border border-white/10 bg-slate-900/70" />
      </div>
    </main>
  );
}