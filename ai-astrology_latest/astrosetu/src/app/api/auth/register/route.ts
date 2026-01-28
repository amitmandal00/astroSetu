import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { RegisterSchema, sanitizeEmail, sanitizePhone } from "@/lib/validation";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && url !== 'https://example.supabase.co' && url !== 'https://placeholder.supabase.co');
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/auth/register');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 5 * 1024); // 5KB max
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    
    // More lenient validation - like AstroSage/AstroTalk
    const emailInput = json.email?.trim() || "";
    const nameInput = json.name?.trim() || "";
    const phoneInput = json.phone?.trim() || "";
    const passwordInput = json.password?.trim() || undefined;
    
    if (!emailInput && !phoneInput) {
      return NextResponse.json({ ok: false, error: "Email or phone number is required" }, { status: 400 });
    }
    
    // Basic email format check (lenient for demo mode)
    let email: string | undefined;
    if (emailInput) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (passwordInput && passwordInput.length > 0 && !emailRegex.test(emailInput)) {
        return NextResponse.json({ ok: false, error: "Please enter a valid email address" }, { status: 400 });
      }
      email = sanitizeEmail(emailInput);
    }
    
    // Sanitize phone (same logic as OTP)
    let phone: string | undefined;
    if (phoneInput) {
      let phoneSanitized = phoneInput.replace(/[^\d+]/g, "");
      if (phoneSanitized.startsWith("0")) {
        phoneSanitized = phoneSanitized.substring(1);
      }
      if (phoneSanitized.length === 10 && !phoneSanitized.startsWith("+")) {
        phoneSanitized = "+91" + phoneSanitized;
      } else if (!phoneSanitized.startsWith("+") && phoneSanitized.length > 10) {
        phoneSanitized = "+" + phoneSanitized;
      }
      const digitsOnly = phoneSanitized.replace(/\D/g, '');
      if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
        phone = phoneSanitized;
      }
    }
    
    const name = nameInput ? nameInput.trim().slice(0, 100) : undefined;
    const password = passwordInput;

    // Demo mode: If Supabase is not configured, return mock user (like AstroSage)
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        ok: true,
        data: {
          id: `demo-user-${(email || phone || 'user').replace(/[^a-zA-Z0-9]/g, '-')}`,
          email: email || `${phone?.replace(/\D/g, '') || 'user'}@astrosetu.com`,
          name: name || (email ? email.split("@")[0] : (phone || "User")),
          phone: phone || null,
          createdAt: Date.now(),
          savedKundlis: [],
          savedMatches: [],
          birthDetails: null,
        },
      });
    }

    const supabase = createServerClient();

    // Sign up user with Supabase Auth
    let authData, authError;
    try {
      // Use email or generate from phone
      const userEmail = email || `${phone?.replace(/\D/g, '') || Date.now()}@astrosetu.com`;
      
      const result = await supabase.auth.signUp({
        email: userEmail,
        password: password || `temp-${Date.now()}`, // Generate temp password if not provided
        phone: phone || undefined,
        options: {
          data: {
            name: name || (email ? email.split("@")[0] : (phone || "User")),
            phone: phone || undefined,
          },
        },
      });
      authData = result.data;
      authError = result.error;
    } catch (e: any) {
      // If Supabase fails, return demo user (like AstroSage)
      return NextResponse.json({
        ok: true,
        data: {
          id: `demo-user-${(email || phone || 'user').replace(/[^a-zA-Z0-9]/g, '-')}`,
          email: email || `${phone?.replace(/\D/g, '') || 'user'}@astrosetu.com`,
          name: name || (email ? email.split("@")[0] : (phone || "User")),
          phone: phone || null,
          createdAt: Date.now(),
          savedKundlis: [],
          savedMatches: [],
          birthDetails: null,
        },
      });
    }

    if (authError) {
      // If user already exists, return demo user (like AstroSage - always succeeds)
      return NextResponse.json({
        ok: true,
        data: {
          id: `demo-user-${(email || phone || 'user').replace(/[^a-zA-Z0-9]/g, '-')}`,
          email: email || `${phone?.replace(/\D/g, '') || 'user'}@astrosetu.com`,
          name: name || (email ? email.split("@")[0] : (phone || "User")),
          phone: phone || null,
          createdAt: Date.now(),
          savedKundlis: [],
          savedMatches: [],
          birthDetails: null,
        },
      });
    }

    if (!authData.user) {
      // If no user created, return demo user (like AstroSage)
      return NextResponse.json({
        ok: true,
        data: {
          id: `demo-user-${(email || phone || 'user').replace(/[^a-zA-Z0-9]/g, '-')}`,
          email: email || `${phone?.replace(/\D/g, '') || 'user'}@astrosetu.com`,
          name: name || (email ? email.split("@")[0] : (phone || "User")),
          phone: phone || null,
          createdAt: Date.now(),
          savedKundlis: [],
          savedMatches: [],
          birthDetails: null,
        },
      });
    }

    // Profile is automatically created by trigger, but let's update it with name/phone
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ name: name || undefined, phone: phone || undefined })
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: authData.user.id,
        email: authData.user.email || email || `${phone?.replace(/\D/g, '')}@astrosetu.com`,
        name: name || authData.user.user_metadata?.name || (email ? email.split("@")[0] : (phone || "User")),
        phone: phone || null,
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

