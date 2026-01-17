import { NextRequest, NextResponse } from "next/server";
import { matchAllowlist } from "@/lib/betaAccess";
import { generateRequestId } from "@/lib/requestId";

/**
 * Private Beta Access Verification API
 * POST /api/beta-access/verify
 * 
 * Verifies user input against allowlist and sets HttpOnly cookie if matched
 * Returns 200 with { ok: true } if access granted
 * Returns 401 with { ok: false, error: "access_denied" } if not matched
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    // Parse request body
    const body = await req.json();
    const { name, dob, time, place, gender, returnTo } = body;

    // Validate required fields
    if (!name || !dob || !time || !place || !gender) {
      return NextResponse.json(
        { ok: false, error: "missing_fields", message: "All fields are required" },
        { status: 400, headers: { "X-Request-ID": requestId } }
      );
    }

    // Check if private beta gating is enabled
    const privateBetaEnabled = process.env.NEXT_PUBLIC_PRIVATE_BETA === "true";
    if (!privateBetaEnabled) {
      // If gating is disabled, allow all requests (development/preview)
      return NextResponse.json(
        { ok: true, accessGranted: true, message: "Beta access not required" },
        { status: 200, headers: { "X-Request-ID": requestId } }
      );
    }

    // Match against allowlist (server-side only)
    const hasAccess = matchAllowlist({ name, dob, time, place, gender });

    // Log verification attempt (server-side, minimal PII)
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const ipHash = ip.split(",")[0].trim(); // Use first IP if multiple
    console.log(`[BETA_ACCESS] ok=${hasAccess}, requestId=${requestId}, ip=${ipHash}`);

    if (!hasAccess) {
      // Access denied: don't set cookie, return generic error
      return NextResponse.json(
        { ok: false, error: "access_denied", message: "Access not granted" },
        { status: 401, headers: { "X-Request-ID": requestId } }
      );
    }

    // Access granted: set HttpOnly cookie (TTL 7 days)
    const response = NextResponse.json(
      { ok: true, accessGranted: true, message: "Access granted" },
      { status: 200, headers: { "X-Request-ID": requestId } }
    );

    // Set HttpOnly cookie with 7-day TTL
    const cookieMaxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    response.cookies.set("beta_access", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: cookieMaxAge,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error(`[BETA_ACCESS] Verification error:`, {
      requestId,
      errorMessage: error.message || "Unknown error",
    });
    
    return NextResponse.json(
      { ok: false, error: "verification_failed", message: "Verification failed. Please try again." },
      { status: 500, headers: { "X-Request-ID": requestId } }
    );
  }
}

