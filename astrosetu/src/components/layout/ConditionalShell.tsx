"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Shell } from "./Shell";

/**
 * ConditionalShell
 * Wraps children with Shell component, except for AI astrology routes
 * AI astrology routes have their own header/footer via layout.tsx
 */
export function ConditionalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Check if current route is in AI astrology section
  const isAIAstrologyRoute = pathname?.startsWith("/ai-astrology");
  
  // Don't wrap AI astrology routes with Shell (they have their own layout)
  if (isAIAstrologyRoute) {
    return <>{children}</>;
  }
  
  // Wrap all other routes with Shell (generic header/footer)
  return <Shell>{children}</Shell>;
}

