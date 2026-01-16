import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { z } from "zod";

const UPIInitiateSchema = z.object({
  orderId: z.string().min(1).max(100),
  upiId: z.string().regex(/^[\w.-]+@[\w]+$/, "Invalid UPI ID format"),
  amount: z.number().positive().max(1000000),
});

async function getAuthenticatedUser(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/payments/initiate-upi');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 2 * 1024); // 2KB max
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    const validated = UPIInitiateSchema.parse({
      orderId: json.orderId,
      upiId: json.upiId,
      amount: json.amount,
    });
    
    const { orderId, upiId, amount } = validated;

    // Check authentication
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const authUser = await getAuthenticatedUser(supabase);
      if (!authUser) {
        return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
      }
    }

    // In production, this would initiate UPI payment via Razorpay
    // For now, return success (mock mode)
    // In real implementation, you would:
    // 1. Create UPI payment intent with Razorpay
    // 2. Return payment URL or deep link
    // 3. User completes payment in UPI app
    // 4. Webhook verifies payment

    return NextResponse.json({
      ok: true,
      data: {
        success: true,
        message: "UPI payment initiated. Please complete payment in your UPI app.",
        // In production, this would be a real UPI deep link
        paymentUrl: `upi://pay?pa=${encodeURIComponent(upiId)}&am=${amount}&cu=INR&tn=AstroSetu%20Wallet%20Recharge`
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

