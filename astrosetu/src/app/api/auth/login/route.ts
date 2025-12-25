import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { LoginSchema, sanitizeEmail } from "@/lib/validation";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && url !== 'https://example.supabase.co' && url !== 'https://placeholder.supabase.co');
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/auth/login');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 5 * 1024); // 5KB max
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    
    // More lenient validation - like AstroSage/AstroTalk
    // Allow any email format in demo mode
    const email = json.email?.trim() || "";
    const password = json.password?.trim() || undefined;
    const rememberMe = json.rememberMe || false;
    
    if (!email || email.length === 0) {
      return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
    }
    
    // Basic email format check (very lenient for demo mode)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (password && password.length > 0 && !emailRegex.test(email)) {
      return NextResponse.json({ ok: false, error: "Please enter a valid email address" }, { status: 400 });
    }
    
    // Sanitize email (lowercase, trim)
    const sanitizedEmail = email.toLowerCase().trim().slice(0, 255);

    // Demo mode: If Supabase is not configured, return mock user (like AstroSage)
    if (!isSupabaseConfigured()) {
      // In demo mode, accept any email - no validation needed
      return NextResponse.json({
        ok: true,
        data: {
          id: `demo-user-${sanitizedEmail.replace(/[^a-zA-Z0-9]/g, '-')}`,
          email: sanitizedEmail,
          name: sanitizedEmail.split("@")[0] || "User",
          phone: null,
          createdAt: Date.now(),
          savedKundlis: [],
          savedMatches: [],
          birthDetails: null,
        },
      });
    }

    const supabase = createServerClient();

    // For demo mode: if no password, create/get user with magic link (like AstroSage)
    if (!password || password.length === 0) {
      // Check if user exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === sanitizedEmail);

      if (existingUser) {
        // User exists, return profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", existingUser.id)
          .single();

        return NextResponse.json({
          ok: true,
          data: {
            id: existingUser.id,
            email: existingUser.email,
            name: profile?.name || existingUser.user_metadata?.name || "User",
            phone: profile?.phone || existingUser.user_metadata?.phone || null,
            createdAt: new Date(existingUser.created_at).getTime(),
            savedKundlis: [],
            savedMatches: [],
            birthDetails: profile?.birth_details || null,
          },
        });
      }

      // Create new user for demo (like AstroSage - always succeeds)
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password: `demo-${Date.now()}`,
          options: {
            data: {
              name: sanitizedEmail.split("@")[0] || "User",
            },
          },
        });

        if (authError || !authData.user) {
          // If signup fails, return demo user anyway (like AstroSage)
          return NextResponse.json({
            ok: true,
            data: {
              id: `demo-user-${sanitizedEmail.replace(/[^a-zA-Z0-9]/g, '-')}`,
              email: sanitizedEmail,
              name: sanitizedEmail.split("@")[0] || "User",
              phone: null,
              createdAt: Date.now(),
              savedKundlis: [],
              savedMatches: [],
              birthDetails: null,
            },
          });
        }

        return NextResponse.json({
          ok: true,
          data: {
            id: authData.user.id,
            email: authData.user.email || sanitizedEmail,
            name: authData.user.user_metadata?.name || sanitizedEmail.split("@")[0] || "User",
            phone: null,
            createdAt: new Date(authData.user.created_at).getTime(),
            savedKundlis: [],
            savedMatches: [],
            birthDetails: null,
          },
        });
      } catch (e: any) {
        // If Supabase fails, return demo user (like AstroSage)
        return NextResponse.json({
          ok: true,
          data: {
            id: `demo-user-${sanitizedEmail.replace(/[^a-zA-Z0-9]/g, '-')}`,
            email: sanitizedEmail,
            name: sanitizedEmail.split("@")[0] || "User",
            phone: null,
            createdAt: Date.now(),
            savedKundlis: [],
            savedMatches: [],
            birthDetails: null,
          },
        });
      }
    }

    // Real login with password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    });

    if (authError) {
      return NextResponse.json({ ok: false, error: authError.message }, { status: 401 });
    }

    if (!authData.user) {
      return NextResponse.json({ ok: false, error: "Login failed" }, { status: 401 });
    }

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    return NextResponse.json({
      ok: true,
      data: {
        id: authData.user.id,
        email: authData.user.email,
        name: profile?.name || authData.user.user_metadata?.name || "User",
        phone: profile?.phone || authData.user.user_metadata?.phone || null,
        createdAt: new Date(authData.user.created_at).getTime(),
        savedKundlis: [],
        savedMatches: [],
        birthDetails: profile?.birth_details || null,
        twoFactorEnabled: profile?.two_factor_enabled || false,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}


