/**
 * Astrology API Abstraction Layer
 * Uses Prokerala API for real astrology calculations
 * Falls back to mock data if API key not configured
 * Enhanced with caching, batching, and optimization
 */

import type { BirthDetails, KundliResult, MatchResult, HoroscopeDaily, HoroscopeWeekly, HoroscopeMonthly, HoroscopeYearly, Panchang, Muhurat, Numerology, Remedy, DoshaAnalysis, KundliChart, Choghadiya } from "@/types/astrology";
import { generateKundli, matchKundli, dailyHoroscope, weeklyHoroscope, monthlyHoroscope, yearlyHoroscope, generatePanchang, findMuhurat, calculateNumerology, getRemedies, generateDoshaAnalysis, generateKundliChart } from "./astrologyEngine";
import { transformKundliResponse, transformMatchResponse, transformPanchangResponse, transformDoshaResponse, transformChoghadiyaResponse, transformPanchangToChoghadiya } from "./prokeralaTransform";
import { generateChartFromProkerala } from "./enhancedChartTransform";
import { generateCacheKey, getCached, setCached, invalidateCache } from "./apiCache";
import { deduplicateRequest } from "./apiBatch";

const PROKERALA_API_URL = "https://api.prokerala.com/v2/astrology";
const API_KEY = process.env.PROKERALA_API_KEY || "";
const CLIENT_ID = process.env.PROKERALA_CLIENT_ID || "";
const CLIENT_SECRET = process.env.PROKERALA_CLIENT_SECRET || "";

// Check if API is configured
export const isAPIConfigured = () => {
  // Check for API key (access token or client_id:client_secret)
  if (API_KEY) return true;
  // Check for separate client credentials
  if (CLIENT_ID && CLIENT_SECRET) return true;
  return false;
};

// Get API credentials
function getAPICredentials() {
  if (API_KEY) {
    // Check if it's client_id:client_secret format
    if (API_KEY.includes(":")) {
      const [id, secret] = API_KEY.split(":");
      return { clientId: id, clientSecret: secret };
    }
    // Otherwise assume it's an access token
    return { accessToken: API_KEY };
  }
  if (CLIENT_ID && CLIENT_SECRET) {
    return { clientId: CLIENT_ID, clientSecret: CLIENT_SECRET };
  }
  return null;
}

/**
 * Helper to make Prokerala API calls
 * Prokerala uses OAuth2 - Client ID and Client Secret
 */
// Cache for access token
let accessTokenCache: { token: string; expiresAt: number } | null = null;

export async function prokeralaRequest(endpoint: string, params: Record<string, any>, retries: number = 2, method: "GET" | "POST" = "POST", skipCache: boolean = false): Promise<any> {
  const credentials = getAPICredentials();
  if (!credentials) {
    throw new Error("Prokerala API credentials not configured. Set PROKERALA_API_KEY or PROKERALA_CLIENT_ID and PROKERALA_CLIENT_SECRET");
  }

  // Check cache for GET requests (only cacheable requests)
  if (!skipCache && method === "GET") {
    const cacheKey = generateCacheKey(endpoint, params);
    const cached = getCached(cacheKey);
    if (cached) {
      console.log(`[AstroSetu] Cache HIT for ${endpoint}`);
      return cached;
    }
    console.log(`[AstroSetu] Cache MISS for ${endpoint}`);
  }

  // Deduplicate identical requests
  const requestKey = `${method}:${endpoint}:${JSON.stringify(params)}`;
  
  return deduplicateRequest(requestKey, async () => {
    return await executeProkeralaRequest(endpoint, params, retries, method, skipCache);
  });
}

async function executeProkeralaRequest(endpoint: string, params: Record<string, any>, retries: number = 2, method: "GET" | "POST" = "POST", skipCache: boolean = false): Promise<any> {

  // CRITICAL: ABSOLUTE ENFORCEMENT - Panchang, Kundli, Dosha, Horoscope, and Muhurat endpoints MUST use GET, no exceptions
  // This overrides ANY method parameter passed, including defaults
  const isPanchangEndpoint = endpoint === "/panchang" || endpoint.includes("/panchang");
  const isKundliEndpoint = endpoint === "/kundli" || endpoint.includes("/kundli");
  const isDoshaEndpoint = endpoint === "/dosha" || endpoint.includes("/dosha");
  const isHoroscopeEndpoint = endpoint.includes("/horoscope");
  const isMuhuratEndpoint = endpoint === "/muhurat" || endpoint.includes("/muhurat");
  const isChoghadiyaEndpoint = endpoint === "/choghadiya" || endpoint.includes("/choghadiya");
  const mustUseGet = isPanchangEndpoint || isKundliEndpoint || isDoshaEndpoint || isHoroscopeEndpoint || isMuhuratEndpoint || isChoghadiyaEndpoint;
  const actualMethod: "GET" | "POST" = mustUseGet ? "GET" : method;
  
  if (mustUseGet && method !== "GET") {
    const endpointName = isPanchangEndpoint ? "Panchang" : isKundliEndpoint ? "Kundli" : isDoshaEndpoint ? "Dosha" : isHoroscopeEndpoint ? "Horoscope" : isMuhuratEndpoint ? "Muhurat" : isChoghadiyaEndpoint ? "Choghadiya" : "Unknown";
    console.error("[AstroSetu] CRITICAL: " + endpointName + " endpoint received method=" + method + ", ENFORCING GET");
  }
  
  // Use actualMethod throughout the function, never the original method parameter
  // actualMethod is guaranteed to be "GET" for panchang and kundli endpoints

  // Build URL with query params for GET requests
  let url = `${PROKERALA_API_URL}${endpoint}`;
  console.log("[AstroSetu] prokeralaRequest: endpoint=" + endpoint + ", originalMethod=" + method + ", enforcedMethod=" + actualMethod + ", mustUseGet=" + mustUseGet);
  
  if (actualMethod === "GET" && params) {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        // Special handling for datetime: ProKerala expects ISO 8601 string for GET requests
        if (key === "datetime" && typeof value === "object" && !Array.isArray(value)) {
          const dt = value as { year: number; month: number; day: number; hour?: number; minute?: number; second?: number };
          // Get timezone from params or default to Asia/Kolkata
          const timezone = params.timezone || "Asia/Kolkata";
          
          // Build ISO 8601 string: YYYY-MM-DDTHH:MM:SS+05:30
          const year = dt.year;
          const month = String(dt.month).padStart(2, "0");
          const day = String(dt.day).padStart(2, "0");
          
          // Check if time components are provided (for kundli) or just date (for panchang)
          const hasTime = dt.hour !== undefined || dt.minute !== undefined || dt.second !== undefined;
          
          let isoString: string;
          if (hasTime) {
            // Full datetime with time: YYYY-MM-DDTHH:MM:SS+05:30
            const hour = String(dt.hour || 0).padStart(2, "0");
            const minute = String(dt.minute || 0).padStart(2, "0");
            const second = String(dt.second || 0).padStart(2, "0");
            
            // For timezone offset, use IST (+05:30) for Asia/Kolkata
            // ProKerala also accepts timezone param separately, so this is mainly for format compliance
            let timezoneOffset = "+05:30"; // Default to IST
            if (timezone === "Asia/Kolkata" || timezone.includes("India")) {
              timezoneOffset = "+05:30";
            } else {
              // For other timezones, use +00:00 (timezone handled by separate param)
              timezoneOffset = "+00:00";
            }
            
            isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}${timezoneOffset}`;
          } else {
            // Date only: YYYY-MM-DD (for panchang)
            isoString = `${year}-${month}-${day}`;
          }
          
          // URLSearchParams automatically encodes, but ensure + is properly encoded as %2B
          queryParams.append(key, isoString);
          console.log("[AstroSetu] Converted datetime object to ISO 8601:", isoString, "Query param:", queryParams.get(key), hasTime ? "(with time)" : "(date only)");
        } else if (typeof value === "object" && !Array.isArray(value)) {
          // Handle other nested objects (not datetime)
          for (const [nestedKey, nestedValue] of Object.entries(value)) {
            queryParams.append(`${key}[${nestedKey}]`, String(nestedValue));
          }
        } else {
          queryParams.append(key, String(value));
        }
      }
    }
    url += `?${queryParams.toString()}`;
  }
  
  let headers: Record<string, string> = {};
  
  // Only set Content-Type for POST requests
  if (actualMethod === "POST") {
    headers["Content-Type"] = "application/json";
  }
  
  // Get access token
  const credentials = getAPICredentials();
  if (!credentials) {
    throw new Error("Prokerala API credentials not configured. Set PROKERALA_API_KEY or PROKERALA_CLIENT_ID and PROKERALA_CLIENT_SECRET");
  }
  
  let accessToken: string;
  
  if (credentials.accessToken) {
    // Direct access token provided
    accessToken = credentials.accessToken;
  } else if (credentials.clientId && credentials.clientSecret) {
    // Check if we have a cached valid token
    if (accessTokenCache && accessTokenCache.expiresAt > Date.now()) {
      accessToken = accessTokenCache.token;
    } else {
      // Get new access token
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        // ProKerala token endpoint uses form-encoded body (not Basic Auth)
        // Trim credentials to remove any accidental spaces
        const clientId = (credentials.clientId || '').trim();
        const clientSecret = (credentials.clientSecret || '').trim();
        
        // Log credential status (without exposing secrets)
        const clientIdLength = clientId.length;
        const clientSecretLength = clientSecret.length;
        const hasSpaces = (credentials.clientId?.includes(' ') || credentials.clientSecret?.includes(' ')) || false;
        const hasQuotes = ((credentials.clientId?.startsWith('"') && credentials.clientId?.endsWith('"')) || 
                          (credentials.clientSecret?.startsWith('"') && credentials.clientSecret?.endsWith('"'))) || false;
        
        console.log(`[AstroSetu] Attempting ProKerala authentication - Client ID length: ${clientIdLength}, Client Secret length: ${clientSecretLength}, hasSpaces: ${hasSpaces}, hasQuotes: ${hasQuotes}`);
        
        if (hasSpaces || hasQuotes) {
          console.warn(`[AstroSetu] WARNING: Credentials may have spaces or quotes. This can cause authentication to fail. Remove spaces/quotes from Vercel environment variables.`);
        }
        
        if (!clientId || !clientSecret) {
          throw new Error(`Prokerala credentials are empty. Client ID length: ${clientIdLength}, Secret length: ${clientSecretLength}`);
        }
        
        // ProKerala API documentation specifies form-encoded body for token endpoint
        // POST /token with body: grant_type=client_credentials&client_id=<CLIENT_ID>&client_secret=<CLIENT_SECRET>
        // Reference: https://api.prokerala.com/account/dashboard
        console.log("[AstroSetu] Requesting ProKerala access token using form-encoded body (per API docs)");
        
        const tokenResponse = await fetch("https://api.prokerala.com/token", {
          method: "POST",
          headers: { 
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        console.log(`[AstroSetu] Token request completed - Status: ${tokenResponse.status}`);
        
        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          let errorMessage = `Failed to get Prokerala access token: ${errorText}`;
          
          // Add helpful diagnostic info for authentication errors
          if (tokenResponse.status === 401 || errorText.includes('authentication failed')) {
            const diagnosticInfo = `[AUTH_DEBUG: status=${tokenResponse.status}, clientIdLength=${clientIdLength}, clientSecretLength=${clientSecretLength}, clientIdHasSpaces=${credentials.clientId?.includes(' ') || false}, clientSecretHasSpaces=${credentials.clientSecret?.includes(' ') || false}]`;
            errorMessage = diagnosticInfo + " | " + errorMessage;
            console.error("[AstroSetu] Authentication failed - check credentials in Vercel environment variables");
            console.error("[AstroSetu] Verify: 1) No extra spaces, 2) No quotes, 3) Exact match with ProKerala dashboard");
          }
          
          throw new Error(errorMessage);
        }
        
        const tokenData = await tokenResponse.json();
        accessToken = tokenData.access_token;
        
        // Cache token (expires in 1 hour, cache for 55 minutes)
        const expiresIn = (tokenData.expires_in || 3600) * 1000;
        accessTokenCache = {
          token: accessToken,
          expiresAt: Date.now() + expiresIn - 5 * 60 * 1000, // 5 minutes buffer
        };
      } catch (error: any) {
        throw new Error(`Prokerala authentication failed: ${error?.message || error}`);
      }
    }
  } else {
    throw new Error("Invalid Prokerala API credentials");
  }
  
  headers["Authorization"] = `Bearer ${accessToken}`;

  // Retry logic with exponential backoff
  let lastError: Error | null = null;
  let result: any = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      // FINAL ENFORCEMENT: Use actualMethod (already enforced at function start)
      // This is the method that will be used - guaranteed GET for panchang, kundli, dosha, horoscope, and muhurat
      const fetchMethod: "GET" | "POST" = actualMethod;
      
      // TRIPLE CHECK: Panchang, Kundli, Dosha, Horoscope, Muhurat, and Choghadiya MUST be GET - throw error if not
      if (mustUseGet && fetchMethod !== "GET") {
        const endpointName = isPanchangEndpoint ? "Panchang" : isKundliEndpoint ? "Kundli" : isDoshaEndpoint ? "Dosha" : isHoroscopeEndpoint ? "Horoscope" : isMuhuratEndpoint ? "Muhurat" : isChoghadiyaEndpoint ? "Choghadiya" : "Unknown";
        const criticalError = `[CRITICAL BUG] ${endpointName} endpoint method enforcement failed! Method is ${fetchMethod} but must be GET. originalMethod=${method}, actualMethod=${actualMethod}, mustUseGet=${mustUseGet}`;
        console.error("[AstroSetu]", criticalError);
        throw new Error(criticalError);
      }
      
      // Build fetch options with ABSOLUTE method enforcement
      const fetchOptions: RequestInit = {
        method: fetchMethod, // This is guaranteed to be GET for panchang, kundli, dosha, horoscope, and muhurat
        headers: { ...headers }, // Copy headers to avoid mutation
        signal: controller.signal,
      };
      
      // CRITICAL: Only include body for POST requests - NEVER for GET
      // This is a safety check to prevent accidentally sending body with GET
      if (fetchMethod === "POST") {
        fetchOptions.body = JSON.stringify(params);
      } else if (fetchMethod === "GET") {
        // Explicitly ensure NO body for GET requests
        if (fetchOptions.body) {
          console.error("[AstroSetu] CRITICAL: Attempted to send body with GET request! Removing body.");
          delete fetchOptions.body;
        }
      }
      
      // Final verification before fetch
      if (mustUseGet) {
        if (fetchOptions.method !== "GET") {
          throw new Error(`[CRITICAL] Final check failed: fetchOptions.method=${fetchOptions.method} but must be GET`);
        }
        if (fetchOptions.body) {
          throw new Error(`[CRITICAL] Final check failed: fetchOptions has body but method is GET`);
        }
      }
      
      const urlPreview = url.length > 100 ? url.substring(0, 100) + "..." : url;
      console.log("[AstroSetu] FETCH CALL: endpoint=" + endpoint + ", fetchMethod=" + fetchMethod + ", fetchOptionsMethod=" + fetchOptions.method + ", url=" + urlPreview + ", hasBody=" + !!fetchOptions.body + ", mustUseGet=" + mustUseGet);
      const response = await fetch(url, fetchOptions);

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Prokerala API error: ${errorText}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          // Keep original error message
        }
        
        // Add comprehensive debug info to error for all GET endpoints
        // Only log if response is NOT ok (actual error)
        if (mustUseGet && !response.ok) {
          const endpointName = isPanchangEndpoint ? "PANCHANG" : isKundliEndpoint ? "KUNDLI" : isDoshaEndpoint ? "DOSHA" : isHoroscopeEndpoint ? "HOROSCOPE" : isMuhuratEndpoint ? "MUHURAT" : isChoghadiyaEndpoint ? "CHOGHADIYA" : "UNKNOWN";
          const debugInfo = `[${endpointName}_DEBUG: originalMethod=${method}, enforcedMethod=${actualMethod}, fetchMethod=${fetchMethod}, fetchOptionsMethod=${fetchOptions.method}, url=${url.substring(0, 200)}, hasBody=${!!fetchOptions.body}, status=${response.status}]`;
          errorMessage = debugInfo + " | " + errorMessage;
          console.error(`[AstroSetu] ${endpointName} ERROR WITH DEBUG:`, debugInfo, "Error:", errorMessage);
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      
      // Log response structure for debugging kundli/panchang
      if (mustUseGet) {
        const endpointName = isPanchangEndpoint ? "PANCHANG" : isKundliEndpoint ? "KUNDLI" : isDoshaEndpoint ? "DOSHA" : isHoroscopeEndpoint ? "HOROSCOPE" : isMuhuratEndpoint ? "MUHURAT" : isChoghadiyaEndpoint ? "CHOGHADIYA" : "UNKNOWN";
        console.log(`[AstroSetu] ${endpointName} Response received:`, {
          hasData: !!responseData.data,
          hasResult: !!responseData.result,
          topLevelKeys: Object.keys(responseData),
          dataKeys: responseData.data ? Object.keys(responseData.data) : [],
          resultKeys: responseData.result ? Object.keys(responseData.result) : [],
          responsePreview: JSON.stringify(responseData).substring(0, 300),
        });
      }
      
      result = responseData;
      break; // Success, exit retry loop
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on authentication errors or client errors (4xx)
      if (error.message?.includes('authentication') || 
          error.message?.includes('401') || 
          error.message?.includes('403') ||
          error.message?.includes('400') ||
          error.message?.includes('405')) {
        throw error;
      }
      
      // Retry with exponential backoff
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Max 5 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  // Only throw if we didn't get a result after all retries
  if (!result) {
    throw lastError || new Error("Prokerala API request failed after retries");
  }
  
  // Cache successful GET responses
  if (!skipCache && method === "GET" && result) {
    try {
      const cacheKey = generateCacheKey(endpoint, params);
      setCached(cacheKey, result);
      console.log(`[AstroSetu] Cached response for ${endpoint}`);
    } catch (cacheError) {
      console.warn("[AstroSetu] Failed to cache response:", cacheError);
    }
  }
  
  return result;
}

/**
 * Get Kundli (Birth Chart)
 * Enhanced with progressive loading support
 */
export async function getKundli(input: BirthDetails): Promise<KundliResult & { dosha: DoshaAnalysis; chart: KundliChart }> {
  // If Prokerala is not configured OR coordinates are missing, fall back to local engine.
  if (!isAPIConfigured() || !input.latitude || !input.longitude) {
    if (!isAPIConfigured()) {
      console.warn("[AstroSetu] Prokerala API not configured - using mock data. Results will NOT match AstroSage.");
    } else {
      console.warn("[AstroSetu] Coordinates missing - using local engine instead of Prokerala.");
    }
    const kundli = generateKundli(input);
    const dosha = generateDoshaAnalysis(input, kundli.planets);
    const chart = generateKundliChart(input);
    return { ...kundli, dosha, chart };
  }

  try {
    // Parse date and time
    const [year, month, day] = input.dob.split("-").map(Number);
    const [hours, minutes, seconds = 0] = input.tob.split(":").map(Number);

    console.log("[AstroSetu] Calling Prokerala API with:", {
      ayanamsa: input.ayanamsa || 1,
      coordinates: `${input.latitude},${input.longitude}`,
      datetime: { year, month, day, hour: hours, minute: minutes, second: seconds },
      timezone: input.timezone || "Asia/Kolkata",
    });

    // Kundli endpoint requires GET method (like panchang)
    const response = await prokeralaRequest("/kundli", {
      ayanamsa: input.ayanamsa || 1, // Default to Lahiri (matches AstroSage default)
      coordinates: `${input.latitude},${input.longitude}`,
      datetime: {
        year,
        month,
        day,
        hour: hours,
        minute: minutes,
        second: seconds || 0,
      },
      timezone: input.timezone || "Asia/Kolkata",
    }, 2, "GET" as const);

    console.log("[AstroSetu] Prokerala API response received:", JSON.stringify(response).substring(0, 1000));
    console.log("[AstroSetu] Prokerala API response structure:", {
      hasData: !!response.data,
      hasResult: !!response.result,
      dataKeys: response.data ? Object.keys(response.data) : [],
      resultKeys: response.result ? Object.keys(response.result) : [],
      topLevelKeys: Object.keys(response),
    });

    // Transform Prokerala response to our format
    const kundli = transformKundliResponse(response, input);
    console.log("[AstroSetu] Transformed kundli:", {
      ascendant: kundli.ascendant,
      rashi: kundli.rashi,
      nakshatra: kundli.nakshatra,
      planetsCount: kundli.planets?.length || 0,
    });
    
    // Extract dosha analysis from kundli response first (Prokerala includes mangal_dosha in kundli response)
    // The standalone /dosha endpoint may not be available in all plans, so prefer extracting from kundli
    let dosha: DoshaAnalysis;
    try {
      // First, try to extract dosha data from the kundli response
      const kundliData = response.data || response;
      if (kundliData.mangal_dosha || kundliData.manglik || kundliData.dosha) {
        // Transform dosha from kundli response
        dosha = transformDoshaResponse({ data: kundliData }, kundli.planets);
        console.log("[AstroSetu] Extracted dosha from kundli response");
      } else {
        // If not in kundli response, try standalone dosha endpoint (may not exist in all plans)
        const doshaParams = {
          ayanamsa: input.ayanamsa || 1,
          coordinates: `${input.latitude},${input.longitude}`,
          datetime: {
            year,
            month,
            day,
            hour: hours,
            minute: minutes,
            second: seconds || 0,
          },
          timezone: input.timezone || "Asia/Kolkata",
        };
        try {
          // Try dosha endpoint (may not exist - returns 404)
          const doshaResponse = await prokeralaRequest("/dosha", doshaParams, 1, "GET" as const);
          dosha = transformDoshaResponse(doshaResponse, kundli.planets);
          console.log("[AstroSetu] Retrieved dosha from standalone endpoint");
        } catch (doshaError: any) {
          // If dosha endpoint fails (404), use mock dosha
          console.warn("[AstroSetu] Dosha endpoint not available (404), using mock dosha");
          dosha = generateDoshaAnalysis(input, kundli.planets);
        }
      }
    } catch (doshaError: any) {
      console.warn("[AstroSetu] Dosha extraction failed, using mock:", doshaError?.message?.substring(0, 200));
      // Fallback to mock dosha
      dosha = generateDoshaAnalysis(input, kundli.planets);
    }
    
    // Generate enhanced chart from Prokerala data (extracts actual chart structure)
    let chart: KundliChart;
    try {
      chart = generateChartFromProkerala(response, kundli.planets);
      console.log("[AstroSetu] Generated chart from Prokerala data:", {
        housesCount: chart.houses.length,
        aspectsCount: chart.aspects.length,
        hasDasha: !!chart.dasha.current,
      });
    } catch (chartError: any) {
      console.warn("[AstroSetu] Failed to generate chart from Prokerala, using fallback:", chartError?.message);
      // Fallback to generated chart
      chart = generateKundliChart(input);
    }
    
    return { ...kundli, dosha, chart };
  } catch (error: any) {
    console.error("[AstroSetu] Prokerala API error:", error?.message || error);
    // In production, we should NOT silently fallback to mock
    // Instead, throw the error so the user knows something went wrong
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Astrology calculation failed: ${error?.message || 'Unknown error'}. Please try again or contact support.`);
    }
    // In development, allow fallback for testing
    console.warn("[AstroSetu] Falling back to mock data (development mode only)");
    const kundli = generateKundli(input);
    const dosha = generateDoshaAnalysis(input, kundli.planets);
    const chart = generateKundliChart(input);
    return { ...kundli, dosha, chart };
  }
}

/**
 * Match Kundli (Guna Milan)
 */
export async function matchKundliAPI(a: BirthDetails, b: BirthDetails): Promise<MatchResult & { doshaA: DoshaAnalysis; doshaB: DoshaAnalysis }> {
  if (!isAPIConfigured()) {
    const match = matchKundli(a, b);
    const kundliA = generateKundli(a);
    const kundliB = generateKundli(b);
    const doshaA = generateDoshaAnalysis(a, kundliA.planets);
    const doshaB = generateDoshaAnalysis(b, kundliB.planets);
    return { ...match, doshaA, doshaB };
  }

  try {
    // Parse dates
    const parseDate = (dob: string, tob: string) => {
      const [year, month, day] = dob.split("-").map(Number);
      const [hours, minutes, seconds = 0] = tob.split(":").map(Number);
      return { year, month, day, hour: hours, minute: minutes, second: seconds };
    };

    // Check if coordinates are available - if not, fall back to mock
    if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) {
      console.warn("[AstroSetu] Match API: Missing coordinates, using mock data");
      const match = matchKundli(a, b);
      const kundliA = generateKundli(a);
      const kundliB = generateKundli(b);
      const doshaA = generateDoshaAnalysis(a, kundliA.planets);
      const doshaB = generateDoshaAnalysis(b, kundliB.planets);
      return { ...match, doshaA, doshaB };
    }

    // Kundli-matching endpoint - try GET first, fall back to POST if needed
    // Complex nested data might require POST, but try GET first
    let response;
    try {
      response = await prokeralaRequest("/kundli-matching", {
        ayanamsa: 1,
        girl: {
          coordinates: `${a.latitude},${a.longitude}`,
          datetime: parseDate(a.dob, a.tob),
          timezone: a.timezone || "Asia/Kolkata",
        },
        boy: {
          coordinates: `${b.latitude},${b.longitude}`,
          datetime: parseDate(b.dob, b.tob),
          timezone: b.timezone || "Asia/Kolkata",
        },
      }, 2, "GET" as const);
    } catch (getError: any) {
      // If GET fails with 405, try POST (complex nested data may require POST)
      if (getError.message?.includes("405") || getError.message?.includes("Method Not Allowed")) {
        console.log("[AstroSetu] Match API: GET failed with 405, trying POST");
        response = await prokeralaRequest("/kundli-matching", {
          ayanamsa: 1,
          girl: {
            coordinates: `${a.latitude},${a.longitude}`,
            datetime: parseDate(a.dob, a.tob),
            timezone: a.timezone || "Asia/Kolkata",
          },
          boy: {
            coordinates: `${b.latitude},${b.longitude}`,
            datetime: parseDate(b.dob, b.tob),
            timezone: b.timezone || "Asia/Kolkata",
          },
        }, 2, "POST");
      } else {
        throw getError;
      }
    }

    // Transform Prokerala response
    const match = transformMatchResponse(response, a, b);
    
    // Get dosha analysis for both
    let doshaA: DoshaAnalysis, doshaB: DoshaAnalysis;
    try {
      const [doshaAResponse, doshaBResponse] = await Promise.all([
        prokeralaRequest("/dosha", {
          ayanamsa: 1,
          coordinates: `${a.latitude},${a.longitude}`,
          datetime: parseDate(a.dob, a.tob),
          timezone: a.timezone || "Asia/Kolkata",
        }, 2, "GET" as const).catch(() => null),
        prokeralaRequest("/dosha", {
          ayanamsa: 1,
          coordinates: `${b.latitude},${b.longitude}`,
          datetime: parseDate(b.dob, b.tob),
          timezone: b.timezone || "Asia/Kolkata",
        }, 2, "GET" as const).catch(() => null),
      ]);
      
      // Get planets for enhanced dosha analysis if dosha API response is not available
      // MatchResult doesn't contain kundli data, so we generate planets from birth details if needed
      let kundliAPlanets: any[] | undefined = undefined;
      let kundliBPlanets: any[] | undefined = undefined;
      
      // If dosha response is not available, generate kundli to get planets for dosha analysis
      if (!doshaAResponse || !doshaBResponse) {
        try {
          if (!doshaAResponse) {
            const kundliA = generateKundli(a);
            kundliAPlanets = kundliA.planets;
          }
          if (!doshaBResponse) {
            const kundliB = generateKundli(b);
            kundliBPlanets = kundliB.planets;
          }
        } catch {
          // Ignore kundli generation errors, will use mock dosha without planets
        }
      }
      
      doshaA = doshaAResponse 
        ? transformDoshaResponse(doshaAResponse, kundliAPlanets) 
        : (kundliAPlanets ? generateDoshaAnalysis(a, kundliAPlanets) : generateDoshaAnalysis(a));
      doshaB = doshaBResponse 
        ? transformDoshaResponse(doshaBResponse, kundliBPlanets) 
        : (kundliBPlanets ? generateDoshaAnalysis(b, kundliBPlanets) : generateDoshaAnalysis(b));
    } catch {
      doshaA = generateDoshaAnalysis(a);
      doshaB = generateDoshaAnalysis(b);
    }
    
    return { ...match, doshaA, doshaB };
  } catch (error) {
    // Log as warning since we're gracefully falling back to mock
    console.warn("[AstroSetu] Match API error, using mock:", error instanceof Error ? error.message : error);
    const match = matchKundli(a, b);
    const kundliA = generateKundli(a);
    const kundliB = generateKundli(b);
    const doshaA = generateDoshaAnalysis(a, kundliA.planets);
    const doshaB = generateDoshaAnalysis(b, kundliB.planets);
    return { ...match, doshaA, doshaB };
  }
}

/**
 * Get Horoscope
 * ProKerala horoscope endpoints use GET method
 */
export async function getHoroscope(mode: "daily" | "weekly" | "monthly" | "yearly", sign: string, date?: string, month?: string, year?: number): Promise<HoroscopeDaily | HoroscopeWeekly | HoroscopeMonthly | HoroscopeYearly> {
  if (!isAPIConfigured()) {
    // Fallback to mock
    const dateStr = date || new Date().toISOString().slice(0, 10);
    if (mode === "weekly") return weeklyHoroscope(sign, dateStr);
    if (mode === "monthly") return monthlyHoroscope(sign, month || new Date().toLocaleString("en-US", { month: "long" }), year || new Date().getFullYear());
    if (mode === "yearly") return yearlyHoroscope(sign, year || new Date().getFullYear());
    return dailyHoroscope(sign, dateStr);
  }

  try {
    const signMap: Record<string, number> = {
      Aries: 1, Taurus: 2, Gemini: 3, Cancer: 4, Leo: 5, Virgo: 6,
      Libra: 7, Scorpio: 8, Sagittarius: 9, Capricorn: 10, Aquarius: 11, Pisces: 12,
    };

    const endpoint = mode === "daily" ? "/horoscope/daily" : mode === "weekly" ? "/horoscope/weekly" : mode === "monthly" ? "/horoscope/monthly" : "/horoscope/yearly";
    
    // Parse date for GET request
    let datetimeParam: string | { year: number; month: number; day: number } = date || new Date().toISOString().slice(0, 10);
    if (typeof datetimeParam === "string") {
      const [y, m, d] = datetimeParam.split("-").map(Number);
      datetimeParam = { year: y, month: m, day: d };
    }
    
    // Horoscope endpoints require GET method
    const response = await prokeralaRequest(endpoint, {
      sign: signMap[sign] || 1,
      datetime: datetimeParam,
    }, 2, "GET" as const);

    // Transform ProKerala response
    const data = response.data || response;
    const horoscopeData = data.horoscope || data.prediction || data;
    
    console.log("[AstroSetu] Horoscope response structure:", {
      hasData: !!data,
      hasHoroscope: !!data.horoscope,
      hasPrediction: !!data.prediction,
      keys: Object.keys(data || {}),
    });
    
    const dateStr = date || new Date().toISOString().slice(0, 10);
    
    // Extract prediction text from various possible locations
    const predictionText = horoscopeData.prediction || 
                          horoscopeData.description || 
                          horoscopeData.text || 
                          horoscopeData.content ||
                          (typeof horoscopeData === 'string' ? horoscopeData : null);
    
    if (mode === "daily") {
      const mockData = dailyHoroscope(sign, dateStr);
      return {
        sign,
        date: dateStr,
        text: predictionText || mockData.text,
        lucky: {
          color: horoscopeData.luckyColor || horoscopeData.lucky_color || mockData.lucky.color,
          number: horoscopeData.luckyNumber || horoscopeData.lucky_number || mockData.lucky.number,
          mood: horoscopeData.mood || mockData.lucky.mood,
        },
      };
    } else if (mode === "weekly") {
      const mockData = weeklyHoroscope(sign, dateStr);
      return {
        sign,
        weekOf: dateStr,
        summary: predictionText || horoscopeData.summary || horoscopeData.description || mockData.summary,
        focus: horoscopeData.focus || 
               horoscopeData.predictions || 
               (predictionText ? [predictionText] : []) ||
               mockData.focus,
      };
    } else if (mode === "monthly") {
      const mockData = monthlyHoroscope(sign, month || new Date().toLocaleString("en-US", { month: "long" }), year || new Date().getFullYear());
      return {
        sign,
        month: month || new Date().toLocaleString("en-US", { month: "long" }),
        year: year || new Date().getFullYear(),
        overview: predictionText || horoscopeData.overview || horoscopeData.description || mockData.overview,
        career: horoscopeData.career || mockData.career,
        love: horoscopeData.love || mockData.love,
        health: horoscopeData.health || mockData.health,
        finance: horoscopeData.finance || mockData.finance,
        luckyDays: horoscopeData.luckyDays || mockData.luckyDays,
      };
    } else {
      const mockData = yearlyHoroscope(sign, year || new Date().getFullYear());
      return {
        sign,
        year: year || new Date().getFullYear(),
        overview: predictionText || horoscopeData.overview || horoscopeData.description || mockData.overview,
        predictions: horoscopeData.predictions || mockData.predictions,
        importantMonths: horoscopeData.importantMonths || mockData.importantMonths,
      };
    }
  } catch (error: any) {
    // Log as warning instead of error since we're gracefully falling back
    console.warn("[AstroSetu] Horoscope API error, using mock:", error?.message || error);
    const dateStr = date || new Date().toISOString().slice(0, 10);
    if (mode === "weekly") return weeklyHoroscope(sign, dateStr);
    if (mode === "monthly") return monthlyHoroscope(sign, month || new Date().toLocaleString("en-US", { month: "long" }), year || new Date().getFullYear());
    if (mode === "yearly") return yearlyHoroscope(sign, year || new Date().getFullYear());
    return dailyHoroscope(sign, dateStr);
  }
}

/**
 * Get Panchang
 */
export async function getPanchangAPI(date: string, place: string, latitude?: number, longitude?: number): Promise<Panchang> {
  if (!isAPIConfigured()) {
    return generatePanchang(date, place);
  }

  try {
    // Ensure coordinates are available
    if (!latitude || !longitude) {
      throw new Error("Latitude and longitude are required for Panchang");
    }

    // ProKerala panchang endpoint requires GET method
    // Parse date string to object format that ProKerala expects
    const [year, month, day] = date.split("-").map(Number);
    console.log("[AstroSetu] Calling panchang with GET method:", { date, year, month, day, latitude, longitude });
    const response = await prokeralaRequest("/panchang", {
      datetime: {
        year,
        month,
        day,
      },
      coordinates: `${latitude},${longitude}`,
      timezone: "Asia/Kolkata",
    }, 2, "GET" as const);

    // Transform Prokerala response
    return transformPanchangResponse(response, date, place);
  } catch (error: any) {
    console.warn("[AstroSetu] API error, using mock:", error?.message || error);
    return generatePanchang(date, place);
  }
}

/**
 * Find Muhurat
 * ProKerala muhurat endpoint uses GET method
 */
export async function findMuhuratAPI(date: string, type: Muhurat["type"]): Promise<Muhurat> {
  if (!isAPIConfigured()) {
    return findMuhurat(date, type);
  }

  try {
    // Parse date for GET request
    const [year, month, day] = date.split("-").map(Number);
    
    // Muhurat endpoint requires GET method
    const response = await prokeralaRequest("/muhurat", {
      datetime: {
        year,
        month,
        day,
      },
      type,
    }, 2, "GET" as const);

    // Transform ProKerala response
    const data = response.data || response;
    const muhuratData = data.muhurat || data;
    
    // Extract auspicious timings
    const auspiciousTimings = muhuratData.timings || muhuratData.auspicious || muhuratData.auspiciousTimings || [];
    const avoidTimings = muhuratData.avoid || muhuratData.inauspicious || muhuratData.avoidTimings || [];
    
    return {
      type,
      date,
      auspiciousTimings: auspiciousTimings.map((t: any) => ({
        start: t.start || t.startTime || t.start_time || "",
        end: t.end || t.endTime || t.end_time || "",
        quality: t.quality || t.rating || "Good",
      })),
      avoidTimings: avoidTimings.map((t: any) => ({
        start: t.start || t.startTime || t.start_time || "",
        end: t.end || t.endTime || t.end_time || "",
        reason: t.reason || t.description || t.note || "Inauspicious period",
      })),
    };
  } catch (error: any) {
    console.warn("[AstroSetu] API error, using mock:", error?.message || error);
    return findMuhurat(date, type);
  }
}

/**
 * Get Choghadiya (Auspicious/Inauspicious Timings)
 * ProKerala choghadiya endpoint uses GET method
 * Choghadiya is typically part of panchang data but can be requested separately
 */
export async function getChoghadiyaAPI(date: string, place: string, latitude?: number, longitude?: number): Promise<Choghadiya> {
  if (!isAPIConfigured()) {
    // Generate mock choghadiya data
    return generateMockChoghadiya(date, place);
  }

  try {
    // Ensure coordinates are available
    if (!latitude || !longitude) {
      throw new Error("Latitude and longitude are required for Choghadiya");
    }

    // Parse date for GET request
    const [year, month, day] = date.split("-").map(Number);
    
    // Choghadiya endpoint requires GET method
    // ProKerala may have choghadiya in panchang endpoint or separate endpoint
    const response = await prokeralaRequest("/choghadiya", {
      datetime: {
        year,
        month,
        day,
      },
      coordinates: `${latitude},${longitude}`,
    }, 2, "GET" as const);

    // Transform ProKerala response
    return transformChoghadiyaResponse(response, date, place);
  } catch (error: any) {
    // If choghadiya endpoint doesn't exist, try extracting from panchang
    try {
      console.log("[AstroSetu] Choghadiya endpoint not available, trying panchang endpoint");
      const panchang = await getPanchangAPI(date, place, latitude, longitude);
      // Extract choghadiya from panchang if available
      return transformPanchangToChoghadiya(panchang, date, place);
    } catch (panchangError) {
      console.warn("[AstroSetu] Failed to get choghadiya from panchang, using mock:", error?.message || error);
      return generateMockChoghadiya(date, place);
    }
  }
}

/**
 * Generate mock Choghadiya data for fallback
 */
function generateMockChoghadiya(date: string, place: string): Choghadiya {
  const dayPeriods = [
    { type: "Shubh" as const, name: "Shubh", start: "06:00", end: "07:30", quality: "Auspicious" as const, activities: ["Starting new ventures", "Business activities", "Important meetings"], avoidActivities: [] },
    { type: "Labh" as const, name: "Labh", start: "07:30", end: "09:00", quality: "Auspicious" as const, activities: ["Financial transactions", "Buying/selling", "Starting business"], avoidActivities: [] },
    { type: "Amrit" as const, name: "Amrit", start: "09:00", end: "10:30", quality: "Auspicious" as const, activities: ["Religious activities", "Health treatments", "Education"], avoidActivities: [] },
    { type: "Chal" as const, name: "Chal", start: "10:30", end: "12:00", quality: "Moderate" as const, activities: ["Travel", "Movement"], avoidActivities: ["Important decisions"] },
    { type: "Kaal" as const, name: "Kaal", start: "12:00", end: "13:30", quality: "Inauspicious" as const, activities: [], avoidActivities: ["All important activities", "Starting new work"] },
    { type: "Rog" as const, name: "Rog", start: "13:30", end: "15:00", quality: "Inauspicious" as const, activities: [], avoidActivities: ["Health-related activities", "Medical treatments"] },
    { type: "Udveg" as const, name: "Udveg", start: "15:00", end: "16:30", quality: "Inauspicious" as const, activities: [], avoidActivities: ["Important meetings", "Decisions"] },
  ];

  const nightPeriods = [
    { type: "Shubh" as const, name: "Shubh", start: "18:00", end: "19:30", quality: "Auspicious" as const, activities: ["Evening prayers", "Family time"], avoidActivities: [] },
    { type: "Labh" as const, name: "Labh", start: "19:30", end: "21:00", quality: "Auspicious" as const, activities: ["Social gatherings", "Entertainment"], avoidActivities: [] },
    { type: "Amrit" as const, name: "Amrit", start: "21:00", end: "22:30", quality: "Auspicious" as const, activities: ["Meditation", "Spiritual activities"], avoidActivities: [] },
    { type: "Chal" as const, name: "Chal", start: "22:30", end: "00:00", quality: "Moderate" as const, activities: ["Travel"], avoidActivities: ["Important activities"] },
  ];

  return {
    date,
    place,
    dayPeriods,
    nightPeriods,
  };
}

/**
 * Calculate Numerology
 */
export async function calculateNumerologyAPI(name: string, dob?: string): Promise<Numerology> {
  // Numerology calculation (Life Path from DOB, others from name)
  return calculateNumerology(name, dob);
}

/**
 * Get Remedies
 */
export async function getRemediesAPI(planet: string, issue: string): Promise<Remedy[]> {
  // Remedies are static, can use mock
  return getRemedies(planet, issue);
}

/**
 * Get Dasha Periods (Vimshottari Dasha)
 */
export async function getDashaPeriods(input: BirthDetails): Promise<any> {
  if (!isAPIConfigured()) {
    // Fallback to mock
    return {
      current: {
        planet: "Jupiter",
        period: "16 years",
        startDate: "2020-01-01",
        endDate: "2036-01-01",
        description: "Jupiter Dasha brings wisdom and spiritual growth.",
      },
      next: {
        planet: "Saturn",
        period: "19 years",
        startDate: "2036-01-01",
        endDate: "2055-01-01",
        description: "Saturn Dasha brings discipline and karmic lessons.",
      },
      antardashas: [],
    };
  }

  try {
    const [year, month, day] = input.dob.split("-").map(Number);
    const [hours, minutes, seconds = 0] = input.tob.split(":").map(Number);

    if (!input.latitude || !input.longitude) {
      throw new Error("Latitude and longitude are required for Prokerala API");
    }

    const response = await prokeralaRequest("/dasha-periods", {
      ayanamsa: input.ayanamsa || 1,
      coordinates: `${input.latitude},${input.longitude}`,
      datetime: {
        year,
        month,
        day,
        hour: hours,
        minute: minutes,
        second: seconds || 0,
      },
      timezone: input.timezone || "Asia/Kolkata",
      dasha: "vimshottari",
    });

    // Transform Prokerala response
    const data = response.data || response;
    const dasha = data.dasha || data.vimshottari || {};
    const periods = dasha.periods || [];

    const current = periods[0] || {};
    const next = periods[1] || {};

    return {
      current: {
        planet: current.planet?.name || current.planet || "Unknown",
        period: current.period || "Unknown",
        startDate: current.start?.datetime || current.startDate || "",
        endDate: current.end?.datetime || current.endDate || "",
        description: current.description || "",
      },
      next: {
        planet: next.planet?.name || next.planet || "Unknown",
        period: next.period || "Unknown",
        startDate: next.start?.datetime || next.startDate || "",
        endDate: next.end?.datetime || next.endDate || "",
        description: next.description || "",
      },
      antardashas: periods.slice(0, 10).map((p: any) => ({
        planet: p.planet?.name || p.planet || "Unknown",
        period: p.period || "Unknown",
        startDate: p.start?.datetime || p.startDate || "",
        endDate: p.end?.datetime || p.endDate || "",
      })),
    };
  } catch (error: any) {
    console.warn("[AstroSetu] API error, using mock:", error?.message || error);
    // Fallback to mock
    return {
      current: {
        planet: "Jupiter",
        period: "16 years",
        startDate: "2020-01-01",
        endDate: "2036-01-01",
        description: "Jupiter Dasha brings wisdom and spiritual growth.",
      },
      next: {
        planet: "Saturn",
        period: "19 years",
        startDate: "2036-01-01",
        endDate: "2055-01-01",
        description: "Saturn Dasha brings discipline and karmic lessons.",
      },
      antardashas: [],
    };
  }
}

/**
 * Get Dosha Analysis (standalone)
 */
export async function getDoshaAnalysis(input: BirthDetails): Promise<DoshaAnalysis> {
  if (!isAPIConfigured()) {
    const kundli = generateKundli(input);
    return generateDoshaAnalysis(input, kundli.planets);
  }

  try {
    const [year, month, day] = input.dob.split("-").map(Number);
    const [hours, minutes, seconds = 0] = input.tob.split(":").map(Number);

    if (!input.latitude || !input.longitude) {
      throw new Error("Latitude and longitude are required for Prokerala API");
    }

    // Dosha endpoint requires GET method
    const doshaResponse = await prokeralaRequest("/dosha", {
      ayanamsa: input.ayanamsa || 1,
      coordinates: `${input.latitude},${input.longitude}`,
      datetime: {
        year,
        month,
        day,
        hour: hours,
        minute: minutes,
        second: seconds || 0,
      },
      timezone: input.timezone || "Asia/Kolkata",
    }, 2, "GET" as const);

    // Get planets data for enhanced dosha analysis
    let planets: any[] | undefined;
    try {
      const kundliResponse = await prokeralaRequest("/kundli", {
        ayanamsa: input.ayanamsa || 1,
        coordinates: `${input.latitude},${input.longitude}`,
        datetime: {
          year,
          month,
          day,
          hour: hours,
          minute: minutes,
          second: seconds || 0,
        },
        timezone: input.timezone || "Asia/Kolkata",
      }, 2, "GET" as const);
      const transformedKundli = transformKundliResponse(kundliResponse, input);
      planets = transformedKundli.planets;
    } catch {
      // If kundli fetch fails, proceed without planets
    }
    return transformDoshaResponse(doshaResponse, planets);
  } catch (error: any) {
    console.warn("[AstroSetu] API error, using mock:", error?.message || error);
    const kundli = generateKundli(input);
    return generateDoshaAnalysis(input, kundli.planets);
  }
}

// Updated: Thu 25 Dec 2025 21:30:00 AEDT

// Env vars updated: 2025-12-26
