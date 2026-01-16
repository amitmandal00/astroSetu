import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { getRazorpayInstance, isRazorpayConfigured } from "@/lib/razorpay";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { z } from "zod";

const UPIStatusSchema = z.object({
  orderId: z.string().min(1).max(100),
});

async function getAuthenticatedUser(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/payments/check-upi-status');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 1 * 1024); // 1KB max
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    const validated = UPIStatusSchema.parse({
      orderId: json.orderId,
    });
    
    const { orderId } = validated;

    // Check authentication
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const authUser = await getAuthenticatedUser(supabase);
      if (!authUser) {
        return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
      }
    }

    // Check payment status from Razorpay
    if (isRazorpayConfigured()) {
      try {
        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.fetch(orderId);
        
        // Check if order has payments
        const payments = await razorpay.orders.fetchPayments(orderId);
        
        if (payments && payments.items && payments.items.length > 0) {
          const payment = payments.items[0];
          if (payment.status === "captured" || payment.status === "authorized") {
            return NextResponse.json({
              ok: true,
              data: {
                status: "paid",
                success: true,
                paymentId: payment.id
              }
            });
          }
        }

        return NextResponse.json({
          ok: true,
          data: {
            status: "pending",
            success: false
          }
        });
      } catch (e: any) {
        return NextResponse.json({ ok: false, error: e?.message ?? "Failed to check status" }, { status: 400 });
      }
    }

    // Mock mode - return pending
    return NextResponse.json({
      ok: true,
      data: {
        status: "pending",
        success: false
      },
      mock: true
    });
  } catch (error) {
    return handleApiError(error);
  }
}

