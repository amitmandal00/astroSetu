/**
 * Token Caching Utility for Input Session Tokens
 * 
 * Prevents duplicate token creation requests and caches tokens in sessionStorage
 * Implements in-flight lock to prevent race conditions
 */

const TOKEN_CACHE_KEY = "aiAstrologyInputToken";
const TOKEN_EXPIRY_KEY = "aiAstrologyInputTokenExpiry";
const MIN_TOKEN_LIFETIME_REMAINING = 5 * 60 * 1000; // 5 minutes in milliseconds

interface TokenCacheEntry {
  token: string;
  expiresAt: number; // Unix timestamp in milliseconds
  input: any; // Cached input data
  reportType?: string;
  bundleType?: string;
  bundleReports?: string[];
}

// In-flight request lock - prevents duplicate token creation
let inFlightTokenRequest: Promise<string | null> | null = null;
let inFlightTokenInput: any = null;

/**
 * Check if a cached token is still valid
 */
function isTokenValid(cached: TokenCacheEntry | null): boolean {
  if (!cached) return false;
  const now = Date.now();
  const timeRemaining = cached.expiresAt - now;
  return timeRemaining > MIN_TOKEN_LIFETIME_REMAINING;
}

/**
 * Get cached token from sessionStorage
 */
function getCachedToken(): TokenCacheEntry | null {
  if (typeof window === "undefined") return null;
  
  try {
    const cachedToken = sessionStorage.getItem(TOKEN_CACHE_KEY);
    const cachedExpiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (!cachedToken || !cachedExpiry) return null;
    
    const expiresAt = parseInt(cachedExpiry, 10);
    const cached: TokenCacheEntry = {
      token: cachedToken,
      expiresAt,
      input: JSON.parse(sessionStorage.getItem("aiAstrologyInput") || "{}"),
      reportType: sessionStorage.getItem("aiAstrologyReportType") || undefined,
      bundleType: sessionStorage.getItem("aiAstrologyBundle") || undefined,
      bundleReports: (() => {
        const bundleReportsStr = sessionStorage.getItem("aiAstrologyBundleReports");
        return bundleReportsStr ? JSON.parse(bundleReportsStr) : undefined;
      })(),
    };
    
    return isTokenValid(cached) ? cached : null;
  } catch (e) {
    console.warn("[TokenCache] Failed to read cached token:", e);
    return null;
  }
}

/**
 * Cache token in sessionStorage
 */
function cacheToken(
  token: string,
  expiresIn: number, // seconds
  input: any,
  reportType?: string,
  bundleType?: string,
  bundleReports?: string[]
): void {
  if (typeof window === "undefined") return;
  
  try {
    const expiresAt = Date.now() + (expiresIn * 1000);
    sessionStorage.setItem(TOKEN_CACHE_KEY, token);
    sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
    
    // Also cache input data (already cached separately, but ensure consistency)
    sessionStorage.setItem("aiAstrologyInput", JSON.stringify(input));
    if (reportType) {
      sessionStorage.setItem("aiAstrologyReportType", reportType);
    }
    if (bundleType) {
      sessionStorage.setItem("aiAstrologyBundle", bundleType);
    }
    if (bundleReports) {
      sessionStorage.setItem("aiAstrologyBundleReports", JSON.stringify(bundleReports));
    }
  } catch (e) {
    console.warn("[TokenCache] Failed to cache token:", e);
  }
}

/**
 * Clear cached token
 */
export function clearCachedToken(): void {
  if (typeof window === "undefined") return;
  
  try {
    sessionStorage.removeItem(TOKEN_CACHE_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch (e) {
    console.warn("[TokenCache] Failed to clear cached token:", e);
  }
}

/**
 * Create or reuse input session token
 * 
 * Implements:
 * 1. Token caching - reuses valid cached token
 * 2. In-flight lock - prevents duplicate requests
 * 3. One token per tab/session
 * 
 * @param input - Birth details input
 * @param reportType - Report type (optional)
 * @param bundleType - Bundle type (optional)
 * @param bundleReports - Bundle reports (optional)
 * @returns Promise resolving to token string or null if creation failed
 */
export async function createOrReuseToken(
  input: any,
  reportType?: string,
  bundleType?: string,
  bundleReports?: string[]
): Promise<string | null> {
  // Check cache first
  const cached = getCachedToken();
  if (cached) {
    // Verify input matches cached input (same user/session)
    const inputMatches = JSON.stringify(cached.input) === JSON.stringify(input);
    if (inputMatches) {
      console.log("[TokenCache] Reusing cached token", {
        tokenSuffix: cached.token.slice(-6),
        expiresIn: Math.round((cached.expiresAt - Date.now()) / 1000),
      });
      return cached.token;
    } else {
      // Input changed - clear cache and create new token
      console.log("[TokenCache] Input changed, clearing cache and creating new token");
      clearCachedToken();
    }
  }
  
  // Check if same request is in-flight
  const inputKey = JSON.stringify({ input, reportType, bundleType, bundleReports });
  if (inFlightTokenRequest && inFlightTokenInput === inputKey) {
    console.log("[TokenCache] Reusing in-flight token request");
    return inFlightTokenRequest;
  }
  
  // Create new token request
  const { apiPost } = await import("@/lib/http");
  
  // Create the promise - use a wrapper to avoid TypeScript control flow issues
  const createTokenPromise = (): Promise<string | null> => {
    return (async (): Promise<string | null> => {
      try {
        const tokenResponse = await apiPost<{
          ok: boolean;
          data?: { token: string; expiresIn?: number };
          error?: string;
        }>("/api/ai-astrology/input-session", {
          input,
          reportType,
          bundleType,
          bundleReports: bundleReports && bundleReports.length > 0 ? bundleReports : undefined,
        });
        
        if (tokenResponse.ok && tokenResponse.data?.token) {
          const token = tokenResponse.data.token;
          const expiresIn = tokenResponse.data.expiresIn || 1800; // Default 30 minutes
          
          // Cache the token
          cacheToken(token, expiresIn, input, reportType, bundleType, bundleReports);
          
          console.log("[TokenCache] Created and cached new token", {
            tokenSuffix: token.slice(-6),
            expiresIn,
          });
          
          return token;
        } else {
          console.warn("[TokenCache] Failed to create token:", tokenResponse.error);
          return null;
        }
      } catch (error: any) {
        console.error("[TokenCache] Token creation error:", error);
        return null;
      } finally {
        // Clear in-flight lock - reference is set below before promise executes
        if (inFlightTokenRequest === tokenPromise) {
          inFlightTokenRequest = null;
          inFlightTokenInput = null;
        }
      }
    })();
  };
  
  const tokenPromise = createTokenPromise();
  
  // Set in-flight lock
  inFlightTokenRequest = tokenPromise;
  inFlightTokenInput = inputKey;
  
  return tokenPromise;
}

/**
 * Get cached token without creating new one
 * Returns null if no valid cached token exists
 */
export function getCachedTokenOnly(): string | null {
  const cached = getCachedToken();
  return cached ? cached.token : null;
}

