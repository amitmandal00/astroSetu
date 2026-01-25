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
    // CRITICAL FIX (ChatGPT Step 0): Completely disable service worker during stabilization
    // No gating - ALWAYS unregister all service workers to prevent cached JS from breaking deploy verification
    // Service worker will be re-enabled after flows are stable
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        if (registrations.length > 0) {
          registrations.forEach((registration) => {
            registration.unregister().then(() => {
              console.log("[SW] Service Worker unregistered for stabilization");
            });
          });
        } else {
          console.log("[SW] Service Worker disabled for stabilization (no registrations found)");
        }
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

