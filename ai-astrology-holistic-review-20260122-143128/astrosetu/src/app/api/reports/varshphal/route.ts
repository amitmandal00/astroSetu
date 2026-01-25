import { NextResponse } from "next/server";
import type { KundliResult } from "@/types/astrology";

function generateVarshphalReport(kundli: KundliResult) {
  const currentYear = new Date().getFullYear();
  
  // Generate predictions based on planetary positions
  const predictions = [
    {
      area: "Career & Profession",
      prediction: `Your career shows ${kundli.planets.find(p => p.house === 10) ? "strong potential" : "moderate growth"} this year. Focus on building expertise and maintaining professional relationships.`,
      rating: (kundli.planets.find(p => p.house === 10)?.name === "Jupiter" || kundli.planets.find(p => p.house === 10)?.name === "Venus") ? "Excellent" : "Good" as const
    },
    {
      area: "Finance & Wealth",
      prediction: `Financial situation appears ${kundli.planets.find(p => p.house === 2 || p.house === 11) ? "favorable" : "stable"}. Avoid unnecessary expenses and focus on savings.`,
      rating: (kundli.planets.find(p => p.house === 2)?.name === "Jupiter") ? "Excellent" : "Good" as const
    },
    {
      area: "Health & Wellbeing",
      prediction: `Health requires attention to ${kundli.planets.find(p => p.house === 6) ? "preventive care" : "overall wellness"}. Regular exercise and balanced diet recommended.`,
      rating: "Good" as const
    },
    {
      area: "Relationships & Marriage",
      prediction: `Relationships show ${kundli.planets.find(p => p.house === 7) ? "harmony" : "balance"}. Communication and understanding are key.`,
      rating: (kundli.planets.find(p => p.house === 7)?.name === "Venus") ? "Excellent" : "Good" as const
    },
    {
      area: "Education & Learning",
      prediction: `Educational pursuits are ${kundli.planets.find(p => p.house === 5 || p.house === 9) ? "favorable" : "moderate"}. Focus on skill development.`,
      rating: "Good" as const
    },
    {
      area: "Travel & Movement",
      prediction: `Travel opportunities may arise. ${kundli.planets.find(p => p.house === 9) ? "Long-distance travel favorable" : "Plan trips carefully"}.`,
      rating: "Average" as const
    }
  ];

  const favorableMonths = ["April", "May", "September", "October", "November"];
  const cautionMonths = ["January", "June", "December"];

  const remedies = [
    "Perform regular puja and prayers",
    "Chant planetary mantras daily",
    "Donate to charity on auspicious days",
    "Wear appropriate gemstones (after consultation)",
    "Follow spiritual practices",
    "Maintain positive attitude",
    "Help others and perform good deeds"
  ];

  return {
    year: currentYear,
    predictions,
    favorableMonths,
    cautionMonths,
    remedies
  };
}

import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/reports/varshphal');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 50 * 1024); // 50KB max
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    const { kundliData, name } = json;

    if (!kundliData || typeof kundliData !== 'object') {
      return NextResponse.json({ 
        ok: false, 
        error: "Kundli data is required" 
      }, { status: 400 });
    }

    const kundli = kundliData as KundliResult;
    const yearAnalysis = generateVarshphalReport(kundli);

    return NextResponse.json({
      ok: true,
      data: {
        kundli,
        yearAnalysis,
        userName: name || "User",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

