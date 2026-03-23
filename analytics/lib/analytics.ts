import { createHash } from 'crypto';
import { isIPv4, isIPv6 } from 'node:net';

const BOT_PATTERN = /(bot|spider|crawler|crawl|slurp|preview|facebookexternalhit|headless|monitor)/i;

export const RATE_LIMIT_WINDOW_SECONDS = parseIntegerEnv('RATE_LIMIT_WINDOW_SECONDS', 60);
export const RATE_LIMIT_MAX_EVENTS = parseIntegerEnv('RATE_LIMIT_MAX_EVENTS', 30);
export const RETENTION_DAYS = parseIntegerEnv('RETENTION_DAYS', 90);

export function parseIntegerEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  const parsed = Number.parseInt(raw ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getTrackingSalt(): string {
  const salt = process.env.ANALYTICS_SALT?.trim();

  if (!salt) {
    throw new Error('ANALYTICS_SALT is required');
  }

  return salt;
}

export function hashValue(value: string, salt = getTrackingSalt()): string {
  return createHash('sha256').update(`${salt}:${value}`).digest('hex');
}

export function normalizeIp(raw: string | null | undefined): string | null {
  if (!raw) return null;

  let candidate = raw.split(',')[0]?.trim() ?? '';
  if (!candidate) return null;

  if (candidate.toLowerCase().startsWith('for=')) {
    candidate = candidate.slice(4);
  }

  candidate = candidate.replace(/^"|"$/g, '');

  if (candidate.startsWith('[') && candidate.includes(']')) {
    candidate = candidate.slice(1, candidate.indexOf(']'));
  }

  if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(candidate)) {
    candidate = candidate.replace(/:\d+$/, '');
  }

  if (candidate.startsWith('::ffff:')) {
    const mapped = candidate.slice(7);
    if (isIPv4(mapped)) return mapped;
  }

  if (isIPv4(candidate) || isIPv6(candidate)) {
    return candidate;
  }

  return null;
}

export function getClientIp(headers: Headers): string | null {
  const headerCandidates = [
    headers.get('x-forwarded-for'),
    headers.get('x-real-ip'),
    headers.get('cf-connecting-ip'),
    headers.get('x-client-ip'),
    headers.get('fastly-client-ip'),
    headers.get('forwarded')
  ];

  for (const value of headerCandidates) {
    const normalized = normalizeIp(value);
    if (normalized) return normalized;
  }

  return null;
}

function expandIpv6(ip: string): string[] {
  const [head, tail] = ip.split('::');
  const headParts = head ? head.split(':').filter(Boolean) : [];
  const tailParts = tail ? tail.split(':').filter(Boolean) : [];
  const missing = Math.max(0, 8 - (headParts.length + tailParts.length));

  return [...headParts, ...Array.from({ length: missing }, () => '0'), ...tailParts].map((part) =>
    part.padStart(4, '0')
  );
}

export function anonymizeIp(ip: string): string {
  if (isIPv4(ip)) {
    const parts = ip.split('.');
    parts[3] = '0';
    return parts.join('.');
  }

  if (isIPv6(ip)) {
    const parts = expandIpv6(ip);
    return [...parts.slice(0, 4), '0000', '0000', '0000', '0000'].join(':');
  }

  return '0.0.0.0';
}

export function hashIp(ip: string, salt = getTrackingSalt()): string {
  return hashValue(anonymizeIp(ip), salt);
}

export function hashUserAgent(userAgent?: string | null, salt = getTrackingSalt()): string | null {
  if (!userAgent?.trim()) return null;
  return hashValue(userAgent.trim(), salt);
}

export function isLikelyBot(userAgent?: string | null): boolean {
  if (!userAgent) return false;
  return BOT_PATTERN.test(userAgent);
}

export function sanitizePath(input?: string | null): string {
  if (!input?.trim()) return '/';

  try {
    if (/^https?:\/\//i.test(input)) {
      const url = new URL(input);
      return `${url.pathname}${url.search}`.slice(0, 2048) || '/';
    }
  } catch {
    // Fallback below.
  }

  const normalized = input.startsWith('/') ? input : `/${input.replace(/^\/+/, '')}`;
  return normalized.slice(0, 2048) || '/';
}

export function sanitizeReferrer(input?: string | null): string | null {
  if (!input?.trim()) return null;

  try {
    const url = new URL(input);
    return `${url.origin}${url.pathname}${url.search}`.slice(0, 2048);
  } catch {
    return input.slice(0, 2048);
  }
}

export function truncateHash(hash: string, visible = 4): string {
  if (hash.length <= visible * 2) return hash;
  return `${hash.slice(0, visible)}…${hash.slice(-visible)}`;
}