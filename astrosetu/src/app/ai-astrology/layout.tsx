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
    // CRITICAL FIX (ChatGPT 22:45): Gate service worker behind env flag
    // Stop service worker from breaking deploy verification
    // Only register if process.env.NEXT_PUBLIC_ENABLE_PWA === "true"
    // Default: disable it in all environments until flows are stable
    const enablePWA = process.env.NEXT_PUBLIC_ENABLE_PWA === "true";
    
    if (enablePWA && typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    } else if (!enablePWA) {
      // CRITICAL: Unregister any existing service workers during stabilization
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister().then(() => {
              console.log("[SW] Service Worker unregistered for stabilization");
            });
          });
        });
      }
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

