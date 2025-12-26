import { NextResponse } from "next/server";
import { getSynastryChart } from "@/lib/westernAstrologyAPI";
import type { BirthDetails } from "@/types/astrology";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";

/**
 * POST /api/astrology/synastry
 * Get Synastry Chart (Compatibility between two Western charts)
 */
export async function POST(req: Request) {
  const requestId = generateRequestId();
  
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/astrology/synastry');
    if (rateLimitResponse) {
      rateLimitResponse.headers.set('X-Request-ID', requestId);
      return rateLimitResponse;
    }
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 20 * 1024);
    
    // Parse and validate request body
    const json = await parseJsonBody<{ personA: BirthDetails; personB: BirthDetails }>(req);
    
    if (!json.personA || !json.personB) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: personA, personB" },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }
    
    if (!json.personA.dob || !json.personA.tob || !json.personA.place) {
      return NextResponse.json(
        { ok: false, error: "personA missing required fields: dob, tob, place" },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }
    
    if (!json.personB.dob || !json.personB.tob || !json.personB.place) {
      return NextResponse.json(
        { ok: false, error: "personB missing required fields: dob, tob, place" },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }
    
    const data = await getSynastryChart(json.personA, json.personB);
    
    return NextResponse.json(
      { ok: true, data },
      { headers: { 'X-Request-ID': requestId } }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

