import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { BirthDetailsSchema } from "@/lib/validators";
import { z } from "zod";

const LoveHoroscopeRequestSchema = BirthDetailsSchema.and(
  z.object({
    relationshipStatus: z.enum(["single", "relationship", "marriage"]),
  })
);

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/reports/love');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 10 * 1024); // 10KB max
    
    // Parse and validate request body
    const body = await parseJsonBody(req);
    const validated = LoveHoroscopeRequestSchema.parse(body);
    const { dob, tob, place, relationshipStatus } = validated;

    const overview = `Based on your birth chart, your love life is influenced by Venus (planet of love) and the 7th house (house of partnerships). Current planetary transits favor relationships and emotional connections. Your romantic life shows positive trends with opportunities for meaningful connections.`;

    const currentStatus = relationshipStatus === "single"
      ? "You are currently single, and the stars indicate favorable timing for meeting someone special. Focus on self-improvement and be open to new connections."
      : relationshipStatus === "relationship"
      ? "You are in a relationship, and current planetary influences support harmony and growth. This is a good time to deepen your bond and plan for the future."
      : "You are married, and the current period favors marital harmony and understanding. Focus on communication and mutual respect to strengthen your bond.";

    const predictions = {
      single: "The coming months show excellent opportunities for meeting someone special. Social activities and gatherings will be favorable. Be open to new connections and trust your intuition. A meaningful relationship may form through friends or social circles.",
      relationship: "Your current relationship is entering a positive phase. Communication improves and understanding deepens. This is a good time to discuss future plans and make important decisions together. Some minor challenges may arise but can be resolved with patience.",
      marriage: "Marital life is harmonious with improved understanding between partners. This period favors family planning and making important life decisions together. Focus on spending quality time and expressing your feelings. Some adjustments may be needed but will strengthen your bond.",
    };

    const compatibility = {
      bestMatches: ["Taurus", "Cancer", "Libra", "Scorpio", "Pisces"],
      challengingMatches: ["Aries", "Gemini", "Sagittarius"],
    };

    const timing = {
      favorablePeriods: [
        {
          period: "March - May 2025",
          event: "Excellent time for new relationships and deepening existing bonds",
        },
        {
          period: "September - November 2025",
          event: "Favorable for marriage and commitment decisions",
        },
      ],
      importantDates: [
        "Valentine's Day 2025",
        "Your birthday month",
        "Venus transit periods",
        "Auspicious dates in your calendar",
      ],
    };

    const advice = [
      "Be patient and don't rush into relationships",
      "Communicate openly and honestly with your partner",
      "Focus on self-love and personal growth",
      "Trust your intuition in matters of the heart",
      "Respect your partner's feelings and boundaries",
      "Plan romantic gestures and quality time together",
    ];

    const remedies = [
      "Chant Venus Mantra: 'Om Shukraya Namah' daily",
      "Wear white flowers or white clothes on Fridays",
      "Donate white items (white cloth, rice, sugar) on Fridays",
      "Perform Venus Puja on Fridays",
      "Wear Diamond or White Sapphire (consult astrologer)",
      "Strengthen relationships with family and friends",
    ];

    return NextResponse.json({
      ok: true,
      data: {
        overview,
        currentStatus,
        predictions,
        compatibility,
        timing,
        advice,
        remedies,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

