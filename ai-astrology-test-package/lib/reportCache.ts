/**
 * Report Cache
 * Caches generated reports to reduce AI API costs
 */

interface CachedReport {
  key: string;
  content: any;
  createdAt: string;
  expiresAt: string;
  reportType: string;
  cost: number;
}

// In-memory cache (use Redis in production)
const cache = new Map<string, CachedReport>();

// Cache TTL (time to live) in milliseconds
const CACHE_TTL = {
  'life-summary': 7 * 24 * 60 * 60 * 1000, // 7 days
  'marriage-timing': 30 * 24 * 60 * 60 * 1000, // 30 days (doesn't change often)
  'career-money': 30 * 24 * 60 * 60 * 1000, // 30 days
  'full-life': 30 * 24 * 60 * 60 * 1000, // 30 days
  'year-analysis': 24 * 60 * 60 * 1000, // 1 day (year-specific)
  'major-life-phase': 90 * 24 * 60 * 60 * 1000, // 90 days
  'decision-support': 1 * 60 * 60 * 1000, // 1 hour (decision-specific)
};

/**
 * Generate cache key from input
 */
export function generateCacheKey(
  reportType: string,
  input: {
    name: string;
    dob: string;
    tob: string;
    place: string;
    gender?: string;
    targetYear?: number;
  }
): string {
  const keyParts = [
    reportType,
    input.name.toLowerCase().trim(),
    input.dob,
    input.tob,
    input.place.toLowerCase().trim(),
    input.gender || '',
    input.targetYear || '',
  ];
  
  return keyParts.join('|');
}

/**
 * Get cached report
 */
export function getCachedReport(key: string): CachedReport | null {
  const cached = cache.get(key);
  
  if (!cached) {
    return null;
  }
  
  // Check if expired
  if (new Date(cached.expiresAt) < new Date()) {
    cache.delete(key);
    return null;
  }
  
  return cached;
}

/**
 * Set cached report
 */
export function setCachedReport(
  key: string,
  content: any,
  reportType: string,
  cost: number = 0
): void {
  const ttl = CACHE_TTL[reportType as keyof typeof CACHE_TTL] || 24 * 60 * 60 * 1000;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttl);
  
  const cached: CachedReport = {
    key,
    content,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    reportType,
    cost,
  };
  
  cache.set(key, cached);
  
  // Log cache hit (for cost savings tracking)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Report Cache] Cached ${reportType} report: ${key} (saved $${cost.toFixed(4)})`);
  }
}

/**
 * Check if report should be cached
 */
export function shouldCache(reportType: string): boolean {
  // Cache all report types except decision-support (too context-specific)
  return reportType !== 'decision-support' || process.env.ENABLE_DECISION_CACHE === 'true';
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): number {
  const now = new Date();
  let cleared = 0;
  
  for (const [key, cached] of cache.entries()) {
    if (new Date(cached.expiresAt) < now) {
      cache.delete(key);
      cleared++;
    }
  }
  
  return cleared;
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalEntries: number;
  totalSize: number;
  expiredEntries: number;
  savings: number; // Estimated cost savings
} {
  const now = new Date();
  let expiredEntries = 0;
  let totalSavings = 0;
  
  for (const cached of cache.values()) {
    if (new Date(cached.expiresAt) < now) {
      expiredEntries++;
    } else {
      totalSavings += cached.cost;
    }
  }
  
  return {
    totalEntries: cache.size,
    totalSize: JSON.stringify(Array.from(cache.values())).length,
    expiredEntries,
    savings: totalSavings,
  };
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  cache.clear();
}

// Clean up expired entries every hour
if (typeof window === 'undefined') {
  // Server-side only
  setInterval(() => {
    const cleared = clearExpiredCache();
    if (cleared > 0 && process.env.NODE_ENV === 'development') {
      console.log(`[Report Cache] Cleared ${cleared} expired entries`);
    }
  }, 60 * 60 * 1000); // Every hour
}

