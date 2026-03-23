'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

interface DailyMetricsChartProps {
  data: Array<{
    date: string;
    views: number;
    uniqueVisitors: number;
  }>;
}

export function DailyMetricsChart({ data }: DailyMetricsChartProps) {
  if (data.length === 0) {
    return <EmptyState label="No hay datos diarios para graficar." />;
  }

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: '#020617',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '1rem',
              color: '#e2e8f0'
            }}
          />
          <Legend wrapperStyle={{ color: '#e2e8f0' }} />
          <Line type="monotone" dataKey="views" stroke="#818cf8" strokeWidth={3} dot={false} name="Pageviews" />
          <Line
            type="monotone"
            dataKey="uniqueVisitors"
            stroke="#34d399"
            strokeWidth={3}
            dot={false}
            name="Únicos aprox."
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-500">
      {label}
    </div>
  );
}