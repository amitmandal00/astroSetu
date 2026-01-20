// CRITICAL FIX (ChatGPT Feedback): Serverless timeout configuration
// Vercel serverless functions have default execution limits that can be exceeded
// on cold start + OpenAI latency, causing report generation to die mid-execution
// This leaves reports stuck in "processing" status forever
export const runtime = "nodejs";
export const maxDuration = 180; // 3 minutes (enough for year-analysis/full-life with cold start)
export const dynamic = "force-dynamic"; // Prevents caching weirdness

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";
import {
  generateLifeSummaryReport,
  generateMarriageTimingReport,
  generateCareerMoneyReport,
  generateFullLifeReport,
  generateYearAnalysisReport,
  generateMajorLifePhaseReport,
  generateDecisionSupportReport,
  isAIConfigured,
} from "@/lib/ai-astrology/reportGenerator";
import type { AIAstrologyInput, ReportType, ReportContent } from "@/lib/ai-astrology/types";
import { verifyPaymentToken, isPaidReportType } from "@/lib/ai-astrology/paymentToken";
import { getYearAnalysisDateRange, getMarriageTimingWindows, getCareerTimingWindows, getMajorLifePhaseWindows, getDateContext } from "@/lib/ai-astrology/dateHelpers";
import { isAllowedUser, getRestrictionMessage } from "@/lib/access-restriction";
import { isProdTestUser } from "@/lib/prodAllowlist";
import { generateIdempotencyKey, getCachedReport, cacheReport, markReportProcessing, getCachedReportByReportId } from "@/lib/ai-astrology/reportCache";
import { generateSessionKey } from "@/lib/ai-astrology/openAICallTracker";
import { ensureFutureWindows } from "@/lib/ai-astrology/ensureFutureWindows";
import { stripMockContent } from "@/lib/ai-astrology/mockContentGuard";
import {
  getStoredReportByIdempotencyKey,
  getStoredReportByReportId,
  markStoredReportProcessing,
  markStoredReportCompleted,
  markStoredReportFailed,
  updateStoredReportHeartbeat,
  markStoredReportRefunded,
  type ReportErrorCode,
} from "@/lib/ai-astrology/reportStore";
import { validateReportBeforeCompletion } from "@/lib/ai-astrology/reportValidation";
import { parseEnvBoolean, calculateReportMode } from "@/lib/envParsing";

function getMaxProcessingMs(reportType: ReportType): number {
  // Upper bound watchdog. Without heartbeats in serverless, "processing" can become permanent if a function times out.
  // Keep this conservative but not infinite. UI already tells users they can refresh after ~2 minutes.
  switch (reportType) {
    case "life-summary":
      return 2 * 60 * 1000; // 2 min
    case "year-analysis":
      return 4 * 60 * 1000; // 4 min
    case "full-life":
    case "major-life-phase":
      return 6 * 60 * 1000; // 6 min
    default:
      return 4 * 60 * 1000;
  }
}

function parseIsoToMs(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : null;
}

function isProcessingStale(params: { updatedAtIso?: string | null; reportType?: ReportType }): boolean {
  const updatedMs = parseIsoToMs(params.updatedAtIso);
  if (!updatedMs || !params.reportType) return false;
  return Date.now() - updatedMs > getMaxProcessingMs(params.reportType);
}

function parseReportIdCreatedAtMs(reportId: string): number | null {
  // Format: RPT-{Date.now()}-{...}
  const m = reportId.match(/^RPT-(\d+)-/);
  if (!m) return null;
  const t = Number(m[1]);
  return Number.isFinite(t) ? t : null;
}

/**
 * GET handler - Check report status by reportId (for polling)
 * Used when a report is already being generated and client needs to check status
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  try {
    const searchParams = req.nextUrl.searchParams;
    const reportId = searchParams.get("reportId");
    
    if (!reportId) {
      return NextResponse.json(
        {
          ok: false,
          error: "reportId query parameter is required",
          requestId,
        },
        { status: 400 }
      );
    }
    
    // Prefer persistent store (serverless-safe) to avoid “stuck polling” + duplicate generations
    const storedReport = await getStoredReportByReportId(reportId);
    if (storedReport && storedReport.status === "failed") {
      return NextResponse.json(
        {
          ok: true,
          data: {
            status: "failed" as const,
            reportId,
            message: storedReport.error_message || "Report generation failed. Please try again.",
          },
          requestId,
        },
        { status: 200, headers: { "X-Request-ID": requestId, "Cache-Control": "no-cache" } }
      );
    }

    if (storedReport && storedReport.status === "processing") {
      // Watchdog: if a serverless function timed out/crashed, we can get stuck in processing forever.
      // When stale, mark failed and surface a safe retry message.
      if (isProcessingStale({ updatedAtIso: storedReport.updated_at, reportType: storedReport.report_type as any })) {
        try {
          await markStoredReportFailed({
            idempotencyKey: storedReport.idempotency_key,
            reportId: storedReport.report_id,
            errorMessage: "Report generation timed out. Please refresh and try again.",
            errorCode: "GENERATION_TIMEOUT",
          });
        } catch {
          // ignore
        }
        return NextResponse.json(
          {
            ok: true,
            data: {
              status: "failed" as const,
              reportId,
              message: "Report generation timed out. Please refresh and try again.",
            },
            requestId,
          },
          { status: 200, headers: { "X-Request-ID": requestId, "Cache-Control": "no-cache" } }
        );
      }
    }

    if (storedReport && storedReport.status === "completed" && storedReport.content) {
      // Guardrail: never render timing windows in the past (protects old stored reports too).
      const normalizedContent = ensureFutureWindows(
        storedReport.report_type as any,
        storedReport.content,
        {
          timeZone: (storedReport.input as any)?.timezone || "Australia/Melbourne",
        }
      );
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.url.split('/api')[0];
      const redirectUrl = `/ai-astrology/preview?reportId=${encodeURIComponent(reportId)}&reportType=${encodeURIComponent(storedReport.report_type)}`;
      const fullRedirectUrl = `${baseUrl}${redirectUrl}`;

      return NextResponse.json(
        {
          ok: true,
          data: {
            status: "completed" as const,
            reportId: storedReport.report_id,
            reportType: storedReport.report_type,
            input: storedReport.input,
            content: normalizedContent,
            generatedAt: storedReport.updated_at,
            redirectUrl,
            fullRedirectUrl,
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

    // Fallback: in-memory cache (NOT durable on serverless)
    const cachedReport = getCachedReportByReportId(reportId);
    
    if (!cachedReport) {
      // If we can't find the report in persistent store OR cache, do not keep users on an infinite spinner.
      // This can happen if the store is not configured/table missing, or a serverless instance was recycled.
      const createdAt = parseReportIdCreatedAtMs(reportId);
      if (createdAt && Date.now() - createdAt > 8 * 60 * 1000) {
        return NextResponse.json(
          {
            ok: true,
            data: {
              status: "failed" as const,
              reportId,
              message:
                "Report generation could not be resumed (missing server-side state). Please refresh and try again. If this persists, ensure the Supabase table `ai_astrology_reports` exists (see `astrosetu/docs/AI_ASTROLOGY_REPORT_STORE_SUPABASE.sql`).",
            },
            requestId,
          },
          { status: 200, headers: { "X-Request-ID": requestId, "Cache-Control": "no-cache" } }
        );
      }

      // Report not found - might be expired or never existed
      return NextResponse.json(
        {
          ok: true,
          data: {
            status: "processing" as const,
            reportId,
            message: "Report generation in progress or not found. Please continue waiting.",
          },
          requestId,
        },
        {
          status: 202, // Accepted - still processing (optimistic)
          headers: {
            "X-Request-ID": requestId,
            "Cache-Control": "no-cache",
          },
        }
      );
    }
    
    // Check status
    if (cachedReport.status === "completed") {
      // Guardrail: never render timing windows in the past (protects in-memory cached reports too).
      const normalizedContent = ensureFutureWindows(
        cachedReport.reportType as any,
        cachedReport.content,
        { timeZone: (cachedReport.input as any)?.timezone || "Australia/Melbourne" }
      );
      // Report is ready
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.url.split('/api')[0];
      const redirectUrl = `/ai-astrology/preview?reportId=${encodeURIComponent(reportId)}&reportType=${encodeURIComponent(cachedReport.reportType)}`;
      const fullRedirectUrl = `${baseUrl}${redirectUrl}`;
      
      return NextResponse.json(
        {
          ok: true,
          data: {
            status: "completed" as const,
            reportId: cachedReport.reportId,
            reportType: cachedReport.reportType,
            input: cachedReport.input,
            content: normalizedContent,
            generatedAt: cachedReport.generatedAt,
            redirectUrl,
            fullRedirectUrl,
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

    // Still processing (or not found) - keep polling optimistic.
    return NextResponse.json(
      {
        ok: true,
        data: {
          status: "processing" as const,
          reportId,
          message: "Report generation in progress. Please continue waiting.",
        },
        requestId,
      },
      {
        status: 202, // Accepted - still processing
        headers: {
          "X-Request-ID": requestId,
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (error: any) {
    const errorLog = {
      requestId,
      timestamp: new Date().toISOString(),
      action: "GET_STATUS_ERROR",
      error: error.message || String(error),
      elapsedMs: Date.now() - startTime,
    };
    console.error("[GET REPORT STATUS ERROR]", JSON.stringify(errorLog, null, 2));
    
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to check report status",
        requestId,
      },
      { status: 500 }
    );
  }
}

// CRITICAL FIX (2026-01-18 - ChatGPT Task 3): Use centralized allowlist function
// Removed checkIfTestUser - use isProdTestUser from @/lib/prodAllowlist instead

/**
 * POST /api/ai-astrology/generate-report
 * Generate AI-powered astrology report
 */
export async function POST(req: Request) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  const requestStartLog = {
    requestId,
    timestamp: new Date().toISOString(),
    endpoint: "/api/ai-astrology/generate-report",
    method: req.method,
    url: req.url,
    userAgent: req.headers.get("user-agent")?.substring(0, 100) || "N/A",
    origin: req.headers.get("origin") || "N/A",
  };
  console.log("[REQUEST START]", JSON.stringify(requestStartLog, null, 2));

  try {
    // Extract session_id early (used for test-session behavior and payment fallback verification).
    const sessionIdFromQuery = (() => {
      try {
        const { searchParams } = new URL(req.url);
        return searchParams.get("session_id") || undefined;
      } catch {
        return undefined;
      }
    })();
    // CRITICAL FIX: Distinguish between demo test sessions (test_session_) and prod test users (prodtest_)
    // test_session_ = demo mode (mock reports)
    // prodtest_ = production test users (real reports)
    const isDemoTestSession = !!sessionIdFromQuery && sessionIdFromQuery.startsWith("test_session_");
    const isProdTestSession = !!sessionIdFromQuery && sessionIdFromQuery.startsWith("prodtest_");
    const isTestSession = isDemoTestSession || isProdTestSession;
    
    // IMMEDIATE LOG: Always log for test sessions (before any other logic)
    if (isTestSession) {
      const sessionType = isProdTestSession ? "PROD_TEST" : "DEMO";
      console.log(`[TEST SESSION DETECTED] type=${sessionType}, sessionId=${sessionIdFromQuery}`);
    }
    
    // Stricter rate limiting for report generation (production-ready)
    // Per ChatGPT feedback: Add rate limiting to prevent abuse
    // Uses middleware rate limiting (already configured) with additional check
    const rateLimitResponse = checkRateLimit(req, "/api/ai-astrology/generate-report");
    if (rateLimitResponse) {
      rateLimitResponse.headers.set("X-Request-ID", requestId);
      rateLimitResponse.headers.set("Retry-After", "60");
      const rateLimitLog = {
        requestId,
        timestamp: new Date().toISOString(),
        action: "RATE_LIMIT_HIT",
        elapsedMs: Date.now() - startTime,
      };
      console.log("[RATE LIMIT]", JSON.stringify(rateLimitLog, null, 2));
      return rateLimitResponse;
    }

    // Validate request size
    validateRequestSize(req.headers.get("content-length"), 10 * 1024); // 10KB max

    // Check if AI is configured - CRITICAL: Cancel payment if service unavailable
    // Note: We need to parse input first to get paymentIntentId, so this check is after parsing
    // But we'll handle this in the error handler

    // Parse and validate request body
    const json = await parseJsonBody<{
      input: AIAstrologyInput;
      reportType: ReportType;
      paymentToken?: string; // Payment verification token for paid reports
      paymentIntentId?: string; // CRITICAL: Payment intent ID for manual capture
      sessionId?: string; // Session ID for token regeneration
      decisionContext?: string; // Optional context for decision support reports
      useReal?: boolean; // Force real AI generation even for test sessions
    }>(req);

    const { input, reportType, paymentToken, paymentIntentId, sessionId: fallbackSessionId, decisionContext, useReal } = json;
    
    // Check for URL query parameter to force real mode (alternative to body parameter)
    const urlParams = new URL(req.url).searchParams;
    const useRealFromQuery = urlParams.get("use_real") === "true" || urlParams.get("force_real") === "true";
    const forceRealMode = useReal === true || useRealFromQuery;
    
    // CRITICAL: Early deployment check log (before any returns)
    // Load build.json to get buildId for deployment verification
    let buildMetadata: { buildId?: string; fullSha?: string; builtAt?: string } = {};
    try {
      const fs = await import("fs");
      const path = await import("path");
      const buildJsonPath = path.join(process.cwd(), "public", "build.json");
      if (fs.existsSync(buildJsonPath)) {
        const buildJsonContent = fs.readFileSync(buildJsonPath, "utf-8");
        buildMetadata = JSON.parse(buildJsonContent);
      }
    } catch (buildJsonError) {
      // Non-critical - build.json might not exist in all environments
    }
    
    // Check test user status early (needed for deploy check log)
    const isTestUserForAccess = input ? isProdTestUser(input) : false;
    
    // Parse environment variables with case-insensitive parsing
    const allowRealForTestSessions = parseEnvBoolean(process.env.ALLOW_REAL_FOR_TEST_SESSIONS);
    const mockModeEnv = parseEnvBoolean(process.env.MOCK_MODE);
    const forceRealReportsEnv = parseEnvBoolean(process.env.FORCE_REAL_REPORTS);
    
    // Calculate mode flags early (will be recalculated later with full context, but log early for debugging)
    // CRITICAL FIX: prodtest_ sessions should NOT trigger mock mode (they're for prod test users who want real reports)
    // Only test_session_ (demo) should trigger mock mode for non-test-users
    const isDemoTestSessionForMode = isDemoTestSession && !isTestUserForAccess;
    const shouldUseRealModeForTestUserEarly = isTestUserForAccess && !mockModeEnv;
    const shouldUseRealModeEarly = forceRealMode || allowRealForTestSessions || forceRealReportsEnv || shouldUseRealModeForTestUserEarly || isProdTestSession;
    const mockModeEarly = mockModeEnv || (isDemoTestSessionForMode && !shouldUseRealModeEarly);
    
    // CRITICAL: [DEPLOY CHECK] log at top of handler (before any returns)
    // This helps diagnose deployment mismatches and env var issues immediately
    console.log(`[DEPLOY CHECK] requestId=${requestId}, buildId=${buildMetadata.buildId || "unknown"}, commitSha=${buildMetadata.fullSha?.substring(0, 7) || "unknown"}`);
    console.log(`[DEPLOY CHECK] allowRealForTestSessions=${allowRealForTestSessions} (raw="${process.env.ALLOW_REAL_FOR_TEST_SESSIONS || "undefined"}"), mockModeEnv=${mockModeEnv} (raw="${process.env.MOCK_MODE || "undefined"}"), forceRealReportsEnv=${forceRealReportsEnv} (raw="${process.env.FORCE_REAL_REPORTS || "undefined"}")`);
    console.log(`[DEPLOY CHECK] isTestSession=${isTestSession}, isDemoTestSession=${isDemoTestSession}, isProdTestSession=${isProdTestSession}, isTestUserForAccess=${isTestUserForAccess}, shouldUseRealMode=${shouldUseRealModeEarly}, mockMode=${mockModeEarly}`);
    
    // CRITICAL: [MODE] log - consolidated mode information for debugging
    console.log(`[MODE] requestId=${requestId}, sessionIdPrefix=${sessionIdFromQuery ? (isProdTestSession ? "prodtest_" : isDemoTestSession ? "test_session_" : "none") : "none"}, isTestSession=${isTestSession}, isDemoTestSession=${isDemoTestSession}, isProdTestSession=${isProdTestSession}, isTestUserForAccess=${isTestUserForAccess}, mockMode=${mockModeEarly}, realMode=${shouldUseRealModeEarly}, env.ALLOW_REAL_FOR_TEST_SESSIONS=${allowRealForTestSessions}, env.MOCK_MODE=${mockModeEnv}`);
    
    // Log request details for debugging (anonymized)
    const requestDetailsLog = {
      requestId,
      timestamp: new Date().toISOString(),
      reportType,
      hasPaymentToken: !!paymentToken,
      hasPaymentIntentId: !!paymentIntentId,
      hasSessionId: !!fallbackSessionId,
      userName: input?.name || "N/A",
      userDOB: input?.dob ? `${input.dob.substring(0, 4)}-XX-XX` : "N/A", // Year only for privacy
      hasCoordinates: !!(input?.latitude && input?.longitude),
      elapsedMs: Date.now() - startTime,
    };
    console.log("[REQUEST PARSED]", JSON.stringify(requestDetailsLog, null, 2));

    // Check for demo mode and test user (needed for payment cancellation checks)
    // NOTE: Test users bypass payment by default to avoid payment verification errors
    // Set BYPASS_PAYMENT_FOR_TEST_USERS=false explicitly if you want test users to go through Stripe
    // CRITICAL FIX (2026-01-18 - ChatGPT Task 3): Use centralized allowlist function
    const isDemoMode = process.env.AI_ASTROLOGY_DEMO_MODE === "true" || process.env.NODE_ENV === "development";
    // SINGLE CHECK: Use one test user check for both payment bypass and access restriction
    const isTestUser = isProdTestUser(input);
    // CRITICAL: Default to true (bypass payment) for test users to avoid payment verification errors
    // Set BYPASS_PAYMENT_FOR_TEST_USERS=false explicitly if you want test users to go through Stripe
    const bypassPaymentForTestUsers = process.env.BYPASS_PAYMENT_FOR_TEST_USERS !== "false";
    // Skip payment verification/capture/cancellation if demo mode OR (test user AND payment bypass enabled)
    const shouldSkipPayment = isDemoMode || (isTestUser && bypassPaymentForTestUsers);

    // Helper function to cancel payment (used in all error scenarios)
    // CRITICAL: Ensures users are NEVER charged if ANY error occurs
    const cancelPaymentSafely = async (reason: string) => {
      // Only cancel if it's a paid report and we have a payment intent
      if (paymentIntentId && reportType && isPaidReportType(reportType) && !shouldSkipPayment) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.url.split('/api')[0];
          const cancelResponse = await fetch(`${baseUrl}/api/ai-astrology/cancel-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentIntentId,
              sessionId: fallbackSessionId,
              reason,
            }),
          });
          if (cancelResponse.ok) {
            console.log(`[PAYMENT CANCELLED - ${reason}]`, { requestId, paymentIntentId });
          } else {
            console.warn(`[PAYMENT CANCELLATION FAILED - ${reason}]`, { requestId, paymentIntentId, status: cancelResponse.status });
          }
        } catch (e: any) {
          console.error(`[PAYMENT CANCELLATION ERROR - ${reason}]`, { requestId, paymentIntentId, error: e?.message || e });
        }
      }
    };

    // CRITICAL: Fail fast - validate everything BEFORE any OpenAI calls
    // Order: 1) Input validation, 2) Access restriction, 3) Report type, 4) Idempotency check, 5) Payment verification, 6) Only then call OpenAI
    
    // 1. Validate input - CRITICAL: Cancel payment if validation fails
    const validationStartTime = Date.now();
    if (!input.name || !input.dob || !input.tob || !input.place) {
      const validationErrorLog = {
        requestId,
        timestamp: new Date().toISOString(),
        action: "INPUT_VALIDATION_FAILED",
        missingFields: {
          name: !input.name,
          dob: !input.dob,
          tob: !input.tob,
          place: !input.place,
        },
        elapsedMs: Date.now() - validationStartTime,
        totalElapsedMs: Date.now() - startTime,
      };
      console.error("[VALIDATION ERROR]", JSON.stringify(validationErrorLog, null, 2));
      await cancelPaymentSafely("Input validation failed - missing required fields");
      return NextResponse.json(
        { ok: false, error: "Missing required fields: name, dob, tob, place" },
        { status: 400, headers: { "X-Request-ID": requestId } }
      );
    }

    if (!input.latitude || !input.longitude) {
      const validationErrorLog = {
        requestId,
        timestamp: new Date().toISOString(),
        action: "INPUT_VALIDATION_FAILED",
        missingFields: {
          latitude: !input.latitude,
          longitude: !input.longitude,
        },
        elapsedMs: Date.now() - validationStartTime,
        totalElapsedMs: Date.now() - startTime,
      };
      console.error("[VALIDATION ERROR]", JSON.stringify(validationErrorLog, null, 2));
      await cancelPaymentSafely("Input validation failed - missing coordinates");
      return NextResponse.json(
        { ok: false, error: "Latitude and longitude are required" },
        { status: 400, headers: { "X-Request-ID": requestId } }
      );
    }
    
    const validationSuccessLog = {
      requestId,
      timestamp: new Date().toISOString(),
      action: "INPUT_VALIDATION_SUCCESS",
      elapsedMs: Date.now() - validationStartTime,
      totalElapsedMs: Date.now() - startTime,
    };
    console.log("[VALIDATION SUCCESS]", JSON.stringify(validationSuccessLog, null, 2));

    // 2. CRITICAL: Access restriction for production testing
    // Only allow Amit Kumar Mandal and Ankita Surabhi until testing is complete
    const restrictAccess = process.env.NEXT_PUBLIC_RESTRICT_ACCESS === "true";
    
    // CRITICAL: Test users ALWAYS bypass access restriction (use same check as payment bypass)
    // CRITICAL FIX (2026-01-18 - ChatGPT Task 3): Use centralized allowlist function
    // IMPORTANT: Reuse isTestUserForAccess from earlier declaration (line 404) - no need to recalculate
    // This ensures test users are NEVER blocked by access restriction
    
    if (restrictAccess && !isTestUserForAccess) {
      // Only check isAllowedUser if NOT a test user
      if (!isAllowedUser(input)) {
        const restrictionError = {
          requestId,
          timestamp: new Date().toISOString(),
          reportType,
          userName: input.name || "N/A",
          userDOB: input.dob || "N/A",
          userPlace: input.place || "N/A",
          userTob: input.tob || "N/A",
          isTestUser: isTestUser,
          isTestUserForAccess: isTestUserForAccess,
          restrictAccess,
          error: "Access restricted for production testing",
        };
        console.error("[ACCESS RESTRICTION]", JSON.stringify(restrictionError, null, 2));
        
        // CRITICAL: Cancel payment if access is restricted (user should not be charged)
        await cancelPaymentSafely("Access restricted - user not authorized");
        
        return NextResponse.json(
          { ok: false, error: getRestrictionMessage() },
          { status: 403, headers: { "X-Request-ID": requestId } }
        );
      }
    }
    
    // Log access check result (use isTestUserForAccess for accuracy)
    const accessCheckLog = {
      requestId,
      timestamp: new Date().toISOString(),
      action: isTestUserForAccess ? "ACCESS_GRANTED_TEST_USER" : restrictAccess ? "ACCESS_CHECK" : "ACCESS_OPEN",
      userName: input.name,
      userDOB: input.dob ? `${input.dob.substring(0, 4)}-XX-XX` : "N/A",
      reportType,
      restrictAccess,
      isTestUser: isTestUser,
      isTestUserForAccess: isTestUserForAccess,
      elapsedMs: Date.now() - startTime,
    };
    console.log("[ACCESS CHECK]", JSON.stringify(accessCheckLog, null, 2));

    // 3. Validate report type - CRITICAL: Cancel payment if invalid
    const validReportTypes: ReportType[] = ["life-summary", "marriage-timing", "career-money", "full-life", "year-analysis", "major-life-phase", "decision-support"];
    if (!reportType || !validReportTypes.includes(reportType)) {
      const reportTypeErrorLog = {
        requestId,
        timestamp: new Date().toISOString(),
        action: "INVALID_REPORT_TYPE",
        providedType: reportType || "MISSING",
        validTypes: validReportTypes,
        elapsedMs: Date.now() - startTime,
      };
      console.error("[REPORT TYPE ERROR]", JSON.stringify(reportTypeErrorLog, null, 2));
      await cancelPaymentSafely("Invalid report type");
      return NextResponse.json(
        { ok: false, error: `Invalid report type. Must be one of: ${validReportTypes.join(", ")}` },
        { status: 400, headers: { "X-Request-ID": requestId } }
      );
    }

    // 4. CRITICAL: Check idempotency BEFORE any OpenAI calls
    // IMPORTANT: In-memory cache is NOT durable on serverless, so prefer persistent store first.
    // CRITICAL FIX: For test users with prodtest_* IDs, bypass cache to ensure fresh real reports
    // This prevents returning cached mock reports when test users should get real reports
    const isTestUserForIdempotency = input ? isProdTestUser(input) : false;
    const mockModeEnvForIdempotency = parseEnvBoolean(process.env.MOCK_MODE);
    // Bypass cache if: test user AND prodtest_ session (not demo test_session_) - ensures fresh real reports
    // prodtest_ sessions are for production test users who should always get fresh real reports
    const shouldBypassCacheForTestUser = isTestUserForIdempotency && !mockModeEnvForIdempotency && isProdTestSession;
    
    const idempotencyKey = generateIdempotencyKey(input, reportType, fallbackSessionId);

    const storedExisting = await getStoredReportByIdempotencyKey(idempotencyKey);
    if (storedExisting) {
      if (storedExisting.status === "completed" && storedExisting.content) {
        // CRITICAL FIX: For test users with test_session_* IDs, bypass cache to ensure fresh real reports
        // This prevents returning cached mock reports when test users should get real reports
        if (shouldBypassCacheForTestUser) {
          console.log(`[CACHE BYPASS] Test user with ${isProdTestSession ? 'prodtest_' : 'test_session_'}* should get real report, bypassing cached report. requestId=${requestId}, reportId=${storedExisting.report_id}, isTestUser=${isTestUserForIdempotency}, isTestSession=${isTestSession}, isProdTestSession=${isProdTestSession}`);
          // Don't return cached report - continue to generate new real report
        } else {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.url.split('/api')[0];
          const redirectUrl = `/ai-astrology/preview?reportId=${encodeURIComponent(storedExisting.report_id)}&reportType=${encodeURIComponent(reportType)}`;
          const fullRedirectUrl = `${baseUrl}${redirectUrl}`;

          return NextResponse.json(
            {
              ok: true,
              data: {
                status: "completed" as const,
                reportId: storedExisting.report_id,
                reportType: storedExisting.report_type,
                input: storedExisting.input,
                content: storedExisting.content,
                generatedAt: storedExisting.updated_at,
                redirectUrl,
                fullRedirectUrl,
                fromCache: true,
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
      }

      if (storedExisting.status === "processing") {
        return NextResponse.json(
          {
            ok: true,
            data: {
              status: "processing" as const,
              reportId: storedExisting.report_id,
              message: "Report generation already in progress. Please wait.",
            },
            requestId,
          },
          {
            status: 202,
            headers: {
              "X-Request-ID": requestId,
              "Retry-After": "10",
            },
          }
        );
      }
    }

    // Fallback: in-memory idempotency (dev-only safety net)
    const cachedReport = getCachedReport(idempotencyKey);
    
    if (cachedReport) {
      // CRITICAL FIX: For test users with test_session_* IDs, bypass cache to ensure fresh real reports
      if (shouldBypassCacheForTestUser) {
        console.log(`[CACHE BYPASS] Test user with ${isProdTestSession ? 'prodtest_' : 'test_session_'}* should get real report, bypassing in-memory cached report. requestId=${requestId}, reportId=${cachedReport.reportId}, isTestUser=${isTestUserForIdempotency}, isTestSession=${isTestSession}, isProdTestSession=${isProdTestSession}`);
        // Don't return cached report - continue to generate new real report
      } else {
        // Report already exists - return cached version (NO OpenAI call)
        const cacheHitLog = {
          requestId,
          timestamp: new Date().toISOString(),
          action: "CACHE_HIT",
          idempotencyKey: idempotencyKey.substring(0, 30) + "...",
          reportId: cachedReport.reportId,
          reportType,
          status: cachedReport.status,
          elapsedMs: Date.now() - startTime,
        };
        console.log("[IDEMPOTENCY CACHE HIT]", JSON.stringify(cacheHitLog, null, 2));
        
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.url.split('/api')[0];
        const redirectUrl = `/ai-astrology/preview?reportId=${encodeURIComponent(cachedReport.reportId)}&reportType=${encodeURIComponent(reportType)}`;
        const fullRedirectUrl = `${baseUrl}${redirectUrl}`;
        
        return NextResponse.json(
          {
            ok: true,
            data: {
              status: "completed" as const,
              reportId: cachedReport.reportId,
              reportType: cachedReport.reportType,
              input: cachedReport.input,
              content: cachedReport.content,
              generatedAt: cachedReport.generatedAt,
              redirectUrl,
              fullRedirectUrl,
              fromCache: true, // Indicate this is from cache
            },
            requestId,
          },
          {
            headers: {
              "X-Request-ID": requestId,
              "Cache-Control": "no-cache", // Don't cache AI-generated content
            },
          }
        );
      }
    }
    
    // Check if report is already processing (prevent concurrent duplicate requests)
    let reportId = `RPT-${Date.now()}-${requestId.substring(0, 8).toUpperCase()}`;
    let bypassInMemoryLock = false;

    // Prefer persistent processing lock (serverless-safe)
    // IMPORTANT: For production, if the Supabase report store isn't available, do NOT fall back to in-memory.
    // In-memory is not durable on serverless and leads to "stuck processing forever" on the client.
    let storeUnavailableError: string | null = null;
    try {
      // Phase 1: Add payment intent ID to tracking (ChatGPT feedback)
      const processing = await markStoredReportProcessing({
        idempotencyKey,
        reportId,
        reportType,
        input,
        paymentIntentId: paymentIntentId || undefined,
      });
      if (!processing.ok) {
        if (processing.existing.status === "processing") {
          // If the existing "processing" row is stale, take over and regenerate using the SAME reportId/idempotencyKey.
          // This avoids permanent "processing" states caused by serverless timeouts.
          if (isProcessingStale({ updatedAtIso: processing.existing.updated_at, reportType: processing.existing.report_type as any })) {
            reportId = processing.existing.report_id;
            bypassInMemoryLock = true;
          } else {
            return NextResponse.json(
              {
                ok: true,
                data: {
                  status: "processing" as const,
                  reportId: processing.existing.report_id,
                  message: "Report generation already in progress. Please wait.",
                },
                requestId,
              },
              {
                status: 202,
                headers: {
                  "X-Request-ID": requestId,
                  "Retry-After": "10",
                },
              }
            );
          }
        }
        if (processing.existing.status === "completed" && processing.existing.content) {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.url.split('/api')[0];
          const redirectUrl = `/ai-astrology/preview?reportId=${encodeURIComponent(processing.existing.report_id)}&reportType=${encodeURIComponent(reportType)}`;
          const fullRedirectUrl = `${baseUrl}${redirectUrl}`;
          return NextResponse.json(
            {
              ok: true,
              data: {
                status: "completed" as const,
                reportId: processing.existing.report_id,
                reportType: processing.existing.report_type,
                input: processing.existing.input,
                content: processing.existing.content,
                generatedAt: processing.existing.updated_at,
                redirectUrl,
                fullRedirectUrl,
                fromCache: true,
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
      }
    } catch (e: any) {
      const msg = String(e?.message || e || "");
      // These errors mean the persistent store cannot be used.
      if (msg.includes("AI_ASTROLOGY_REPORTS_TABLE_MISSING") || msg.includes("SUPABASE_NOT_CONFIGURED")) {
        storeUnavailableError = msg;
      }
    }

    // In production (non-MOCK) we require the persistent store; otherwise polling will never complete reliably.
    // Test sessions are allowed to proceed via forced mock mode below.
    const allowVolatileFallback =
      process.env.NODE_ENV !== "production" || process.env.MOCK_MODE === "true" || isTestSession;
    if (storeUnavailableError && !allowVolatileFallback) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "AI report store is not configured. Please create the Supabase table `ai_astrology_reports` and set Supabase env vars. See: `astrosetu/docs/AI_ASTROLOGY_REPORT_STORE_SUPABASE.sql`.",
          code: storeUnavailableError,
          requestId,
        },
        { status: 503, headers: { "X-Request-ID": requestId, "Cache-Control": "no-cache" } }
      );
    }

    const isProcessing = bypassInMemoryLock ? true : markReportProcessing(idempotencyKey, reportId);
    
    if (!isProcessing) {
      // Another request is already processing this report - return processing status
      const processingLog = {
        requestId,
        timestamp: new Date().toISOString(),
        action: "ALREADY_PROCESSING",
        idempotencyKey: idempotencyKey.substring(0, 30) + "...",
        reportType,
        reportId,
        elapsedMs: Date.now() - startTime,
      };
      console.log("[IDEMPOTENCY ALREADY PROCESSING]", JSON.stringify(processingLog, null, 2));
      
      return NextResponse.json(
        {
          ok: true,
          data: {
            status: "processing" as const,
            reportId,
            message: "Report generation already in progress. Please wait.",
          },
          requestId,
        },
        {
          status: 202, // Accepted - processing
          headers: {
            "X-Request-ID": requestId,
            "Retry-After": "10", // Suggest retrying in 10 seconds
          },
        }
      );
    }

    // CRITICAL SECURITY: Verify payment for paid reports
    // Skip payment verification if demo mode OR (test user AND payment bypass enabled)
    if (isPaidReportType(reportType) && !shouldSkipPayment) {
      // CRITICAL FIX: If paymentToken is missing, try to verify using session_id from query params
      let paymentTokenToVerify = paymentToken;
      let paymentVerified = false;
      
      if (!paymentTokenToVerify) {
        // Try to get session_id from request URL and verify payment
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("session_id");
        
        // CRITICAL: Check if this is a test session BEFORE trying Stripe verification
        // Test sessions start with "test_session_" or "prodtest_" and should NEVER be verified with Stripe
        // CRITICAL FIX: Handle both demo test sessions and production test user sessions
        const isDemoTestSession = sessionId && sessionId.startsWith("test_session_");
        const isProdTestSession = sessionId && sessionId.startsWith("prodtest_");
        if (isDemoTestSession || isProdTestSession) {
          const sessionType = isProdTestSession ? "PROD_TEST" : "DEMO_TEST";
          console.log(`[TEST SESSION] Detected ${sessionType} session: ${sessionId.substring(0, 30)}... - Skipping Stripe verification`);
          
          // For test sessions, generate a payment token directly (bypass Stripe)
          // Extract reportType from session ID (format: test_session_{reportType}_{requestId} or prodtest_{reportType}_{requestId})
          const sessionPrefix = isProdTestSession ? "prodtest_" : "test_session_";
          const afterPrefix = sessionId.substring(sessionPrefix.length);
          // Find the last underscore to separate reportType from requestId
          const lastUnderscoreIndex = afterPrefix.lastIndexOf("_");
          let extractedReportType = reportType; // Default to requested reportType
          
          if (lastUnderscoreIndex > 0) {
            extractedReportType = afterPrefix.substring(0, lastUnderscoreIndex) as ReportType;
          }
          
          // Verify report type matches (or use extracted one if it's valid)
          const validReportType = extractedReportType === reportType ? reportType : extractedReportType;
          
          // Generate payment token for test session
          const { generatePaymentToken } = await import("@/lib/ai-astrology/paymentToken");
          paymentTokenToVerify = generatePaymentToken(validReportType, sessionId);
          paymentVerified = true;
          
          const testSessionVerified = {
            requestId,
            timestamp: new Date().toISOString(),
            reportType: validReportType,
            sessionId: sessionId.substring(0, 20) + "...",
            action: "Test session verified - payment bypassed",
          };
          console.log("[TEST SESSION VERIFIED]", JSON.stringify(testSessionVerified, null, 2));
        } else if (sessionId) {
          // Only try Stripe verification for real (non-test) session IDs
          try {
            // Verify payment using session_id via Stripe API
            const Stripe = (await import("stripe")).default;
            const secretKey = process.env.STRIPE_SECRET_KEY;
            
            if (secretKey && !secretKey.startsWith("pk_")) {
              const stripe = new Stripe(secretKey);
              const session = await stripe.checkout.sessions.retrieve(sessionId);
              
              if (session && session.payment_status === "paid") {
                // Verify report type matches (check both report_type and reportType in metadata)
                const sessionReportType = session.metadata?.reportType || session.metadata?.report_type;
                
                // Allow if report type matches OR if session is paid (more lenient for production)
                if (sessionReportType === reportType || session.payment_status === "paid") {
                  // Generate new token from verified session
                  const { generatePaymentToken } = await import("@/lib/ai-astrology/paymentToken");
                  paymentTokenToVerify = generatePaymentToken(reportType, sessionId);
                  paymentVerified = true;
                  
                  const tokenRegenSuccess = {
                    requestId,
                    timestamp: new Date().toISOString(),
                    reportType,
                    sessionReportType: sessionReportType || "N/A",
                    sessionId: sessionId.substring(0, 20) + "...",
                    action: "Payment token regenerated from session_id",
                  };
                  console.log("[TOKEN REGENERATION SUCCESS]", JSON.stringify(tokenRegenSuccess, null, 2));
                } else {
                  // Log mismatch for debugging
                  const mismatchLog = {
                    requestId,
                    timestamp: new Date().toISOString(),
                    requestedReportType: reportType,
                    sessionReportType: sessionReportType || "N/A",
                    sessionId: sessionId.substring(0, 20) + "...",
                    error: "Report type mismatch but payment is valid",
                  };
                  console.warn("[REPORT TYPE MISMATCH]", JSON.stringify(mismatchLog, null, 2));
                  // Still allow if payment is valid (lenient check)
                  if (session.payment_status === "paid") {
                    const { generatePaymentToken } = await import("@/lib/ai-astrology/paymentToken");
                    paymentTokenToVerify = generatePaymentToken(reportType, sessionId);
                    paymentVerified = true;
                    console.log("[TOKEN REGENERATION SUCCESS - LENIENT]", JSON.stringify(mismatchLog, null, 2));
                  }
                }
              }
            }
          } catch (sessionVerifyError: any) {
            const sessionVerifyErrorLog = {
              requestId,
              timestamp: new Date().toISOString(),
              reportType,
              sessionId: sessionId?.substring(0, 20) + "..." || "N/A",
              errorType: sessionVerifyError.constructor?.name || "Unknown",
              errorMessage: sessionVerifyError.message || "Unknown error",
              errorStack: sessionVerifyError.stack || "No stack trace",
            };
            console.error("[SESSION VERIFICATION ERROR]", JSON.stringify(sessionVerifyErrorLog, null, 2));
            // Continue to check paymentToken below
          }
        }
      }
      
      // If still no valid token, return error with helpful message
      if (!paymentTokenToVerify && !paymentVerified) {
        const paymentErrorContext = {
          requestId,
          timestamp: new Date().toISOString(),
          reportType,
          hasToken: !!paymentToken,
          tokenLength: paymentToken?.length || 0,
          tokenPrefix: paymentToken ? `${paymentToken.substring(0, 10)}...` : "N/A",
          hasSessionId: !!new URL(req.url).searchParams.get("session_id"),
          sessionId: new URL(req.url).searchParams.get("session_id")?.substring(0, 20) + "..." || "N/A",
          isDemoMode,
          isTestUser,
          error: "Payment verification failed - no valid token or session_id",
        };
        
        console.error("[PAYMENT VERIFICATION ERROR]", JSON.stringify(paymentErrorContext, null, 2));
        
        // Cancel payment before returning error
        await cancelPaymentSafely("Payment verification failed - no valid token or session_id");
        
        return NextResponse.json(
          { 
            ok: false, 
            error: "Payment verification required for paid reports. If you've already paid, please try clicking 'View My Report Now' from the payment success page, or contact support with your payment receipt. Your payment has been automatically cancelled and you will NOT be charged.",
            code: "PAYMENT_VERIFICATION_REQUIRED",
            refundInfo: "Payment authorization has been automatically released. No charge will be made. If any amount was authorized, it will be released within 1-3 business days."
          },
          { status: 403 }
        );
      }

      // Verify token if we have one
      if (paymentTokenToVerify && !paymentVerified) {
        const tokenData = verifyPaymentToken(paymentTokenToVerify);
        if (!tokenData) {
          // Try session_id fallback before giving up
          const { searchParams } = new URL(req.url);
          const sessionId = searchParams.get("session_id");
          
          // CRITICAL: Check if this is a test session BEFORE trying Stripe verification
          // CRITICAL FIX: Handle both demo test sessions and production test user sessions
          const isDemoTestSession = sessionId && sessionId.startsWith("test_session_");
          const isProdTestSession = sessionId && sessionId.startsWith("prodtest_");
          if (isDemoTestSession || isProdTestSession) {
            const sessionType = isProdTestSession ? "PROD_TEST" : "DEMO_TEST";
            console.log(`[TEST SESSION] Detected ${sessionType} session in token fallback: ${sessionId.substring(0, 30)}... - Skipping Stripe verification`);
            
            // Extract reportType from test session ID (format: test_session_{reportType}_{requestId} or prodtest_{reportType}_{requestId})
            const sessionPrefix = isProdTestSession ? "prodtest_" : "test_session_";
            const afterPrefix = sessionId.substring(sessionPrefix.length);
            const lastUnderscoreIndex = afterPrefix.lastIndexOf("_");
            let extractedReportType = reportType;
            
            if (lastUnderscoreIndex > 0) {
              extractedReportType = afterPrefix.substring(0, lastUnderscoreIndex) as ReportType;
            }
            
            const validReportType = extractedReportType === reportType ? reportType : extractedReportType;
            
            // Generate payment token for test session
            const { generatePaymentToken } = await import("@/lib/ai-astrology/paymentToken");
            paymentTokenToVerify = generatePaymentToken(validReportType, sessionId);
            paymentVerified = true;
            
            console.log("[TEST SESSION VERIFIED - TOKEN FALLBACK]", JSON.stringify({
              requestId,
              reportType: validReportType,
              sessionId: sessionId.substring(0, 20) + "...",
            }, null, 2));
          } else if (sessionId) {
            // Only try Stripe verification for real (non-test) session IDs
            try {
              const Stripe = (await import("stripe")).default;
              const secretKey = process.env.STRIPE_SECRET_KEY;
              
              if (secretKey && !secretKey.startsWith("pk_")) {
                const stripe = new Stripe(secretKey);
                const session = await stripe.checkout.sessions.retrieve(sessionId);
                
                // More lenient check - accept if payment is paid, even if report type doesn't exactly match
                const sessionReportType = session?.metadata?.reportType || session?.metadata?.report_type;
                if (session && session.payment_status === "paid") {
                  // If report type matches or payment is valid, accept it
                  if (sessionReportType === reportType || !sessionReportType) {
                    const { generatePaymentToken } = await import("@/lib/ai-astrology/paymentToken");
                    paymentTokenToVerify = generatePaymentToken(reportType, sessionId);
                    paymentVerified = true;
                    
                    const tokenRegenSuccess2 = {
                      requestId,
                      timestamp: new Date().toISOString(),
                      reportType,
                      sessionReportType: sessionReportType || "N/A",
                      sessionId: sessionId.substring(0, 20) + "...",
                      action: "Payment token regenerated from session_id (fallback)",
                    };
                    console.log("[TOKEN REGENERATION SUCCESS - FALLBACK]", JSON.stringify(tokenRegenSuccess2, null, 2));
                  }
                }
              }
            } catch (e) {
              // Fall through to error below
            }
          }
          
          if (!paymentVerified) {
            const invalidTokenError = {
              requestId,
              timestamp: new Date().toISOString(),
              reportType,
              hasToken: !!paymentTokenToVerify,
              tokenLength: paymentTokenToVerify?.length || 0,
              hasSessionId: !!sessionId,
              error: "Invalid or expired payment token",
            };
            console.error("[INVALID PAYMENT TOKEN]", JSON.stringify(invalidTokenError, null, 2));
            
            // Cancel payment before returning error
            await cancelPaymentSafely("Invalid or expired payment token");
            
            return NextResponse.json(
              { 
                ok: false, 
                error: "Invalid or expired payment token. Please complete payment again or contact support with your payment receipt. Your payment has been automatically cancelled and you will NOT be charged.",
                refundInfo: "Payment authorization has been automatically released. No charge will be made."
              },
              { status: 403 }
            );
          }
        } else {
          // Verify the token matches the requested report type
          if (tokenData.reportType !== reportType) {
            // Enhanced error handling: Try to recover using session_id if available
            const tokenMismatchContext = {
              requestId,
              timestamp: new Date().toISOString(),
              tokenReportType: tokenData.reportType,
              requestedReportType: reportType,
              sessionId: tokenData.sessionId,
              hasFallbackSessionId: !!fallbackSessionId,
              error: "Payment token report type mismatch",
            };
            console.warn("[PAYMENT TOKEN MISMATCH]", JSON.stringify(tokenMismatchContext, null, 2));
            
            // Try to recover: If we have a session_id, verify payment directly with Stripe
            if (fallbackSessionId || tokenData.sessionId) {
              const sessionIdToVerify = fallbackSessionId || tokenData.sessionId;
              try {
                const Stripe = (await import("stripe")).default;
                const secretKey = process.env.STRIPE_SECRET_KEY;
                
                if (secretKey && !secretKey.startsWith("pk_")) {
                  const stripe = new Stripe(secretKey);
                  const session = await stripe.checkout.sessions.retrieve(sessionIdToVerify);
                  
                  // Check if payment is valid and allow if report type matches or payment is paid
                  const paymentIntentStatus = typeof session.payment_intent === 'object' && session.payment_intent !== null
                    ? (session.payment_intent as any).status
                    : undefined;
                  const isPaymentValid = session.payment_status === "paid" || 
                                         paymentIntentStatus === "requires_capture" || 
                                         paymentIntentStatus === "succeeded";
                  
                  if (session && isPaymentValid) {
                    const sessionReportType = session.metadata?.reportType || session.metadata?.report_type;
                    
                    // More lenient: Allow if payment is valid, even if report types don't match exactly
                    // This handles cases where user paid for one report but wants to generate another
                    // OR where the token was generated for a different report type
                    if (sessionReportType === reportType || isPaymentValid) {
                      // Regenerate token with correct report type
                      const { generatePaymentToken } = await import("@/lib/ai-astrology/paymentToken");
                      paymentTokenToVerify = generatePaymentToken(reportType, sessionIdToVerify);
                      paymentVerified = true;
                      
                      const recoveryLog = {
                        requestId,
                        timestamp: new Date().toISOString(),
                        action: "Recovered from token mismatch using session_id",
                        oldTokenReportType: tokenData.reportType,
                        newReportType: reportType,
                        sessionReportType: sessionReportType || "N/A",
                        sessionId: sessionIdToVerify.substring(0, 20) + "...",
                      };
                      console.log("[TOKEN MISMATCH RECOVERY]", JSON.stringify(recoveryLog, null, 2));
                    } else {
                      // Payment exists but for a different report type - cancel and return error
                      await cancelPaymentSafely("Payment token mismatch - user paid for different report type");
                      
                      return NextResponse.json(
                        { 
                          ok: false, 
                          error: `Payment verification failed. The payment was made for "${sessionReportType || "a different"}" report, but you're trying to generate "${reportType}" report. Please purchase the correct report type or contact support.`,
                          code: "PAYMENT_TYPE_MISMATCH",
                          paidForReportType: sessionReportType || null,
                          requestedReportType: reportType,
                        },
                        { status: 403 }
                      );
                    }
                  } else {
                    // Payment session not found or invalid - cancel and return error
                    await cancelPaymentSafely("Payment token mismatch - session verification failed");
                    
                    return NextResponse.json(
                      { 
                        ok: false, 
                        error: "Payment verification failed. The payment token does not match the requested report type. If you've completed payment, please contact support with your payment receipt for assistance.",
                        code: "PAYMENT_TOKEN_MISMATCH",
                        recoveryAttempted: true,
                      },
                      { status: 403 }
                    );
                  }
                }
              } catch (recoveryError: any) {
                // Recovery failed - cancel payment and return error
                console.error("[TOKEN MISMATCH RECOVERY FAILED]", {
                  requestId,
                  error: recoveryError.message,
                  sessionId: sessionIdToVerify?.substring(0, 20) + "..." || "N/A",
                });
                
                await cancelPaymentSafely("Payment token mismatch - recovery attempt failed");
                
                return NextResponse.json(
                  { 
                    ok: false, 
                    error: "Payment verification failed. The payment token does not match the requested report type. If you've completed payment, please contact support with your payment receipt for assistance.",
                    code: "PAYMENT_TOKEN_MISMATCH",
                    recoveryAttempted: true,
                  },
                  { status: 403 }
                );
              }
            } else {
              // No session_id to recover with - cancel payment and return error
              await cancelPaymentSafely("Payment token mismatch - no recovery option available");
              
              return NextResponse.json(
                { 
                  ok: false, 
                  error: `Payment verification failed. The payment token was generated for "${tokenData.reportType}" report, but you're trying to generate "${reportType}" report. Please ensure you're generating the correct report type that you paid for.`,
                  code: "PAYMENT_TOKEN_MISMATCH",
                  tokenReportType: tokenData.reportType,
                  requestedReportType: reportType,
                },
                { status: 403 }
              );
            }
          }
        }
      }
    }
    
    // Log demo mode or test user usage (with payment bypass status)
    if ((isDemoMode || isTestUser) && isPaidReportType(reportType)) {
      const mode = isDemoMode ? "DEMO MODE" : "TEST USER";
      const bypassLog = {
        requestId,
        timestamp: new Date().toISOString(),
        mode,
        reportType,
        bypassPaymentForTestUsers,
        reason: isDemoMode ? "Demo mode enabled" : (bypassPaymentForTestUsers ? "Test user - payment bypassed" : "Test user - payment required"),
      };
      console.log(`[PAYMENT BYPASS STATUS]`, JSON.stringify(bypassLog, null, 2));
    }
    
    // Log successful payment verification for paid reports
    if (isPaidReportType(reportType) && !shouldSkipPayment) {
      const paymentVerifiedLog = {
        requestId,
        timestamp: new Date().toISOString(),
        reportType,
        hasToken: !!paymentToken,
        tokenRegenerated: !paymentToken && !!new URL(req.url).searchParams.get("session_id"),
      };
      console.log("[PAYMENT VERIFIED]", JSON.stringify(paymentVerifiedLog, null, 2));
    }
    
    // Log generation start
    const generationStartLog = {
      requestId,
      timestamp: new Date().toISOString(),
      action: "REPORT_GENERATION_START",
      reportType,
      isPaidReport: isPaidReportType(reportType),
      isTestUser,
      isDemoMode,
      elapsedMs: Date.now() - startTime,
    };
    console.log("[GENERATION START]", JSON.stringify(generationStartLog, null, 2));

    // MOCK_MODE: Return mock data for testing/development (prevents external API calls)
    // CRITICAL FIX (ChatGPT Feedback): Case-insensitive env parsing + test user priority
    // 
    // Rules:
    // 1. If isTestUserForAccess === true (prod test user), default to REAL mode even for test_session_*
    //    unless MOCK_MODE is explicitly true (allows override for explicit testing)
    // 2. For non-test-users with test_session_*: use mock unless ALLOW_REAL_FOR_TEST_SESSIONS=true
    // 3. MOCK_MODE=true overrides everything (explicit dev/demo mode)
    // 4. Environment variables are parsed case-insensitively (true/TRUE/True/1 all work)
    //
    // You can force real mode by:
    //   1. Setting useReal=true in request body, OR
    //   2. Adding ?use_real=true or ?force_real=true to URL query params
    //   3. Setting ALLOW_REAL_FOR_TEST_SESSIONS=true environment variable (case-insensitive)
    //   4. Being a prod test user (isTestUserForAccess === true)
    
    // Parse environment variables with case-insensitive parsing (already done above, but recalculate with full context)
    const allowRealForTestSessionsFinal = parseEnvBoolean(process.env.ALLOW_REAL_FOR_TEST_SESSIONS);
    const mockModeEnvFinal = parseEnvBoolean(process.env.MOCK_MODE);
    const forceRealReportsEnvFinal = parseEnvBoolean(process.env.FORCE_REAL_REPORTS);
    
    // CRITICAL: Test users (isTestUserForAccess) should get REAL reports by default
    // Use centralized calculation function for consistency and testability
    // CRITICAL FIX: Pass isDemoTestSession (not isTestSession) so prodtest_ sessions don't trigger mock mode
    // prodtest_ sessions are for production test users who should always get real reports
    // Reuse isTestUser from earlier declaration (line 444) - no need to recalculate
    const { shouldUseRealMode, mockMode } = calculateReportMode({
      isTestSession: isDemoTestSession, // Only demo test sessions should trigger mock mode logic
      isTestUserForAccess: isTestUser,
      forceRealMode,
      allowRealForTestSessions: allowRealForTestSessionsFinal,
      mockModeEnv: mockModeEnvFinal,
      forceRealReportsEnv: forceRealReportsEnvFinal,
    });
    
    // CRITICAL DEBUG: Log environment variable check (ALWAYS log for test sessions)
    // Using simple console.log format for better visibility in Vercel logs
    if (isTestSession || isTestUser) {
      console.log(`[REAL MODE CHECK] requestId=${requestId}, sessionId=${sessionIdFromQuery || "N/A"}`);
      console.log(`[REAL MODE CHECK] isTestUser=${isTestUser}, isTestSession=${isTestSession}`);
      console.log(`[REAL MODE CHECK] allowRealForTestSessions=${allowRealForTestSessionsFinal} (raw="${process.env.ALLOW_REAL_FOR_TEST_SESSIONS || "undefined"}"), mockModeEnv=${mockModeEnvFinal} (raw="${process.env.MOCK_MODE || "undefined"}")`);
      console.log(`[REAL MODE CHECK] forceRealMode=${forceRealMode}, shouldUseRealModeForTestUser=${isTestUser && !mockModeEnvFinal}, shouldUseRealMode=${shouldUseRealMode}, mockMode=${mockMode}`);
      
      // Also log all related env vars
      const relatedEnvVars = Object.keys(process.env)
        .filter(k => k.includes("ALLOW") || k.includes("REAL") || k.includes("MOCK") || k.includes("FORCE"))
        .map(k => `${k}=${process.env[k]}`);
      console.log(`[REAL MODE CHECK] Related env vars: ${relatedEnvVars.join(", ") || "NONE"}`);
    }
    
    // Log when real mode is enabled for test sessions or test users
    if ((isTestSession || isTestUser) && shouldUseRealMode) {
      let reason = "unknown";
      if (mockModeEnvFinal) {
        reason = "MOCK_MODE override (should not happen if real mode enabled)";
      } else if (forceRealMode) {
        reason = "explicit request (URL/body)";
      } else if (isTestUser && !mockModeEnvFinal) {
        reason = "prod test user (isTestUserForAccess=true)";
      } else if (allowRealForTestSessionsFinal) {
        reason = "environment variable (ALLOW_REAL_FOR_TEST_SESSIONS=true)";
      } else if (forceRealReportsEnvFinal) {
        reason = "environment variable (FORCE_REAL_REPORTS=true)";
      }
      console.log(`[TEST SESSION/USER - REAL MODE ENABLED] requestId=${requestId}, reason=${reason}`);
      console.log(`[TEST SESSION/USER - REAL MODE ENABLED] isTestUser=${isTestUser}, isTestSession=${isTestSession}, mockMode=${mockMode}`);
    }
    
    // Log when mock mode is being used for test sessions
    if ((isTestSession || isTestUser) && mockMode) {
      console.log(`[TEST SESSION/USER - MOCK MODE] requestId=${requestId}, shouldUseRealMode=${shouldUseRealMode}, mockModeEnv=${mockModeEnvFinal}, isTestUser=${isTestUser}`);
    }
    
    if (mockMode) {
      const { getMockReport, simulateApiDelay } = await import("@/lib/ai-astrology/mocks/fixtures");
      
      // Simulate API delay for realistic testing
      await simulateApiDelay(1500, 3000);
      
      // Generate mock report
      const rawMock = getMockReport(reportType);
      const mockReportContent = ensureFutureWindows(reportType, rawMock, {
        timeZone: input.timezone || "Australia/Melbourne",
      });
      
      // CRITICAL: Strip mock content before caching/storing (production safety)
      // Use forceStrip: true to ensure mock content is stripped even in test sessions
      let cleanedMockContent = stripMockContent(mockReportContent, true);
      
      // DEBUG: Log section count after stripping
      const sectionsBeforeStrip = cleanedMockContent.sections?.length || 0;
      console.log(`[MOCK REPORT DEBUG] After stripping: ${sectionsBeforeStrip} sections for ${reportType}`);
      
      // CRITICAL FIX (2026-01-19): Ensure mock reports also have minimum sections
      // Mock reports from fixtures can be too short, so we need to add fallback sections
      const { ensureMinimumSections } = await import("@/lib/ai-astrology/reportGenerator");
      const sectionsBefore = cleanedMockContent.sections?.length || 0;
      cleanedMockContent = ensureMinimumSections(cleanedMockContent, reportType);
      const sectionsAfter = cleanedMockContent.sections?.length || 0;
      
      // CRITICAL: Log section details for debugging
      console.log(`[MOCK REPORT DEBUG] Sections before fallback: ${sectionsBefore}, after: ${sectionsAfter}`);
      console.log(`[MOCK REPORT DEBUG] Section titles: ${cleanedMockContent.sections?.map(s => s.title).join(", ") || "NONE"}`);
      
      if (sectionsAfter > sectionsBefore) {
        console.log(`[MOCK REPORT] Added ${sectionsAfter - sectionsBefore} fallback sections (now ${sectionsAfter} total)`);
      }
      
      // CRITICAL: Ensure sections array exists and is not empty
      if (!cleanedMockContent.sections || cleanedMockContent.sections.length === 0) {
        console.error(`[MOCK REPORT CRITICAL ERROR] No sections after ensureMinimumSections! ReportType: ${reportType}`);
        // Force add at least one section as emergency fallback
        cleanedMockContent = {
          ...cleanedMockContent,
          sections: [{
            title: "Decision Analysis",
            content: "This report provides comprehensive decision-making guidance based on your birth chart analysis.",
          }],
        };
      }
      
      // Phase 1: Validate mock report (even mock reports should pass validation)
      const mockValidation = validateReportBeforeCompletion(cleanedMockContent, input, paymentToken, reportType);
      
      if (!mockValidation.valid) {
        // This should rarely happen, but handle it
        console.warn("[MOCK REPORT VALIDATION FAILED]", JSON.stringify({
          requestId,
          reportId,
          error: mockValidation.error,
          errorCode: mockValidation.errorCode,
        }, null, 2));
        
        await markStoredReportFailed({
          idempotencyKey,
          reportId,
          errorMessage: mockValidation.error || "Mock report validation failed",
          errorCode: (mockValidation.errorCode || "VALIDATION_FAILED") as ReportErrorCode,
        });
        
        // In mock mode, we don't need to refund (payment not charged)
        // But we still mark as failed for consistency
      } else {
        // Cache the mock report (for idempotency)
        cacheReport(idempotencyKey, reportId, cleanedMockContent, reportType, input);
        // Persist completion (best-effort, serverless-safe)
        await markStoredReportCompleted({ idempotencyKey, reportId, content: cleanedMockContent });
      }
      
      const mockLog = {
        requestId,
        timestamp: new Date().toISOString(),
        action: "MOCK_REPORT_GENERATED",
        reportType,
        reportId,
        isTestSession,
        sectionsCount: cleanedMockContent.sections?.length || 0,
        hasDecisionContext: !!cleanedMockContent.decisionContext,
        hasDecisionOptions: !!(cleanedMockContent.decisionOptions && cleanedMockContent.decisionOptions.length > 0),
        sectionTitles: cleanedMockContent.sections?.map(s => s.title) || [],
        elapsedMs: Date.now() - startTime,
      };
      console.log("[MOCK MODE]", JSON.stringify(mockLog, null, 2));
      
      // CRITICAL: Verify sections are present before returning - force add if missing
      if (!cleanedMockContent.sections || cleanedMockContent.sections.length < 6) {
        console.error("[MOCK REPORT ERROR] Report has insufficient sections after fallback addition!", {
          reportType,
          sectionsCount: cleanedMockContent.sections?.length || 0,
          sections: cleanedMockContent.sections?.map(s => s.title) || [],
        });
        
        // EMERGENCY FIX: Force add sections if they're still missing
        if (!cleanedMockContent.sections || cleanedMockContent.sections.length === 0) {
          console.error("[MOCK REPORT CRITICAL] Forcing emergency sections for decision-support report!");
          cleanedMockContent = {
            ...cleanedMockContent,
            sections: [
              {
                title: "Current Astrological Climate for Decision-Making",
                content: "Your current Dasha period and planetary transits create a specific decision-making environment. Understanding these influences helps you align your choices with favorable timing. Some periods favor decisive action, while others require careful planning and gathering more information.",
              },
              {
                title: "Astrological Analysis of Decision Options",
                content: "From an astrological perspective, different decision options have varying levels of alignment with your birth chart patterns. Options that align with your natural strengths and current planetary influences tend to have better outcomes.",
              },
              {
                title: "Optimal Timing for Decisions",
                content: "Timing is a critical factor in decision-making. Some periods are naturally more favorable for taking action, while others require patience and preparation. The alignment of planets and current Dasha period influences when decisions should be made.",
              },
              {
                title: "Strategic Decision-Making Approach",
                content: "A strategic approach to decision-making involves considering both astrological guidance and practical factors. Combine insights from your birth chart with real-world considerations, personal values, and professional advice when needed.",
              },
              {
                title: "Important Factors to Consider",
                content: "When making major decisions, several astrological factors should be considered. These include the current Dasha period, planetary transits affecting relevant houses, and the alignment of your decision with your natural strengths.",
              },
              {
                title: "Guidance for Different Types of Decisions",
                content: "Different types of decisions require different approaches based on astrological timing. Career decisions benefit from analyzing the 10th house and career-related planets. Relationship decisions involve the 7th house and Venus influences. Financial decisions relate to the 2nd and 11th houses.",
              },
            ],
          };
        }
      }
      
      // Final verification - log section count before sending response
      console.log(`[MOCK REPORT FINAL] ReportType: ${reportType}, Sections: ${cleanedMockContent.sections?.length || 0}, SectionTitles: ${cleanedMockContent.sections?.map(s => s.title).join(", ") || "NONE"}`);
      
      return NextResponse.json(
        {
          ok: true,
          data: {
            status: "completed" as const,
            reportId,
            reportType,
            input,
            content: cleanedMockContent,
            generatedAt: cleanedMockContent.generatedAt || new Date().toISOString(),
          },
          requestId,
        },
        {
          headers: {
            "X-Request-ID": requestId,
            "X-Mock-Mode": "true",
          },
        }
      );
    }

    // Generate report based on type with hard timeout fallback
    // Optimized timeouts for faster user experience:
    // - Reduced retries (3 instead of 5) = faster failure
    // - Reduced retry waits (5-20s instead of 10-60s) = faster recovery
    // - Reduced token limits = faster generation
    // Timeout values: 60s for free reports (astrology + AI), 120s for complex paid reports
    // Free reports might take longer due to external astrology data fetch before AI
    const isComplexReport = reportType === "full-life" || reportType === "major-life-phase";
    const isCareerMoneyReport = reportType === "career-money";
    const isFreeReport = reportType === "life-summary";
    // Free reports: 65s (external astrology fetch can take time, then AI needs time)
    // Regular paid reports: 60s (already have data, just OpenAI)
    // Career & Money: 120s (can be complex with multiple timing windows and recommendations)
    // Complex reports (full-life, major-life-phase): 120s (more tokens to generate - 2200+ tokens for comprehensive analysis)
    // Increased from 90s to 120s for better reliability with complex reports and to prevent timeout issues
    const REPORT_GENERATION_TIMEOUT = isComplexReport || isCareerMoneyReport ? 120000 : (isFreeReport ? 65000 : 60000);
    let reportContent;
    let cleanedReportContent: ReportContent | undefined; // Declared in broader scope for use in response
    
    // CRITICAL FIX (ChatGPT Feedback): Heartbeat during generation
    // Updates report's updated_at every 15-20s to prevent stuck "processing" status
    // when serverless function times out. Defined outside try block for catch access.
    let heartbeatIntervalId: NodeJS.Timeout | null = null;
    const heartbeatIntervalMs = 18000; // 18 seconds (between 15-20s as recommended)
    const startHeartbeat = () => {
      heartbeatIntervalId = setInterval(async () => {
        try {
          await updateStoredReportHeartbeat({ idempotencyKey, reportId });
        } catch (err) {
          // Ignore heartbeat errors - they shouldn't block report generation
          console.warn("[HEARTBEAT] Heartbeat update failed (non-critical):", err);
        }
      }, heartbeatIntervalMs);
    };
    const stopHeartbeat = () => {
      if (heartbeatIntervalId) {
        clearInterval(heartbeatIntervalId);
        heartbeatIntervalId = null;
      }
    };
    
    try {
      // Start heartbeat when generation begins
      startHeartbeat();
      // Create a timeout promise that rejects after REPORT_GENERATION_TIMEOUT
      // CRITICAL FIX: Store timeout ID to ensure it can be cleared
      let timeoutId: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("Report generation timed out. Please try again with a simpler request."));
        }, REPORT_GENERATION_TIMEOUT);
      });

      // Generate session key for OpenAI call tracking
      const sessionKey = generateSessionKey(input);
      
      // Race between report generation and timeout
      const reportGenerationPromise = (async () => {
        try {
          switch (reportType) {
            case "life-summary":
              return await generateLifeSummaryReport(input, sessionKey);
            case "marriage-timing":
              return await generateMarriageTimingReport(input, sessionKey);
            case "career-money":
              return await generateCareerMoneyReport(input, sessionKey);
            case "full-life":
              return await generateFullLifeReport(input, sessionKey);
            case "year-analysis":
              // Use next 12 months from current date (intelligent date window)
              // This provides guidance for the actual upcoming year period, not just calendar year
              const yearAnalysisRange = getYearAnalysisDateRange();
              return await generateYearAnalysisReport(input, sessionKey, {
                startYear: yearAnalysisRange.startYear,
                startMonth: yearAnalysisRange.startMonth,
                endYear: yearAnalysisRange.endYear,
                endMonth: yearAnalysisRange.endMonth,
              });
            case "major-life-phase":
              return await generateMajorLifePhaseReport(input, sessionKey);
            case "decision-support":
              return await generateDecisionSupportReport(input, decisionContext, sessionKey);
            default:
              throw new Error(`Unknown report type: ${reportType}`);
          }
        } finally {
          // Always stop heartbeat when generation completes (success or failure)
          stopHeartbeat();
        }
      })();

      // Race the timeout against report generation
      // CRITICAL FIX: Ensure timeout is cleared if report generation succeeds
      try {
        reportContent = await Promise.race([reportGenerationPromise, timeoutPromise]);
        // Clear timeout if report generation succeeded
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        // Stop heartbeat on success
        stopHeartbeat();
      } catch (raceError: any) {
        // Clear timeout on error
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        // Stop heartbeat on error
        stopHeartbeat();
        // Re-throw the error to be handled by outer catch
        throw raceError;
      }

      // CENTRAL GUARDRail: Ensure all timing windows are future-only before caching/storing/rendering.
      // This fixes LLM “past year” leakage and also protects users when prompts are imperfect.
      reportContent = ensureFutureWindows(reportType, reportContent, {
        timeZone: input.timezone || "Australia/Melbourne",
      });
      
      // Log successful completion with timing
      const generationTime = Date.now() - startTime;
      const successLog = {
        requestId,
        timestamp: new Date().toISOString(),
        action: "REPORT_GENERATION_SUCCESS",
        reportType,
        userName: input.name,
        userDOB: input.dob ? `${input.dob.substring(0, 4)}-XX-XX` : "N/A",
        contentLength: reportContent ? JSON.stringify(reportContent).length : 0,
        hasReportId: !!reportContent?.reportId,
        reportId: reportContent?.reportId || "N/A",
        generationTimeMs: generationTime,
        isTestUser,
        isDemoMode,
        elapsedMs: generationTime,
      };
      console.log("[REPORT GENERATION SUCCESS]", JSON.stringify(successLog, null, 2));
      
      // CRITICAL: Strip mock content before caching/storing (production safety - even for real reports)
      cleanedReportContent = stripMockContent(reportContent);
      
      // CRITICAL FIX: Ensure minimum sections AFTER stripping mock content
      // This ensures reports have enough sections even after mock content is removed
      const { ensureMinimumSections } = await import("@/lib/ai-astrology/reportGenerator");
      const sectionsBeforeMinCheck = cleanedReportContent.sections?.length || 0;
      cleanedReportContent = ensureMinimumSections(cleanedReportContent, reportType);
      const sectionsAfterMinCheck = cleanedReportContent.sections?.length || 0;
      if (sectionsAfterMinCheck > sectionsBeforeMinCheck) {
        console.log(`[REPORT SECTIONS] Added ${sectionsAfterMinCheck - sectionsBeforeMinCheck} fallback sections after mock content stripping. requestId=${requestId}, reportType=${reportType}, before=${sectionsBeforeMinCheck}, after=${sectionsAfterMinCheck}`);
      }
      
      // Phase 1: STRICT VALIDATION before marking as "completed" (ChatGPT feedback)
      const validation = validateReportBeforeCompletion(cleanedReportContent, input, paymentToken, reportType);
      
      if (!validation.valid) {
        // Validation failed - mark as failed and trigger refund
        const errorMessage = validation.error || "Report validation failed";
        const errorCode = validation.errorCode || "VALIDATION_FAILED";
        
        console.error("[REPORT VALIDATION FAILED]", JSON.stringify({
          requestId,
          reportId,
          reportType,
          error: errorMessage,
          errorCode,
          timestamp: new Date().toISOString(),
        }, null, 2));
        
        await markStoredReportFailed({
          idempotencyKey,
          reportId,
          errorMessage,
          errorCode: errorCode as ReportErrorCode,
        });
        
        // Trigger refund if payment was made
        if (paymentIntentId && isPaidReportType(reportType) && !shouldSkipPayment) {
          await cancelPaymentSafely(`Report validation failed: ${errorMessage}`);
        }
        
        return NextResponse.json(
          {
            ok: false,
            error: `Report validation failed: ${errorMessage}. Your payment has been automatically cancelled.`,
            code: errorCode,
            requestId,
          },
          { status: 500 }
        );
      }
      
      // CRITICAL: Cache the generated report to prevent duplicate OpenAI calls
      cacheReport(idempotencyKey, reportId, cleanedReportContent, reportType, input);
      // Persist completion (best-effort, serverless-safe) - only after validation passes
      await markStoredReportCompleted({ idempotencyKey, reportId, content: cleanedReportContent });
      const cacheSaveLog = {
        requestId,
        timestamp: new Date().toISOString(),
        action: "REPORT_CACHED",
        idempotencyKey: idempotencyKey.substring(0, 30) + "...",
        reportId,
        reportType,
        elapsedMs: Date.now() - startTime,
      };
      console.log("[IDEMPOTENCY CACHED]", JSON.stringify(cacheSaveLog, null, 2));
  } catch (error: any) {
    // COMPREHENSIVE ERROR LOGGING for production debugging
    const totalTime = Date.now() - startTime;
    const errorContext = {
      requestId,
      timestamp: new Date().toISOString(),
      action: "REPORT_GENERATION_ERROR",
      reportType,
      hasInput: !!input,
      inputName: input?.name || "N/A", // Name only, no sensitive data
      inputDOB: input?.dob ? `${input.dob.substring(0, 4)}-XX-XX` : "N/A", // Year only for privacy
      isPaidReport: isPaidReportType(reportType),
      isDemoMode,
      isTestUser,
      errorType: error.constructor?.name || "Unknown",
      errorMessage: error.message || "Unknown error",
      errorStack: error.stack?.substring(0, 1000) || "No stack trace", // Limit stack trace length
      totalTimeMs: totalTime,
      elapsedMs: totalTime,
    };
    
    console.error("[REPORT GENERATION ERROR]", JSON.stringify(errorContext, null, 2));
    
    // Provide user-friendly error message without exposing internal details
    const errorMessage = error.message || "Unknown error";
    const errorString = JSON.stringify(error).toLowerCase();

      // CRITICAL FIX (ChatGPT Feedback): Always stop heartbeat on error
      stopHeartbeat();
      
      // CRITICAL FIX (ChatGPT Feedback - Issue A): Fail-fast for allowlisted users
      // If test user and error is dependency/LLM/parsing failure, return error immediately
      // This prevents placeholder contamination that would then be rejected by validator
      const isDependencyError = 
        errorMessage.includes("prokerala") ||
        errorMessage.includes("PROKERALA") ||
        errorMessage.includes("404") ||
        errorMessage.includes("endpoint not available") ||
        errorMessage.includes("API key") ||
        errorMessage.includes("not configured") ||
        errorMessage.includes("insufficient credit") ||
        errorMessage.includes("quota") ||
        errorString.includes("prokerala") ||
        errorString.includes("endpoint_not_available");
      
      const isLLMError = 
        errorMessage.includes("openai") ||
        errorMessage.includes("OpenAI") ||
        errorMessage.includes("model") ||
        errorMessage.includes("token") ||
        errorMessage.includes("parsing") ||
        errorMessage.includes("parse") ||
        errorString.includes("openai") ||
        errorString.includes("model_not_found");
      
      const isGenerationFailure = isDependencyError || isLLMError;
      
      if (isTestUserForAccess && isGenerationFailure) {
        // Fail-fast: Return error immediately instead of generating placeholder
        const errorCode: ReportErrorCode = isDependencyError ? "DEPENDENCY_FAILURE" : "GENERATION_FAILED";
        
        console.error("[FAIL-FAST] Allowlisted test user - returning error instead of placeholder", {
          requestId,
          reportId,
          reportType,
          errorCode,
          errorMessage,
          isDependencyError,
          isLLMError,
        });
        
        // Mark as failed
        try {
          await markStoredReportFailed({
            idempotencyKey,
            reportId,
            errorMessage: `Report generation failed: ${errorMessage}`,
            errorCode,
          });
        } catch (markFailedError) {
          console.error("[FAIL-FAST] Failed to mark report as failed:", markFailedError);
        }
        
        // Cancel payment if applicable
        if (paymentIntentId && isPaidReportType(reportType) && !shouldSkipPayment) {
          try {
            await cancelPaymentSafely(`Report generation failed: ${errorCode}`);
          } catch (cancelError) {
            console.error("[FAIL-FAST] Payment cancellation error:", cancelError);
          }
        }
        
        // Return clean error response
        return NextResponse.json(
          {
            ok: false,
            error: isDependencyError 
              ? "Report generation failed due to upstream dependency issue. Please try again later or contact support."
              : "Report generation failed. Please try again later or contact support.",
            code: errorCode,
            requestId,
          },
          { 
            status: 500,
            headers: {
              "X-Request-ID": requestId,
              "Cache-Control": "no-cache, no-store, must-revalidate",
            }
          }
        );
      }
      
      // CRITICAL FIX (ChatGPT Feedback): Always mark as failed if generation fails
      // Never leave reports stuck in "processing" status - ensures catch/finally always updates status
      // This prevents reports from being stuck forever when serverless function times out
      try {
        // Determine error code
        let errorCode: ReportErrorCode = "GENERATION_ERROR";
        const errorLower = errorMessage.toLowerCase();
        if (errorLower.includes("timeout")) {
          errorCode = "GENERATION_TIMEOUT";
        } else if (errorLower.includes("payment") || errorLower.includes("verification")) {
          errorCode = "PAYMENT_VERIFICATION_FAILED";
        } else if (isDependencyError) {
          errorCode = "DEPENDENCY_FAILURE";
        } else if (isLLMError) {
          errorCode = "GENERATION_FAILED";
        }
        
        await markStoredReportFailed({ 
          idempotencyKey, 
          reportId, 
          errorMessage,
          errorCode,
        });
      } catch (markFailedError) {
        // Log but don't throw - marking failed is best-effort but critical
        console.error("[MARK_FAILED] Failed to mark report as failed:", markFailedError);
        // Don't re-throw - we've already logged the error above
      }
      
      // Check if it's a timeout error
      const isTimeoutError = 
        errorMessage.includes("timed out") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("Report generation timed out");
      
      // Log timeout errors with additional context
      if (isTimeoutError) {
        const timeoutErrorContext = {
          requestId,
          timestamp: new Date().toISOString(),
          reportType,
          timeoutMs: REPORT_GENERATION_TIMEOUT,
          errorType: "TIMEOUT",
        };
        console.error("[REPORT GENERATION TIMEOUT]", JSON.stringify(timeoutErrorContext, null, 2));
      }
      
      // Check for third-party quota / credit exhaustion (403 with "insufficient credit balance")
      // Keep generic to avoid vendor-specific coupling.
      const isThirdPartyQuotaError =
        errorMessage.includes("insufficient credit") ||
        errorMessage.includes("credit balance") ||
        errorMessage.includes("sufficient credit") ||
        errorString.includes("insufficient credit") ||
        errorString.includes("credit balance") ||
        errorString.includes("sufficient credit") ||
        (errorMessage.includes("403") && (errorString.includes("credit") || errorString.includes("balance")));
      
      // Check for rate limit errors specifically
      const isRateLimitError = 
        errorMessage.includes("rate limit") || 
        errorMessage.includes("rate_limit") ||
        errorMessage.includes("Rate limit") ||
        errorMessage.includes("429") ||
        errorString.includes("rate_limit_exceeded") ||
        errorString.includes("rate limit");
      
      // Check for various configuration and quota errors
      const isConfigError = 
        errorMessage.includes("API key") || 
        errorMessage.includes("not configured") ||
        errorMessage.includes("model_not_found") ||
        errorMessage.includes("insufficient_quota") ||
        errorMessage.includes("quota") ||
        errorMessage.includes("billing") ||
        errorString.includes("insufficient_quota") ||
        errorString.includes("quota") ||
        errorString.includes("billing") ||
        isThirdPartyQuotaError; // Include quota errors in config errors
      
      // For third-party quota errors, we'll use fallback/mock data instead of failing
      // This allows the service to continue working when external credits are exhausted
      if (isThirdPartyQuotaError) {
        // Suppress verbose error logging - quota errors are expected and handled gracefully
        console.warn("[AI Astrology] External astrology quota exhausted, using fallback data generation");
        // The report generator should handle fallback internally, but if it doesn't,
        // we'll return a friendly error that suggests the service is temporarily limited
        // In practice, the astrologyAPI should fall back to mock data
      }
      
      // Build headers object
      const headers: Record<string, string> = {
        "X-Request-ID": requestId,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      };
      
      // Add Retry-After header for rate limit and quota/config errors
      if (isRateLimitError) {
        headers["Retry-After"] = "120"; // Suggest retry after 2 minutes for rate limits
      } else if (isConfigError) {
        headers["Retry-After"] = "3600"; // Suggest retry after 1 hour for quota issues
      }
      
      // Provide specific error message with transparent refund information
      // CRITICAL: Inform users that automatic refund will be provided
      const isPaidReport = isPaidReportType(reportType);
      const refundMessage = isPaidReport && paymentIntentId && !shouldSkipPayment
        ? " Your payment has been automatically cancelled and you will NOT be charged. If any amount was authorized, it will be released within 1-3 business days (no action required from you)."
        : "";
      
      const finalErrorMessage = isRateLimitError
        ? `Our AI service is experiencing high demand right now. Please wait 2-3 minutes and try again. Your request will be processed as soon as capacity is available.${refundMessage}`
        : isTimeoutError
        ? `Report generation is taking longer than expected. Please try again with a simpler request, or contact support if the issue persists.${refundMessage}`
        : isConfigError
        ? `Astrology calculation service is temporarily unavailable. Reports may use estimated data. Please try again later.${refundMessage}`
        : `We're sorry, but we were unable to generate your report at this time.${refundMessage} Please try again later or contact support if the issue persists.`;
      
      const finalErrorCode = isRateLimitError
        ? "RATE_LIMIT_EXCEEDED"
        : isTimeoutError
        ? "TIMEOUT"
        : isConfigError
        ? "SERVICE_UNAVAILABLE"
        : "REPORT_GENERATION_FAILED";
      
      const finalStatus = isRateLimitError 
        ? 429 // Rate limit status code
        : isTimeoutError 
        ? 504 
        : isConfigError 
        ? 503 
        : 500;
      
      // CRITICAL: ALWAYS cancel payment if report generation fails
      // This ensures users are NEVER charged if report generation fails
      // Retry logic to ensure payment is cancelled even if first attempt fails
      if (paymentIntentId && isPaidReportType(reportType) && !shouldSkipPayment) {
        let paymentCancelled = false;
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.url.split('/api')[0];
        const cancelUrl = `${baseUrl}/api/ai-astrology/cancel-payment`;
        
        // Try to cancel payment (with retry)
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const cancelResponse = await fetch(cancelUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                paymentIntentId,
                sessionId: fallbackSessionId,
                reason: `Report generation failed: ${finalErrorCode}`,
              }),
            });
            
            if (cancelResponse.ok) {
              paymentCancelled = true;
              const cancelSuccess = {
                requestId,
                timestamp: new Date().toISOString(),
                paymentIntentId,
                reason: `Report generation failed: ${finalErrorCode}`,
                attempt,
                action: "Payment cancelled/refunded due to report generation failure",
              };
              console.log("[PAYMENT CANCELLED - REPORT FAILED]", JSON.stringify(cancelSuccess, null, 2));
              break; // Success - exit retry loop
            } else {
              // Log failure but retry
              console.warn(`[PAYMENT CANCELLATION FAILED - ATTEMPT ${attempt}/3]`, {
                requestId,
                paymentIntentId,
                status: cancelResponse.status,
              });
              
              if (attempt < 3) {
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              }
            }
          } catch (cancelError: any) {
            // Log error but retry
            console.error(`[PAYMENT CANCELLATION ERROR - ATTEMPT ${attempt}/3]`, {
              requestId,
              paymentIntentId,
              error: cancelError.message,
            });
            
            if (attempt < 3) {
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          }
        }
        
        // CRITICAL: If cancellation failed after all retries, log for manual intervention
        if (!paymentCancelled) {
          console.error("[CRITICAL - MANUAL INTERVENTION REQUIRED]", {
            requestId,
            paymentIntentId,
            reason: "Payment cancellation failed after 3 attempts",
            errorCode: finalErrorCode,
            action: "MANUAL REFUND REQUIRED - User may be charged incorrectly",
            urgency: "HIGH",
          });
        }
      }
      
      return NextResponse.json(
        { 
          ok: false, 
          error: finalErrorMessage,
          code: finalErrorCode,
          requestId 
        },
        { 
          status: finalStatus,
          headers
        }
      );
    }

    // CRITICAL: Capture payment ONLY after successful report generation
    // This ensures payment is NEVER deducted if report generation fails
    // IMPORTANT: Payment operations must NEVER block the response return
    // Use fire-and-forget pattern with timeout protection
    if (paymentIntentId && isPaidReportType(reportType) && !shouldSkipPayment) {
      // Fire-and-forget payment capture - don't block response return
      // If capture fails, we'll cancel in background (user won't be charged)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.url.split('/api')[0];
      
      // Helper function to cancel payment in background (fire-and-forget)
      function cancelPaymentInBackground(paymentIntentId: string, sessionId: string, reason: string) {
        (async () => {
          try {
            const cancelTimeout = new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error("Cancel timeout")), 3000);
            });
            const cancelFetch = fetch(`${baseUrl}/api/ai-astrology/cancel-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                paymentIntentId,
                sessionId,
                reason,
              }),
            });
            await Promise.race([cancelFetch, cancelTimeout]).catch(() => {
              console.warn("[PAYMENT] Cancel request timed out - will retry in background");
            });
          } catch (cancelError) {
            console.error("[CRITICAL] Failed to cancel payment:", cancelError);
            console.error("[MANUAL INTERVENTION REQUIRED]", {
              paymentIntentId,
              reason: "Payment capture failed and cancellation also failed",
              action: "Manual refund required",
            });
          }
        })().catch(() => {
          // Ignore any errors - already logged
        });
      }
      
      (async () => {
        try {
          const captureUrl = `${baseUrl}/api/ai-astrology/capture-payment`;
          
          // Add timeout for payment capture to prevent hanging (5 seconds max)
          const captureTimeout = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error("Payment capture timeout")), 5000);
          });
          
          const captureFetch = fetch(captureUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentIntentId,
              sessionId: fallbackSessionId || "",
            }),
          });
          
          try {
            const captureResponse = await Promise.race([captureFetch, captureTimeout]);
            
            if (captureResponse.ok) {
              const captureSuccess = {
                requestId,
                timestamp: new Date().toISOString(),
                paymentIntentId,
                reportType,
                action: "Payment captured after successful report generation",
              };
              console.log("[PAYMENT CAPTURED - REPORT SUCCESS]", JSON.stringify(captureSuccess, null, 2));
            } else {
              // CRITICAL: If capture fails, we must cancel payment (payment not captured = user not charged)
              console.error("[PAYMENT CAPTURE FAILED - CANCELLING]", JSON.stringify({
                requestId,
                timestamp: new Date().toISOString(),
                paymentIntentId,
                status: captureResponse.status,
                error: "Payment capture failed - will cancel payment to protect user",
              }, null, 2));
              
              // Cancel payment in background (fire-and-forget)
              cancelPaymentInBackground(paymentIntentId, fallbackSessionId || "", "Payment capture failed after report generation");
            }
          } catch (timeoutError: any) {
            // Timeout or fetch error - cancel payment in background
            console.error("[PAYMENT CAPTURE TIMEOUT/ERROR]", JSON.stringify({
              requestId,
              timestamp: new Date().toISOString(),
              paymentIntentId,
              errorType: timeoutError.constructor?.name || "Unknown",
              errorMessage: timeoutError.message || "Unknown error",
              action: "Payment capture timed out/failed - cancelling payment to protect user",
            }, null, 2));
            
            // Cancel payment in background (fire-and-forget)
            cancelPaymentInBackground(paymentIntentId, fallbackSessionId || "", `Payment capture error: ${timeoutError.message || "Timeout"}`);
          }
        } catch (captureError: any) {
          // Any other error - cancel payment in background
          console.error("[CRITICAL - PAYMENT CAPTURE ERROR]", JSON.stringify({
            requestId,
            timestamp: new Date().toISOString(),
            paymentIntentId,
            errorType: captureError.constructor?.name || "Unknown",
            errorMessage: captureError.message || "Unknown error",
            action: "Payment capture error - cancelling payment to protect user",
          }, null, 2));
          
          cancelPaymentInBackground(paymentIntentId, fallbackSessionId || "", `Payment capture error: ${captureError.message || "Unknown error"}`);
        }
      })().catch((backgroundError) => {
        // Ignore any errors from background payment operations
        console.error("[BACKGROUND PAYMENT ERROR]", backgroundError);
      });
    }

    // Return report
    console.log(`[REPORT GENERATION] Returning response for reportType=${reportType}, requestId=${requestId}, reportId=${reportId}`);
    
    // Ensure content doesn't have its own reportId (remove if present to avoid duplication)
    // reportId was already generated above for idempotency check
    // Canonical reportId is stored in data.reportId, not in content.reportId
    // Use cleanedReportContent (mock content already stripped, defined above)
    if (!cleanedReportContent && reportContent) {
      cleanedReportContent = stripMockContent(reportContent);
    }
    const contentWithoutReportId = cleanedReportContent ? { ...cleanedReportContent } : {};
    if ('reportId' in contentWithoutReportId) {
      delete contentWithoutReportId.reportId;
    }
    
    // Get base URL (ensure it's domain only, no path, no trailing slash)
    // NEXT_PUBLIC_APP_URL should be like: https://www.mindveda.net (domain only)
    const baseUrlFromEnv = process.env.NEXT_PUBLIC_APP_URL || "";
    const baseUrlFromRequest = req.url.split('/api')[0];
    let baseUrl = baseUrlFromEnv || baseUrlFromRequest;
    // Remove trailing slash and any path after domain (e.g., remove /ai-astrology if present)
    baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    // Extract just the domain (protocol + hostname + port if any)
    try {
      const url = new URL(baseUrl);
      baseUrl = `${url.protocol}//${url.host}`;
    } catch {
      // If URL parsing fails, just remove paths manually
      baseUrl = baseUrl.replace(/\/ai-astrology.*$/i, '').replace(/\/[^\/]+$/, '');
    }
    
    // Create redirect URLs
    const redirectUrl = `/ai-astrology/preview?reportId=${encodeURIComponent(reportId)}&reportType=${encodeURIComponent(reportType)}`;
    const fullRedirectUrl = `${baseUrl}${redirectUrl}`;
    
    const responseData = {
      ok: true,
      data: {
        status: "completed" as const,
        reportId, // Canonical reportId - single source of truth
        reportType,
        input,
        content: contentWithoutReportId, // Content without reportId to avoid duplication
        generatedAt: new Date().toISOString(),
        redirectUrl,
        fullRedirectUrl,
      },
      requestId,
    };
    console.log(`[REPORT GENERATION] Response prepared, sending...`, {
      reportId,
      redirectUrl,
      status: "completed",
    });
    return NextResponse.json(
      responseData,
      {
        headers: {
          "X-Request-ID": requestId,
          "Cache-Control": "no-cache", // Don't cache AI-generated content
        },
      }
    );
  } catch (error) {
    const errorResponse = handleApiError(error);
    errorResponse.headers.set("X-Request-ID", requestId);
    return errorResponse;
  }
}

