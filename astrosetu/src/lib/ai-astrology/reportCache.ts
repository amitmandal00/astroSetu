/**
 * In-memory cache for generated reports to prevent duplicate OpenAI API calls
 * Uses idempotency keys based on user input + reportType + sessionId
 */

import type { AIAstrologyInput, ReportType } from "./types";
import type { ReportContent } from "./types";
import { createHash } from "crypto";

interface CachedReport {
  reportId: string;
  content: ReportContent;
  reportType: ReportType;
  input: AIAstrologyInput;
  generatedAt: string;
  status: "completed" | "processing";
  createdAt: number; // Timestamp for TTL
}

// In-memory cache (in production, consider Redis or database)
const reportCache = new Map<string, CachedReport>();

// TTL: 24 hours (reports are valid for 24 hours)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Generate an idempotency key from user input + reportType + sessionId
 * Same input + reportType + sessionId = same key = same report
 */
export function generateIdempotencyKey(
  input: AIAstrologyInput,
  reportType: ReportType,
  sessionId?: string
): string {
  // Create a stable hash from user input
  const inputHash = createHash("sha256")
    .update(
      JSON.stringify({
        name: input.name?.toLowerCase().trim(),
        dob: input.dob,
        tob: input.tob,
        place: input.place?.toLowerCase().trim(),
        latitude: input.latitude,
        longitude: input.longitude,
        gender: input.gender,
      })
    )
    .digest("hex")
    .substring(0, 16);

  // Include sessionId if available (for paid reports)
  const sessionPart = sessionId ? `_${sessionId.substring(0, 20)}` : "";
  
  // Include reportType
  return `${reportType}_${inputHash}${sessionPart}`;
}

/**
 * Check if a report is already cached (completed or processing)
 * Returns the cached report if found, null otherwise
 */
export function getCachedReport(
  idempotencyKey: string
): CachedReport | null {
  const cached = reportCache.get(idempotencyKey);
  
  if (!cached) {
    return null;
  }

  // Check TTL
  const age = Date.now() - cached.createdAt;
  if (age > CACHE_TTL_MS) {
    // Expired, remove from cache
    reportCache.delete(idempotencyKey);
    return null;
  }

  return cached;
}

/**
 * Store a completed report in cache
 */
export function cacheReport(
  idempotencyKey: string,
  reportId: string,
  content: ReportContent,
  reportType: ReportType,
  input: AIAstrologyInput
): void {
  reportCache.set(idempotencyKey, {
    reportId,
    content,
    reportType,
    input,
    generatedAt: new Date().toISOString(),
    status: "completed",
    createdAt: Date.now(),
  });
}

/**
 * Mark a report as processing (to prevent duplicate concurrent requests)
 */
export function markReportProcessing(
  idempotencyKey: string,
  reportId: string
): boolean {
  // Check if already processing or completed
  const existing = reportCache.get(idempotencyKey);
  if (existing && (existing.status === "processing" || existing.status === "completed")) {
    return false; // Already processing/completed
  }

  // Mark as processing
  reportCache.set(idempotencyKey, {
    reportId,
    content: {} as ReportContent, // Placeholder
    reportType: "life-summary" as ReportType, // Placeholder
    input: {} as AIAstrologyInput, // Placeholder
    generatedAt: new Date().toISOString(),
    status: "processing",
    createdAt: Date.now(),
  });

  return true; // Successfully marked as processing
}

/**
 * Clean up expired cache entries (call periodically)
 */
export function cleanupExpiredCache(): void {
  const now = Date.now();
  reportCache.forEach((cached, key) => {
    const age = now - cached.createdAt;
    if (age > CACHE_TTL_MS) {
      reportCache.delete(key);
    }
  });
}

// Clean up expired entries every hour
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredCache, 60 * 60 * 1000);
}

