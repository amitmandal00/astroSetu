import { NextResponse } from "next/server";
import { getPanchangAPI } from "@/lib/astrologyAPI";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";

/**
 * GET /api/astrology/diagnostic
 * Diagnostic endpoint for local astrology engine
 */
export async function GET(req: Request) {
  try {
    const rateLimitResponse = checkRateLimit(req, "/api/astrology/diagnostic");
    if (rateLimitResponse) return rateLimitResponse;

    const today = new Date().toISOString().slice(0, 10);
    const samplePanchang = await getPanchangAPI(today, "Delhi");

    return NextResponse.json({
      ok: true,
      engine: "local",
      configured: true,
      sample: {
        date: today,
        panchang: samplePanchang,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

