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

    // Get session ID from query params
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: "session_id is required" },
        { status: 400 }
      );
    }

    // Check for test session (mock payment for demo/test mode)
    const isTestSession = sessionId.startsWith("test_session_");
    const isDemoMode = process.env.AI_ASTROLOGY_DEMO_MODE === "true" || process.env.NODE_ENV === "development";

    // If it's a test session, return mock verification
    if (isTestSession && (isDemoMode || !isStripeConfigured())) {
      console.log(`[DEMO MODE] Verifying test session: ${sessionId}`);
      
      // Extract reportType from session ID (format: test_session_{reportType}_{requestId})
      const sessionParts = sessionId.split("_");
      let extractedReportType = "marriage-timing"; // Default
      let isSubscriptionTest = false;
      
      if (sessionParts.length >= 3) {
        const typePart = sessionParts[2]; // The part after "test_session"
        if (typePart === "subscription") {
          isSubscriptionTest = true;
        } else if (typePart === "marriage-timing" || typePart === "career-money" || typePart === "full-life") {
          extractedReportType = typePart;
        }
      }
      
      return NextResponse.json(
        {
          ok: true,
          data: {
            sessionId,
            paid: true,
            paymentStatus: "paid",
            subscription: isSubscriptionTest,
            reportType: isSubscriptionTest ? undefined : extractedReportType,
            paymentToken: undefined, // Test sessions don't need payment tokens (generate-report handles test users)
            customerEmail: undefined,
            amountTotal: 1, // Test amount in cents
            currency: "aud",
            metadata: { testMode: true },
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
    }

    // Check if Stripe is configured for real payments
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Payment processing not configured" },
        { status: 503 }
      );
    }

    // Dynamically import Stripe
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

