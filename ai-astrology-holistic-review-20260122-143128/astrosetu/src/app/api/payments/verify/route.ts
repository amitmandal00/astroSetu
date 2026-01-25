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

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/payments/verify');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 5 * 1024); // 5KB max
    
    const supabase = createServerClient();
    const authUser = await getAuthenticatedUser(supabase);
    if (!authUser) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    
    // Validate payment verification data
    const validated = PaymentVerificationSchema.parse({
      razorpay_order_id: json.orderId,
      razorpay_payment_id: json.paymentId,
      razorpay_signature: json.signature,
    });
    
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = validated;
    const amount = json.amount;
    
    // Validate amount if provided
    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount <= 0 || amount > 1000000) {
        return NextResponse.json({ ok: false, error: "Invalid amount" }, { status: 400 });
      }
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
        if (paymentDetails.status !== "captured" && paymentDetails.status !== "authorized") {
          return NextResponse.json({ ok: false, error: "Payment not successful" }, { status: 400 });
        }
      } catch (error) {
        console.error("Error fetching payment details:", error);
        // Continue with verification if fetch fails
      }
    }

    // Calculate amount in paise
    const amountPaise = Math.round((amount || 0) * 100);

    // Create transaction in database
    const { data: transaction, error: txnError } = await supabase
      .from("transactions")
      .insert({
        user_id: authUser.id,
        type: "credit",
        amount: amountPaise,
        description: "Wallet Recharge",
        metadata: {
          order_id: orderId,
          payment_id: paymentId,
          signature,
          status: paymentDetails?.status || "captured",
          verified: true,
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
        orderId,
        paymentId,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

