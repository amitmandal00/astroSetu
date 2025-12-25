import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { BirthDetailsSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/reports/gochar');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 10 * 1024); // 10KB max
    
    // Parse and validate request body
    const body = await parseJsonBody(req);
    const validated = BirthDetailsSchema.parse(body);
    const { dob, tob, place } = validated;

    // Mock transit data (in production, use real astrology API)
    const currentTransits = [
      {
        planet: "Jupiter",
        currentSign: "Aries",
        currentHouse: 5,
        effect: "Jupiter in 5th house brings opportunities in education, creativity, and children. Good time for learning new skills and creative pursuits.",
        duration: "Until May 2025",
        remedies: ["Chant Guru Mantra daily", "Donate yellow items on Thursdays", "Wear Yellow Sapphire"],
      },
      {
        planet: "Saturn",
        currentSign: "Aquarius",
        currentHouse: 11,
        effect: "Saturn in 11th house indicates gains through hard work and discipline. Focus on long-term goals and networking.",
        duration: "Until March 2025",
        remedies: ["Chant Shani Mantra", "Donate black items on Saturdays", "Serve elderly people"],
      },
      {
        planet: "Rahu",
        currentSign: "Pisces",
        currentHouse: 12,
        effect: "Rahu in 12th house brings spiritual growth and may cause some expenses. Good time for meditation and spiritual practices.",
        duration: "Until April 2025",
        remedies: ["Chant Rahu Mantra", "Donate blue items", "Practice meditation"],
      },
      {
        planet: "Ketu",
        currentSign: "Virgo",
        currentHouse: 6,
        effect: "Ketu in 6th house helps overcome enemies and health issues. Focus on service and helping others.",
        duration: "Until April 2025",
        remedies: ["Chant Ketu Mantra", "Donate to charity", "Practice yoga"],
      },
    ];

    const predictions = {
      career: "Current transits favor career growth, especially in creative and educational fields. Jupiter's influence brings new opportunities. Focus on skill development and networking.",
      health: "Overall health is stable. Saturn's influence suggests maintaining discipline in health routines. Pay attention to chronic issues and follow a regular exercise regimen.",
      relationships: "Relationships are harmonious with Jupiter's positive influence. Good time for strengthening bonds with family and friends. New relationships may form through social activities.",
      finance: "Financial situation is improving gradually. Saturn's influence suggests gains through hard work. Avoid impulsive spending and focus on savings and investments.",
      education: "Excellent time for learning and education. Jupiter's transit favors students and those pursuing knowledge. New courses or certifications will be beneficial.",
    };

    const summary = `Based on your birth chart and current planetary transits, this period brings mixed influences. Jupiter's positive transit favors growth in education and creativity, while Saturn's influence emphasizes discipline and hard work. Overall, this is a favorable time for personal and professional development.`;

    return NextResponse.json({
      ok: true,
      data: {
        currentTransits,
        predictions,
        summary,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

