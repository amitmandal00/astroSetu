/**
 * Feature Flags Configuration
 * Control what features/routes are available in production
 */

// AI-Only Mode: When enabled, only /ai-astrology routes are accessible
// Set NEXT_PUBLIC_AI_ONLY_MODE=true in .env.local to enable
export const AI_ONLY_MODE = process.env.NEXT_PUBLIC_AI_ONLY_MODE === 'true';

// Web Push Notifications: When disabled, push service will not initialize
// Set NEXT_PUBLIC_ENABLE_PUSH=true to enable push notifications
// Default: false (disabled for stability)
export const ENABLE_PUSH = process.env.NEXT_PUBLIC_ENABLE_PUSH === 'true';

// Allowed routes when AI-only mode is enabled
export const ALLOWED_AI_ROUTES = [
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
  '/accessibility',
  '/api/ai-astrology',
  '/api/contact',
  '/api/health',
];

// Check if a path is allowed in AI-only mode
export function isAllowedRoute(pathname: string): boolean {
  if (!AI_ONLY_MODE) return true; // All routes allowed when AI-only mode is off
  
  // Allow root path (will redirect to /ai-astrology)
  if (pathname === '/') return true;
  
  // CRITICAL FIX (2026-01-18): Allow ALL API routes when AI-only mode is enabled
  // API routes should be accessible for functionality (billing, notifications, etc.)
  // UI routes are restricted, but API routes must work for the app to function
  if (pathname.startsWith('/api/')) {
    return true;
  }
  
  // Allow static assets and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/i)
  ) {
    return true;
  }
  
  // Check if path matches any allowed route
  return ALLOWED_AI_ROUTES.some(route => pathname.startsWith(route));
}

