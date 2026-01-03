"use client";

import { usePathname } from "next/navigation";
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
  
  // Check if current route is in AI astrology section or uses AI section header/footer
  // Check synchronously to prevent flash of wrong content
  const isAIAstrologyRoute = pathname?.startsWith("/ai-astrology");
  const isAISectionPage = 
    pathname === "/privacy" || 
    pathname === "/terms" || 
    pathname === "/disclaimer" || 
    pathname === "/refund" || 
    pathname === "/contact" || 
    pathname === "/disputes" || 
    pathname === "/cookies" || 
    pathname === "/data-breach" || 
    pathname === "/compliance";
  
  // Also check the data attribute set by inline script (fallback for first render)
  const isAIRouteFromAttribute = 
    typeof document !== "undefined" && 
    document.documentElement.getAttribute("data-ai-route") === "true";
  
  // Don't wrap AI astrology routes or AI section pages with Shell (they have their own header/footer)
  if (isAIAstrologyRoute || isAISectionPage || isAIRouteFromAttribute) {
    return <>{children}</>;
  }
  
  // Wrap all other routes with Shell (generic header/footer)
  return <Shell>{children}</Shell>;
}

