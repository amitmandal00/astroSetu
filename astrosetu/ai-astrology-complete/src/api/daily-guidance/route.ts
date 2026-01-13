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

    // Check for MOCK_MODE
    if (process.env.MOCK_MODE === "true") {
      // Return mock enhanced monthly outlook structure
      const mockGuidance = {
        date: date || new Date().toISOString().split("T")[0],
        input,
        todayGoodFor: [],
        avoidToday: [],
        actions: [],
        planetaryInfluence: "",
        guidance: "This month emphasizes balance between personal growth and professional commitments. Planetary influences suggest focusing on communication and relationship harmony. Consider reflecting on long-term goals while maintaining daily routines.",
        focusAreas: {
          mindset: "This month favors clear thinking and deliberate decision-making. Mental clarity improves when you take time for reflection.",
          work: "Professional progress benefits from collaboration and clear communication. Focus on one key project at a time.",
          relationships: "Open dialogue and patience support stronger connections this month. Listen actively and express needs directly.",
          energy: "Balance activity with rest to maintain steady energy levels. Protect time for recovery and renewal.",
        },
        helpfulThisMonth: [
          "Plan conversations carefully and write things down to ensure clarity",
          "Revisit unfinished ideas and projects that deserve attention",
        ],
        beMindfulOf: [
          "Overloading your schedule with too many commitments",
          "Jumping to conclusions without gathering full information",
        ],
        reflectionPrompt: "What conversation or decision deserves more clarity this month?",
      };

      // Simulate slow generation
      await new Promise(resolve => setTimeout(resolve, 1000));

      return NextResponse.json(
        {
          ok: true,
          data: mockGuidance,
          requestId,
        },
        {
          headers: {
            "X-Request-ID": requestId,
            "Cache-Control": "public, max-age=3600",
          },
        }
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

