import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { truncateHash } from '@/lib/analytics';

export type DashboardRangeKey = '7' | '30' | '90' | 'custom';

export interface DashboardRange {
  key: DashboardRangeKey;
  label: string;
  from: Date;
  to: Date;
  fromInput: string;
  toInput: string;
}

export interface AnalyticsDashboardData {
  summary: {
    selectedRangeViews: number;
    approxUniqueVisitors: number;
    totals7Days: number;
    totals30Days: number;
    totals90Days: number;
  };
  dailySeries: Array<{
    date: string;
    views: number;
    uniqueVisitors: number;
  }>;
  topPaths: Array<{
    path: string;
    views: number;
  }>;
  recentEvents: Array<{
    id: string;
    createdAt: string;
    path: string;
    referrer: string | null;
    ipHashMasked: string;
    uaHashMasked: string | null;
    isBot: boolean;
  }>;
}

type SearchParams = Record<string, string | string[] | undefined>;

export function parseDashboardRange(searchParams: SearchParams = {}): DashboardRange {
  const rangeParam = first(searchParams.range) ?? '30';
  const now = new Date();

  if (rangeParam === 'custom') {
    const fromInput = first(searchParams.from);
    const toInput = first(searchParams.to);

    if (fromInput && toInput) {
      const from = startOfDay(new Date(`${fromInput}T00:00:00`));
      const to = endOfDay(new Date(`${toInput}T23:59:59.999`));

      if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && from <= to) {
        return {
          key: 'custom',
          label: 'Rango personalizado',
          from,
          to,
          fromInput,
          toInput
        };
      }
    }
  }

  const days = rangeParam === '7' || rangeParam === '30' || rangeParam === '90' ? Number(rangeParam) : 30;
  const to = endOfDay(now);
  const from = startOfDay(addDays(to, -(days - 1)));

  return {
    key: days === 7 ? '7' : days === 90 ? '90' : '30',
    label: `Últimos ${days} días`,
    from,
    to,
    fromInput: formatDateInput(from),
    toInput: formatDateInput(to)
  };
}

export async function getAnalyticsDashboardData(range: DashboardRange): Promise<AnalyticsDashboardData> {
  const nonBotWhere = {
    createdAt: {
      gte: range.from,
      lte: range.to
    },
    isBot: false
  } as const;

  const [selectedRangeViews, approxUniqueVisitors, totals7Days, totals30Days, totals90Days, dailyRows, topPaths, recentEvents] =
    await Promise.all([
      prisma.pageView.count({ where: nonBotWhere }),
      countDistinctVisitors(range.from, range.to),
      countViewsForLastDays(7),
      countViewsForLastDays(30),
      countViewsForLastDays(90),
      getDailySeries(range.from, range.to),
      getTopPaths(range.from, range.to),
      prisma.pageView.findMany({
        where: {
          createdAt: {
            gte: range.from,
            lte: range.to
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 25,
        select: {
          id: true,
          createdAt: true,
          path: true,
          referrer: true,
          ipHash: true,
          uaHash: true,
          isBot: true
        }
      })
    ]);

  return {
    summary: {
      selectedRangeViews,
      approxUniqueVisitors,
      totals7Days,
      totals30Days,
      totals90Days
    },
    dailySeries: fillDateGaps(range.from, range.to, dailyRows),
    topPaths,
    recentEvents: recentEvents.map((event) => ({
      id: event.id,
      createdAt: event.createdAt.toISOString(),
      path: event.path,
      referrer: event.referrer,
      ipHashMasked: truncateHash(event.ipHash),
      uaHashMasked: event.uaHash ? truncateHash(event.uaHash) : null,
      isBot: event.isBot
    }))
  };
}

async function countDistinctVisitors(from: Date, to: Date): Promise<number> {
  const rows = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
    SELECT COUNT(DISTINCT "ipHash")::bigint AS count
    FROM "page_views"
    WHERE "createdAt" >= ${from}
      AND "createdAt" <= ${to}
      AND "isBot" = false
  `);

  return Number(rows[0]?.count ?? 0);
}

async function countViewsForLastDays(days: number): Promise<number> {
  const to = endOfDay(new Date());
  const from = startOfDay(addDays(to, -(days - 1)));

  return prisma.pageView.count({
    where: {
      createdAt: {
        gte: from,
        lte: to
      },
      isBot: false
    }
  });
}

async function getDailySeries(from: Date, to: Date) {
  return prisma.$queryRaw<Array<{ day: Date; views: bigint; uniqueVisitors: bigint }>>(Prisma.sql`
    SELECT DATE("createdAt") AS day,
           COUNT(*)::bigint AS views,
           COUNT(DISTINCT "ipHash")::bigint AS "uniqueVisitors"
    FROM "page_views"
    WHERE "createdAt" >= ${from}
      AND "createdAt" <= ${to}
      AND "isBot" = false
    GROUP BY DATE("createdAt")
    ORDER BY DATE("createdAt") ASC
  `);
}

async function getTopPaths(from: Date, to: Date) {
  const rows = await prisma.$queryRaw<Array<{ path: string; views: bigint }>>(Prisma.sql`
    SELECT "path", COUNT(*)::bigint AS views
    FROM "page_views"
    WHERE "createdAt" >= ${from}
      AND "createdAt" <= ${to}
      AND "isBot" = false
    GROUP BY "path"
    ORDER BY views DESC
    LIMIT 10
  `);

  return rows.map((row: { path: string; views: bigint }) => ({
    path: row.path,
    views: Number(row.views)
  }));
}

function fillDateGaps(
  from: Date,
  to: Date,
  rows: Array<{ day: Date; views: bigint; uniqueVisitors: bigint }>
): AnalyticsDashboardData['dailySeries'] {
  const map = new Map(
    rows.map((row) => [formatDateInput(row.day), { views: Number(row.views), uniqueVisitors: Number(row.uniqueVisitors) }])
  );

  const series: AnalyticsDashboardData['dailySeries'] = [];

  for (let cursor = startOfDay(from); cursor <= to; cursor = addDays(cursor, 1)) {
    const key = formatDateInput(cursor);
    const values = map.get(key);

    series.push({
      date: key,
      views: values?.views ?? 0,
      uniqueVisitors: values?.uniqueVisitors ?? 0
    });
  }

  return series;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateInput(date: Date): string {
  return new Date(date).toISOString().slice(0, 10);
}