import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AI_ONLY_MODE, isAllowedRoute } from '@/lib/feature-flags';

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60000); // Clean every minute

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // CRITICAL FIX: Allow /build.json, /manifest.json, /sw.js, and /offline.html to pass through (static files from public/)
  // Static files in public/ should be served directly without middleware interference
  // /sw.js must be allowed or service worker registration will fail with redirect errors
  // /offline.html is used by service worker for offline functionality
  if (pathname === '/build.json' || pathname === '/manifest.json' || pathname === '/sw.js' || pathname === '/offline.html') {
    return NextResponse.next();
  }
  
  // CRITICAL FIX (2026-01-18): Allow ALL /api/* routes to pass through BEFORE AI_ONLY_MODE check
  // This ensures API routes always work regardless of AI_ONLY_MODE setting
  // Prevents 307 redirects that cause "Unexpected token '<'" JSON parsing errors
  // API routes must return JSON, not HTML redirects
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // AI-Only Mode: Redirect non-allowed routes to AI section
  if (AI_ONLY_MODE && !isAllowedRoute(pathname)) {
    // Redirect root to AI section
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/ai-astrology', request.url));
    }
    // For all other non-allowed routes, redirect to AI section
    return NextResponse.redirect(new URL('/ai-astrology', request.url));
  }
  
  const response = NextResponse.next();

  // Pass pathname to layout for server-side route detection
  response.headers.set('x-pathname', pathname);

  // Security Headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.razorpay.com https://*.supabase.co",
    "frame-src 'self' https://checkout.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ].join('; ');
  response.headers.set('Content-Security-Policy', csp);

  // Rate Limiting for API routes
  if (pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    // Different limits for different endpoint types
    let limit = 100; // Default: 100 requests per window
    let windowMs = 60000; // 1 minute window

    // Auth endpoints: stricter limit
    if (pathname.startsWith('/api/auth/')) {
      limit = 10; // 10 requests per minute
      windowMs = 60000;
    }
    
    // Payment endpoints: very strict
    if (pathname.startsWith('/api/payments/')) {
      limit = 20; // 20 requests per minute
      windowMs = 60000;
    }
    
    // Prediction endpoints: moderate limit
    if (pathname.startsWith('/api/astrology/') || pathname.startsWith('/api/reports/')) {
      limit = 30; // 30 requests per minute
      windowMs = 60000;
    }

    if (!rateLimit(ip, limit, windowMs)) {
      return NextResponse.json(
        { ok: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // Add rate limit headers
    const record = rateLimitMap.get(ip);
    if (record) {
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', Math.max(0, limit - record.count).toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000).toString());
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

