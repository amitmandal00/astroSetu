import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/auth/logout');
    if (rateLimitResponse) return rateLimitResponse;
    
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      await supabase.auth.signOut();
    }
    
    // Note: Client-side session clearing is handled by the frontend
    // This endpoint just clears server-side session
    
    return NextResponse.json({ ok: true, message: "Logged out successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

