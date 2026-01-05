"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Shell } from "./Shell";

/**
 * ConditionalShell
 * Wraps children with Shell component, except for AI astrology routes
 * AI astrology routes have their own header/footer via layout.tsx
 * Uses server-side data attribute + CSS to prevent flash of wrong content
 */
export function ConditionalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Check data attribute immediately (set server-side by layout)
  const [isAIFromAttribute, setIsAIFromAttribute] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.getAttribute("data-ai-route") === "true";
    }
    return false;
  });
  
  // Update on pathname change
  useEffect(() => {
    if (typeof document !== "undefined") {
      setIsAIFromAttribute(document.documentElement.getAttribute("data-ai-route") === "true");
    }
  }, [pathname]);
  
  // Check if current route is in AI astrology section
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
  
  // Don't render Shell at all for AI routes (server-side attribute + client-side check)
  if (isAIFromAttribute || isAIAstrologyRoute || isAISectionPage) {
    return <>{children}</>;
  }
  
  // Wrap all other routes with Shell (generic header/footer)
  return <Shell>{children}</Shell>;
}

