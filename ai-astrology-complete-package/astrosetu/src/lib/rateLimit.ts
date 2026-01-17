/**
 * Rate Limiting Utility
 * For production, use Redis or a dedicated rate limiting service
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up old entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }

  check(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      // Create new record
      const newRecord: RateLimitRecord = {
        count: 1,
        resetTime: now + windowMs,
      };
      this.store.set(key, newRecord);
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: newRecord.resetTime,
      };
    }

    if (record.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    record.count++;
    return {
      allowed: true,
      remaining: limit - record.count,
      resetTime: record.resetTime,
    };
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Get rate limit configuration for an endpoint
 */
export function getRateLimitConfig(pathname: string): { limit: number; windowMs: number } {
  // Auth endpoints: strict
  if (pathname.startsWith('/api/auth/')) {
    return { limit: 10, windowMs: 60000 }; // 10 per minute
  }

  // Payment endpoints: strict
  if (pathname.startsWith('/api/payments/')) {
    return { limit: 20, windowMs: 60000 }; // 20 per minute
  }

  // AI Astrology endpoints: moderate
  if (pathname.startsWith('/api/ai-astrology/')) {
    // Input session endpoints: strict (PII protection)
    if (pathname.includes('/input-session')) {
      return { limit: 10, windowMs: 60000 }; // 10 per minute per IP/token
    }
    return { limit: 30, windowMs: 60000 }; // 30 per minute
  }

  // Prediction endpoints: moderate
  if (pathname.startsWith('/api/astrology/') || pathname.startsWith('/api/reports/')) {
    return { limit: 30, windowMs: 60000 }; // 30 per minute
  }

  // Chat endpoints: moderate
  if (pathname.startsWith('/api/chat/')) {
    return { limit: 60, windowMs: 60000 }; // 60 per minute
  }

  // Default: lenient
  return { limit: 100, windowMs: 60000 }; // 100 per minute
}

