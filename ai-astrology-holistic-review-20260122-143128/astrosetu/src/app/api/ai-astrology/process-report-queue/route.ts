import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";
import type { ReportContent, ReportType } from "@/lib/ai-astrology/types";
import {
  getProcessingReportsWithoutContent,
  markStoredReportCompleted,
  markStoredReportFailed,
  updateStoredReportHeartbeat,
  type StoredReportRow,
} from "@/lib/ai-astrology/reportStore";
import {
  generateCareerMoneyReport,
  generateFullLifeReport,
  generateMajorLifePhaseReport,
  generateDecisionSupportReport,
  ensureMinimumSections,
  addLowQualityDisclaimer,
} from "@/lib/ai-astrology/reportGenerator";
import { ensureFutureWindows } from "@/lib/ai-astrology/ensureFutureWindows";
import { validateReportBeforeCompletion } from "@/lib/ai-astrology/reportValidation";
import { isPaidReportType } from "@/lib/ai-astrology/paymentToken";
import { runWithAIJobContext, getAIJobContext } from "@/lib/ai-astrology/aiJobContext";
import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // background worker can take longer

function isAuthorized(req: Request): boolean {
  const apiKey = req.headers.get("x-api-key");
  const expected = process.env.REPORT_QUEUE_API_KEY;

  // If explicitly configured, require API key.
  if (expected) return apiKey === expected;

  // Allow local development without a key.
  if (process.env.NODE_ENV === "development") return true;

  // Allow Vercel cron / internal calls if CRON_SECRET exists.
  const bearer = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && bearer === `Bearer ${cronSecret}`) return true;

  return false;
}

function isHeavyReportType(reportType: ReportType): boolean {
  return reportType === "full-life" || reportType === "career-money" || reportType === "major-life-phase" || reportType === "decision-support";
}

async function capturePayment(paymentIntentId: string, requestId: string, reportId: string) {
  try {
    const Stripe = (await import("stripe")).default;
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey || secretKey.startsWith("pk_")) return;
    const stripe = new Stripe(secretKey);

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status === "succeeded") return;
    if (pi.status !== "requires_capture") return;

    await stripe.paymentIntents.capture(paymentIntentId);
    console.log("[REPORT_JOB_PAYMENT_CAPTURED]", { requestId, reportId, paymentIntentId });
  } catch (e) {
    Sentry.captureException(e, { tags: { requestId, reportId, source: "report_job_capture_payment" } });
    console.error("[REPORT_JOB_PAYMENT_CAPTURE_FAILED]", { requestId, reportId, paymentIntentId, error: (e as any)?.message || String(e) });
  }
}

async function processOneReport(row: StoredReportRow, requestId: string) {
  const reportType = row.report_type;
  if (!isHeavyReportType(reportType)) {
    return { ok: false as const, reason: "not_heavy" as const };
  }

  const startedAt = Date.now();

  return await runWithAIJobContext(
    {
      mode: "background",
      requestId,
      reportId: row.report_id,
      reportType,
      degradedInputUsed: false,
    },
    async () => {
      // heartbeat while running (best-effort)
      let heartbeat: NodeJS.Timeout | null = null;
      const startHeartbeat = () => {
        heartbeat = setInterval(() => {
          void updateStoredReportHeartbeat({ idempotencyKey: row.idempotency_key, reportId: row.report_id });
        }, 18000);
      };
      const stopHeartbeat = () => {
        if (heartbeat) clearInterval(heartbeat);
        heartbeat = null;
      };

      try {
        startHeartbeat();

        let content: ReportContent;
        const sessionKey = `${row.report_id}:${Date.now()}`; // background-only tracking key

        const genStart = Date.now();
        switch (reportType) {
          case "career-money":
            content = await generateCareerMoneyReport(row.input, sessionKey);
            break;
          case "full-life":
            content = await generateFullLifeReport(row.input, sessionKey);
            break;
          case "major-life-phase":
            content = await generateMajorLifePhaseReport(row.input, sessionKey);
            break;
          case "decision-support":
            content = await generateDecisionSupportReport(row.input, row.input.decisionContext || "", sessionKey);
            break;
          default:
            throw new Error(`Unsupported reportType for background processing: ${reportType}`);
        }
        const genMs = Date.now() - genStart;

        // Normalize outputs
        let cleaned = ensureFutureWindows(reportType, content);

        // Validate and repair locally (no extra OpenAI call in worker unless we add later)
        let validation = validateReportBeforeCompletion(cleaned, row.input, undefined, reportType);
        if (!validation.valid) {
          cleaned = ensureMinimumSections(cleaned, reportType);
          validation = validateReportBeforeCompletion(cleaned, row.input, undefined, reportType);
        }

        // Always deliver something; mark LOW quality if still not valid
        if (!validation.valid) {
          cleaned = addLowQualityDisclaimer({ ...cleaned, quality: "LOW" } as ReportContent);
        }

        // Persist as delivered (polling depends on this)
        await markStoredReportCompleted({ idempotencyKey: row.idempotency_key, reportId: row.report_id, content: cleaned });

        const ctx = getAIJobContext();
        console.log("[REPORT_JOB_DELIVERED]", {
          requestId,
          reportId: row.report_id,
          reportType,
          elapsedMs: Date.now() - startedAt,
          generationMs: genMs,
          degradedInputUsed: ctx?.degradedInputUsed || false,
          metrics: ctx?.metrics,
          validationPassed: validation.valid,
          quality: (cleaned as any)?.quality,
        });

        // Capture payment ONLY if validation passed and quality isn't LOW
        if (
          row.payment_intent_id &&
          isPaidReportType(reportType) &&
          validation.valid &&
          (cleaned as any)?.quality !== "LOW"
        ) {
          await capturePayment(row.payment_intent_id, requestId, row.report_id);
        }

        return { ok: true as const };
      } catch (e: any) {
        stopHeartbeat();
        const msg = e?.message || String(e);
        await markStoredReportFailed({
          idempotencyKey: row.idempotency_key,
          reportId: row.report_id,
          errorMessage: msg,
          errorCode: msg.toLowerCase().includes("timeout") ? "GENERATION_TIMEOUT" : "GENERATION_FAILED",
        });
        Sentry.captureException(e, { tags: { requestId, reportId: row.report_id, reportType, source: "process_report_queue" } });
        console.error("[REPORT_JOB_FAILED]", { requestId, reportId: row.report_id, reportType, error: msg });
        return { ok: false as const, reason: "failed" as const };
      } finally {
        stopHeartbeat();
      }
    }
  );
}

export async function POST(req: Request) {
  const requestId = generateRequestId();

  try {
    const rateLimitResponse = checkRateLimit(req, "/api/ai-astrology/process-report-queue");
    if (rateLimitResponse) {
      rateLimitResponse.headers.set("X-Request-ID", requestId);
      return rateLimitResponse;
    }

    if (!isAuthorized(req)) {
      Sentry.captureMessage("Unauthorized access to process-report-queue", {
        level: "warning",
        tags: { requestId, source: "process_report_queue" },
      });
      return NextResponse.json({ ok: false, error: "Unauthorized", requestId }, { status: 401 });
    }

    const url = new URL(req.url);
    const reportId = url.searchParams.get("reportId") || undefined;
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "1", 10) || 1, 5);

    const candidates = await getProcessingReportsWithoutContent({
      reportId,
      limit,
      olderThanSeconds: reportId ? 0 : 10,
    });

    let processed = 0;
    let delivered = 0;
    let skipped = 0;
    let failed = 0;

    for (const row of candidates) {
      processed++;
      const res = await processOneReport(row, requestId);
      if (res.ok) delivered++;
      else if (res.reason === "not_heavy") skipped++;
      else failed++;
    }

    return NextResponse.json(
      {
        ok: true,
        data: { processed, delivered, skipped, failed, picked: candidates.map(r => ({ reportId: r.report_id, reportType: r.report_type })) },
        requestId,
      },
      { headers: { "X-Request-ID": requestId, "Cache-Control": "no-cache" } }
    );
  } catch (e) {
    return handleApiError(e);
  }
}


