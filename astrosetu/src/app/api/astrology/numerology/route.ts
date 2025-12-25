import { NextResponse } from "next/server";
import { calculateNumerologyAPI } from "@/lib/astrologyAPI";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { z } from "zod";

const NumerologySchema = z.object({
  name: z.string().min(1).max(100),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/astrology/numerology');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 2 * 1024); // 2KB max
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    const validated = NumerologySchema.parse({
      name: json.name,
      dob: json.dob,
    });
    
    const data = await calculateNumerologyAPI(validated.name.trim(), validated.dob);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}

