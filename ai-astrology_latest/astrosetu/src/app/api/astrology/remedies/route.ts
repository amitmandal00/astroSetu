import { NextResponse } from "next/server";
import { getRemediesAPI } from "@/lib/astrologyAPI";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";

const VALID_PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
const VALID_ISSUES = ["general", "health", "career", "finance", "marriage", "education"];

export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/astrology/remedies');
    if (rateLimitResponse) return rateLimitResponse;
    
    const { searchParams } = new URL(req.url);
    const planet = searchParams.get("planet") ?? "Saturn";
    const issue = searchParams.get("issue") ?? "general";
    
    // Validate planet
    if (!VALID_PLANETS.includes(planet)) {
      return NextResponse.json({ ok: false, error: `Invalid planet. Must be one of: ${VALID_PLANETS.join(", ")}` }, { status: 400 });
    }
    
    // Validate issue
    if (!VALID_ISSUES.includes(issue)) {
      return NextResponse.json({ ok: false, error: `Invalid issue. Must be one of: ${VALID_ISSUES.join(", ")}` }, { status: 400 });
    }
    
    const data = await getRemediesAPI(planet, issue);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}

