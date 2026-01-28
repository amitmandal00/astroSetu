/**
 * POST /api/ai-astrology/cancel-payment
 * Cancel/refund payment if report generation fails
 * This ensures users are not charged if report generation fails
 */

import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError, parseJsonBody } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";
import { isStripeConfigured } from "@/lib/ai-astrology/payments";
import { markStoredReportRefunded, getStoredReportByPaymentIntentId } from "@/lib/ai-astrology/reportStore";

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

          // Phase 1: Mark report as refunded if report exists (ChatGPT feedback)
          // Payment was cancelled (not captured), so technically no refund needed
          // But we track it for analytics
          try {
            const storedReport = await getStoredReportByPaymentIntentId(paymentIntentId);
            if (storedReport && !storedReport.refunded) {
              // Payment cancelled = refunded (user not charged)
              await markStoredReportRefunded({
                idempotencyKey: storedReport.idempotency_key,
                reportId: storedReport.report_id,
                refundId: `cancelled_${paymentIntentId}`,
              });
            }
          } catch (e) {
            // Ignore - refund tracking is best-effort
            console.warn("[REFUND TRACKING] Could not mark cancelled payment:", e);
          }

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
        // Handle case where payment intent is already cancelled
        if (error.message && (error.message.includes("already canceled") || error.message.includes("already cancelled"))) {
          const alreadyCancelledSuccess = {
            requestId,
            timestamp: new Date().toISOString(),
            paymentIntentId,
            status: "canceled",
            reason: reason || "Report generation failed",
            note: "Payment intent was already cancelled (caught from Stripe error)",
          };
          console.log("[PAYMENT ALREADY CANCELLED]", JSON.stringify(alreadyCancelledSuccess, null, 2));

          return NextResponse.json(
            {
              ok: true,
              data: {
                paymentIntentId,
                status: "canceled",
                cancelled: true,
                alreadyCancelled: true,
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
          
          // Check if charge has already been refunded
          if (charge.refunded) {
            // Charge already refunded - check for existing refunds
            const refunds = await stripe.refunds.list({
              charge: charge.id,
              limit: 1,
            });

            const existingRefund = refunds.data[0];
            const alreadyRefundedSuccess = {
              requestId,
              timestamp: new Date().toISOString(),
              paymentIntentId,
              chargeId: charge.id,
              refundId: existingRefund?.id || "N/A",
              amount: existingRefund?.amount || charge.amount_refunded || 0,
              status: existingRefund?.status || "succeeded",
              reason: reason || "Report generation failed",
              note: "Charge was already refunded",
            };
            console.log("[PAYMENT ALREADY REFUNDED]", JSON.stringify(alreadyRefundedSuccess, null, 2));

            // Return success since payment is already refunded
            return NextResponse.json(
              {
                ok: true,
                data: {
                  paymentIntentId,
                  refundId: existingRefund?.id || "existing_refund",
                  amount: existingRefund?.amount || charge.amount_refunded || 0,
                  status: existingRefund?.status || "succeeded",
                  refunded: true,
                  alreadyRefunded: true,
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
          
          // Create refund only if not already refunded
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

          // Phase 1: Mark report as refunded in database (ChatGPT feedback)
          try {
            const storedReport = await getStoredReportByPaymentIntentId(paymentIntentId);
            if (storedReport && !storedReport.refunded) {
              await markStoredReportRefunded({
                idempotencyKey: storedReport.idempotency_key,
                reportId: storedReport.report_id,
                refundId: refund.id,
              });
              console.log("[REPORT MARKED AS REFUNDED]", {
                reportId: storedReport.report_id,
                refundId: refund.id,
                paymentIntentId,
              });
            }
          } catch (refundTrackingError) {
            // Log but don't fail - refund tracking is best-effort
            console.warn("[REFUND TRACKING] Failed to mark report as refunded:", refundTrackingError);
          }

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
        // Handle case where refund already exists (Stripe returns an error)
        if (error.message && error.message.includes("already been refunded")) {
          // Charge already refunded - treat as success
          const alreadyRefundedInfo = {
            requestId,
            timestamp: new Date().toISOString(),
            paymentIntentId,
            errorMessage: error.message,
            note: "Charge was already refunded (caught from Stripe error)",
          };
          console.log("[PAYMENT ALREADY REFUNDED - FROM ERROR]", JSON.stringify(alreadyRefundedInfo, null, 2));

          return NextResponse.json(
            {
              ok: true,
              data: {
                paymentIntentId,
                refundId: "existing_refund",
                refunded: true,
                alreadyRefunded: true,
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
    } else if (paymentIntent.status === "canceled") {
      // Payment already cancelled - treat as success
      const alreadyCancelledSuccess = {
        requestId,
        timestamp: new Date().toISOString(),
        paymentIntentId,
        status: paymentIntent.status,
        reason: reason || "Report generation failed",
        note: "Payment intent was already cancelled",
      };
      console.log("[PAYMENT ALREADY CANCELLED]", JSON.stringify(alreadyCancelledSuccess, null, 2));

      return NextResponse.json(
        {
          ok: true,
          data: {
            paymentIntentId,
            status: paymentIntent.status,
            cancelled: true,
            alreadyCancelled: true,
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

