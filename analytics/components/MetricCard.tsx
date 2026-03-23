interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
}

export function MetricCard({ title, value, subtitle }: MetricCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-panel">
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
    </article>
  );
}