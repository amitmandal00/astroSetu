import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { ConditionalShell } from "@/components/layout/ConditionalShell";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotificationInitializer } from "@/components/notifications/NotificationInitializer";
import { headers } from "next/headers";

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

// AI routes that should not show Shell component
const AI_ROUTES = [
  '/',
  '/ai-astrology',
  '/privacy',
  '/terms',
  '/disclaimer',
  '/refund',
  '/contact',
  '/disputes',
  '/cookies',
  '/data-breach',
  '/compliance',
];

function isAIRoute(pathname: string): boolean {
  return pathname === '/' || pathname.startsWith('/ai-astrology') || AI_ROUTES.includes(pathname);
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Server-side detection of AI routes using middleware header
  let isAI = false;
  try {
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '';
    isAI = isAIRoute(pathname);
  } catch (e) {
    // Fallback if headers() fails (shouldn't happen, but safety)
    isAI = false;
  }
  
  return (
    <html lang="en" className="h-full" suppressHydrationWarning data-ai-route={isAI ? "true" : "false"}>
      <body className="h-full" suppressHydrationWarning>
        {/* CRITICAL: CSS must be FIRST in body to load before React renders */}
        {/* This prevents Shell from rendering on AI routes during SSR, hydration, loading, and route transitions */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* ULTRA-AGGRESSIVE Shell hiding for AI routes - runs BEFORE React hydration */
              html[data-ai-route="true"] [data-shell-content],
              html[data-ai-route="true"] [data-shell-content] *,
              html[data-ai-route="true"] [data-shell-content] *::before,
              html[data-ai-route="true"] [data-shell-content] *::after,
              html[data-ai-route="true"] body > div[data-shell-content],
              html[data-ai-route="true"] body > [data-shell-content],
              html[data-ai-route="true"] [data-shell-content] header,
              html[data-ai-route="true"] [data-shell-content] footer,
              html[data-ai-route="true"] [data-shell-content] nav,
              html[data-ai-route="true"] [data-shell-content] main,
              html[data-ai-route="true"] [data-shell-content] div {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                min-height: 0 !important;
                max-height: 0 !important;
                overflow: hidden !important;
                position: absolute !important;
                width: 0 !important;
                min-width: 0 !important;
                max-width: 0 !important;
                pointer-events: none !important;
                z-index: -9999 !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
                background: transparent !important;
                color: transparent !important;
                line-height: 0 !important;
                font-size: 0 !important;
                text-indent: -9999px !important;
              }
              
              /* Prevent Shell from flashing during route transitions, loading states, Suspense fallbacks */
              html[data-ai-route="true"] body > div:first-child[data-shell-content],
              html[data-ai-route="true"] body > [data-shell-content]:first-child,
              html[data-ai-route="true"] [data-shell-content][class*="loading"],
              html[data-ai-route="true"] [data-shell-content][class*="Loading"],
              html[data-ai-route="true"] [data-shell-content][class*="transition"],
              html[data-ai-route="true"] [data-shell-content][class*="animate"],
              html[data-ai-route="true"] [data-shell-content][data-reactroot] {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                min-height: 0 !important;
                overflow: hidden !important;
                opacity: 0 !important;
              }
            `,
          }}
        />
        {/* CRITICAL: Blocking script - runs synchronously BEFORE React hydration */}
        {/* Must be first script in body to execute immediately */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !(function() {
                'use strict';
                try {
                  // Detect AI route IMMEDIATELY (before React, before any rendering)
                  var path = window.location.pathname;
                  var aiRoutes = ['/', '/privacy', '/terms', '/disclaimer', '/refund', '/contact', '/disputes', '/cookies', '/data-breach', '/compliance'];
                  var isAI = path === '/' || path.startsWith('/ai-astrology') || aiRoutes.indexOf(path) !== -1;
                  
                  // Set attribute IMMEDIATELY (triggers CSS hiding rules from globals.css and inline style)
                  document.documentElement.setAttribute('data-ai-route', isAI ? 'true' : 'false');
                  
                  // If AI route, hide Shell immediately and continuously watch for it
                  if (isAI) {
                    // Function to aggressively hide ALL Shell elements
                    function hideShellElements() {
                      var shellElements = document.querySelectorAll('[data-shell-content]');
                      for (var i = 0; i < shellElements.length; i++) {
                        var el = shellElements[i];
                        // Apply inline styles directly (highest priority)
                        el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; min-height: 0 !important; max-height: 0 !important; overflow: hidden !important; position: absolute !important; width: 0 !important; min-width: 0 !important; max-width: 0 !important; pointer-events: none !important; z-index: -9999 !important; margin: 0 !important; padding: 0 !important; border: none !important; background: transparent !important; color: transparent !important;';
                        // Also hide all children recursively
                        var children = el.querySelectorAll('*');
                        for (var j = 0; j < children.length; j++) {
                          children[j].style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; overflow: hidden !important; position: absolute !important; width: 0 !important; pointer-events: none !important;';
                        }
                      }
                    }
                    
                    // Hide immediately - don't wait for DOMContentLoaded
                    hideShellElements();
                    
                    // Hide on DOMContentLoaded (if script runs before DOM ready)
                    if (document.readyState === 'loading') {
                      document.addEventListener('DOMContentLoaded', hideShellElements);
                    }
                    
                    // Hide on window load (final safety net)
                    window.addEventListener('load', hideShellElements);
                    
                    // Watch for Shell elements being added dynamically (route transitions, React hydration, Suspense, loading states)
                    var observer = new MutationObserver(function(mutations) {
                      hideShellElements(); // Hide immediately when DOM changes
                    });
                    
                    // Start observing as soon as body exists (or immediately if it exists)
                    function startObserving() {
                      if (document.body) {
                        observer.observe(document.body, {
                          childList: true,
                          subtree: true,
                          attributes: false,
                          attributeOldValue: false,
                          characterData: false
                        });
                        hideShellElements(); // Hide any that were added before observer started
                      } else {
                        // Body doesn't exist yet, try again
                        setTimeout(startObserving, 0);
                      }
                    }
                    startObserving();
                    
                    // Also watch for route changes (Next.js client-side navigation)
                    var originalPushState = history.pushState;
                    var originalReplaceState = history.replaceState;
                    history.pushState = function() {
                      originalPushState.apply(history, arguments);
                      // Hide Shell immediately on route change (multiple checks for safety)
                      setTimeout(hideShellElements, 0);
                      setTimeout(hideShellElements, 10); // Double-check after a tick
                      setTimeout(hideShellElements, 50); // Final check
                    };
                    history.replaceState = function() {
                      originalReplaceState.apply(history, arguments);
                      setTimeout(hideShellElements, 0);
                      setTimeout(hideShellElements, 10);
                      setTimeout(hideShellElements, 50);
                    };
                    
                    // Watch for popstate (back/forward navigation)
                    window.addEventListener('popstate', function() {
                      setTimeout(hideShellElements, 0);
                      setTimeout(hideShellElements, 10);
                      setTimeout(hideShellElements, 50);
                    });
                    
                    // Add permanent style tag to <head> for CSS-level hiding
                    if (!document.getElementById('ai-route-hide-shell-critical')) {
                      var style = document.createElement('style');
                      style.id = 'ai-route-hide-shell-critical';
                      style.textContent = '[data-shell-content], [data-shell-content] *, [data-shell-content] *::before, [data-shell-content] *::after { display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; min-height: 0 !important; max-height: 0 !important; overflow: hidden !important; position: absolute !important; width: 0 !important; min-width: 0 !important; max-width: 0 !important; pointer-events: none !important; z-index: -9999 !important; margin: 0 !important; padding: 0 !important; border: none !important; background: transparent !important; color: transparent !important; line-height: 0 !important; font-size: 0 !important; }';
                      (document.head || document.getElementsByTagName('head')[0] || document.documentElement).appendChild(style);
                    }
                    
                    // Periodically check and hide (safety net for edge cases during loading/transitions)
                    setInterval(hideShellElements, 100); // Check every 100ms
                    
                    // Hide on focus (in case user switches tabs/windows)
                    window.addEventListener('focus', hideShellElements);
                  }
                } catch(e) {
                  // Silent fail - don't break page if script fails
                }
              })();
            `,
          }}
        />
        <ErrorBoundary>
          <NotificationInitializer />
          <ConditionalShell isAIRoute={isAI}>{children}</ConditionalShell>
        </ErrorBoundary>
      </body>
    </html>
  );
}
