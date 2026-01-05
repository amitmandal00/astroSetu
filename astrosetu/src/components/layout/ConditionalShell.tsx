"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Shell } from "./Shell";

/**
 * ConditionalShell
 * Wraps children with Shell component, except for AI astrology routes
 * AI astrology routes have their own header/footer via layout.tsx
 * Uses server-side prop + client-side detection to prevent Shell from rendering
 */
export function ConditionalShell({ 
  children,
  isAIRoute: serverIsAI = false 
}: { 
  children: ReactNode;
  isAIRoute?: boolean;
}) {
  const pathname = usePathname();
  
  // Helper function to check if current pathname is an AI route
  function checkIfAIRoute(currentPathname: string | null): boolean {
    if (!currentPathname) return false;
    const isAIAstrologyRoute = currentPathname.startsWith("/ai-astrology");
    const isAISectionPage = 
      currentPathname === "/privacy" || 
      currentPathname === "/terms" || 
      currentPathname === "/disclaimer" || 
      currentPathname === "/refund" || 
      currentPathname === "/contact" || 
      currentPathname === "/disputes" || 
      currentPathname === "/cookies" || 
      currentPathname === "/data-breach" || 
      currentPathname === "/compliance";
    return isAIAstrologyRoute || isAISectionPage;
  }
  
  // Initialize state: prefer server-side prop, fallback to data attribute
  // Note: pathname check happens in useEffect (usePathname hook not available in useState initializer)
  const [isAI, setIsAI] = useState(() => {
    // Server-side prop takes highest priority
    if (serverIsAI) return true;
    
    // Fallback to data attribute (set by server-side layout or inline script)
    if (typeof document !== "undefined") {
      const attrValue = document.documentElement.getAttribute("data-ai-route");
      return attrValue === "true";
    }
    
    return false;
  });
  
  // Update state when server prop changes
  useEffect(() => {
    if (serverIsAI) {
      setIsAI(true);
    }
  }, [serverIsAI]);
  
  // Update state when pathname changes (client-side navigation)
  // This runs on mount and whenever pathname changes
  useEffect(() => {
    if (pathname) {
      const isAIRouteFromPath = checkIfAIRoute(pathname);
      if (isAIRouteFromPath) {
        setIsAI(true);
        // Also update data attribute for consistency
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-ai-route", "true");
        }
      } else {
        // For non-AI routes, set to false and update attribute
        setIsAI(false);
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-ai-route", "false");
        }
      }
    }
  }, [pathname]);
  
  // Check data attribute on mount and when it changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      const checkAttribute = () => {
        const attrValue = document.documentElement.getAttribute("data-ai-route");
        if (attrValue === "true") {
          setIsAI(true);
        }
      };
      
      checkAttribute();
      
      // Watch for attribute changes (in case script sets it later)
      const observer = new MutationObserver(checkAttribute);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-ai-route']
      });
      
      return () => observer.disconnect();
    }
  }, []);
  
  // Don't render Shell at all for AI routes - return children directly
  // This prevents Shell from rendering even during SSR
  if (isAI || serverIsAI) {
    return <>{children}</>;
  }
  
  // Wrap all other routes with Shell (generic header/footer)
  return <Shell>{children}</Shell>;
}

