import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError, parseJsonBody } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";
import { generateDailyGuidance } from "@/lib/ai-astrology/dailyGuidance";
import type { AIAstrologyInput } from "@/lib/ai-astrology/types";

/**
 * POST /api/ai-astrology/daily-guidance
 * Generate daily guidance for a subscriber
 */
export async function POST(req: Request) {
  const requestId = generateRequestId();

  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, "/api/ai-astrology/daily-guidance");
    if (rateLimitResponse) {
      rateLimitResponse.headers.set("X-Request-ID", requestId);
      return rateLimitResponse;
    }

    // Parse request body
    const json = await parseJsonBody<{
      input: AIAstrologyInput;
      date?: string; // Optional date (defaults to today)
    }>(req);

    const { input, date } = json;

    // Validate input
    if (!input.name || !input.dob || !input.tob || !input.place) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: name, dob, tob, place" },
        { status: 400 }
      );
    }

    if (!input.latitude || !input.longitude) {
      return NextResponse.json(
        { ok: false, error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Generate daily guidance
    const guidance = await generateDailyGuidance(input, date);

    return NextResponse.json(
      {
        ok: true,
        data: guidance,
        requestId,
      },
      {
        headers: {
          "X-Request-ID": requestId,
          "Cache-Control": "public, max-age=3600", // Cache for 1 hour (same day)
        },
      }
    );
  } catch (error) {
    const errorResponse = handleApiError(error);
    errorResponse.headers.set("X-Request-ID", requestId);
    return errorResponse;
  }
}

