import { NextResponse } from "next/server";
import { findMuhuratAPI } from "@/lib/astrologyAPI";
import type { Muhurat } from "@/types/astrology";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";

const VALID_MUHURAT_TYPES = ["Marriage", "House Warming", "Vehicle Purchase", "Business Start", "Travel"];

export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/astrology/muhurat');
    if (rateLimitResponse) return rateLimitResponse;
    
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
    const type = (searchParams.get("type") ?? "Marriage") as Muhurat["type"];
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ ok: false, error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }
    
    // Validate muhurat type
    if (!VALID_MUHURAT_TYPES.includes(type)) {
      return NextResponse.json({ ok: false, error: `Invalid muhurat type. Must be one of: ${VALID_MUHURAT_TYPES.join(", ")}` }, { status: 400 });
    }
    
    const data = await findMuhuratAPI(date, type);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}

