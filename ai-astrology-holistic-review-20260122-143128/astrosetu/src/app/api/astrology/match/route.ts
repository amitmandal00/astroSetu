import { NextResponse } from "next/server";
import { MatchSchema } from "@/lib/validators";
import { matchKundliAPI } from "@/lib/astrologyAPI";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/astrology/match');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 20 * 1024); // 20KB max
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    
    // Validate input using schema
    const input = MatchSchema.parse(json);
    const result = await matchKundliAPI(input.a as any, input.b as any);
    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
