import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";
import { isStripeConfigured } from "@/lib/ai-astrology/payments";
import { generatePaymentToken } from "@/lib/ai-astrology/paymentToken";

/**
 * GET /api/ai-astrology/verify-payment?session_id=xxx
 * Verify Stripe payment session
 */
export async function GET(req: Request) {
  const requestId = generateRequestId();

  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, "/api/ai-astrology/verify-payment");
    if (rateLimitResponse) {
      rateLimitResponse.headers.set("X-Request-ID", requestId);
      return rateLimitResponse;
    }

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Payment processing not configured" },
        { status: 503 }
      );
    }

    // Get session ID from query params
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: "session_id is required" },
        { status: 400 }
      );
    }

    // Dynamically import Stripe
    const stripe = (await import("stripe")).default(process.env.STRIPE_SECRET_KEY!);

    // Retrieve session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Session not found" },
        { status: 404 }
      );
    }

    // Check payment status
    const isPaid = session.payment_status === "paid";
    const isSubscription = session.mode === "subscription";
    const reportType = session.metadata?.reportType;

    // Generate payment token if payment is successful and it's a paid report
    let paymentToken: string | undefined;
    if (isPaid && reportType && reportType !== "subscription") {
      paymentToken = generatePaymentToken(reportType, session.id);
    }

    return NextResponse.json(
      {
        ok: true,
        data: {
          sessionId: session.id,
          paid: isPaid,
          paymentStatus: session.payment_status,
          subscription: isSubscription,
          reportType,
          paymentToken, // Include token for client to store
          customerEmail: session.customer_email,
          amountTotal: session.amount_total,
          currency: session.currency,
          metadata: session.metadata,
        },
        requestId,
      },
      {
        headers: {
          "X-Request-ID": requestId,
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (error) {
    const errorResponse = handleApiError(error);
    errorResponse.headers.set("X-Request-ID", requestId);
    return errorResponse;
  }
}

