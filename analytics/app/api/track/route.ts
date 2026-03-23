import type { NextRequest } from 'next/server';

import {
  getClientIp,
  hashIp,
  hashUserAgent,
  isLikelyBot,
  sanitizePath,
  sanitizeReferrer
} from '@/lib/analytics';
import { prisma } from '@/lib/prisma';
import { consumeRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

interface TrackPayload {
  path?: string;
  referrer?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseJson(request);
    const path = sanitizePath(body?.path ?? '/');

    if (path === '/api/track') {
      return noContent();
    }

    const referrer = sanitizeReferrer(body?.referrer);
    const userAgent = request.headers.get('user-agent');
    const clientIp = getClientIp(request.headers) ?? '0.0.0.0';
    const ipHash = hashIp(clientIp);
    const uaHash = hashUserAgent(userAgent);
    const isBot = isLikelyBot(userAgent);

    const rateLimit = consumeRateLimit(ipHash);
    if (!rateLimit.allowed) {
      return new Response(null, {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfter),
          'Cache-Control': 'no-store'
        }
      });
    }

    await prisma.pageView.create({
      data: {
        path,
        referrer,
        ipHash,
        uaHash,
        isBot
      }
    });

    return noContent();
  } catch (error) {
    console.error('Tracking failed:', error);
    return new Response(null, {
      status: 202,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  }
}

export async function OPTIONS() {
  return noContent();
}

async function parseJson(request: NextRequest): Promise<TrackPayload | null> {
  try {
    return (await request.json()) as TrackPayload;
  } catch {
    return null;
  }
}

function noContent() {
  return new Response(null, {
    status: 204,
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}