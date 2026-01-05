import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { ConditionalShell } from "@/components/layout/ConditionalShell";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotificationInitializer } from "@/components/notifications/NotificationInitializer";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "AstroSetu",
  description: "Bridging humans with cosmic guidance",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AstroSetu"
  },
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#6366f1"
};

// AI routes that should not show Shell component
const AI_ROUTES = [
  '/ai-astrology',
  '/privacy',
  '/terms',
  '/disclaimer',
  '/refund',
  '/contact',
  '/disputes',
  '/cookies',
  '/data-breach',
  '/compliance',
];

function isAIRoute(pathname: string): boolean {
  return pathname.startsWith('/ai-astrology') || AI_ROUTES.includes(pathname);
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Server-side detection of AI routes using middleware header
  let isAI = false;
  try {
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '';
    isAI = isAIRoute(pathname);
  } catch (e) {
    // Fallback if headers() fails (shouldn't happen, but safety)
    isAI = false;
  }
  
  return (
    <html lang="en" className="h-full" suppressHydrationWarning data-ai-route={isAI ? "true" : "false"}>
      <body className="h-full" suppressHydrationWarning>
        {/* Critical blocking script - runs synchronously BEFORE React hydration */}
        {/* Must be first element in body to execute immediately */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !(function() {
                try {
                  var path = window.location.pathname;
                  var aiRoutes = ['/privacy', '/terms', '/disclaimer', '/refund', '/contact', '/disputes', '/cookies', '/data-breach', '/compliance'];
                  var isAI = path.startsWith('/ai-astrology') || aiRoutes.indexOf(path) !== -1;
                  
                  // Set attribute immediately
                  document.documentElement.setAttribute('data-ai-route', isAI ? 'true' : 'false');
                  
                  // Inject critical CSS immediately if AI route (before any rendering)
                  if (isAI) {
                    var style = document.createElement('style');
                    style.id = 'ai-route-hide-shell';
                    style.textContent = '[data-shell-content] { display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; overflow: hidden !important; position: absolute !important; width: 0 !important; pointer-events: none !important; z-index: -9999 !important; } [data-shell-content] header, [data-shell-content] footer, [data-shell-content] nav { display: none !important; visibility: hidden !important; height: 0 !important; overflow: hidden !important; }';
                    (document.head || document.getElementsByTagName('head')[0]).appendChild(style);
                  }
                } catch(e) {
                  console.error('AI route detection failed:', e);
                }
              })();
            `,
          }}
        />
        <ErrorBoundary>
          <NotificationInitializer />
          <ConditionalShell>{children}</ConditionalShell>
        </ErrorBoundary>
      </body>
    </html>
  );
}
