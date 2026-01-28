import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { BirthDetailsSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/reports/general');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 10 * 1024); // 10KB max
    
    // Parse and validate request body
    const body = await parseJsonBody(req);
    const validated = BirthDetailsSchema.parse(body);
    const { dob, tob, place } = validated;

    const overview = `Based on your birth chart analysis, this period brings a mix of opportunities and challenges. Your planetary positions indicate growth in several areas, with some areas requiring more attention. Overall, this is a favorable time for personal and professional development.`;

    const predictions = {
      shortTerm: "The next 3-6 months show positive trends in career and relationships. Focus on building connections and exploring new opportunities. Health remains stable with proper care.",
      mediumTerm: "The 6-12 month period brings significant developments in financial matters and career growth. This is a good time for investments and long-term planning. Relationships deepen with understanding.",
      longTerm: "The next 1-2 years indicate major life changes and transformations. Career advancement is likely, along with improvements in health and family harmony. This period sets the foundation for future success.",
    };

    const areas = {
      career: "Career prospects are bright with opportunities for growth and advancement. Current planetary positions favor leadership roles and new projects. Focus on skill development and networking. Important career decisions should be made during favorable periods.",
      health: "Overall health is stable, but pay attention to preventive care. Regular exercise and a balanced diet are essential. Some minor health issues may arise but can be managed with proper care. Regular health checkups are recommended.",
      relationships: "Relationships are harmonious with improved understanding and communication. This is a good time to strengthen bonds with family and friends. New relationships may form, and existing ones deepen. Focus on empathy and patience.",
      finance: "Financial situation is improving gradually. Current transits favor gains through hard work and smart investments. Avoid impulsive spending and focus on savings. Long-term investments will be beneficial. Some unexpected expenses may occur but can be managed.",
      family: "Family life is harmonious with better understanding among members. This is a good time for family gatherings and strengthening bonds. Some family-related decisions may need attention. Support from family members will be available when needed.",
      education: "Educational pursuits are favored with good learning opportunities. Students will perform well in studies. This is an excellent time for acquiring new skills and knowledge. Educational investments will yield positive results.",
    };

    const importantPeriods = [
      {
        period: "March - May 2025",
        event: "Career Advancement Period",
        significance: "Favorable for job changes, promotions, and new career opportunities. Focus on professional growth.",
      },
      {
        period: "June - August 2025",
        event: "Financial Growth Period",
        significance: "Good time for investments and financial planning. Gains through business and investments are likely.",
      },
      {
        period: "September - November 2025",
        event: "Relationship Harmony Period",
        significance: "Excellent time for strengthening relationships and resolving conflicts. New meaningful connections may form.",
      },
    ];

    const remedies = [
      "Chant daily prayers and mantras for overall well-being",
      "Perform regular charity and help those in need",
      "Wear gemstones as per your birth chart (consult an astrologer)",
      "Follow a balanced lifestyle with proper diet and exercise",
      "Practice meditation and yoga for mental peace",
      "Respect elders and seek their blessings",
    ];

    return NextResponse.json({
      ok: true,
      data: {
        overview,
        predictions,
        areas,
        importantPeriods,
        remedies,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

