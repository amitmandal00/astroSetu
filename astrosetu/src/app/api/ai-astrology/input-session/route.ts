import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError, parseJsonBody } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";
import { createClient } from "@supabase/supabase-js";
import type { AIAstrologyInput } from "@/lib/ai-astrology/types";

// CRITICAL FIX (ChatGPT): Use service role key ONLY server-side, never exposed
// Service role key should NEVER be logged, returned, or accessible to client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// CRITICAL: Hard guard - return 500 if service role key is missing (don't silently degrade)
// Service role key is required for server-side operations (bypasses RLS)
if (!supabaseServiceRoleKey && process.env.NODE_ENV === "production") {
  console.error("[input-session] CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in production");
  // Don't create supabase client if missing in production
}

const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * POST /api/ai-astrology/input-session
 * Store birth details and return input_token
 */
export async function POST(req: Request) {
  const requestId = generateRequestId();

  try {
    const rateLimitResponse = checkRateLimit(req, "/api/ai-astrology/input-session");
    if (rateLimitResponse) {
      rateLimitResponse.headers.set("X-Request-ID", requestId);
      return rateLimitResponse;
    }

    const json = await parseJsonBody<{
      input: AIAstrologyInput;
      reportType?: string;
      bundleType?: string;
      bundleReports?: string[];
      expiresIn?: number; // Optional: expiration in seconds (default: 1 hour)
    }>(req);

    // CRITICAL FIX (ChatGPT): Default expiration to 30 minutes (not 1 hour)
    // Shorter TTL reduces security risk of exposed tokens
    const { input, reportType, bundleType, bundleReports, expiresIn = 1800 } = json; // 30 minutes default

    if (!input) {
      return NextResponse.json(
        { ok: false, error: "Input data is required" },
        { status: 400, headers: { "X-Request-ID": requestId } }
      );
    }

    // CRITICAL FIX (ChatGPT): Hard guard - return 500 if service role key is missing in production
    // Don't silently degrade to mock tokens in production
    if (!supabase) {
      if (process.env.NODE_ENV === "production") {
        console.error("[input-session] CRITICAL: Supabase not configured in production");
        return NextResponse.json(
          {
            ok: false,
            error: "Input session storage is not available. Please contact support.",
            code: "STORAGE_NOT_CONFIGURED",
          },
          { status: 500, headers: { "X-Request-ID": requestId } }
        );
      }
      // Only allow mock tokens in development
      console.warn("[input-session] Supabase not configured (dev mode), returning mock token");
      const mockToken = `mock_token_${requestId}`;
      return NextResponse.json(
        {
          ok: true,
          data: { token: mockToken },
          requestId,
          mock: true,
        },
        {
          headers: {
            "X-Request-ID": requestId,
            "Cache-Control": "no-cache",
          },
        }
      );
    }

    // Generate token (UUID)
    const { randomUUID } = await import("crypto");
    const token = randomUUID();

    // CRITICAL FIX (ChatGPT): Log redaction - never log full token
    const tokenSuffix = token.slice(-6);
    console.log(`[input-session] Creating new session token: ...${tokenSuffix}`, {
      requestId,
      tokenSuffix: `...${tokenSuffix}`,
      expiresIn,
    });

    // Calculate expiration
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Store in Supabase
    const { data, error } = await supabase
      .from("ai_input_sessions")
      .insert({
        token,
        payload: {
          input,
          reportType,
          bundleType,
          bundleReports,
        },
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // CRITICAL FIX (ChatGPT): Log redaction - never log full token in errors
      console.error(`[input-session] Supabase insert error for token: ...${tokenSuffix}`, {
        requestId,
        tokenSuffix: `...${tokenSuffix}`,
        errorCode: error.code,
        errorMessage: error.message,
      });
      return NextResponse.json(
        {
          ok: false,
          error: "Failed to store input session",
          code: "STORAGE_ERROR",
        },
        { status: 500, headers: { "X-Request-ID": requestId } }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        data: { token },
        requestId,
      },
      {
        headers: {
          "X-Request-ID": requestId,
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (error: any) {
    console.error("[input-session] Error:", error);
    const errorResponse = handleApiError(error);
    errorResponse.headers.set("X-Request-ID", requestId);
    return errorResponse;
  }
}

/**
 * GET /api/ai-astrology/input-session?token=...
 * Retrieve birth details by token
 * CRITICAL: Returns only minimal data needed by preview page (PII protection)
 */
export async function GET(req: Request) {
  const requestId = generateRequestId();

  try {
    const rateLimitResponse = checkRateLimit(req, "/api/ai-astrology/input-session");
    if (rateLimitResponse) {
      rateLimitResponse.headers.set("X-Request-ID", requestId);
      return rateLimitResponse;
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Token is required" },
        { status: 400, headers: { "X-Request-ID": requestId } }
      );
    }

    // CRITICAL FIX (ChatGPT): Rate limiting per token (prevent token brute-force)
    // Additional rate limit check: max 5 requests per token per 60 seconds
    const { rateLimiter } = await import("@/lib/rateLimit");
    const tokenRateLimitKey = `token:${token}`;
    const tokenRateLimit = rateLimiter.check(tokenRateLimitKey, 5, 60000); // 5 per minute per token
    if (!tokenRateLimit.allowed) {
      // CRITICAL FIX (ChatGPT): Log redaction - only log last 6 chars of token
      const tokenSuffix = token.slice(-6);
      console.warn(`[input-session] Rate limit exceeded for token: ...${tokenSuffix}`, {
        requestId,
        tokenSuffix: `...${tokenSuffix}`,
      });
      return NextResponse.json(
        {
          ok: false,
          error: "Too many requests for this token. Please try again later.",
          code: "TOKEN_RATE_LIMIT_EXCEEDED",
        },
        {
          status: 429,
          headers: {
            "X-Request-ID": requestId,
            "Retry-After": Math.ceil((tokenRateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // CRITICAL FIX (ChatGPT): Log redaction - never log full token
    const tokenSuffix = token.slice(-6);
    console.log(`[input-session] GET request for token: ...${tokenSuffix}`, {
      requestId,
      tokenSuffix: `...${tokenSuffix}`,
    });

    // If Supabase is not configured, return mock data for mock tokens
    if (!supabase) {
      if (token.startsWith("mock_token_")) {
        return NextResponse.json(
          {
            ok: true,
            data: {
              input: {
                name: "Test User",
                dob: "1990-01-01",
                tob: "12:00",
                place: "Mumbai, Maharashtra, India",
                latitude: 19.0760,
                longitude: 72.8777,
                gender: "Male",
              },
              reportType: "life-summary",
            },
            requestId,
            mock: true,
          },
          {
            headers: {
              "X-Request-ID": requestId,
              "Cache-Control": "no-cache",
            },
          }
        );
      }
      return NextResponse.json(
        { ok: false, error: "Input session storage not configured" },
        { status: 503, headers: { "X-Request-ID": requestId } }
      );
    }

    // Fetch from Supabase
    const { data, error } = await supabase
      .from("ai_input_sessions")
      .select("*")
      .eq("token", token)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: "Invalid or expired token", code: "TOKEN_NOT_FOUND" },
        { status: 404, headers: { "X-Request-ID": requestId } }
      );
    }

    // CRITICAL FIX (ChatGPT): Check expiration
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      // Delete expired token
      await supabase.from("ai_input_sessions").delete().eq("token", token);
      console.warn(`[input-session] Expired token rejected: ...${tokenSuffix}`, { requestId, tokenSuffix: `...${tokenSuffix}` });
      return NextResponse.json(
        { ok: false, error: "Token has expired. Please start again.", code: "TOKEN_EXPIRED" },
        { status: 410, headers: { "X-Request-ID": requestId } }
      );
    }

    // CRITICAL FIX (ChatGPT): Multi-use semantics (PRODUCTION BEHAVIOR - NOT OPTIONAL)
    // Token can be used multiple times within 30-minute TTL
    // This allows legitimate retries (e.g., preview page refresh) without breaking
    // consumed_at is NOT set/checked, so token can be reused until expiration
    // 
    // Rationale: 
    // - Preview page may refresh during generation
    // - User may navigate back/forward
    // - One-time semantics would break legitimate use cases
    // - TTL (30 minutes) provides sufficient security for temporary PII

    // CRITICAL FIX (ChatGPT): Return only minimal data needed by preview page
    // Don't return extra fields that could leak PII
    const payload = data.payload as {
      input: AIAstrologyInput;
      reportType?: string;
      bundleType?: string;
      bundleReports?: string[];
    };

    // Only return what preview page needs (input + reportType + bundle info)
    const minimalPayload = {
      input: payload.input,
      reportType: payload.reportType,
      bundleType: payload.bundleType,
      bundleReports: payload.bundleReports,
    };

    return NextResponse.json(
      {
        ok: true,
        data: minimalPayload, // Only return minimal data, not full payload
        requestId,
      },
      {
        headers: {
          "X-Request-ID": requestId,
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (error: any) {
    // CRITICAL FIX (ChatGPT): Log redaction - never log full token in errors
    const tokenSuffix = token ? token.slice(-6) : "N/A";
    console.error(`[input-session] GET error for token: ...${tokenSuffix}`, {
      requestId,
      tokenSuffix: `...${tokenSuffix}`,
      errorMessage: error.message || "Unknown error",
    });
    const errorResponse = handleApiError(error);
    errorResponse.headers.set("X-Request-ID", requestId);
    return errorResponse;
  }
}

