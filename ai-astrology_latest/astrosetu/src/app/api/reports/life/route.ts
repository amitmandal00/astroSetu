import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import type { KundliResult, DoshaAnalysis, KundliChart } from "@/types/astrology";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";

async function getAuthenticatedUser(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/reports/life');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 50 * 1024); // 50KB max for Kundli data
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    const { kundliData } = json;
    
    // Validate kundliData structure if provided
    if (kundliData && typeof kundliData !== 'object') {
      return NextResponse.json({ ok: false, error: "Invalid Kundli data format" }, { status: 400 });
    }

    // If Kundli data is provided, use it
    if (kundliData) {
      return NextResponse.json({
        ok: true,
        data: {
          kundli: kundliData,
          userName: kundliData.name || "User",
          generatedAt: new Date().toISOString(),
        },
      });
    }

    // Otherwise, try to get from authenticated user's saved Kundli
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ 
        ok: false, 
        error: "Please generate your Kundli first" 
      }, { status: 400 });
    }

    const supabase = createServerClient();
    const user = await getAuthenticatedUser(supabase);
    
    if (!user) {
      return NextResponse.json({ 
        ok: false, 
        error: "Not authenticated" 
      }, { status: 401 });
    }

    // Get user's saved Kundli from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("saved_kundlis, name")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.saved_kundlis || profile.saved_kundlis.length === 0) {
      return NextResponse.json({ 
        ok: false, 
        error: "No Kundli found. Please generate your Kundli first." 
      }, { status: 400 });
    }

    // Use the most recent Kundli
    const latestKundli = profile.saved_kundlis[profile.saved_kundlis.length - 1];

    return NextResponse.json({
      ok: true,
      data: {
        kundli: latestKundli,
        userName: profile.name || user.email?.split("@")[0] || "User",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

