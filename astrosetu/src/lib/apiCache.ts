/**
 * API Response Cache Layer
 * Reduces redundant API calls by caching responses
 * Inspired by AstroSage/AstroTalk optimization patterns
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  expiresAt: number;
};

type CacheKey = string;

// In-memory cache (can be upgraded to Redis in production)
const responseCache = new Map<CacheKey, CacheEntry<any>>();

// Default cache TTLs (in milliseconds)
const CACHE_TTL = {
  kundli: 24 * 60 * 60 * 1000, // 24 hours - birth charts don't change
  match: 24 * 60 * 60 * 1000, // 24 hours
  dosha: 24 * 60 * 60 * 1000, // 24 hours
  horoscope: 60 * 60 * 1000, // 1 hour - updates daily
  panchang: 12 * 60 * 60 * 1000, // 12 hours - updates throughout day
  muhurat: 24 * 60 * 60 * 1000, // 24 hours
  numerology: 365 * 24 * 60 * 60 * 1000, // 1 year - never changes
  dasha: 7 * 24 * 60 * 60 * 1000, // 7 days - changes slowly
} as const;

/**
 * Generate cache key from endpoint and parameters
 */
export function generateCacheKey(endpoint: string, params: Record<string, any>): CacheKey {
  // Normalize params to ensure consistent keys
  const normalized: Record<string, any> = {};
  
  // Sort keys for consistency
  const sortedKeys = Object.keys(params).sort();
  
  for (const key of sortedKeys) {
    const value = params[key];
    if (value === undefined || value === null) continue;
    
    // Handle datetime objects
    if (key === 'datetime' && typeof value === 'object') {
      normalized[key] = JSON.stringify({
        year: value.year,
        month: value.month,
        day: value.day,
        hour: value.hour || 0,
        minute: value.minute || 0,
        second: value.second || 0,
      });
    } else if (typeof value === 'object') {
      normalized[key] = JSON.stringify(value);
    } else {
      normalized[key] = String(value);
    }
  }
  
  return `${endpoint}:${JSON.stringify(normalized)}`;
}

/**
 * Get cache TTL for endpoint
 */
function getCacheTTL(endpoint: string): number {
  if (endpoint.includes('/kundli')) return CACHE_TTL.kundli;
  if (endpoint.includes('/match')) return CACHE_TTL.match;
  if (endpoint.includes('/dosha')) return CACHE_TTL.dosha;
  if (endpoint.includes('/horoscope')) return CACHE_TTL.horoscope;
  if (endpoint.includes('/panchang')) return CACHE_TTL.panchang;
  if (endpoint.includes('/muhurat')) return CACHE_TTL.muhurat;
  if (endpoint.includes('/numerology')) return CACHE_TTL.numerology;
  if (endpoint.includes('/dasha')) return CACHE_TTL.dasha;
  
  return 60 * 60 * 1000; // Default: 1 hour
}

/**
 * Get cached response if available and valid
 */
export function getCached<T>(key: CacheKey): T | null {
  const entry = responseCache.get(key);
  
  if (!entry) return null;
  
  // Check if expired
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

/**
 * Set cache entry
 */
export function setCached<T>(key: CacheKey, data: T, ttl?: number): void {
  const timestamp = Date.now();
  const cacheTTL = ttl || getCacheTTL(key.split(':')[0]);
  
  responseCache.set(key, {
    data,
    timestamp,
    expiresAt: timestamp + cacheTTL,
  });
}

/**
 * Invalidate cache entries matching pattern
 */
export function invalidateCache(pattern: string): void {
  const keysToDelete: CacheKey[] = [];
  
  for (const key of responseCache.keys()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  }
  
  for (const key of keysToDelete) {
    responseCache.delete(key);
  }
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  responseCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;
  
  for (const entry of responseCache.values()) {
    if (now > entry.expiresAt) {
      expiredEntries++;
    } else {
      validEntries++;
    }
  }
  
  return {
    total: responseCache.size,
    valid: validEntries,
    expired: expiredEntries,
  };
}

/**
 * Clean expired entries (run periodically)
 */
export function cleanExpiredCache(): number {
  const now = Date.now();
  const keysToDelete: CacheKey[] = [];
  
  for (const [key, entry] of responseCache.entries()) {
    if (now > entry.expiresAt) {
      keysToDelete.push(key);
    }
  }
  
  for (const key of keysToDelete) {
    responseCache.delete(key);
  }
  
  return keysToDelete.length;
}

// Clean expired entries every 10 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    const cleaned = cleanExpiredCache();
    if (cleaned > 0) {
      console.log(`[API Cache] Cleaned ${cleaned} expired entries`);
    }
  }, 10 * 60 * 1000);
}

