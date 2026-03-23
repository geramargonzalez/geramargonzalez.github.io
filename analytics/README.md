# Privacy-first Analytics Dashboard

Sistema simple de analítica propia construido con **Next.js (App Router) + TypeScript + Prisma + PostgreSQL + TailwindCSS**, con foco en privacidad:

- recibe page views en `POST /api/track`
- anonimiza la IP antes del hash
- guarda eventos en PostgreSQL
- ofrece un dashboard protegido en `/admin/analytics`
- incluye retención configurable para borrar eventos viejos

## Stack

- **Framework:** Next.js App Router + TypeScript
- **DB:** PostgreSQL
- **ORM:** Prisma
- **Charts:** Recharts
- **Estilos:** TailwindCSS
- **Infra local:** Docker Compose

## Privacidad y seguridad

- **No se guarda la IP real**.
- Se calcula `ipHash` usando **SHA-256(IP anonimizada + SALT)**.
- **IPv4:** se trunca el último octeto (`192.168.1.123 -> 192.168.1.0`).
- **IPv6:** se trunca a `/64` antes del hash.
- Si se guarda User-Agent, se persiste solo como `uaHash`.
- Se marca `isBot` si el User-Agent contiene patrones básicos como `bot`, `spider`, `crawler`, etc.
- El dashboard `/admin/analytics` está protegido con **Basic Auth** por middleware usando `ADMIN_USER` y `ADMIN_PASSWORD`.
- El endpoint `/api/track` aplica **rate limiting básico** por `ipHash` en memoria.

## Estructura del proyecto

```text
analytics/
├─ app/
│  ├─ admin/analytics/
│  │  ├─ loading.tsx
│  │  └─ page.tsx
│  ├─ api/track/route.ts
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ charts/
│  │  ├─ DailyMetricsChart.tsx
│  │  └─ TopPathsChart.tsx
│  ├─ AnalyticsTracker.tsx
│  ├─ DateRangeFilter.tsx
│  ├─ MetricCard.tsx
│  └─ RecentEventsTable.tsx
├─ lib/
│  ├─ analytics.ts
│  ├─ auth.ts
│  ├─ dashboard.ts
│  ├─ prisma.ts
│  ├─ rate-limit.ts
│  └─ snippets.ts
├─ prisma/
│  ├─ migrations/
│  ├─ schema.prisma
│  └─ seed.ts
├─ scripts/
│  └─ retention.ts
├─ .dockerignore
├─ .env.example
├─ .gitignore
├─ Dockerfile
├─ middleware.ts
├─ next.config.mjs
├─ package.json
├─ postcss.config.js
├─ tailwind.config.ts
└─ tsconfig.json
```

En la raíz del repo tenés además `docker-compose.yml`, que levanta la app y PostgreSQL.

## Variables de entorno

Copiá el ejemplo:

```bash
copy analytics\.env.example analytics\.env
```

Variables principales:

```env
NODE_ENV=development
APP_PORT=3000

POSTGRES_DB=analytics
POSTGRES_USER=analytics
POSTGRES_PASSWORD=analytics
POSTGRES_PORT=5432
DATABASE_URL=postgresql://analytics:analytics@postgres:5432/analytics?schema=public

ANALYTICS_SALT=replace-with-a-long-random-secret
RETENTION_DAYS=90
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_EVENTS=30

ADMIN_USER=admin
ADMIN_PASSWORD=change-me-now
```

## Levantar local con Docker

Desde la raíz del repo:

```bash
docker compose up --build
```

La app quedará disponible en:

- `http://localhost:3000`
- dashboard: `http://localhost:3000/admin/analytics`

## Desarrollo local sin Docker

Si preferís correr todo fuera de Docker:

```bash
cd analytics
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

## Migraciones Prisma

Crear una migración nueva:

```bash
cd analytics
npm run db:migrate
```

Aplicar migraciones existentes:

```bash
cd analytics
npm run db:deploy
```

## Seed opcional

Para cargar datos de ejemplo:

```bash
cd analytics
npm run db:seed
```

## Retención de datos

El script borra eventos con más de `RETENTION_DAYS` días:

```bash
cd analytics
npm run retention
```

Podés correrlo desde un cron / task scheduler según necesites.

## Modelo de datos

Tabla principal `page_views`:

- `id` UUID
- `createdAt` timestamp
- `path` string
- `referrer` string nullable
- `ipHash` string indexed
- `uaHash` string nullable
- `isBot` boolean

## API de tracking

### Endpoint

`POST /api/track`

### Body JSON

```json
{
  "path": "/projects",
  "referrer": "https://google.com"
}
```

### Comportamiento

- obtiene IP desde headers (`x-forwarded-for`, `x-real-ip`, etc.)
- anonimiza y hashea la IP
- hashea User-Agent si existe
- marca bots básicos con `isBot = true`
- limita requests por `ipHash`
- responde rápido con `204` o `202` si falla el guardado

## Snippet cliente genérico

```js
(function () {
  var endpoint = window.__ANALYTICS_ENDPOINT__ || '/api/track';

  function send() {
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: location.pathname,
        referrer: document.referrer || undefined
      }),
      keepalive: true
    }).catch(function () {});
  }

  function track() {
    setTimeout(send, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', track, { once: true });
  } else {
    track();
  }

  var originalPushState = history.pushState;
  history.pushState = function () {
    originalPushState.apply(history, arguments);
    track();
  };

  window.addEventListener('popstate', track);
})();
```

## Componente Next.js

Ya viene incluido `components/AnalyticsTracker.tsx`.

Uso básico en el layout:

```tsx
import { AnalyticsTracker } from '@/components/AnalyticsTracker';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
```

## Dashboard `/admin/analytics`

Incluye:

- total de pageviews del rango seleccionado
- comparativa 7 / 30 / 90 días
- serie temporal de pageviews por día
- visitantes únicos aproximados por día (`COUNT(DISTINCT ipHash)`)
- top 10 paths por visitas
- tabla de eventos recientes con hashes truncados
- filtros rápidos y rango custom

## Notas

- El rate limiting actual usa memoria de proceso. Para producción con múltiples instancias conviene migrarlo a Redis o similar.
- La agregación diaria se calcula “on the fly” con SQL. Si el volumen crece mucho, podés agregar una tabla `DailyStat` o materialized views.
- El dashboard excluye bots de los gráficos y cards principales, pero los eventos recientes muestran también si un evento fue marcado como bot.