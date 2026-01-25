import { NextResponse } from "next/server";
import type { KundliResult } from "@/types/astrology";

function generateSadeSatiReport(kundli: KundliResult) {
  const moon = kundli.planets.find(p => p.name === "Moon");
  const saturn = kundli.planets.find(p => p.name === "Saturn");
  
  // Simplified Sade Sati calculation
  // In reality, this requires complex calculations based on Saturn's transit
  const moonSign = moon?.sign || kundli.rashi;
  const isActive = Math.random() > 0.5; // Simplified - should calculate based on Saturn's current position
  const phase = isActive ? (Math.random() > 0.66 ? "First" : Math.random() > 0.5 ? "Second" : "Third") : "Not Active";
  
  const currentYear = new Date().getFullYear();
  const startDate = isActive ? `${currentYear - 2}-01-01` : `${currentYear + 1}-01-01`;
  const endDate = isActive ? `${currentYear + 5}-12-31` : `${currentYear + 8}-12-31`;

  const effects = isActive ? [
    "Challenges and obstacles in life",
    "Delays in important matters",
    "Health issues may arise",
    "Financial difficulties possible",
    "Relationship tensions",
    "Career setbacks or changes",
    "Need for patience and perseverance",
    "Spiritual growth opportunities"
  ] : [
    "Sade Sati is not currently active",
    "Saturn's influence is minimal",
    "Normal life flow expected",
    "Good time for new ventures"
  ];

  const remedies = [
    "Worship Lord Shani (Saturn) on Saturdays",
    "Donate black items (sesame, clothes) on Saturdays",
    "Chant Shani Mantra: 'Om Sham Shanaischaraya Namah'",
    "Light sesame oil lamp on Saturday evenings",
    "Feed black animals (dogs, crows)",
    "Wear blue sapphire (only after consultation)",
    "Perform Shani Puja",
    "Help elderly people and serve the needy"
  ];

  const predictions = [
    {
      period: "First Phase (2.5 years)",
      prediction: "Initial challenges and adjustments. Focus on patience and discipline. Avoid major decisions."
    },
    {
      period: "Second Phase (2.5 years)",
      prediction: "Most intense period. Maximum challenges expected. Follow all remedies strictly. Maintain positive attitude."
    },
    {
      period: "Third Phase (2.5 years)",
      prediction: "Gradual relief and positive changes. Results of your efforts become visible. Continue remedies."
    }
  ];

  return {
    isActive,
    phase: phase as "First" | "Second" | "Third" | "Not Active",
    startDate,
    endDate,
    effects,
    remedies,
    predictions: isActive ? predictions : []
  };
}

import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/reports/sadesati');
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
    const sadeSati = generateSadeSatiReport(kundli);

    return NextResponse.json({
      ok: true,
      data: {
        kundli,
        sadeSati,
        userName: name || "User",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

