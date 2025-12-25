import { NextResponse } from "next/server";
import { getHoroscope } from "@/lib/astrologyAPI";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";

const VALID_SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const VALID_MODES = ["daily", "weekly", "monthly", "yearly"];
const VALID_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/astrology/horoscope');
    if (rateLimitResponse) return rateLimitResponse;
    
    const { searchParams } = new URL(req.url);
    const mode = (searchParams.get("mode") ?? "daily").toLowerCase() as "daily" | "weekly" | "monthly" | "yearly";
    const sign = searchParams.get("sign") ?? "Aries";
    const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
    const month = searchParams.get("month") ?? new Date().toLocaleString("en-US", { month: "long" });
    const year = Number(searchParams.get("year")) || new Date().getFullYear();
    
    // Validate mode
    if (!VALID_MODES.includes(mode)) {
      return NextResponse.json({ ok: false, error: `Invalid mode. Must be one of: ${VALID_MODES.join(", ")}` }, { status: 400 });
    }
    
    // Validate sign
    if (!VALID_SIGNS.includes(sign)) {
      return NextResponse.json({ ok: false, error: `Invalid sign. Must be one of: ${VALID_SIGNS.join(", ")}` }, { status: 400 });
    }
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ ok: false, error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }
    
    // Validate month
    if (month && !VALID_MONTHS.includes(month)) {
      return NextResponse.json({ ok: false, error: `Invalid month. Must be one of: ${VALID_MONTHS.join(", ")}` }, { status: 400 });
    }
    
    // Validate year
    if (isNaN(year) || year < 1900 || year > 2100) {
      return NextResponse.json({ ok: false, error: "Invalid year. Must be between 1900 and 2100" }, { status: 400 });
    }

    const data = await getHoroscope(mode, sign, date, month, year);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}
