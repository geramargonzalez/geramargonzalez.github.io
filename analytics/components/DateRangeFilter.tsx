import Link from 'next/link';

import type { DashboardRange } from '@/lib/dashboard';

const quickRanges = [
  { key: '7', label: '7 días' },
  { key: '30', label: '30 días' },
  { key: '90', label: '90 días' }
] as const;

export function DateRangeFilter({ range }: { range: DashboardRange }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300 shadow-panel">
      <div className="flex flex-wrap gap-2">
        {quickRanges.map((item) => {
          const active = range.key === item.key;

          return (
            <Link
              key={item.key}
              href={`/admin/analytics?range=${item.key}`}
              className={`inline-flex rounded-full px-4 py-2 font-medium transition ${
                active
                  ? 'bg-indigo-500 text-white'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:border-indigo-400/40 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <form method="get" className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <input type="hidden" name="range" value="custom" />

        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
          Desde
          <input
            type="date"
            name="from"
            defaultValue={range.fromInput}
            className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none transition focus:border-indigo-400"
          />
        </label>

        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
          Hasta
          <input
            type="date"
            name="to"
            defaultValue={range.toInput}
            className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none transition focus:border-indigo-400"
          />
        </label>

        <button
          type="submit"
          className="inline-flex h-[46px] items-center justify-center rounded-2xl bg-white px-4 font-semibold text-slate-950 transition hover:bg-slate-200"
        >
          Aplicar
        </button>
      </form>
    </div>
  );
}