import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/razorpay";
import { checkRateLimit, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { getCountryPricing, type CountryCode } from "@/lib/pricing";

async function getAuthenticatedUser(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/subscriptions/create');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 10 * 1024);
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    
    const { plan, countryCode } = json;
    
    if (!plan || !["weekly", "yearly"].includes(plan)) {
      return NextResponse.json({ ok: false, error: "Invalid plan. Must be 'weekly' or 'yearly'" }, { status: 400 });
    }
    
    // Get pricing for country
    const pricing = getCountryPricing((countryCode as CountryCode) || "IN");
    const selectedPlan = pricing.plans[plan as "weekly" | "yearly"];
    
    // Check authentication
    let userId: string | null = null;
    let userEmail: string | null = null;
    
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const authUser = await getAuthenticatedUser(supabase);
      if (authUser) {
        userId = authUser.id;
        userEmail = authUser.email || null;
      }
    }
    
    // For development, allow session-based auth
    if (!userId && json.userId) {
      userId = json.userId;
      userEmail = json.userEmail || null;
    }
    
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Not authenticated. Please log in to subscribe." }, { status: 401 });
    }
    
    // Check if user already has active subscription
    if (isSupabaseConfigured()) {
      try {
        const supabase = createServerClient();
        const { data: existing } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "active")
          .single();
        
        if (existing) {
          return NextResponse.json({ 
            ok: false, 
            error: "You already have an active subscription. Please cancel it first or wait for it to expire." 
          }, { status: 400 });
        }
      } catch (e) {
        // Ignore, continue with subscription creation
      }
    }
    
    // Check if Razorpay is configured
    if (!isRazorpayConfigured()) {
      // In development, return mock order
      return NextResponse.json({
        ok: true,
        data: {
          id: `order_sub_${Date.now()}`,
          amount: Math.round(selectedPlan.price * 100), // Convert to smallest currency unit
          currency: selectedPlan.currency,
          receipt: `sub_${userId}_${Date.now()}`,
          status: "created",
          plan: selectedPlan.name,
          period: selectedPlan.period,
        },
        mock: true,
      });
    }
    
    // Create Razorpay order
    const receipt = `sub_${userId}_${Date.now()}`;
    const order = await createRazorpayOrder(
      selectedPlan.price,
      selectedPlan.currency,
      receipt
    );
    
    // Store subscription order in database
    if (isSupabaseConfigured() && userId) {
      try {
        const supabase = createServerClient();
        await supabase.from("subscriptions").insert({
          user_id: userId,
          order_id: order.id,
          plan: plan,
          period: selectedPlan.period,
          amount: order.amount,
          currency: order.currency,
          status: "pending",
          country_code: countryCode || "IN",
          metadata: {
            receipt,
            created_at: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error("Failed to store subscription order:", error);
        // Continue even if DB insert fails
      }
    }
    
    return NextResponse.json({
      ok: true,
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        plan: selectedPlan.name,
        period: selectedPlan.period,
        price: selectedPlan.price,
        currencySymbol: pricing.currencySymbol,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Failed to create subscription order" }, { status: 400 });
  }
}
