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
        {/* Blocking inline script to prevent flash of wrong content for AI routes */}
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
