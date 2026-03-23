interface RecentEvent {
  id: string;
  createdAt: string;
  path: string;
  referrer: string | null;
  ipHashMasked: string;
  uaHashMasked: string | null;
  isBot: boolean;
}

export function RecentEventsTable({ events }: { events: RecentEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-500">
        No hay eventos recientes en el rango seleccionado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-300">
        <thead className="bg-white/5 text-xs uppercase tracking-[0.16em] text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Path</th>
            <th className="px-4 py-3 font-medium">Referrer</th>
            <th className="px-4 py-3 font-medium">ipHash</th>
            <th className="px-4 py-3 font-medium">uaHash</th>
            <th className="px-4 py-3 font-medium">Bot</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 bg-slate-950/60">
          {events.map((event) => (
            <tr key={event.id} className="align-top">
              <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                {new Date(event.createdAt).toLocaleString('es-UY')}
              </td>
              <td className="max-w-[220px] truncate px-4 py-3 font-medium text-white">{event.path}</td>
              <td className="max-w-[240px] truncate px-4 py-3 text-slate-400">{event.referrer ?? '—'}</td>
              <td className="px-4 py-3 font-mono text-xs text-indigo-200">{event.ipHashMasked}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-400">{event.uaHashMasked ?? '—'}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    event.isBot ? 'bg-amber-500/15 text-amber-200' : 'bg-emerald-500/15 text-emerald-200'
                  }`}
                >
                  {event.isBot ? 'Sí' : 'No'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}