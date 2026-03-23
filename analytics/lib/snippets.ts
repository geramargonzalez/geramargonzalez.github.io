export const browserSnippet = String.raw`(function () {
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
})();`;

export const nextTrackerExample = String.raw`// app/layout.tsx
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
}`;