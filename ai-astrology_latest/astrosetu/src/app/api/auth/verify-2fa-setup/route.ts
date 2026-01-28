import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { verifyTOTP } from "@/lib/totp";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { z } from "zod";

const Verify2FASetupSchema = z.object({
  secret: z.string().min(16).max(100),
  code: z.string().length(6).regex(/^\d{6}$/),
});

async function getAuthenticatedUser(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Verify 2FA setup by checking the TOTP code
 * POST /api/auth/verify-2fa-setup
 * Body: { secret, code }
 */
export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/auth/verify-2fa-setup');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 1 * 1024); // 1KB max
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    const validated = Verify2FASetupSchema.parse({
      secret: json.secret,
      code: json.code,
    });
    
    const { secret, code } = validated;

    // Verify the TOTP code
    const isValid = verifyTOTP(code, secret);

    if (!isValid) {
      return NextResponse.json({ ok: false, error: "Invalid verification code" }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      // Demo mode: Return success
      return NextResponse.json({
        ok: true,
        data: {
          message: "2FA setup verified successfully",
          enabled: true,
        },
      });
    }

    const supabase = createServerClient();
    const user = await getAuthenticatedUser(supabase);
    
    if (!user) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    // Store the secret in the user's profile
    // In production, encrypt the secret before storing
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        two_factor_secret: secret, // In production, encrypt this
        two_factor_enabled: true,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to save 2FA secret:", updateError);
      return NextResponse.json({ ok: false, error: "Failed to enable 2FA" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      data: {
        message: "2FA enabled successfully",
        enabled: true,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

