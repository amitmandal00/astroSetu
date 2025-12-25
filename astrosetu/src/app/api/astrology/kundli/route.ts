import { NextResponse } from "next/server";
import { BirthDetailsSchema } from "@/lib/validators";
import { getKundli } from "@/lib/astrologyAPI";
import type { BirthDetails } from "@/types/astrology";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";

export async function POST(req: Request) {
  const requestId = generateRequestId();
  
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/astrology/kundli');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 10 * 1024); // 10KB max
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    
    // Normalize the input - convert day/month/year to dob and hours/minutes/seconds to tob if needed
    let normalized: BirthDetails;
    
    if (json.dob && json.tob) {
      // Old format - already has dob and tob
      normalized = {
        name: json.name,
        gender: json.gender,
        dob: json.dob,
        tob: json.tob,
        place: json.place,
        latitude: json.latitude,
        longitude: json.longitude,
        timezone: json.timezone
      };
    } else if (json.day && json.month && json.year && json.hours !== undefined && json.minutes !== undefined) {
      // New format - convert to dob and tob
      const monthStr = String(json.month).padStart(2, "0");
      const dayStr = String(json.day).padStart(2, "0");
      const dob = `${json.year}-${monthStr}-${dayStr}`;
      const hoursStr = String(json.hours).padStart(2, "0");
      const minutesStr = String(json.minutes).padStart(2, "0");
      const secondsStr = json.seconds !== undefined ? String(json.seconds).padStart(2, "0") : "00";
      const tob = `${hoursStr}:${minutesStr}:${secondsStr}`;
      
      normalized = {
        name: json.name,
        gender: json.gender,
        dob,
        tob,
        place: json.place,
        day: json.day,
        month: json.month,
        year: json.year,
        hours: json.hours,
        minutes: json.minutes,
        seconds: json.seconds || 0,
        latitude: json.latitude,
        longitude: json.longitude,
        timezone: json.timezone,
        ayanamsa: json.ayanamsa || 1 // Default to Lahiri (matches AstroSage)
      };
    } else {
      throw new Error("Invalid input format");
    }
    
    const input = BirthDetailsSchema.parse(normalized) as BirthDetails;
        
    const result = await getKundli(input);
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
