import { NextResponse } from "next/server";
import { astrologers } from "@/lib/mockAstrologers";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";

export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/astrologers');
    if (rateLimitResponse) return rateLimitResponse;
    
    return NextResponse.json({ ok: true, data: astrologers });
  } catch (error) {
    return handleApiError(error);
  }
}
