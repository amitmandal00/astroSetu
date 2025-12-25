import { NextResponse } from "next/server";
import { getPanchangAPI } from "@/lib/astrologyAPI";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";
import { validatePlace } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/astrology/panchang');
    if (rateLimitResponse) return rateLimitResponse;
    
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
    const place = searchParams.get("place") ?? "Delhi";
    
    // Validate place
    try {
      validatePlace(place);
    } catch (error) {
      return NextResponse.json({ ok: false, error: "Invalid place name" }, { status: 400 });
    }
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ ok: false, error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }
    
    // Validate coordinates if provided
    const latitude = searchParams.get("latitude") ? Number(searchParams.get("latitude")) : undefined;
    const longitude = searchParams.get("longitude") ? Number(searchParams.get("longitude")) : undefined;
    
    if (latitude !== undefined && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
      return NextResponse.json({ ok: false, error: "Invalid latitude" }, { status: 400 });
    }
    
    if (longitude !== undefined && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
      return NextResponse.json({ ok: false, error: "Invalid longitude" }, { status: 400 });
    }
    
    const data = await getPanchangAPI(date, place, latitude, longitude);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}

