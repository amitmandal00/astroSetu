import { NextResponse } from "next/server";
import { astrologers } from "@/lib/mockAstrologers";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/astrologers');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate astrologer ID
    if (!params.id || typeof params.id !== 'string' || params.id.length > 100) {
      return NextResponse.json({ ok: false, error: "Invalid astrologer ID" }, { status: 400 });
    }
    
    const a = astrologers.find(x => x.id === params.id);
    if (!a) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, data: a });
  } catch (error) {
    return handleApiError(error);
  }
}
