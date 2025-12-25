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
    
    // Validate input using schema
    const validated = RegisterSchema.parse({
      email: json.email,
      password: json.password,
      name: json.name,
      phone: json.phone,
    });
    
    // Sanitize inputs
    const email = sanitizeEmail(validated.email);
    const name = validated.name ? validated.name.trim().slice(0, 100) : undefined;
    const phone = validated.phone ? sanitizePhone(validated.phone) : undefined;
    const password = validated.password;

    // Demo mode: If Supabase is not configured, return mock user
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        ok: true,
        data: {
          id: `demo-user-${email.replace(/[^a-zA-Z0-9]/g, '-')}`,
          email,
          name,
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
      const result = await supabase.auth.signUp({
        email,
        password: password || `temp-${Date.now()}`, // Generate temp password if not provided
        options: {
          data: {
            name: name || undefined,
            phone: phone || undefined,
          },
        },
      });
      authData = result.data;
      authError = result.error;
    } catch (e: any) {
      // If Supabase fails, return demo user
      return NextResponse.json({
        ok: true,
        data: {
          id: `demo-user-${email.replace(/[^a-zA-Z0-9]/g, '-')}`,
          email,
          name: name || "User",
          phone: phone || null,
          createdAt: Date.now(),
          savedKundlis: [],
          savedMatches: [],
          birthDetails: null,
        },
      });
    }

    if (authError) {
      // If user already exists, try to sign in instead
      if (authError.message.includes("already registered")) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: password || `temp-${Date.now()}`,
        });

        if (signInError) {
          return NextResponse.json({ ok: false, error: signInError.message }, { status: 400 });
        }

        // Get profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", signInData.user.id)
          .single();

        return NextResponse.json({
          ok: true,
          data: {
            id: signInData.user.id,
            email: signInData.user.email,
            name: profile?.name || name,
            phone: profile?.phone || phone,
            createdAt: new Date(signInData.user.created_at).getTime(),
            savedKundlis: [],
            savedMatches: [],
            birthDetails: profile?.birth_details || null,
          },
        });
      }

      return NextResponse.json({ ok: false, error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ ok: false, error: "Failed to create user" }, { status: 400 });
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
        email: authData.user.email,
        name: name || "User",
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

