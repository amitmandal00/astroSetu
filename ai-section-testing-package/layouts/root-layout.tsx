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
  '/',
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
  return pathname === '/' || pathname.startsWith('/ai-astrology') || AI_ROUTES.includes(pathname);
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
        {/* Critical CSS - Must be FIRST in body to load before any React renders */}
        {/* This prevents Shell from rendering on AI routes during SSR */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Hide Shell immediately for AI routes - applies before any rendering */
              html[data-ai-route="true"] [data-shell-content],
              html[data-ai-route="true"] [data-shell-content] * {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                overflow: hidden !important;
                position: absolute !important;
                width: 0 !important;
                pointer-events: none !important;
                z-index: -9999 !important;
                margin: 0 !important;
                padding: 0 !important;
              }
            `,
          }}
        />
        {/* Critical blocking script - runs synchronously BEFORE React hydration */}
        {/* Must be first element in body to execute immediately */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !(function() {
                try {
                  var path = window.location.pathname;
                  var aiRoutes = ['/', '/privacy', '/terms', '/disclaimer', '/refund', '/contact', '/disputes', '/cookies', '/data-breach', '/compliance'];
                  var isAI = path === '/' || path.startsWith('/ai-astrology') || aiRoutes.indexOf(path) !== -1;
                  
                  // Set attribute immediately
                  document.documentElement.setAttribute('data-ai-route', isAI ? 'true' : 'false');
                  
                  // Inject additional critical CSS immediately if AI route (before any rendering)
                  if (isAI) {
                    // Remove any existing Shell content
                    var shellElements = document.querySelectorAll('[data-shell-content]');
                    shellElements.forEach(function(el) {
                      el.style.display = 'none';
                      el.style.visibility = 'hidden';
                      el.style.opacity = '0';
                      el.style.height = '0';
                      el.style.overflow = 'hidden';
                      el.style.position = 'absolute';
                      el.style.width = '0';
                      el.style.pointerEvents = 'none';
                      el.style.zIndex = '-9999';
                    });
                    
                    // Add style tag if not already added
                    if (!document.getElementById('ai-route-hide-shell')) {
                      var style = document.createElement('style');
                      style.id = 'ai-route-hide-shell';
                      style.textContent = '[data-shell-content], [data-shell-content] * { display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; overflow: hidden !important; position: absolute !important; width: 0 !important; pointer-events: none !important; z-index: -9999 !important; }';
                      (document.head || document.getElementsByTagName('head')[0]).appendChild(style);
                    }
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
          <ConditionalShell isAIRoute={isAI}>{children}</ConditionalShell>
        </ErrorBoundary>
      </body>
    </html>
  );
}
