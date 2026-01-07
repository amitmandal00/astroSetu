/**
 * POST /api/ai-astrology/cancel-payment
 * Cancel/refund payment if report generation fails
 * This ensures users are not charged if report generation fails
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
    const rateLimitResponse = checkRateLimit(req, "/api/ai-astrology/cancel-payment");
    if (rateLimitResponse) {
      rateLimitResponse.headers.set("X-Request-ID", requestId);
      return rateLimitResponse;
    }

    // Parse request body
    const json = await parseJsonBody<{
      paymentIntentId: string;
      sessionId?: string;
      reason?: string;
    }>(req);

    const { paymentIntentId, sessionId, reason } = json;

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
      console.error("[cancel-payment] Invalid STRIPE_SECRET_KEY");
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

    // Cancel payment intent if it hasn't been captured
    if (paymentIntent.status === "requires_capture") {
      try {
        const cancelledPayment = await stripe.paymentIntents.cancel(paymentIntentId);

        const cancelSuccess = {
          requestId,
          timestamp: new Date().toISOString(),
          paymentIntentId,
          status: cancelledPayment.status,
          reason: reason || "Report generation failed",
          sessionId: sessionId?.substring(0, 20) + "..." || "N/A",
        };
        console.log("[PAYMENT CANCELLED]", JSON.stringify(cancelSuccess, null, 2));

        return NextResponse.json(
          {
            ok: true,
            data: {
              paymentIntentId: cancelledPayment.id,
              status: cancelledPayment.status,
              cancelled: true,
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
        const cancelError = {
          requestId,
          timestamp: new Date().toISOString(),
          paymentIntentId,
          errorType: error.constructor?.name || "Unknown",
          errorMessage: error.message || "Unknown error",
          errorCode: error.code || "N/A",
        };
        console.error("[PAYMENT CANCELLATION ERROR]", JSON.stringify(cancelError, null, 2));
        
        return NextResponse.json(
          { ok: false, error: `Failed to cancel payment: ${error.message || "Unknown error"}` },
          { status: 500 }
        );
      }
    } else if (paymentIntent.status === "succeeded") {
      // Payment already captured - need to refund instead
      try {
        // Find the charge associated with this payment intent
        const charges = await stripe.charges.list({
          payment_intent: paymentIntentId,
        });

        if (charges.data.length > 0) {
          const charge = charges.data[0];
          
          // Create refund
          const refund = await stripe.refunds.create({
            charge: charge.id,
            reason: "requested_by_customer",
            metadata: {
              reason: reason || "Report generation failed",
              requestId,
            },
          });

          const refundSuccess = {
            requestId,
            timestamp: new Date().toISOString(),
            paymentIntentId,
            chargeId: charge.id,
            refundId: refund.id,
            amount: refund.amount,
            status: refund.status,
            reason: reason || "Report generation failed",
          };
          console.log("[PAYMENT REFUNDED]", JSON.stringify(refundSuccess, null, 2));

          return NextResponse.json(
            {
              ok: true,
              data: {
                paymentIntentId,
                refundId: refund.id,
                amount: refund.amount,
                status: refund.status,
                refunded: true,
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
        } else {
          return NextResponse.json(
            { ok: false, error: "No charge found for this payment intent" },
            { status: 404 }
          );
        }
      } catch (error: any) {
        const refundError = {
          requestId,
          timestamp: new Date().toISOString(),
          paymentIntentId,
          errorType: error.constructor?.name || "Unknown",
          errorMessage: error.message || "Unknown error",
        };
        console.error("[PAYMENT REFUND ERROR]", JSON.stringify(refundError, null, 2));
        
        return NextResponse.json(
          { ok: false, error: `Failed to refund payment: ${error.message || "Unknown error"}` },
          { status: 500 }
        );
      }
    } else {
      // Payment in unexpected state
      return NextResponse.json(
        { ok: false, error: `Payment cannot be cancelled. Current status: ${paymentIntent.status}` },
        { status: 400 }
      );
    }
  } catch (error) {
    const errorResponse = handleApiError(error);
    errorResponse.headers.set("X-Request-ID", requestId);
    return errorResponse;
  }
}

