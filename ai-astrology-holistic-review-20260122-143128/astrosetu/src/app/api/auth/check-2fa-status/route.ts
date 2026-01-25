import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";
import { sanitizeEmail } from "@/lib/validation";

async function getAuthenticatedUser(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Check if user has 2FA enabled
 * GET /api/auth/check-2fa-status?email=user@example.com
 */
export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/auth/check-2fa-status');
    if (rateLimitResponse) return rateLimitResponse;
    
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get("email");
    
    // Validate and sanitize email if provided
    const email = emailParam ? sanitizeEmail(emailParam) : null;

    if (!isSupabaseConfigured()) {
      // Demo mode: Check localStorage or return false
      return NextResponse.json({
        ok: true,
        data: {
          enabled: false,
          canSetup: true,
        },
      });
    }

    if (!email) {
      return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Find user by email
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users?.find(u => u.email === email);

    if (!user) {
      return NextResponse.json({
        ok: true,
        data: {
          enabled: false,
          canSetup: true,
        },
      });
    }

    // Check 2FA status from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("two_factor_enabled")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      ok: true,
      data: {
        enabled: profile?.two_factor_enabled || false,
        canSetup: true,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

