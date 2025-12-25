import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { BirthDetailsSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/reports/mangal-dosha');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 10 * 1024); // 10KB max
    
    // Parse and validate request body
    const body = await parseJsonBody(req);
    const validated = BirthDetailsSchema.parse(body);
    const { dob, tob, place } = validated;

    // Mock analysis (in production, use real astrology calculations)
    // For demo, randomly assign Manglik status
    const isManglik = Math.random() > 0.5;
    const severity = isManglik ? (Math.random() > 0.5 ? "High" : "Medium") : "None";

    const status: "Manglik" | "Non-Manglik" = isManglik ? "Manglik" : "Non-Manglik";

    const analysis = isManglik
      ? `Mars is placed in one of the Mangal Dosha houses (1st, 4th, 7th, 8th, or 12th) in your birth chart, indicating the presence of Mangal Dosha. The severity is ${severity.toLowerCase()}. This may affect marriage timing and marital harmony, but can be managed through appropriate remedies.`
      : `Mars is not placed in Mangal Dosha houses in your birth chart. You are Non-Manglik, which is favorable for marriage. No special remedies are required, but general astrological remedies can still be beneficial.`;

    const effects = isManglik
      ? [
          "May cause delays in marriage",
          "Can affect marital harmony if not addressed",
          "May cause conflicts in relationships",
          "Can be nullified by marrying another Manglik person",
          "Remedies can reduce the negative effects significantly",
        ]
      : [
          "No negative effects on marriage",
          "Favorable for marital harmony",
          "No delays expected in marriage",
          "Compatible with both Manglik and Non-Manglik partners",
        ];

    const remedies = isManglik
      ? [
          {
            type: "Mangal Dosha Puja",
            description: "Perform special puja to reduce Mangal Dosha effects",
            instructions: [
              "Perform Mangal Dosha Puja on Tuesdays",
              "Chant Mangal Mantra: 'Om Ang Angarkaya Namah'",
              "Offer red flowers and red cloth to Lord Hanuman",
              "Donate red items to needy people",
            ],
          },
          {
            type: "Gemstone Remedy",
            description: "Wear Red Coral (Moonga) gemstone",
            instructions: [
              "Wear Red Coral ring in ring finger",
              "Get it energized by a qualified astrologer",
              "Wear it on Tuesday morning",
              "Consult astrologer for proper weight and quality",
            ],
          },
          {
            type: "Marriage Compatibility",
            description: "Marry another Manglik person to nullify the dosha",
            instructions: [
              "Find a partner who also has Mangal Dosha",
              "Both partners should perform remedies",
              "Marriage ceremony should be performed on auspicious dates",
              "Consult an astrologer for best marriage timing",
            ],
          },
          {
            type: "Charity & Donation",
            description: "Regular charity helps reduce Mangal Dosha effects",
            instructions: [
              "Donate red items (red cloth, red lentils) on Tuesdays",
              "Help needy people and animals",
              "Donate to temples and religious institutions",
              "Feed the poor on Tuesdays",
            ],
          },
        ]
      : [
          {
            type: "General Remedies",
            description: "While you don't have Mangal Dosha, these general remedies can enhance your life",
            instructions: [
              "Chant daily prayers and mantras",
              "Perform regular puja and worship",
              "Follow a balanced lifestyle",
              "Respect elders and seek their blessings",
            ],
          },
        ];

    const marriageCompatibility = {
      withManglik: isManglik
        ? "Marrying another Manglik person is highly recommended as it nullifies the Mangal Dosha for both partners. This is considered the most effective remedy. Both partners should perform remedies together for best results."
        : "You can marry a Manglik person without any issues. Your Non-Manglik status will help balance the relationship. However, your partner should perform Mangal Dosha remedies.",
      withNonManglik: isManglik
        ? "Marrying a Non-Manglik person is possible but requires proper remedies. Both partners should perform Mangal Dosha remedies, and the marriage should be conducted on an auspicious date. Consult an astrologer for guidance."
        : "Marrying a Non-Manglik person is ideal and requires no special remedies. This combination is considered highly favorable for marital harmony and happiness.",
    };

    const importantNotes = [
      "Mangal Dosha is not a curse but a planetary influence that can be managed",
      "Remedies should be performed with faith and devotion",
      "Consult a qualified astrologer for personalized remedies",
      "Marriage timing is important - choose auspicious dates",
      "Both partners should understand and support each other",
      "Regular puja and prayers help reduce negative effects",
    ];

    return NextResponse.json({
      ok: true,
      data: {
        status,
        severity: severity as "High" | "Medium" | "Low" | "None",
        analysis,
        effects,
        remedies,
        marriageCompatibility,
        importantNotes,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

