import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { ConditionalShell } from "@/components/layout/ConditionalShell";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotificationInitializer } from "@/components/notifications/NotificationInitializer";

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        {/* Critical inline styles - must be first in body to prevent flash */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Hide Shell immediately for AI routes - applies before React hydrates */
              html[data-ai-route="true"] [data-shell-content] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                overflow: hidden !important;
                position: absolute !important;
                width: 0 !important;
                pointer-events: none !important;
              }
              html[data-ai-route="true"] [data-shell-content] header,
              html[data-ai-route="true"] [data-shell-content] footer {
                display: none !important;
              }
              html[data-ai-route="true"] body > [data-shell-content] {
                display: none !important;
              }
            `,
          }}
        />
        {/* Blocking inline script to set data attribute immediately - runs before React */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var path = window.location.pathname;
                  if (path.startsWith('/ai-astrology') || 
                      path === '/privacy' || 
                      path === '/terms' || 
                      path === '/disclaimer' || 
                      path === '/refund' || 
                      path === '/contact' || 
                      path === '/disputes' || 
                      path === '/cookies' || 
                      path === '/data-breach' ||
                      path === '/compliance') {
                    document.documentElement.setAttribute('data-ai-route', 'true');
                  }
                } catch(e) {}
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
