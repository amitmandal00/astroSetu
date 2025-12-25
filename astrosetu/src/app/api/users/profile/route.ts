import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { BirthDetailsSchema } from "@/lib/validators";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { UserProfileUpdateSchema, BirthDetailsUpdateSchema, sanitizeEmail, sanitizePhone } from "@/lib/validation";

async function getAuthenticatedUser(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/users/profile');
    if (rateLimitResponse) return rateLimitResponse;
    
    const supabase = createServerClient();
    const authUser = await getAuthenticatedUser(supabase);
    if (!authUser) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

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

export async function PATCH(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/users/profile');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 5 * 1024); // 5KB max
    
    // Support both Supabase and demo mode
    const isSupabaseConfigured = () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      return !!(url && key && url !== 'https://example.supabase.co' && url !== 'https://placeholder.supabase.co');
    };

    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    
    // Validate input using schema
    const validated = UserProfileUpdateSchema.parse({
      name: json.name,
      phone: json.phone,
      email: json.email,
    });

    // Sanitize inputs
    const name = validated.name ? validated.name.trim().slice(0, 100) : undefined;
    const cleanPhone = validated.phone ? sanitizePhone(validated.phone) : undefined;
    const email = validated.email ? sanitizeEmail(validated.email) : undefined;

    // Demo mode: Update localStorage session
    if (!isSupabaseConfigured()) {
      // In demo mode, we need to get the actual user ID from the request
      // For now, return updated user data - the client will handle localStorage update
      const userId = json.userId || "demo-user";
      return NextResponse.json({
        ok: true,
        data: {
          id: userId,
          email: json.email || "demo@astrosetu.com",
          name: name || "User", // Use provided name or default to "User"
          phone: cleanPhone || null,
          createdAt: Date.now(),
          savedKundlis: [],
          savedMatches: [],
          birthDetails: null,
        },
      });
    }

    const supabase = createServerClient();
    const authUser = await getAuthenticatedUser(supabase);
    if (!authUser) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        name: name || undefined,
        phone: cleanPhone || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authUser.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: authUser.id,
        email: authUser.email,
        name: profile?.name || name,
        phone: profile?.phone || cleanPhone,
        createdAt: new Date(authUser.created_at).getTime(),
        savedKundlis: [],
        savedMatches: [],
        birthDetails: profile?.birth_details || null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/users/profile');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 10 * 1024); // 10KB max
    
    const supabase = createServerClient();
    const authUser = await getAuthenticatedUser(supabase);
    if (!authUser) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

    // Parse and validate request body
    const json = await parseJsonBody(req);
    
    // Validate birth details using schema
    const birthDetails = BirthDetailsSchema.parse(json);

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        birth_details: birthDetails,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authUser.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: authUser.id,
        email: authUser.email,
        name: profile?.name || authUser.user_metadata?.name || "User",
        phone: profile?.phone || authUser.user_metadata?.phone || null,
        createdAt: new Date(authUser.created_at).getTime(),
        savedKundlis: [],
        savedMatches: [],
        birthDetails: profile?.birth_details || null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

