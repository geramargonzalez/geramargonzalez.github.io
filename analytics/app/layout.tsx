import type { Metadata } from 'next';

import { AnalyticsTracker } from '@/components/AnalyticsTracker';

import './globals.css';

export const metadata: Metadata = {
  title: 'Privacy-first Analytics Dashboard',
  description:
    'Sistema simple de analítica propia con Next.js, Prisma y PostgreSQL, priorizando privacidad y métricas útiles.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AnalyticsTracker excludePrefixes={['/admin', '/api']} />
        {children}
      </body>
    </html>
  );
}