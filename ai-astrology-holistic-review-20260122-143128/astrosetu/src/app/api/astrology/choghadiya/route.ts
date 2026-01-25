import { NextResponse } from "next/server";
import { getChoghadiyaAPI } from "@/lib/astrologyAPI";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";

export async function POST(req: Request) {
  const requestId = generateRequestId();
  
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/astrology/choghadiya');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 10 * 1024); // 10KB max
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    
    const { date, place, latitude, longitude } = json;
    
    if (!date || !place) {
      return NextResponse.json(
        { ok: false, error: "Date and place are required" },
        { status: 400 }
      );
    }

    if (!latitude || !longitude) {
      return NextResponse.json(
        { ok: false, error: "Latitude and longitude are required for accurate Choghadiya calculations" },
        { status: 400 }
      );
    }
        
    const result = await getChoghadiyaAPI(date, place, latitude, longitude);
    
    return NextResponse.json(
      { ok: true, data: result, requestId },
      {
        headers: {
          'X-Request-ID': requestId,
          'Cache-Control': 'public, max-age=86400', // 24 hours
        },
      }
    );
  } catch (error) {
    const errorResponse = handleApiError(error);
    errorResponse.headers.set('X-Request-ID', requestId);
    return errorResponse;
  }
}

