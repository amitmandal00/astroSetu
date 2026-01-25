import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { verifyPaymentSignature, isRazorpayConfigured } from "@/lib/razorpay";
import { generateRequestId } from "@/lib/requestId";

/**
 * Webhook handler for Razorpay subscription payments
 * This endpoint should be configured in Razorpay dashboard:
 * Settings → Webhooks → Add Webhook URL
 * Events: payment.captured, payment.failed, order.paid
 */
export async function POST(req: Request) {
  const requestId = generateRequestId();
  
  try {
    // Get webhook signature from headers
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    
    if (!signature && isRazorpayConfigured()) {
      return NextResponse.json({ ok: false, error: "Missing signature" }, { status: 401 });
    }
    
    // Get raw body for signature verification
    const body = await req.text();
    
    // Verify webhook signature (if configured)
    if (isRazorpayConfigured() && webhookSecret) {
      const crypto = require("crypto");
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");
      
      if (signature !== expectedSignature) {
        console.error("[webhook] Invalid signature", { requestId });
        return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
      }
    }
    
    const payload = JSON.parse(body);
    const event = payload.event;
    
    console.log("[webhook] Received event:", event, { requestId });
    
    // Handle payment.captured event
    if (event === "payment.captured" || event === "order.paid") {
      const payment = payload.payload.payment?.entity || payload.payload.payment;
      const order = payload.payload.order?.entity || payload.payload.order;
      
      if (!payment || !order) {
        return NextResponse.json({ ok: false, error: "Missing payment or order data" }, { status: 400 });
      }
      
      const orderId = order.id;
      const paymentId = payment.id;
      const amount = payment.amount / 100; // Convert from paise
      const currency = payment.currency;
      
      // Find subscription by order_id
      if (isSupabaseConfigured()) {
        try {
          const supabase = createServerClient();
          const { data: subscription } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("order_id", orderId)
            .single();
          
          if (subscription) {
            // Calculate expiry based on plan
            const now = new Date();
            const expiryDate = new Date(now);
            if (subscription.plan === "weekly") {
              expiryDate.setDate(now.getDate() + 7);
            } else if (subscription.plan === "yearly") {
              expiryDate.setFullYear(now.getFullYear() + 1);
            }
            
            // Update subscription
            await supabase
              .from("subscriptions")
              .update({
                status: "active",
                payment_id: paymentId,
                activated_at: now.toISOString(),
                expires_at: expiryDate.toISOString(),
                metadata: {
                  ...subscription.metadata,
                  webhook_received: true,
                  webhook_event: event,
                  webhook_timestamp: now.toISOString(),
                },
              })
              .eq("id", subscription.id);
            
            console.log("[webhook] Subscription activated", { orderId, paymentId, requestId });
          }
        } catch (error) {
          console.error("[webhook] Failed to update subscription:", error, { requestId });
        }
      }
    }
    
    // Handle payment.failed event
    if (event === "payment.failed") {
      const payment = payload.payload.payment?.entity || payload.payload.payment;
      const orderId = payment?.order_id;
      
      if (orderId && isSupabaseConfigured()) {
        try {
          const supabase = createServerClient();
          await supabase
            .from("subscriptions")
            .update({
              status: "failed",
              metadata: {
                webhook_received: true,
                webhook_event: event,
                failure_reason: payment?.error_description || "Payment failed",
              },
            })
            .eq("order_id", orderId);
          
          console.log("[webhook] Subscription payment failed", { orderId, requestId });
        } catch (error) {
          console.error("[webhook] Failed to update failed subscription:", error, { requestId });
        }
      }
    }
    
    return NextResponse.json({ ok: true, requestId });
  } catch (e: any) {
    console.error("[webhook] Error processing webhook:", e, { requestId });
    return NextResponse.json({ ok: false, error: e?.message ?? "Webhook processing failed", requestId }, { status: 500 });
  }
}
