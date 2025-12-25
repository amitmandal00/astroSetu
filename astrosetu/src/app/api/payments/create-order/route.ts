import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/razorpay";
import { checkRateLimit, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";

async function getAuthenticatedUser(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/payments/create-order');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 10 * 1024); // 10KB max
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    
    // Validate payment amount using schema
    const { RazorpayOrderSchema } = await import('@/lib/validation');
    const validated = RazorpayOrderSchema.parse({
      amount: json.amount,
      currency: json.currency || "INR",
      description: json.description,
      serviceId: json.serviceId,
      serviceName: json.serviceName,
    });
    
    const { amount, currency, description, serviceId, serviceName } = validated;
    const bodyUserId = json.userId;
    const bodyUserEmail = json.userEmail;
    
    // Check authentication - support both Supabase and session-based auth
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
    
    // If Supabase auth fails, use client-side session from request body
    if (!userId) {
      // For development, allow requests without strict auth if Supabase is not configured
      // OR if Supabase is configured but user is using client-side session
      if (!isSupabaseConfigured()) {
        // In development mode without Supabase, use userId from body or create mock
        if (bodyUserId) {
          userId = bodyUserId;
          userEmail = bodyUserEmail || null;
        } else {
          userId = "dev_user_" + Date.now();
          userEmail = "dev@example.com";
        }
      } else {
        // Supabase is configured but user is not authenticated via Supabase
        // Allow client-side session for development - use userId from body if provided
        if (bodyUserId) {
          userId = bodyUserId;
          userEmail = bodyUserEmail || null;
        } else {
          // No user info provided, return error
          return NextResponse.json({ ok: false, error: "Not authenticated. Please log in to continue." }, { status: 401 });
        }
      }
    }

    // Check if Razorpay is configured
    if (!isRazorpayConfigured()) {
      // In development, return mock order
      return NextResponse.json({
        ok: true,
        data: {
          id: `order_mock_${Date.now()}`,
          amount: Math.round(amount * 100),
          currency,
          receipt: `receipt_${Date.now()}`,
          status: "created",
        },
        mock: true, // Indicate this is a mock order
      });
    }

    // Create Razorpay order
    const receipt = `wallet_${userId}_${Date.now()}`;
    const order = await createRazorpayOrder(amount, currency, receipt);

    // Store order in database (optional, for tracking)
    if (isSupabaseConfigured() && userId) {
      try {
        const supabase = createServerClient();
        await supabase.from("transactions").insert({
          user_id: userId,
          type: serviceId ? "debit" : "credit",
          amount: order.amount,
          description: description || (serviceName ? `Purchase: ${serviceName}` : "Wallet Recharge"),
          metadata: {
            order_id: order.id,
            status: "pending",
            currency: order.currency,
            service_id: serviceId,
            service_name: serviceName,
          },
        });
      } catch (error) {
        // Ignore errors, order creation is more important
        console.error("Failed to store order in database:", error);
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
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Failed to create order" }, { status: 400 });
  }
}

