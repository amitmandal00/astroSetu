import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { OTPVerifySchema, sanitizePhone } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    // Rate limiting (stricter for OTP verification)
    const rateLimitResponse = checkRateLimit(req, '/api/auth/verify-otp');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 2 * 1024); // 2KB max
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    
    // Validate input using schema
    const validated = OTPVerifySchema.parse({
      phone: json.phone,
      otp: json.otp,
    });
    
    // Sanitize phone number
    const phone = sanitizePhone(validated.phone);
    const otp = validated.otp;

    // Demo mode: Accept any 6-digit OTP
    if (!isSupabaseConfigured()) {
      if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        return NextResponse.json({ ok: false, error: "Invalid OTP format" }, { status: 400 });
      }

      // In demo mode, accept OTP "123456" or any 6 digits
      // In production, verify against stored OTP
      const isValid = otp === "123456" || /^\d{6}$/.test(otp);
      
      if (!isValid) {
        return NextResponse.json({ ok: false, error: "Invalid OTP" }, { status: 401 });
      }

      // Create or get user
      return NextResponse.json({
        ok: true,
        data: {
          id: `demo-user-${phone.replace(/\D/g, '')}`,
          email: `${phone.replace(/\D/g, '')}@astrosetu.com`,
          name: phone.replace(/\D/g, ''),
          phone,
          createdAt: Date.now(),
          savedKundlis: [],
          savedMatches: [],
          birthDetails: null,
        },
      });
    }

    // Production: Verify OTP from database/cache
    // const storedOTP = await getOTP(phone);
    // if (!storedOTP || storedOTP !== otp || storedOTP.expired) {
    //   return NextResponse.json({ ok: false, error: "Invalid or expired OTP" }, { status: 401 });
    // }
    // await deleteOTP(phone);

    // Find or create user by phone
    const supabase = createServerClient();
    
    // Check if user exists with this phone
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => 
      u.user_metadata?.phone === phone || u.phone === phone
    );

    if (existingUser) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", existingUser.id)
        .single();

      return NextResponse.json({
        ok: true,
        data: {
          id: existingUser.id,
          email: existingUser.email || `${phone}@astrosetu.com`,
          name: profile?.name || existingUser.user_metadata?.name || phone,
          phone,
          createdAt: new Date(existingUser.created_at).getTime(),
          savedKundlis: [],
          savedMatches: [],
          birthDetails: profile?.birth_details || null,
        },
      });
    }

    // Create new user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `${phone.replace(/\D/g, '')}@astrosetu.com`,
      password: `otp-${Date.now()}`,
      phone,
      options: {
        data: {
          name: phone,
          phone,
        },
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json({ ok: false, error: "Failed to create user" }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: authData.user.id,
        email: authData.user.email || `${phone}@astrosetu.com`,
        name: phone,
        phone,
        createdAt: new Date(authData.user.created_at).getTime(),
        savedKundlis: [],
        savedMatches: [],
        birthDetails: null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

