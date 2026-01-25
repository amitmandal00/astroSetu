import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/apiHelpers";

async function getAuthenticatedUser(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/subscriptions/status');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Check authentication
    let userId: string | null = null;
    
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const authUser = await getAuthenticatedUser(supabase);
      if (authUser) {
        userId = authUser.id;
      }
    }
    
    // Allow session-based auth for development
    const url = new URL(req.url);
    const bodyUserId = url.searchParams.get("userId");
    if (!userId && bodyUserId) {
      userId = bodyUserId;
    }
    
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }
    
    // Get subscription status
    if (isSupabaseConfigured()) {
      try {
        const supabase = createServerClient();
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "active")
          .order("activated_at", { ascending: false })
          .limit(1)
          .single();
        
        if (subscription) {
          const expiresAt = new Date(subscription.expires_at);
          const now = new Date();
          const isActive = expiresAt > now;
          
          return NextResponse.json({
            ok: true,
            data: {
              isActive,
              plan: subscription.plan,
              period: subscription.period,
              activatedAt: subscription.activated_at,
              expiresAt: subscription.expires_at,
              daysRemaining: isActive ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0,
            },
          });
        }
      } catch (error) {
        // No subscription found or error
      }
    }
    
    // No active subscription
    return NextResponse.json({
      ok: true,
      data: {
        isActive: false,
        plan: null,
        period: null,
        activatedAt: null,
        expiresAt: null,
        daysRemaining: 0,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Failed to get subscription status" }, { status: 400 });
  }
}
