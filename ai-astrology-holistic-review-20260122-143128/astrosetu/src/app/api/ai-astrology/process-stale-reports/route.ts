/**
 * POST /api/ai-astrology/process-stale-reports
 * Background job to process stale reports (stuck in processing > 5 minutes)
 * 
 * CRITICAL: This endpoint should be called by a cron job (Vercel Cron, external cron, etc.)
 * to automatically refund stuck reports and prevent chargebacks.
 * 
 * Security: Protected by API key or internal-only access
 */

import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";
import { isStripeConfigured } from "@/lib/ai-astrology/payments";
import { 
  getStaleProcessingReports, 
  markStoredReportFailed, 
  markStoredReportRefunded,
  type StoredReportRow 
} from "@/lib/ai-astrology/reportStore";
import { isSupabaseConfigured } from "@/lib/supabase";

// Server-side error logging helper
function logErrorToSentry(error: Error | unknown, context: Record<string, unknown>) {
  try {
    // Dynamic import to avoid bundling Sentry in client
    const Sentry = require("@sentry/nextjs");
    if (error instanceof Error) {
      Sentry.captureException(error, {
        tags: { source: "stale_reports_job" },
        extra: context,
      });
    } else {
      Sentry.captureMessage(String(error), {
        level: "error",
        tags: { source: "stale_reports_job" },
        extra: context,
      });
    }
  } catch (e) {
    // Sentry not available - log to console
    console.error("[STALE_REPORTS_JOB] Sentry not available:", e);
    console.error("[STALE_REPORTS_JOB] Error:", error, "Context:", context);
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // 1 minute max for processing multiple reports

// Security: Require API key or internal access
function isAuthorized(req: Request): boolean {
  // Check for API key in header
  const apiKey = req.headers.get("x-api-key");
  const expectedApiKey = process.env.STALE_REPORTS_API_KEY;
  
  // If API key is set, require it
  if (expectedApiKey) {
    return apiKey === expectedApiKey;
  }
  
  // If no API key is set, allow internal access only (for development)
  // In production, always set STALE_REPORTS_API_KEY
  const userAgent = req.headers.get("user-agent") || "";
  const isVercelCron = req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
  const isInternal = userAgent.includes("vercel-cron") || isVercelCron;
  
  return isInternal || process.env.NODE_ENV === "development";
}

export async function POST(req: Request) {
  const requestId = generateRequestId();
  
  try {
    // Security check
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Rate limiting (less strict for cron jobs)
    const rateLimitResponse = checkRateLimit(req, "/api/ai-astrology/process-stale-reports");
    if (rateLimitResponse) {
      rateLimitResponse.headers.set("X-Request-ID", requestId);
      return rateLimitResponse;
    }
    
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Database not configured" },
        { status: 503 }
      );
    }
    
    // Get threshold from query params or use default (5 minutes)
    const url = new URL(req.url);
    const thresholdParam = url.searchParams.get("threshold");
    const thresholdMinutes = thresholdParam ? parseInt(thresholdParam, 10) : 5;
    
    if (isNaN(thresholdMinutes) || thresholdMinutes < 1) {
      return NextResponse.json(
        { ok: false, error: "Invalid threshold. Must be >= 1 minute" },
        { status: 400 }
      );
    }
    
    // Get stale reports
    const staleReports = await getStaleProcessingReports(thresholdMinutes);
    
    if (staleReports.length === 0) {
      return NextResponse.json({
        ok: true,
        data: {
          processed: 0,
          refunded: 0,
          failed: 0,
          message: "No stale reports found",
        },
        requestId,
      });
    }
    
    console.log(`[STALE_REPORTS_JOB] Found ${staleReports.length} stale reports (threshold: ${thresholdMinutes} minutes)`);
    
    // Alert if too many stale reports (potential issue)
    if (staleReports.length > 10) {
      const alertMessage = `[STALE_REPORTS_ALERT] High number of stale reports detected: ${staleReports.length}`;
      console.error(alertMessage);
      logErrorToSentry(new Error(alertMessage), {
        count: staleReports.length,
        thresholdMinutes,
        requestId,
        alertType: "high_stale_report_count",
      });
    }
    
    // Process each stale report
    const results = {
      processed: 0,
      refunded: 0,
      failed: 0,
      errors: [] as Array<{ reportId: string; error: string }>,
    };
    
    for (const report of staleReports) {
      try {
        results.processed++;
        
        // Mark report as failed
        await markStoredReportFailed({
          idempotencyKey: report.idempotency_key,
          reportId: report.report_id,
          errorMessage: `Report stuck in processing for > ${thresholdMinutes} minutes. Auto-marked as failed.`,
          errorCode: "STALE_PROCESSING",
        });
        
        // If payment was captured, refund it
        if (report.payment_intent_id && !report.refunded) {
          try {
            const refundResult = await processRefundForStaleReport(report, requestId);
            if (refundResult.refunded) {
              results.refunded++;
              
              // Mark report as refunded in database
              await markStoredReportRefunded({
                idempotencyKey: report.idempotency_key,
                reportId: report.report_id,
                refundId: refundResult.refundId || `stale_${report.report_id}`,
              });
            }
          } catch (refundError: any) {
            // Log refund error but continue processing other reports
            results.errors.push({
              reportId: report.report_id,
              error: `Refund failed: ${refundError.message || "Unknown error"}`,
            });
            console.error(`[STALE_REPORTS_JOB] Refund failed for report ${report.report_id}:`, refundError);
            
            // Alert on refund failures (critical - user may be charged)
            logErrorToSentry(refundError, {
              reportId: report.report_id,
              paymentIntentId: report.payment_intent_id,
              requestId,
              errorType: "refund_failed",
            });
          }
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          reportId: report.report_id,
          error: error.message || "Unknown error",
        });
        console.error(`[STALE_REPORTS_JOB] Failed to process report ${report.report_id}:`, error);
        
        // Alert on processing failures
        logErrorToSentry(error, {
          reportId: report.report_id,
          requestId,
          errorType: "processing_failed",
        });
      }
    }
    
    // Log summary
    console.log(`[STALE_REPORTS_JOB] Completed: ${results.processed} processed, ${results.refunded} refunded, ${results.failed} failed`);
    
    return NextResponse.json({
      ok: true,
      data: {
        processed: results.processed,
        refunded: results.refunded,
        failed: results.failed,
        errors: results.errors,
        thresholdMinutes,
      },
      requestId,
    }, {
      headers: {
        "X-Request-ID": requestId,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    const errorResponse = handleApiError(error);
    errorResponse.headers.set("X-Request-ID", requestId);
    return errorResponse;
  }
}

/**
 * Process refund for a stale report
 * Checks if payment was captured and refunds if necessary
 */
async function processRefundForStaleReport(
  report: StoredReportRow,
  requestId: string
): Promise<{ refunded: boolean; refundId?: string; error?: string }> {
  // Check if Stripe is configured
  if (!isStripeConfigured()) {
    return { refunded: false, error: "Stripe not configured" };
  }
  
  if (!report.payment_intent_id) {
    return { refunded: false, error: "No payment intent ID" };
  }
  
  try {
    // Dynamically import Stripe
    const Stripe = (await import("stripe")).default;
    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey || secretKey.startsWith("pk_")) {
      return { refunded: false, error: "Invalid Stripe secret key" };
    }
    
    const stripe = new Stripe(secretKey);
    
    // Retrieve payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(report.payment_intent_id);
    
    // If payment hasn't been captured, cancel it (no refund needed)
    if (paymentIntent.status === "requires_capture") {
      try {
        await stripe.paymentIntents.cancel(report.payment_intent_id);
        console.log(`[STALE_REPORTS_JOB] Cancelled uncaptured payment for report ${report.report_id}`);
        return { refunded: true, refundId: `cancelled_${report.payment_intent_id}` };
      } catch (cancelError: any) {
        // Payment might already be cancelled
        if (cancelError.message?.includes("already canceled") || cancelError.message?.includes("already cancelled")) {
          return { refunded: true, refundId: `already_cancelled_${report.payment_intent_id}` };
        }
        throw cancelError;
      }
    }
    
    // If payment was captured, refund it
    if (paymentIntent.status === "succeeded") {
      // Find the charge
      const charges = await stripe.charges.list({
        payment_intent: report.payment_intent_id,
        limit: 1,
      });
      
      if (charges.data.length === 0) {
        return { refunded: false, error: "No charge found" };
      }
      
      const charge = charges.data[0];
      
      // Check if already refunded
      if (charge.refunded) {
        const refunds = await stripe.refunds.list({
          charge: charge.id,
          limit: 1,
        });
        const existingRefund = refunds.data[0];
        return { 
          refunded: true, 
          refundId: existingRefund?.id || `existing_refund_${charge.id}` 
        };
      }
      
      // Create refund
      const refund = await stripe.refunds.create({
        charge: charge.id,
        reason: "requested_by_customer",
        metadata: {
          reason: "Report stuck in processing - auto-refunded",
          reportId: report.report_id,
          requestId,
        },
      });
      
      console.log(`[STALE_REPORTS_JOB] Refunded payment for report ${report.report_id}: ${refund.id}`);
      
      return { refunded: true, refundId: refund.id };
    }
    
    // Payment in unexpected state
    return { refunded: false, error: `Payment in unexpected state: ${paymentIntent.status}` };
  } catch (error: any) {
    return { refunded: false, error: error.message || "Unknown error" };
  }
}

