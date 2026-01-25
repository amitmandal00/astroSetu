import { NextResponse } from "next/server";
import { getInauspiciousPeriod } from "@/lib/prokeralaEnhanced";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";

/**
 * GET /api/astrology/inauspicious-period
 * Get inauspicious periods (Rahu Kalam, Yamagandam, Gulika Kalam, etc.)
 */
export async function GET(req: Request) {
  const requestId = generateRequestId();
  
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/astrology/inauspicious-period');
    if (rateLimitResponse) {
      rateLimitResponse.headers.set('X-Request-ID', requestId);
      return rateLimitResponse;
    }
    
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");
    const place = searchParams.get("place") ?? "Delhi";
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ ok: false, error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }
    
    // Validate coordinates if provided
    let lat: number | undefined;
    let lon: number | undefined;
    
    if (latitude) {
      lat = Number(latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return NextResponse.json({ ok: false, error: "Invalid latitude" }, { status: 400 });
      }
    }
    
    if (longitude) {
      lon = Number(longitude);
      if (isNaN(lon) || lon < -180 || lon > 180) {
        return NextResponse.json({ ok: false, error: "Invalid longitude" }, { status: 400 });
      }
    }
    
    // Default coordinates if not provided (Delhi)
    const location = {
      latitude: lat ?? 28.6139,
      longitude: lon ?? 77.2090,
    };
    
    const result = await getInauspiciousPeriod(location, date);
    
    if (!result) {
      return NextResponse.json(
        { ok: false, error: "Inauspicious period data not available" },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { ok: true, data: result, requestId },
      {
        headers: {
          'X-Request-ID': requestId,
          'Cache-Control': 'public, max-age=3600', // 1 hour (changes daily)
        },
      }
    );
  } catch (error) {
    const errorResponse = handleApiError(error);
    errorResponse.headers.set('X-Request-ID', requestId);
    return errorResponse;
  }
}

