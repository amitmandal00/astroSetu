import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { verifyPaymentSignature, getPaymentDetails, isRazorpayConfigured } from "@/lib/razorpay";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { PaymentVerificationSchema } from "@/lib/validation";

async function getAuthenticatedUser(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * This endpoint is kept for backward compatibility
 * New payments should use /api/payments/verify
 */
export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/wallet/add-money');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 5 * 1024); // 5KB max
    
    const supabase = createServerClient();
    const authUser = await getAuthenticatedUser(supabase);
    if (!authUser) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    const { amount, payment_id, order_id, signature } = json;
    
    // Validate amount
    if (typeof amount !== 'number' || amount <= 0 || amount > 1000000) {
      return NextResponse.json({ ok: false, error: "Invalid amount" }, { status: 400 });
    }
    
    // Validate payment verification if provided
    if (order_id && payment_id && signature) {
      try {
        PaymentVerificationSchema.parse({
          razorpay_order_id: order_id,
          razorpay_payment_id: payment_id,
          razorpay_signature: signature,
        });
      } catch (error) {
        return NextResponse.json({ ok: false, error: "Invalid payment verification data" }, { status: 400 });
      }
    }

    // Verify payment if Razorpay is configured
    if (isRazorpayConfigured() && order_id && payment_id && signature) {
      const isValid = verifyPaymentSignature(order_id, payment_id, signature);
      if (!isValid) {
        return NextResponse.json({ ok: false, error: "Invalid payment signature" }, { status: 400 });
      }

      // Fetch payment details
      try {
        const paymentDetails = await getPaymentDetails(payment_id);
        if (paymentDetails.status !== "captured" && paymentDetails.status !== "authorized") {
          return NextResponse.json({ ok: false, error: "Payment not successful" }, { status: 400 });
        }
      } catch (error) {
        console.error("Error fetching payment details:", error);
      }
    }

    const amountPaise = Math.round(amount * 100);

    const { data: transaction, error: txnError } = await supabase
      .from("transactions")
      .insert({
        user_id: authUser.id,
        type: "credit",
        amount: amountPaise,
        description: "Wallet Recharge",
        metadata: {
          payment_id,
          order_id,
          signature,
          verified: isRazorpayConfigured(),
        },
      })
      .select()
      .single();

    if (txnError) {
      return NextResponse.json({ ok: false, error: txnError.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount / 100,
        description: transaction.description,
        timestamp: new Date(transaction.created_at).getTime(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

