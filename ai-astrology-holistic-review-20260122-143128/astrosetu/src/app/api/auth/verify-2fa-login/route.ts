import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { verifyTOTP } from "@/lib/totp";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { z } from "zod";

const Verify2FALoginSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email().optional(),
  code: z.string().length(6).regex(/^\d{6}$/),
}).refine((data) => data.userId || data.email, {
  message: "Either userId or email is required",
});

/**
 * Verify 2FA code during login
 * POST /api/auth/verify-2fa-login
 * Body: { userId, code }
 */
export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/auth/verify-2fa-login');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 1 * 1024); // 1KB max
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    const validated = Verify2FALoginSchema.parse({
      userId: json.userId,
      email: json.email,
      code: json.code,
    });
    
    const { userId, code, email } = validated;

    if (!isSupabaseConfigured()) {
      // Demo mode: Accept any 6-digit code if user has 2FA enabled
      // In production, retrieve secret from database
      return NextResponse.json({
        ok: true,
        data: {
          verified: /^\d{6}$/.test(code),
          message: "2FA verified",
        },
      });
    }

    const supabase = createServerClient();

    // Find user
    let user;
    if (userId) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } else if (email) {
      // Find user by email (for login flow)
      const { data: { users } } = await supabase.auth.admin.listUsers();
      user = users?.find(u => u.email === email);
    }

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // Get user's 2FA secret from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("two_factor_secret, two_factor_enabled")
      .eq("id", user.id)
      .single();

    if (!profile?.two_factor_enabled || !profile?.two_factor_secret) {
      return NextResponse.json({ ok: false, error: "2FA not enabled for this account" }, { status: 400 });
    }

    // Verify TOTP code
    const isValid = verifyTOTP(code, profile.two_factor_secret);

    if (!isValid) {
      return NextResponse.json({ ok: false, error: "Invalid 2FA code" }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      data: {
        verified: true,
        message: "2FA verified successfully",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

