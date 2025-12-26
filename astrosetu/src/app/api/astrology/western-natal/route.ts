import { NextResponse } from "next/server";
import { getWesternNatalChart } from "@/lib/westernAstrologyAPI";
import type { BirthDetails } from "@/types/astrology";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";

/**
 * POST /api/astrology/western-natal
 * Get Western Astrology Natal Chart
 */
export async function POST(req: Request) {
  const requestId = generateRequestId();
  
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/astrology/western-natal');
    if (rateLimitResponse) {
      rateLimitResponse.headers.set('X-Request-ID', requestId);
      return rateLimitResponse;
    }
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 10 * 1024);
    
    // Parse and validate request body
    const json = await parseJsonBody<BirthDetails>(req);
    
    if (!json.dob || !json.tob || !json.place) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: dob, tob, place" },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }
    
    const data = await getWesternNatalChart(json);
    
    return NextResponse.json(
      { ok: true, data },
      { headers: { 'X-Request-ID': requestId } }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

