import { NextResponse } from "next/server";
import { getAuspiciousPeriods } from "@/lib/auspiciousPeriodAPI";
import type { AuspiciousPeriodCalculator } from "@/types/astrology";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";

/**
 * POST /api/astrology/auspicious-period
 * Find best dates for events over a date range
 */
export async function POST(req: Request) {
  const requestId = generateRequestId();
  
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/astrology/auspicious-period');
    if (rateLimitResponse) {
      rateLimitResponse.headers.set('X-Request-ID', requestId);
      return rateLimitResponse;
    }
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 10 * 1024); // 10KB max
    
    // Parse and validate request body
    const json = await parseJsonBody<{
      eventType: AuspiciousPeriodCalculator["eventType"];
      startDate: string;
      endDate: string;
      place: string;
      latitude?: number;
      longitude?: number;
      timezone?: string;
    }>(req);
    
    // Validate required fields
    if (!json.eventType || !json.startDate || !json.endDate || !json.place) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: eventType, startDate, endDate, place" },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(json.startDate) || !dateRegex.test(json.endDate)) {
      return NextResponse.json(
        { ok: false, error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }
    
    // Validate date range
    const start = new Date(json.startDate);
    const end = new Date(json.endDate);
    if (start > end) {
      return NextResponse.json(
        { ok: false, error: "startDate must be before or equal to endDate" },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }
    
    // Validate date range length (max 90 days for free tier, can be adjusted)
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 90) {
      return NextResponse.json(
        { ok: false, error: "Date range cannot exceed 90 days" },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }
    
    // Get auspicious periods
    const data = await getAuspiciousPeriods({
      eventType: json.eventType,
      startDate: json.startDate,
      endDate: json.endDate,
      place: json.place,
      latitude: json.latitude,
      longitude: json.longitude,
      timezone: json.timezone,
    });
    
    return NextResponse.json(
      { ok: true, data },
      { headers: { 'X-Request-ID': requestId } }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

