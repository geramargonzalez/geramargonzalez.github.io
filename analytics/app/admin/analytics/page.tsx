import { DateRangeFilter } from '@/components/DateRangeFilter';
import { DailyMetricsChart } from '@/components/charts/DailyMetricsChart';
import { TopPathsChart } from '@/components/charts/TopPathsChart';
import { MetricCard } from '@/components/MetricCard';
import { RecentEventsTable } from '@/components/RecentEventsTable';
import { getAnalyticsDashboardData, parseDashboardRange } from '@/lib/dashboard';

export const dynamic = 'force-dynamic';

type AnalyticsPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function AnalyticsDashboardPage({ searchParams = {} }: AnalyticsPageProps) {
  const range = parseDashboardRange(searchParams);
  const data = await getAnalyticsDashboardData(range);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-panel backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
              Dashboard protegido
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">/admin/analytics</h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              Métricas de page views con enfoque en privacidad. Las IP nunca se guardan en claro: se
              anonimizan, se truncan y luego se hashean con SHA-256 + SALT antes de persistirse.
            </p>
          </div>
          <DateRangeFilter range={range} />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title={`Pageviews (${range.label})`}
          value={data.summary.selectedRangeViews.toLocaleString('es-UY')}
          subtitle="Visitas no-bot dentro del rango seleccionado."
        />
        <MetricCard
          title="Visitantes únicos aprox."
          value={data.summary.approxUniqueVisitors.toLocaleString('es-UY')}
          subtitle="Conteo distinto por ipHash (IP truncada + hash)."
        />
        <MetricCard
          title="Últimos 7 días"
          value={data.summary.totals7Days.toLocaleString('es-UY')}
          subtitle="Total de pageviews recientes."
        />
        <MetricCard
          title="Últimos 30 / 90 días"
          value={`${data.summary.totals30Days.toLocaleString('es-UY')} / ${data.summary.totals90Days.toLocaleString(
            'es-UY'
          )}`}
          subtitle="Comparativa rápida para tendencias generales."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 xl:col-span-2">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">Pageviews y visitantes únicos por día</h2>
            <p className="mt-1 text-sm text-slate-400">
              Serie temporal sobre el rango seleccionado. Los bots no se incluyen en estas métricas.
            </p>
          </div>
          <DailyMetricsChart data={data.dailySeries} />
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">Top 10 paths</h2>
            <p className="mt-1 text-sm text-slate-400">Rutas más visitadas dentro del rango actual.</p>
          </div>
          <TopPathsChart data={data.topPaths} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">Eventos recientes</h2>
            <p className="mt-1 text-sm text-slate-400">
              Se muestran hashes truncados y referrer opcional; nunca la IP real.
            </p>
          </div>
          <RecentEventsTable events={data.recentEvents} />
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold text-white">Resumen de paths</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {data.topPaths.length === 0 ? (
                <li className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-slate-500">
                  No hay datos para el rango seleccionado.
                </li>
              ) : (
                data.topPaths.map((item, index) => (
                  <li
                    key={`${item.path}-${index}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"
                  >
                    <span className="max-w-[75%] truncate text-slate-200">{item.path}</span>
                    <span className="font-semibold text-white">{item.views}</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold text-white">Seguridad y privacidad</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>• IP anonimizada: IPv4 sin último octeto, IPv6 truncada a /64.</li>
              <li>• Hash SHA-256 con SALT configurable desde env.</li>
              <li>• Basic Auth para proteger el dashboard de administración.</li>
              <li>• Rate limiting en memoria por ipHash para reducir spam.</li>
              <li>• Script de retención para purgar eventos con más de 90 días.</li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}