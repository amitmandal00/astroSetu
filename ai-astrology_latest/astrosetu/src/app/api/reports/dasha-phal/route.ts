import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { BirthDetailsSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/reports/dasha-phal');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 10 * 1024); // 10KB max
    
    // Parse and validate request body
    const body = await parseJsonBody(req);
    const validated = BirthDetailsSchema.parse(body);
    const { dob, tob, place } = validated;

    // Mock Dasha data (in production, use real astrology calculations)
    const currentDasha = {
      planet: "Jupiter",
      period: "16 years",
      startDate: "January 2020",
      endDate: "January 2036",
      description: "Jupiter Dasha brings wisdom, knowledge, and spiritual growth. This is a favorable period for education, teaching, and spiritual pursuits. Jupiter's influence brings opportunities for expansion and growth in various areas of life.",
    };

    const antardashas = [
      {
        planet: "Jupiter",
        period: "1 year 7 months",
        startDate: "January 2020",
        endDate: "August 2021",
        effects: "Jupiter-Jupiter period brings excellent opportunities in education and career. Good time for starting new ventures and expanding business.",
      },
      {
        planet: "Saturn",
        period: "2 years 8 months",
        startDate: "August 2021",
        endDate: "April 2024",
        effects: "Jupiter-Saturn period brings discipline and hard work. Focus on long-term goals and avoid shortcuts. Some delays may occur but results will be lasting.",
      },
      {
        planet: "Mercury",
        period: "1 year 4 months",
        startDate: "April 2024",
        endDate: "August 2025",
        effects: "Jupiter-Mercury period favors communication, business, and learning. Good time for writing, teaching, and intellectual pursuits. Financial gains through business.",
      },
      {
        planet: "Ketu",
        period: "1 year 1 month",
        startDate: "August 2025",
        endDate: "September 2026",
        effects: "Jupiter-Ketu period brings spiritual growth and detachment. Focus on meditation and spiritual practices. Some unexpected changes may occur.",
      },
    ];

    const predictions = {
      career: "Jupiter Dasha favors career growth, especially in fields related to education, law, finance, and spirituality. Opportunities for promotion and recognition are likely. Teaching and advisory roles will be beneficial.",
      health: "Health remains stable during Jupiter Dasha. However, pay attention to liver, pancreas, and digestive system. Regular exercise and a balanced diet are essential. Avoid overindulgence.",
      relationships: "Relationships are harmonious with Jupiter's positive influence. Good time for marriage and strengthening family bonds. Relationships with teachers and mentors will be beneficial.",
      finance: "Financial situation improves gradually. Gains through investments, business, and inheritance are possible. Avoid speculative investments and focus on long-term financial planning.",
      education: "Excellent period for education and learning. Students will perform well. Good time for higher studies, research, and acquiring new knowledge. Teaching and sharing knowledge will be rewarding.",
    };

    const remedies = [
      "Chant Guru Mantra: 'Om Gram Greem Grom Sah Guruve Namah' daily",
      "Donate yellow items (yellow cloth, turmeric, yellow flowers) on Thursdays",
      "Wear Yellow Sapphire (Pukhraj) after consulting an astrologer",
      "Respect teachers and seek their blessings",
      "Read religious texts and spiritual books",
      "Perform Guru Puja on Thursdays",
    ];

    const nextDasha = {
      planet: "Saturn",
      startDate: "January 2036",
      preview: "Saturn Dasha will bring discipline, hard work, and karmic lessons. This period emphasizes responsibility and long-term planning. Focus on building strong foundations for future success.",
    };

    return NextResponse.json({
      ok: true,
      data: {
        currentDasha,
        antardashas,
        predictions,
        remedies,
        nextDasha,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

