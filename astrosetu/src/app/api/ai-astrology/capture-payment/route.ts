/**
 * POST /api/ai-astrology/capture-payment
 * Capture payment after successful report generation
 * This ensures payment is only deducted if report is successfully generated
 */

import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError, parseJsonBody } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";
import { isStripeConfigured } from "@/lib/ai-astrology/payments";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const requestId = generateRequestId();

  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, "/api/ai-astrology/capture-payment");
    if (rateLimitResponse) {
      rateLimitResponse.headers.set("X-Request-ID", requestId);
      return rateLimitResponse;
    }

    // Parse request body
    const json = await parseJsonBody<{
      paymentIntentId: string;
      sessionId?: string;
    }>(req);

    const { paymentIntentId, sessionId } = json;

    if (!paymentIntentId) {
      return NextResponse.json(
        { ok: false, error: "paymentIntentId is required" },
        { status: 400 }
      );
    }

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Payment processing not configured" },
        { status: 503 }
      );
    }

    // Dynamically import Stripe
    const Stripe = (await import("stripe")).default;
    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey || secretKey.startsWith("pk_")) {
      console.error("[capture-payment] Invalid STRIPE_SECRET_KEY");
      return NextResponse.json(
        { ok: false, error: "Payment processing configuration error" },
        { status: 500 }
      );
    }
    
    const stripe = new Stripe(secretKey);

    // Retrieve payment intent
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error: any) {
      const retrieveError = {
        requestId,
        timestamp: new Date().toISOString(),
        paymentIntentId,
        errorType: error.constructor?.name || "Unknown",
        errorMessage: error.message || "Unknown error",
      };
      console.error("[PAYMENT INTENT RETRIEVE ERROR]", JSON.stringify(retrieveError, null, 2));
      
      return NextResponse.json(
        { ok: false, error: "Payment intent not found" },
        { status: 404 }
      );
    }

    // Check if payment intent is in correct state for capture
    if (paymentIntent.status !== "requires_capture") {
      const statusError = {
        requestId,
        timestamp: new Date().toISOString(),
        paymentIntentId,
        currentStatus: paymentIntent.status,
        error: "Payment intent is not in requires_capture state",
      };
      console.error("[PAYMENT CAPTURE STATUS ERROR]", JSON.stringify(statusError, null, 2));
      
      return NextResponse.json(
        { ok: false, error: `Payment cannot be captured. Current status: ${paymentIntent.status}` },
        { status: 400 }
      );
    }

    // Capture the payment
    try {
      const capturedPayment = await stripe.paymentIntents.capture(paymentIntentId);

      const captureSuccess = {
        requestId,
        timestamp: new Date().toISOString(),
        paymentIntentId,
        amount: capturedPayment.amount,
        currency: capturedPayment.currency,
        status: capturedPayment.status,
        sessionId: sessionId?.substring(0, 20) + "..." || "N/A",
      };
      console.log("[PAYMENT CAPTURED]", JSON.stringify(captureSuccess, null, 2));

      return NextResponse.json(
        {
          ok: true,
          data: {
            paymentIntentId: capturedPayment.id,
            status: capturedPayment.status,
            amount: capturedPayment.amount,
            currency: capturedPayment.currency,
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
    } catch (error: any) {
      const captureError = {
        requestId,
        timestamp: new Date().toISOString(),
        paymentIntentId,
        errorType: error.constructor?.name || "Unknown",
        errorMessage: error.message || "Unknown error",
        errorCode: error.code || "N/A",
      };
      console.error("[PAYMENT CAPTURE ERROR]", JSON.stringify(captureError, null, 2));
      
      return NextResponse.json(
        { ok: false, error: `Failed to capture payment: ${error.message || "Unknown error"}` },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorResponse = handleApiError(error);
    errorResponse.headers.set("X-Request-ID", requestId);
    return errorResponse;
  }
}

