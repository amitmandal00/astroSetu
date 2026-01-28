import { NextResponse } from "next/server";
import { isAPIConfigured } from "@/lib/astrologyAPI";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";

/**
 * GET /api/astrology/config
 * Returns whether Prokerala API is configured
 */
export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/astrology/config');
    if (rateLimitResponse) return rateLimitResponse;
    
    return NextResponse.json({
      ok: true,
      data: {
        configured: isAPIConfigured(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

