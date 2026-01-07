"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Shell } from "./Shell";

/**
 * ConditionalShell
 * Wraps children with Shell component, except for AI astrology routes
 * AI astrology routes have their own header/footer via layout.tsx
 * Uses inline script + CSS to prevent flash of wrong content on initial load
 */
export function ConditionalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [shouldHideShell, setShouldHideShell] = useState(false);
  
  useEffect(() => {
    // Check if we're on an AI route using the data attribute set by inline script
    if (typeof document !== "undefined") {
      const isAIRoute = document.documentElement.getAttribute("data-ai-route") === "true";
      setShouldHideShell(isAIRoute);
    }
  }, []);
  
  // Check if current route is in AI astrology section or uses AI section header/footer
  const isAIAstrologyRoute = pathname?.startsWith("/ai-astrology");
  const isAISectionPage = pathname === "/privacy" || pathname === "/terms" || pathname === "/disclaimer" || pathname === "/refund" || pathname === "/contact" || pathname === "/disputes" || pathname === "/cookies" || pathname === "/data-breach" || pathname === "/compliance";
  
  // Don't wrap AI astrology routes or AI section pages with Shell (they have their own header/footer)
  if (shouldHideShell || isAIAstrologyRoute || isAISectionPage) {
    return <>{children}</>;
  }
  
  // Wrap all other routes with Shell (generic header/footer)
  return <Shell>{children}</Shell>;
}

