import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { verifyPaymentSignature, getPaymentDetails, isRazorpayConfigured } from "@/lib/razorpay";
import { checkRateLimit, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";

async function getAuthenticatedUser(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/subscriptions/verify');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 5 * 1024);
    
    const supabase = createServerClient();
    const authUser = await getAuthenticatedUser(supabase);
    
    // Allow session-based auth for development
    const json = await parseJsonBody<Record<string, any>>(req);
    const userId = authUser?.id || json.userId;
    
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }
    
    // Validate payment verification data
    const { orderId, paymentId, signature, plan } = json;
    
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ ok: false, error: "Missing payment verification data" }, { status: 400 });
    }
    
    // Verify payment signature
    const isValid = verifyPaymentSignature(orderId, paymentId, signature);
    
    if (!isValid && isRazorpayConfigured()) {
      return NextResponse.json({ ok: false, error: "Invalid payment signature" }, { status: 400 });
    }
    
    // Fetch payment details from Razorpay (if configured)
    let paymentDetails = null;
    if (isRazorpayConfigured()) {
      try {
        paymentDetails = await getPaymentDetails(paymentId);
      } catch (error) {
        console.error("Failed to fetch payment details:", error);
      }
    }
    
    // Calculate subscription expiry
    const now = new Date();
    const expiryDate = new Date(now);
    if (plan === "weekly") {
      expiryDate.setDate(now.getDate() + 7);
    } else if (plan === "yearly") {
      expiryDate.setFullYear(now.getFullYear() + 1);
    } else {
      expiryDate.setMonth(now.getMonth() + 1); // Default to monthly
    }
    
    // Update subscription status in database
    if (isSupabaseConfigured()) {
      try {
        // Find subscription by order_id
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("order_id", orderId)
          .single();
        
        if (subscription) {
          // Update existing subscription
          await supabase
            .from("subscriptions")
            .update({
              status: "active",
              payment_id: paymentId,
              activated_at: now.toISOString(),
              expires_at: expiryDate.toISOString(),
              metadata: {
                ...subscription.metadata,
                payment_details: paymentDetails,
                verified_at: now.toISOString(),
              },
            })
            .eq("id", subscription.id);
        } else {
          // Create new subscription if not found
          await supabase.from("subscriptions").insert({
            user_id: userId,
            order_id: orderId,
            payment_id: paymentId,
            plan: plan || "yearly",
            status: "active",
            activated_at: now.toISOString(),
            expires_at: expiryDate.toISOString(),
            metadata: {
              payment_details: paymentDetails,
              verified_at: now.toISOString(),
            },
          });
        }
      } catch (error) {
        console.error("Failed to update subscription:", error);
        // Continue even if DB update fails
      }
    }
    
    return NextResponse.json({
      ok: true,
      data: {
        subscriptionId: orderId,
        status: "active",
        expiresAt: expiryDate.toISOString(),
        plan: plan || "yearly",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Failed to verify subscription payment" }, { status: 400 });
  }
}
