import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";

export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/auth/me');
    if (rateLimitResponse) return rateLimitResponse;
    
    const supabase = createServerClient();
    
    // Get user from session
    let authUser = null;
    let authError = null;
    
    try {
      const result = await supabase.auth.getUser();
      authUser = result.data?.user || null;
      authError = result.error || null;
    } catch (err: any) {
      authError = { message: err?.message || "Not authenticated" };
    }

    if (authError || !authUser) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Profile fetch error:", profileError);
    }

    // Get saved reports count
    const { count: kundliCount } = await supabase
      .from("saved_reports")
      .select("*", { count: "exact", head: true })
      .eq("user_id", authUser.id)
      .eq("type", "kundli");

    const { count: matchCount } = await supabase
      .from("saved_reports")
      .select("*", { count: "exact", head: true })
      .eq("user_id", authUser.id)
      .eq("type", "match");

    return NextResponse.json({
      ok: true,
      data: {
        id: authUser.id,
        email: authUser.email,
        name: profile?.name || authUser.user_metadata?.name || "User",
        phone: profile?.phone || authUser.user_metadata?.phone || null,
        createdAt: new Date(authUser.created_at).getTime(),
        savedKundlis: Array(kundliCount || 0).fill(null),
        savedMatches: Array(matchCount || 0).fill(null),
        birthDetails: profile?.birth_details || null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

