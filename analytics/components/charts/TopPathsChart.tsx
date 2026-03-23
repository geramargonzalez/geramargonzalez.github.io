'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface TopPathsChartProps {
  data: Array<{
    path: string;
    views: number;
  }>;
}

export function TopPathsChart({ data }: TopPathsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-500">
        No hay rutas para mostrar.
      </div>
    );
  }

  const chartData = data
    .slice()
    .reverse()
    .map((item) => ({
      ...item,
      shortPath: item.path.length > 20 ? `${item.path.slice(0, 20)}…` : item.path
    }));

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 8 }}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="3 3" />
          <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="shortPath"
            width={110}
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number) => [value, 'Visitas']}
            contentStyle={{
              background: '#020617',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '1rem',
              color: '#e2e8f0'
            }}
          />
          <Bar dataKey="views" fill="#60a5fa" radius={[0, 10, 10, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}