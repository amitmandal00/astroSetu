import { NextResponse } from "next/server";
import { getTransitChart } from "@/lib/westernAstrologyAPI";
import type { BirthDetails } from "@/types/astrology";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";

/**
 * POST /api/astrology/transit
 * Get Transit Chart (Current planetary transits affecting natal chart)
 */
export async function POST(req: Request) {
  const requestId = generateRequestId();
  
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/astrology/transit');
    if (rateLimitResponse) {
      rateLimitResponse.headers.set('X-Request-ID', requestId);
      return rateLimitResponse;
    }
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 10 * 1024);
    
    // Parse and validate request body
    const json = await parseJsonBody<{ birthDetails: BirthDetails; transitDate?: string }>(req);
    
    if (!json.birthDetails) {
      return NextResponse.json(
        { ok: false, error: "Missing required field: birthDetails" },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }
    
    if (!json.birthDetails.dob || !json.birthDetails.tob || !json.birthDetails.place) {
      return NextResponse.json(
        { ok: false, error: "birthDetails missing required fields: dob, tob, place" },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }
    
    const transitDate = json.transitDate || new Date().toISOString().slice(0, 10);
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(transitDate)) {
      return NextResponse.json(
        { ok: false, error: "Invalid transitDate format. Use YYYY-MM-DD" },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }
    
    const data = await getTransitChart(json.birthDetails, transitDate);
    
    return NextResponse.json(
      { ok: true, data },
      { headers: { 'X-Request-ID': requestId } }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

