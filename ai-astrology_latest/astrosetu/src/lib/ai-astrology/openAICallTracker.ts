/**
 * OpenAI Call Tracker
 * Tracks OpenAI API calls per user session to prevent duplicate calls and monitor usage
 */

interface OpenAICallRecord {
  sessionId: string;
  reportType: string;
  timestamp: number;
  tokensUsed?: number;
  success: boolean;
  retryCount: number;
  duration: number; // milliseconds
}

// In-memory tracking (in production, consider Redis or database)
const callTracker = new Map<string, OpenAICallRecord[]>();

// Session TTL: 24 hours
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Generate a session key from user input (for tracking calls per user session)
 */
export function generateSessionKey(input: {
  name?: string;
  dob?: string;
  place?: string;
}): string {
  if (!input.name || !input.dob) {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
  
  // Create a stable session key from user identity
  const { createHash } = require("crypto");
  return createHash("sha256")
    .update(JSON.stringify({
      name: input.name?.toLowerCase().trim(),
      dob: input.dob,
      place: input.place?.toLowerCase().trim(),
    }))
    .digest("hex")
    .substring(0, 16);
}

/**
 * Track an OpenAI API call
 */
export function trackOpenAICall(
  sessionKey: string,
  reportType: string,
  success: boolean,
  retryCount: number = 0,
  duration: number = 0,
  tokensUsed?: number
): void {
  const calls = callTracker.get(sessionKey) || [];
  
  calls.push({
    sessionId: sessionKey,
    reportType,
    timestamp: Date.now(),
    tokensUsed,
    success,
    retryCount,
    duration,
  });
  
  // Keep only last 100 calls per session to prevent memory issues
  if (calls.length > 100) {
    calls.shift();
  }
  
  callTracker.set(sessionKey, calls);
  
  // Log for monitoring
  console.log(`[OpenAI Call Tracker] Session: ${sessionKey.substring(0, 8)}... | Report: ${reportType} | Success: ${success} | Retries: ${retryCount} | Duration: ${duration}ms`);
}

/**
 * Get call statistics for a session
 */
export function getSessionCallStats(sessionKey: string): {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalRetries: number;
  reportsGenerated: Set<string>;
  totalDuration: number;
  averageDuration: number;
} {
  const calls = callTracker.get(sessionKey) || [];
  
  // Filter out expired calls (older than 24 hours)
  const now = Date.now();
  const recentCalls = calls.filter(call => now - call.timestamp < SESSION_TTL_MS);
  
  const successfulCalls = recentCalls.filter(c => c.success).length;
  const failedCalls = recentCalls.filter(c => !c.success).length;
  const totalRetries = recentCalls.reduce((sum, c) => sum + c.retryCount, 0);
  const reportsGenerated = new Set(recentCalls.filter(c => c.success).map(c => c.reportType));
  const totalDuration = recentCalls.reduce((sum, c) => sum + c.duration, 0);
  const averageDuration = recentCalls.length > 0 ? totalDuration / recentCalls.length : 0;
  
  return {
    totalCalls: recentCalls.length,
    successfulCalls,
    failedCalls,
    totalRetries,
    reportsGenerated,
    totalDuration,
    averageDuration,
  };
}

/**
 * Check if a report type has already been generated for this session
 * (to prevent duplicate calls for the same report in the same session)
 */
export function hasReportBeenGenerated(sessionKey: string, reportType: string): boolean {
  const calls = callTracker.get(sessionKey) || [];
  const now = Date.now();
  
  // Check if there's a successful call for this report type in the last 24 hours
  return calls.some(call => 
    call.reportType === reportType &&
    call.success &&
    (now - call.timestamp) < SESSION_TTL_MS
  );
}

/**
 * Get all calls for a session (for debugging/monitoring)
 */
export function getSessionCalls(sessionKey: string): OpenAICallRecord[] {
  const calls = callTracker.get(sessionKey) || [];
  const now = Date.now();
  
  // Return only recent calls (within TTL)
  return calls.filter(call => now - call.timestamp < SESSION_TTL_MS);
}

/**
 * Clean up expired sessions
 */
export function cleanupExpiredSessions(): void {
  const now = Date.now();
  callTracker.forEach((calls, sessionKey) => {
    const recentCalls = calls.filter(call => now - call.timestamp < SESSION_TTL_MS);
    if (recentCalls.length === 0) {
      callTracker.delete(sessionKey);
    } else {
      callTracker.set(sessionKey, recentCalls);
    }
  });
}

// Clean up expired sessions every hour
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
}

