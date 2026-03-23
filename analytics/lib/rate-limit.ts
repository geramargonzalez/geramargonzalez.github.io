import { RATE_LIMIT_MAX_EVENTS, RATE_LIMIT_WINDOW_SECONDS } from '@/lib/analytics';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

const globalStore = globalThis as typeof globalThis & {
  __analyticsRateLimitStore__?: Map<string, RateLimitEntry>;
};

const store = globalStore.__analyticsRateLimitStore__ ?? new Map<string, RateLimitEntry>();

if (!globalStore.__analyticsRateLimitStore__) {
  globalStore.__analyticsRateLimitStore__ = store;
}

export function consumeRateLimit(
  key: string,
  maxEvents = RATE_LIMIT_MAX_EVENTS,
  windowSeconds = RATE_LIMIT_WINDOW_SECONDS
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    const entry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs
    };

    store.set(key, entry);
    pruneExpired(now);

    return {
      allowed: true,
      remaining: Math.max(0, maxEvents - entry.count),
      retryAfter: windowSeconds
    };
  }

  current.count += 1;
  store.set(key, current);
  pruneExpired(now);

  return {
    allowed: current.count <= maxEvents,
    remaining: Math.max(0, maxEvents - current.count),
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000))
  };
}

function pruneExpired(now: number): void {
  if (store.size < 5000) return;

  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}