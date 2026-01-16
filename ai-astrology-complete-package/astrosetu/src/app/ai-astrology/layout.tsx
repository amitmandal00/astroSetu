/**
 * AI Astrology Section Layout
 * Dedicated layout for all AI astrology pages
 * Includes autonomous header and footer (no human support elements)
 */

"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { AIHeader } from "@/components/ai-astrology/AIHeader";
import { AIFooter } from "@/components/ai-astrology/AIFooter";
import { PWAInstallPrompt } from "@/components/ai-astrology/PWAInstallPrompt";

export default function AIAstrologyLayout({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    // Register service worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AIHeader />
      <main className="flex-1">
        {children}
      </main>
      <AIFooter />
      <PWAInstallPrompt />
    </div>
  );
}

