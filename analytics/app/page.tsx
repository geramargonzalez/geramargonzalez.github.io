import Link from 'next/link';

import { browserSnippet, nextTrackerExample } from '@/lib/snippets';

const featureList = [
  'Tracking server-side con IP anonimizada y hash SHA-256 + SALT.',
  'Dashboard protegido con Basic Auth y métricas en tiempo real.',
  'Rate limiting básico por ipHash para reducir spam en /api/track.',
  'Retención configurable para borrar eventos antiguos automáticamente.'
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-6 py-12 lg:px-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-panel backdrop-blur md:p-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-5">
            <span className="inline-flex rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-200">
              Next.js + Prisma + PostgreSQL
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Privacy-first analytics para tu web personal
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Esta app expone <code>/api/track</code> para recibir page views, guarda eventos en PostgreSQL usando
              Prisma y ofrece un dashboard protegido en <code>/admin/analytics</code> con métricas clave y gráficos.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/analytics"
                className="inline-flex items-center rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
              >
                Abrir dashboard admin
              </Link>
              <a
                href="https://nextjs.org/docs"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-indigo-400/60 hover:text-white"
              >
                Docs de Next.js
              </a>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-300 lg:max-w-sm">
            {featureList.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                  ✓
                </span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-slate-900/75 p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Snippet JavaScript genérico</h2>
              <p className="mt-1 text-sm text-slate-400">
                Pegalo en cualquier sitio estático o multipágina para empezar a enviar page views.
              </p>
            </div>
          </div>
          <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-xs leading-6 text-slate-200">
            <code>{browserSnippet}</code>
          </pre>
        </article>

        <article className="rounded-3xl border border-white/10 bg-slate-900/75 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Componente para Next.js App Router</h2>
            <p className="mt-1 text-sm text-slate-400">
              Usá <code>usePathname()</code> para trackear cambios de ruta en una SPA con Next.js.
            </p>
          </div>
          <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-xs leading-6 text-slate-200">
            <code>{nextTrackerExample}</code>
          </pre>
        </article>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h2 className="text-2xl font-semibold text-white">Qué incluye el repo</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: 'API de tracking',
              desc: 'POST /api/track con hashing de IP, ua_hash, bots y rate limit.'
            },
            {
              title: 'Dashboard admin',
              desc: 'Visitas totales, series por día, top paths, visitantes únicos aproximados y eventos recientes.'
            },
            {
              title: 'Docker local',
              desc: 'docker-compose para levantar app + PostgreSQL con configuración reproducible.'
            },
            {
              title: 'Retención',
              desc: 'Script CLI para eliminar eventos más viejos que la ventana configurada.'
            }
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <h3 className="text-base font-semibold text-white">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}