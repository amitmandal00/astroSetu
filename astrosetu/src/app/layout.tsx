import "./globals.css";
import type { Metadata } from "next";
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
    "mobile-web-app-capable": "yes",
    "viewport": "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
    "theme-color": "#6366f1"
  }
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
