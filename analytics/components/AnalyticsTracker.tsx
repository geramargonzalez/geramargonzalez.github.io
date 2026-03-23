'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface AnalyticsTrackerProps {
  endpoint?: string;
  excludePrefixes?: string[];
}

export function AnalyticsTracker({
  endpoint = '/api/track',
  excludePrefixes = []
}: AnalyticsTrackerProps) {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (excludePrefixes.some((prefix) => pathname.startsWith(prefix))) return;
    if (lastTrackedPath.current === pathname) return;

    lastTrackedPath.current = pathname;

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: pathname,
        referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined
      }),
      keepalive: true,
      cache: 'no-store'
    }).catch(() => {
      // Intencionalmente silencioso para no afectar UX.
    });
  }, [endpoint, excludePrefixes, pathname]);

  return null;
}