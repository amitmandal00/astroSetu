import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";

/**
 * GET /api/astrology/config
 * Returns whether the local astrology engine is available
 */
export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/astrology/config');
    if (rateLimitResponse) return rateLimitResponse;
    
    return NextResponse.json({
      ok: true,
      data: {
        configured: true,
        engine: "local",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

