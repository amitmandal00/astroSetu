/**
 * Astrology API Abstraction Layer
 * Uses Prokerala API for real astrology calculations
 * Falls back to mock data if API key not configured
 */

import type { BirthDetails, KundliResult, MatchResult, HoroscopeDaily, HoroscopeWeekly, HoroscopeMonthly, HoroscopeYearly, Panchang, Muhurat, Numerology, Remedy, DoshaAnalysis, KundliChart } from "@/types/astrology";
import { generateKundli, matchKundli, dailyHoroscope, weeklyHoroscope, monthlyHoroscope, yearlyHoroscope, generatePanchang, findMuhurat, calculateNumerology, getRemedies, generateDoshaAnalysis, generateKundliChart } from "./astrologyEngine";
import { transformKundliResponse, transformMatchResponse, transformPanchangResponse, transformDoshaResponse } from "./prokeralaTransform";

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

async function prokeralaRequest(endpoint: string, params: Record<string, any>, retries: number = 2, method: "GET" | "POST" = "POST"): Promise<any> {
  const credentials = getAPICredentials();
  if (!credentials) {
    throw new Error("Prokerala API credentials not configured. Set PROKERALA_API_KEY or PROKERALA_CLIENT_ID and PROKERALA_CLIENT_SECRET");
  }

  // CRITICAL: ABSOLUTE ENFORCEMENT - Panchang and Kundli endpoints MUST use GET, no exceptions
  // This overrides ANY method parameter passed, including defaults
  const isPanchangEndpoint = endpoint === "/panchang" || endpoint.includes("/panchang");
  const isKundliEndpoint = endpoint === "/kundli" || endpoint.includes("/kundli");
  const mustUseGet = isPanchangEndpoint || isKundliEndpoint;
  const actualMethod: "GET" | "POST" = mustUseGet ? "GET" : method;
  
  if (mustUseGet && method !== "GET") {
    console.error("[AstroSetu] CRITICAL: " + (isPanchangEndpoint ? "Panchang" : "Kundli") + " endpoint received method=" + method + ", ENFORCING GET");
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
        // Handle nested objects (like datetime)
        if (typeof value === "object" && !Array.isArray(value)) {
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
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      // FINAL ENFORCEMENT: Use actualMethod (already enforced at function start)
      // This is the method that will be used - guaranteed GET for panchang and kundli
      const fetchMethod: "GET" | "POST" = actualMethod;
      
      // TRIPLE CHECK: Panchang and Kundli MUST be GET - throw error if not
      if (mustUseGet && fetchMethod !== "GET") {
        const endpointName = isPanchangEndpoint ? "Panchang" : "Kundli";
        const criticalError = `[CRITICAL BUG] ${endpointName} endpoint method enforcement failed! Method is ${fetchMethod} but must be GET. originalMethod=${method}, actualMethod=${actualMethod}, mustUseGet=${mustUseGet}`;
        console.error("[AstroSetu]", criticalError);
        throw new Error(criticalError);
      }
      
      // Build fetch options with ABSOLUTE method enforcement
      const fetchOptions: RequestInit = {
        method: fetchMethod, // This is guaranteed to be GET for panchang and kundli
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
        
        // Add comprehensive debug info to error for panchang
        if (isPanchangEndpoint) {
          const debugInfo = `[PANCHANG_DEBUG: originalMethod=${method}, enforcedMethod=${actualMethod}, fetchMethod=${fetchMethod}, fetchOptionsMethod=${fetchOptions.method}, url=${url.substring(0, 200)}, hasBody=${!!fetchOptions.body}, status=${response.status}]`;
          errorMessage = debugInfo + " | " + errorMessage;
          console.error("[AstroSetu] PANCHANG ERROR WITH DEBUG:", debugInfo, "Error:", errorMessage);
        }
        
        throw new Error(errorMessage);
      }

      return response.json();
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

  throw lastError || new Error("Prokerala API request failed after retries");
}

/**
 * Get Kundli (Birth Chart)
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
    const dosha = generateDoshaAnalysis(input);
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

    console.log("[AstroSetu] Prokerala API response received:", JSON.stringify(response).substring(0, 500));

    // Transform Prokerala response to our format
    const kundli = transformKundliResponse(response, input);
    
    // Get dosha analysis (may need separate API call)
    let dosha: DoshaAnalysis;
    try {
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
      });
      dosha = transformDoshaResponse(doshaResponse);
    } catch (doshaError: any) {
      console.warn("[AstroSetu] Dosha API call failed, using mock:", doshaError?.message);
      // Fallback to mock dosha if dosha endpoint not available
      dosha = generateDoshaAnalysis(input);
    }
    
    // Generate chart (Prokerala may not provide chart visualization)
    const chart = generateKundliChart(input);
    
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
    const dosha = generateDoshaAnalysis(input);
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
    const doshaA = generateDoshaAnalysis(a);
    const doshaB = generateDoshaAnalysis(b);
    return { ...match, doshaA, doshaB };
  }

  try {
    // Parse dates
    const parseDate = (dob: string, tob: string) => {
      const [year, month, day] = dob.split("-").map(Number);
      const [hours, minutes, seconds = 0] = tob.split(":").map(Number);
      return { year, month, day, hour: hours, minute: minutes, second: seconds };
    };

    // Ensure coordinates are available
    if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) {
      throw new Error("Latitude and longitude are required for both persons");
    }

    const response = await prokeralaRequest("/kundli-matching", {
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
    });

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
        }).catch(() => null),
        prokeralaRequest("/dosha", {
          ayanamsa: 1,
          coordinates: `${b.latitude},${b.longitude}`,
          datetime: parseDate(b.dob, b.tob),
          timezone: b.timezone || "Asia/Kolkata",
        }).catch(() => null),
      ]);
      
      doshaA = doshaAResponse ? transformDoshaResponse(doshaAResponse) : generateDoshaAnalysis(a);
      doshaB = doshaBResponse ? transformDoshaResponse(doshaBResponse) : generateDoshaAnalysis(b);
    } catch {
      doshaA = generateDoshaAnalysis(a);
      doshaB = generateDoshaAnalysis(b);
    }
    
    return { ...match, doshaA, doshaB };
  } catch (error) {
    console.error("Prokerala API error, using mock:", error);
    const match = matchKundli(a, b);
    const doshaA = generateDoshaAnalysis(a);
    const doshaB = generateDoshaAnalysis(b);
    return { ...match, doshaA, doshaB };
  }
}

/**
 * Get Horoscope
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
    
    const response = await prokeralaRequest(endpoint, {
      sign: signMap[sign] || 1,
      datetime: date || new Date().toISOString().slice(0, 10),
    });

    // Transform response (use mock for now, enhance later)
    const dateStr = date || new Date().toISOString().slice(0, 10);
    if (mode === "weekly") return weeklyHoroscope(sign, dateStr);
    if (mode === "monthly") return monthlyHoroscope(sign, month || new Date().toLocaleString("en-US", { month: "long" }), year || new Date().getFullYear());
    if (mode === "yearly") return yearlyHoroscope(sign, year || new Date().getFullYear());
    return dailyHoroscope(sign, dateStr);
  } catch (error) {
    console.error("Prokerala API error, using mock:", error);
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
    console.error("Prokerala API error, using mock:", error?.message || error);
    return generatePanchang(date, place);
  }
}

/**
 * Find Muhurat
 */
export async function findMuhuratAPI(date: string, type: Muhurat["type"]): Promise<Muhurat> {
  if (!isAPIConfigured()) {
    return findMuhurat(date, type);
  }

  try {
    const response = await prokeralaRequest("/muhurat", {
      datetime: date,
      type,
    });

    // Transform response (use mock for now, enhance later)
    return findMuhurat(date, type);
  } catch (error) {
    console.error("Prokerala API error, using mock:", error);
    return findMuhurat(date, type);
  }
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
    console.error("Prokerala API error, using mock:", error?.message || error);
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
    return generateDoshaAnalysis(input);
  }

  try {
    const [year, month, day] = input.dob.split("-").map(Number);
    const [hours, minutes, seconds = 0] = input.tob.split(":").map(Number);

    if (!input.latitude || !input.longitude) {
      throw new Error("Latitude and longitude are required for Prokerala API");
    }

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
    });

    return transformDoshaResponse(doshaResponse);
  } catch (error: any) {
    console.error("Prokerala API error, using mock:", error?.message || error);
    return generateDoshaAnalysis(input);
  }
}

// Updated: Thu 25 Dec 2025 21:30:00 AEDT

// Env vars updated: 2025-12-26
