/**
 * Kundli and Dosha Analysis Cache
 * Aggressively caches Prokerala API responses to eliminate redundant calls
 * Cache key: hash(name_normalized + dob + tob + lat + lon + tz + ayanamsa)
 * 
 * Goal: Make Prokerala/astro math effectively "free" after first run
 * Expected: 2-8s → 0-50ms after warm cache
 */

import { createHash } from "crypto";
import type { BirthDetails, KundliResult, DoshaAnalysis, KundliChart } from "@/types/astrology";

interface CachedKundliData {
  kundli: KundliResult & { chart?: KundliChart };
  dosha?: DoshaAnalysis | null;
  cachedAt: number; // Timestamp for TTL
}

// In-memory cache (in production, consider Redis for multi-instance deployments)
const kundliCache = new Map<string, CachedKundliData>();

// TTL: 24 hours (astrology data doesn't change)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Generate a stable cache key from birth details
 * Same input = same key = cached result
 */
export function generateKundliCacheKey(input: {
  name?: string;
  dob?: string;
  tob?: string;
  place?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  ayanamsa?: number;
}): string {
  const normalizedInput = {
    name: input.name?.toLowerCase().trim() || "",
    dob: input.dob || "",
    tob: input.tob || "",
    place: input.place?.toLowerCase().trim() || "",
    // Round coordinates to 4 decimal places (~11 meters precision)
    latitude: input.latitude !== undefined ? Math.round(input.latitude * 10000) / 10000 : 0,
    longitude: input.longitude !== undefined ? Math.round(input.longitude * 10000) / 10000 : 0,
    timezone: input.timezone || "Asia/Kolkata",
    ayanamsa: input.ayanamsa || 1,
  };

  const hash = createHash("sha256")
    .update(JSON.stringify(normalizedInput))
    .digest("hex")
    .substring(0, 24);

  return `kundli_${hash}`;
}

/**
 * Get cached Kundli data if available and not expired
 */
export function getCachedKundli(
  cacheKey: string
): (KundliResult & { chart?: KundliChart; dosha?: DoshaAnalysis | null }) | null {
  const cached = kundliCache.get(cacheKey);

  if (!cached) {
    return null;
  }

  // Check TTL
  const age = Date.now() - cached.cachedAt;
  if (age > CACHE_TTL_MS) {
    // Expired, remove from cache
    kundliCache.delete(cacheKey);
    return null;
  }

  // Return cached data
  return {
    ...cached.kundli,
    dosha: cached.dosha !== undefined ? cached.dosha : undefined,
  };
}

/**
 * Cache Kundli result
 */
export function cacheKundli(
  cacheKey: string,
  kundli: KundliResult & { chart?: KundliChart },
  dosha?: DoshaAnalysis | null
): void {
  kundliCache.set(cacheKey, {
    kundli,
    dosha,
    cachedAt: Date.now(),
  });

  console.log(`[KundliCache] Cached Kundli data for key: ${cacheKey.substring(0, 20)}...`);
}

/**
 * Get cached Dosha analysis (if available)
 */
export function getCachedDosha(cacheKey: string): DoshaAnalysis | null | undefined {
  const cached = kundliCache.get(cacheKey);
  
  if (!cached) {
    return undefined; // Not in cache
  }

  // Check TTL
  const age = Date.now() - cached.cachedAt;
  if (age > CACHE_TTL_MS) {
    kundliCache.delete(cacheKey);
    return undefined;
  }

  // Return cached dosha (can be null if explicitly cached as "no dosha")
  return cached.dosha;
}

/**
 * Cache Dosha analysis result (can cache null if dosha doesn't exist)
 */
export function cacheDosha(
  cacheKey: string,
  dosha: DoshaAnalysis | null
): void {
  const existing = kundliCache.get(cacheKey);
  
  if (existing) {
    // Update existing cache entry
    existing.dosha = dosha;
    console.log(`[KundliCache] Updated Dosha data for key: ${cacheKey.substring(0, 20)}...`);
  } else {
    // Create new entry (shouldn't happen, but handle gracefully)
    console.warn(`[KundliCache] Attempting to cache Dosha without Kundli data for key: ${cacheKey.substring(0, 20)}...`);
  }
}

/**
 * Clean up expired cache entries
 */
export function cleanupExpiredKundliCache(): void {
  const now = Date.now();
  let cleaned = 0;
  
  kundliCache.forEach((cached, key) => {
    const age = now - cached.cachedAt;
    if (age > CACHE_TTL_MS) {
      kundliCache.delete(key);
      cleaned++;
    }
  });

  if (cleaned > 0) {
    console.log(`[KundliCache] Cleaned up ${cleaned} expired entries`);
  }
}

/**
 * Get cache statistics (for monitoring/debugging)
 */
export function getKundliCacheStats(): {
  totalEntries: number;
  oldestEntry: number | null;
  newestEntry: number | null;
} {
  if (kundliCache.size === 0) {
    return {
      totalEntries: 0,
      oldestEntry: null,
      newestEntry: null,
    };
  }

  let oldest = Date.now();
  let newest = 0;

  kundliCache.forEach((cached) => {
    if (cached.cachedAt < oldest) {
      oldest = cached.cachedAt;
    }
    if (cached.cachedAt > newest) {
      newest = cached.cachedAt;
    }
  });

  return {
    totalEntries: kundliCache.size,
    oldestEntry: oldest,
    newestEntry: newest,
  };
}

// Clean up expired entries every hour
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredKundliCache, 60 * 60 * 1000);
}

