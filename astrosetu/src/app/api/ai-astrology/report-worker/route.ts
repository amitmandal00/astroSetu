/**
 * Report Generation Worker
 * Processes async jobs for heavy reports (full-life, year-analysis)
 * 
 * This endpoint is called asynchronously to process queued report generation jobs
 * Prevents serverless timeouts for long-running reports
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateRequestId } from "@/lib/requestId";
import type { AIAstrologyInput, ReportType } from "@/lib/ai-astrology/types";
import {
  generateFullLifeReport,
  generateYearAnalysisReport,
} from "@/lib/ai-astrology/reportGenerator";
import {
  getStoredReportByReportId,
  markStoredReportCompleted,
  markStoredReportFailed,
  updateStoredReportHeartbeat,
} from "@/lib/ai-astrology/reportStore";
import { validateReportContent } from "@/lib/ai-astrology/validation";
import { applyDeterministicFallback_NO_API } from "@/lib/ai-astrology/deterministicFallback";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for worker (longer than main handler)

/**
 * POST /api/ai-astrology/report-worker
 * Process a queued report generation job
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const json = await req.json();
    const { reportId, reportType, input, idempotencyKey, paymentIntentId, sessionId } = json;

    if (!reportId || !reportType || !input) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: reportId, reportType, input" },
        { status: 400, headers: { "X-Request-ID": requestId } }
      );
    }

    // Verify job is still queued (prevent duplicate processing)
    const storedReport = await getStoredReportByReportId(reportId);
    if (!storedReport) {
      return NextResponse.json(
        { ok: false, error: "Report not found" },
        { status: 404, headers: { "X-Request-ID": requestId } }
      );
    }

    if (storedReport.status !== "processing") {
      // Already completed or failed - return current status
      return NextResponse.json(
        {
          ok: true,
          status: storedReport.status,
          reportId,
          message: storedReport.status === "completed" ? "Report already completed" : "Report already failed",
        },
        { status: 200, headers: { "X-Request-ID": requestId } }
      );
    }

    console.log(`[REPORT_WORKER] Starting job processing`, {
      requestId,
      reportId,
      reportType,
      idempotencyKey: idempotencyKey?.substring(0, 30) + "...",
    });

    // Start heartbeat to prevent stuck states
    const heartbeatInterval = setInterval(async () => {
      try {
        await updateStoredReportHeartbeat({ idempotencyKey, reportId });
      } catch (err) {
        // Ignore heartbeat errors
      }
    }, 18000); // Every 18 seconds

    try {
      // Generate report based on type
      let reportContent;
      const sessionKey = `worker-${reportId}`;

      switch (reportType) {
        case "full-life":
          reportContent = await generateFullLifeReport(input, sessionKey);
          break;
        case "year-analysis":
          reportContent = await generateYearAnalysisReport(input, sessionKey);
          break;
        default:
          throw new Error(`Unsupported report type for async worker: ${reportType}`);
      }

      // Validate report content
      const validation = validateReportContent(reportContent, reportType);
      if (!validation.isValid) {
        console.warn(`[REPORT_WORKER] Validation failed, applying fallback`, {
          requestId,
          reportId,
          reportType,
          error: validation.error,
        });

        // Apply deterministic fallback
        const fallbackContent = applyDeterministicFallback_NO_API(
          reportContent,
          reportType,
          input
        );

        // Re-validate fallback
        const fallbackValidation = validateReportContent(fallbackContent, reportType);
        if (!fallbackValidation.isValid) {
          // Check if we can allow degradation (year-analysis only)
          const isContentTooShort =
            fallbackValidation.errorCode === "VALIDATION_FAILED" &&
            typeof fallbackValidation.error === "string" &&
            fallbackValidation.error.toLowerCase().includes("content too short");

          const canAllowDegradation = reportType === "year-analysis" && isContentTooShort;

          if (canAllowDegradation) {
            // Allow degradation for year-analysis
            console.warn(`[REPORT_WORKER] Allowing degradation for year-analysis`, {
              requestId,
              reportId,
              error: fallbackValidation.error,
            });
            reportContent = fallbackContent;
          } else {
            // Terminal failure
            throw new Error(`Fallback validation failed: ${fallbackValidation.error}`);
          }
        } else {
          reportContent = fallbackContent;
        }
      }

      // Mark as completed
      await markStoredReportCompleted({
        idempotencyKey,
        reportId,
        content: reportContent,
      });

      // Capture payment if exists
      if (paymentIntentId && !sessionId?.startsWith("test_session_") && !sessionId?.startsWith("prodtest_")) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.url.split('/api')[0];
        try {
          await fetch(`${baseUrl}/api/ai-astrology/capture-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentIntentId,
              sessionId: sessionId || "",
            }),
          });
        } catch (captureError) {
          console.error(`[REPORT_WORKER] Payment capture failed`, {
            requestId,
            reportId,
            paymentIntentId,
            error: captureError,
          });
        }
      }

      clearInterval(heartbeatInterval);

      console.log(`[REPORT_WORKER] Job completed successfully`, {
        requestId,
        reportId,
        reportType,
        elapsedMs: Date.now() - startTime,
      });

      return NextResponse.json(
        {
          ok: true,
          status: "completed",
          reportId,
          reportType,
        },
        { status: 200, headers: { "X-Request-ID": requestId } }
      );
    } catch (error: any) {
      clearInterval(heartbeatInterval);

      // Mark as failed
      await markStoredReportFailed({
        idempotencyKey,
        reportId,
        errorCode: "GENERATION_ERROR",
        errorMessage: error.message || "Report generation failed",
      });

      // Cancel payment if exists
      if (paymentIntentId && !sessionId?.startsWith("test_session_") && !sessionId?.startsWith("prodtest_")) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.url.split('/api')[0];
        try {
          await fetch(`${baseUrl}/api/ai-astrology/cancel-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentIntentId,
              sessionId: sessionId || "",
              reason: `Report generation failed: ${error.message}`,
            }),
          });
        } catch (cancelError) {
          console.error(`[REPORT_WORKER] Payment cancellation failed`, {
            requestId,
            reportId,
            paymentIntentId,
            error: cancelError,
          });
        }
      }

      console.error(`[REPORT_WORKER] Job failed`, {
        requestId,
        reportId,
        reportType,
        error: error.message,
        elapsedMs: Date.now() - startTime,
      });

      return NextResponse.json(
        {
          ok: false,
          status: "failed",
          reportId,
          error: error.message || "Report generation failed",
        },
        { status: 500, headers: { "X-Request-ID": requestId } }
      );
    }
  } catch (error: any) {
    console.error(`[REPORT_WORKER] Error`, {
      requestId,
      error: error.message,
      elapsedMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Worker error",
      },
      { status: 500, headers: { "X-Request-ID": requestId } }
    );
  }
}

