import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";

/**
 * Hash input with HMAC using server-side salt
 */
function hmac(input: string): string {
  const salt = process.env.CONSENT_LOG_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "default-salt-change-in-production";
  return crypto
    .createHmac("sha256", salt)
    .update(input)
    .digest("hex");
}

/**
 * POST /api/consent
 * Log user consent for legal documents
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/consent');
    if (rateLimitResponse) {
      rateLimitResponse.headers.set('X-Request-ID', requestId);
      return rateLimitResponse;
    }

    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 10 * 1024); // 10KB max

    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);

    const {
      userId = null,
      sessionId,
      source = "web",
      consentType,
      granted,
      documentVersion,
      documentUrl,
      metadata = {}
    } = json;

    // Validation
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }

    if (!consentType || !["terms", "privacy", "cookies", "ai"].includes(consentType)) {
      return NextResponse.json(
        { error: "Invalid consentType. Must be one of: terms, privacy, cookies, ai" },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }

    if (typeof granted !== "boolean") {
      return NextResponse.json(
        { error: "granted must be a boolean" },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }

    if (!documentVersion || typeof documentVersion !== "string") {
      return NextResponse.json(
        { error: "documentVersion is required" },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }

    if (!documentUrl || typeof documentUrl !== "string") {
      return NextResponse.json(
        { error: "documentUrl is required" },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }

    // Get IP address and user agent for hashing
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "";

    const userAgent = req.headers.get("user-agent") || "";

    // Hash IP and user agent
    const ipHash = ip ? hmac(ip) : null;
    const userAgentHash = userAgent ? hmac(userAgent) : null;

    // Get Supabase client (server-side with service role key)
    const supabase = createServerClient();

    // Insert consent log
    const { error } = await supabase.from("consent_logs").insert({
      user_id: userId || null,
      session_id: sessionId,
      source: source || "web",
      consent_type: consentType,
      granted,
      document_version: documentVersion,
      document_url: documentUrl,
      ip_hash: ipHash,
      user_agent_hash: userAgentHash,
      metadata: metadata || {}
    });

    if (error) {
      console.error("Error inserting consent log:", error);
      return NextResponse.json(
        { error: "Failed to log consent", details: error.message },
        { status: 500, headers: { 'X-Request-ID': requestId } }
      );
    }

    return NextResponse.json(
      { ok: true },
      { headers: { 'X-Request-ID': requestId } }
    );
  } catch (error) {
    console.error("Consent logging error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { 'X-Request-ID': requestId } }
    );
  }
}

