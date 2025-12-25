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
    
    // Validate input using schema
    const validated = LoginSchema.parse({
      email: json.email,
      password: json.password,
      rememberMe: json.rememberMe,
    });
    
    // Sanitize email
    const email = sanitizeEmail(validated.email);
    const password = validated.password;
    const rememberMe = validated.rememberMe;

    // Demo mode: If Supabase is not configured, return mock user
    if (!isSupabaseConfigured()) {
      // Try to get existing user data from a simple in-memory store or use "User" as default
      // In a real app, this would come from a database
      return NextResponse.json({
        ok: true,
        data: {
          id: `demo-user-${email.replace(/[^a-zA-Z0-9]/g, '-')}`,
          email,
          name: "User", // Default to "User" instead of email username
          phone: null,
          createdAt: Date.now(),
          savedKundlis: [],
          savedMatches: [],
          birthDetails: null,
        },
      });
    }

    const supabase = createServerClient();

    // For demo mode: if no password, create/get user with magic link
    if (!password) {
      // Check if user exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === email);

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

      // Create new user for demo
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: `demo-${Date.now()}`,
          options: {
            data: {
              name: "User", // Default name instead of email username
            },
          },
        });

        if (authError) {
          // If signup fails, return demo user anyway
          return NextResponse.json({
            ok: true,
            data: {
              id: `demo-user-${email.replace(/[^a-zA-Z0-9]/g, '-')}`,
              email,
              name: "User", // Default name instead of email username
              phone: null,
              createdAt: Date.now(),
              savedKundlis: [],
              savedMatches: [],
              birthDetails: null,
            },
          });
        }

        if (!authData.user) {
          // If no user created, return demo user
          return NextResponse.json({
            ok: true,
            data: {
              id: `demo-user-${email.replace(/[^a-zA-Z0-9]/g, '-')}`,
              email,
              name: "User", // Default name instead of email username
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
            email: authData.user.email,
            name: authData.user.user_metadata?.name || "User", // Use metadata name or default to "User"
            phone: null,
            createdAt: new Date(authData.user.created_at).getTime(),
            savedKundlis: [],
            savedMatches: [],
            birthDetails: null,
          },
        });
      } catch (e: any) {
        // If Supabase fails, return demo user
        return NextResponse.json({
          ok: true,
          data: {
            id: `demo-user-${email.replace(/[^a-zA-Z0-9]/g, '-')}`,
            email,
            name: email.split("@")[0],
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
      email,
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

