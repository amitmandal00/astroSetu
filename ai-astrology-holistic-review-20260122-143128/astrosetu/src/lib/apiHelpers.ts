/**
 * API Helper Functions
 * Common utilities for API routes
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { rateLimiter, getRateLimitConfig } from './rateLimit';

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

/**
 * Check rate limit for a request
 */
export function checkRateLimit(request: Request, pathname: string): NextResponse | null {
  const ip = getClientIP(request);
  const config = getRateLimitConfig(pathname);
  const result = rateLimiter.check(ip, config.limit, config.windowMs);
  
  if (!result.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': config.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
        },
      }
    );
  }
  
  return null;
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): NextResponse {
  // Import PII redaction (dynamic to avoid circular deps)
  const { redactPII } = require('./piiRedaction');
  
  // Zod validation errors
  if (error instanceof ZodError) {
    const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    // Log with PII redaction
    console.error('[API Error] Validation failed:', redactPII(messages));
    
    return NextResponse.json(
      {
        ok: false,
        error: 'Validation failed',
        details: messages,
      },
      { status: 400 }
    );
  }
  
  // Known error with message
  if (error instanceof Error) {
    // Don't expose internal errors in production
    const isProduction = process.env.NODE_ENV === 'production';
    const message = isProduction && error.message.includes('internal')
      ? 'An internal error occurred. Please try again later.'
      : error.message;
    
    // Log with PII redaction
    console.error('[API Error]', redactPII(error.message));
    
    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 400 }
    );
  }
  
  // Unknown error
  console.error('[API Error] Unknown error:', error);
  return NextResponse.json(
    {
      ok: false,
      error: 'An unexpected error occurred',
    },
    { status: 500 }
  );
}

/**
 * Parse JSON request body safely
 */
export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    const text = await request.text();
    if (!text) {
      throw new Error('Request body is empty');
    }
    return JSON.parse(text) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON in request body');
    }
    throw error;
  }
}

/**
 * Validate request size
 */
export function validateRequestSize(contentLength: string | null, maxSize: number = 1024 * 1024): void {
  if (!contentLength) return;
  
  const size = parseInt(contentLength, 10);
  if (isNaN(size) || size > maxSize) {
    throw new Error(`Request body too large. Maximum size is ${maxSize / 1024}KB`);
  }
}

/**
 * Create success response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      ok: true,
      data,
    },
    { status }
  );
}

/**
 * Create error response
 */
export function errorResponse(message: string, status: number = 400): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    { status }
  );
}

