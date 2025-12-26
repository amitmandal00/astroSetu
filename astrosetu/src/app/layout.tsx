import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Shell } from "@/components/layout/Shell";
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
        <ErrorBoundary>
          <NotificationInitializer />
          <Shell>{children}</Shell>
        </ErrorBoundary>
      </body>
    </html>
  );
}
