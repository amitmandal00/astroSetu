import { NextResponse } from "next/server";
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
import type { AIAstrologyInput, ReportType } from "@/lib/ai-astrology/types";
import { verifyPaymentToken, isPaidReportType } from "@/lib/ai-astrology/paymentToken";
import { getYearAnalysisDateRange, getMarriageTimingWindows, getCareerTimingWindows, getMajorLifePhaseWindows, getDateContext } from "@/lib/ai-astrology/dateHelpers";
import { isAllowedUser, getRestrictionMessage } from "@/lib/access-restriction";
import { generateIdempotencyKey, getCachedReport, cacheReport, markReportProcessing } from "@/lib/ai-astrology/reportCache";

/**
 * Check if the user is a production test user
 * Test users: Amit Kumar Mandal and Ankita Surabhi
 */
function checkIfTestUser(input: AIAstrologyInput): boolean {
  const testUsers = [
    {
      name: "Amit Kumar Mandal",
      dob: "1984-11-26",
      time: "21:40",
      place: "Noamundi",
      gender: "Male",
    },
    {
      name: "Ankita Surabhi",
      dob: "1990-05-15", // Update with actual DOB if different
      time: "10:30", // Update with actual time if different
      place: "Delhi", // Update with actual place if different
      gender: "Female", // Update if different
    },
  ];
  
  // Check if input matches any test user
  for (const testUser of testUsers) {
    const nameMatch = input.name?.toLowerCase().includes(testUser.name.toLowerCase()) ?? false;
    
    if (!nameMatch) continue;
    
    let dobMatch = false;
    if (input.dob && testUser.dob) {
      const inputDOB = input.dob.replace(/\//g, "-").trim();
      dobMatch = inputDOB.includes(testUser.dob) || 
                 inputDOB.includes(testUser.dob.replace(/-/g, "/")) ||
                 inputDOB.includes(testUser.dob.replace(/-/g, "-"));
    }
    
    let timeMatch = false;
    if (input.tob && testUser.time) {
      const inputTime = input.tob.trim().toUpperCase();
      const testTime = testUser.time;
      timeMatch = inputTime.includes(testTime) || 
                  (testTime.includes(":") && inputTime.includes(testTime.split(":")[0]));
    }
    
    const placeMatch = input.place?.toLowerCase().includes(testUser.place.toLowerCase()) ?? false;
    const genderMatch = !testUser.gender || input.gender?.toLowerCase() === testUser.gender.toLowerCase();

    // More flexible matching - allow if name matches and at least DOB OR place matches
    // This handles cases where exact place/time might vary (e.g., "Delhi" vs "New Delhi")
    const hasNameMatch = nameMatch;
    const hasBasicMatch = dobMatch || placeMatch; // At least DOB or place should match
    const timeMatchesOrNotRequired = timeMatch || !input.tob || !testUser.time;
    const genderMatchesOrNotRequired = genderMatch || !testUser.gender;
    
    if (hasNameMatch && hasBasicMatch && timeMatchesOrNotRequired && genderMatchesOrNotRequired) {
      console.log(`[TEST USER] Production test user detected: ${testUser.name}`, JSON.stringify({
        nameMatch,
        dobMatch,
        placeMatch,
        timeMatch,
        genderMatch,
        inputName: input.name,
        inputDOB: input.dob,
        inputPlace: input.place,
        inputTob: input.tob,
      }, null, 2));
      return true;
    } else {
      // Log why test user detection failed for debugging
      if (nameMatch) {
        console.log(`[TEST USER MATCH FAILED]`, JSON.stringify({
          testUserName: testUser.name,
          inputName: input.name,
          nameMatch,
          dobMatch,
          placeMatch,
          timeMatch,
          genderMatch,
          inputDOB: input.dob,
          inputPlace: input.place,
          inputTob: input.tob,
          inputGender: input.gender,
          reason: !hasBasicMatch ? "DOB and Place don't match" : 
                  !timeMatchesOrNotRequired ? "Time doesn't match" :
                  !genderMatchesOrNotRequired ? "Gender doesn't match" : "Unknown"
        }, null, 2));
      }
    }
  }
  
  return false;
}

/**
 * POST /api/ai-astrology/generate-report
 * Generate AI-powered astrology report
 */
export async function POST(req: Request) {
  const requestId = generateRequestId();

  try {
    // Stricter rate limiting for report generation (production-ready)
    // Per ChatGPT feedback: Add rate limiting to prevent abuse
    // Uses middleware rate limiting (already configured) with additional check
    const rateLimitResponse = checkRateLimit(req, "/api/ai-astrology/generate-report");
    if (rateLimitResponse) {
      rateLimitResponse.headers.set("X-Request-ID", requestId);
      rateLimitResponse.headers.set("Retry-After", "60");
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
    }>(req);

    const { input, reportType, paymentToken, paymentIntentId, sessionId: fallbackSessionId, decisionContext } = json;

    // Check for demo mode and test user (needed for payment cancellation checks)
    // NOTE: Test users bypass payment by default to avoid payment verification errors
    // Set BYPASS_PAYMENT_FOR_TEST_USERS=false explicitly if you want test users to go through Stripe
    const isDemoMode = process.env.AI_ASTROLOGY_DEMO_MODE === "true" || process.env.NODE_ENV === "development";
    const isTestUser = checkIfTestUser(input);
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
    if (!input.name || !input.dob || !input.tob || !input.place) {
      await cancelPaymentSafely("Input validation failed - missing required fields");
      return NextResponse.json(
        { ok: false, error: "Missing required fields: name, dob, tob, place" },
        { status: 400, headers: { "X-Request-ID": requestId } }
      );
    }

    if (!input.latitude || !input.longitude) {
      await cancelPaymentSafely("Input validation failed - missing coordinates");
      return NextResponse.json(
        { ok: false, error: "Latitude and longitude are required" },
        { status: 400, headers: { "X-Request-ID": requestId } }
      );
    }

    // 2. CRITICAL: Access restriction for production testing
    // Only allow Amit Kumar Mandal and Ankita Surabhi until testing is complete
    const restrictAccess = process.env.NEXT_PUBLIC_RESTRICT_ACCESS === "true";
    
    // ENHANCED: Check if user is a test user FIRST (before access restriction)
    // This ensures test users always pass access restriction even if matching logic differs
    const isTestUserForAccess = isTestUser || checkIfTestUser(input);
    
    if (restrictAccess && !isTestUserForAccess && !isAllowedUser(input)) {
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
    
    // Log successful access for test users
    if (isTestUserForAccess) {
      console.log("[TEST USER ACCESS GRANTED]", JSON.stringify({
        requestId,
        userName: input.name,
        userDOB: input.dob,
        reportType,
        timestamp: new Date().toISOString(),
      }, null, 2));
    }

    // 3. Validate report type - CRITICAL: Cancel payment if invalid
    const validReportTypes: ReportType[] = ["life-summary", "marriage-timing", "career-money", "full-life", "year-analysis", "major-life-phase", "decision-support"];
    if (!reportType || !validReportTypes.includes(reportType)) {
      await cancelPaymentSafely("Invalid report type");
      return NextResponse.json(
        { ok: false, error: `Invalid report type. Must be one of: ${validReportTypes.join(", ")}` },
        { status: 400, headers: { "X-Request-ID": requestId } }
      );
    }

    // 4. CRITICAL: Check idempotency cache BEFORE any OpenAI calls
    // This prevents duplicate API calls for the same request
    const idempotencyKey = generateIdempotencyKey(input, reportType, fallbackSessionId);
    const cachedReport = getCachedReport(idempotencyKey);
    
    if (cachedReport) {
      // Report already exists - return cached version (NO OpenAI call)
      console.log(`[IDEMPOTENCY] Returning cached report for key: ${idempotencyKey.substring(0, 30)}...`, {
        requestId,
        reportId: cachedReport.reportId,
        status: cachedReport.status,
      });
      
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
    
    // Check if report is already processing (prevent concurrent duplicate requests)
    const reportId = `RPT-${Date.now()}-${requestId.substring(0, 8).toUpperCase()}`;
    const isProcessing = markReportProcessing(idempotencyKey, reportId);
    
    if (!isProcessing) {
      // Another request is already processing this report - return processing status
      console.log(`[IDEMPOTENCY] Report already processing for key: ${idempotencyKey.substring(0, 30)}...`, {
        requestId,
        reportId,
      });
      
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
        // Test sessions start with "test_session_" and should NEVER be verified with Stripe
        if (sessionId && sessionId.startsWith("test_session_")) {
          console.log(`[TEST SESSION] Detected test session: ${sessionId.substring(0, 30)}... - Skipping Stripe verification`);
          
          // For test sessions, generate a payment token directly (bypass Stripe)
          // Extract reportType from session ID (format: test_session_{reportType}_{requestId})
          const sessionPrefix = "test_session_";
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
          if (sessionId && sessionId.startsWith("test_session_")) {
            console.log(`[TEST SESSION] Detected test session in token fallback: ${sessionId.substring(0, 30)}... - Skipping Stripe verification`);
            
            // Extract reportType from test session ID
            const sessionPrefix = "test_session_";
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

    // Generate report based on type with hard timeout fallback
    // Timeout accounts for normal generation + potential rate limit retries
    // Retry logic now uses smarter waits (10-60s, trusting OpenAI's Retry-After header)
    // So timeout can be more reasonable: 90s for regular, 120s for complex reports
    const isComplexReport = reportType === "full-life" || reportType === "major-life-phase";
    const REPORT_GENERATION_TIMEOUT = isComplexReport ? 120000 : 90000; // 120s for complex, 90s for regular (allows retries without being excessive)
    let reportContent;
    
    try {
      // Create a timeout promise that rejects after REPORT_GENERATION_TIMEOUT
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Report generation timed out. Please try again with a simpler request."));
        }, REPORT_GENERATION_TIMEOUT);
      });

      // Race between report generation and timeout
      const reportGenerationPromise = (async () => {
        switch (reportType) {
          case "life-summary":
            return await generateLifeSummaryReport(input);
          case "marriage-timing":
            return await generateMarriageTimingReport(input);
          case "career-money":
            return await generateCareerMoneyReport(input);
          case "full-life":
            return await generateFullLifeReport(input);
          case "year-analysis":
            // Use next 12 months from current date (intelligent date window)
            // This provides guidance for the actual upcoming year period, not just calendar year
            const yearAnalysisRange = getYearAnalysisDateRange();
            return await generateYearAnalysisReport(input, {
              startYear: yearAnalysisRange.startYear,
              startMonth: yearAnalysisRange.startMonth,
              endYear: yearAnalysisRange.endYear,
              endMonth: yearAnalysisRange.endMonth,
            });
          case "major-life-phase":
            return await generateMajorLifePhaseReport(input);
          case "decision-support":
            return await generateDecisionSupportReport(input, decisionContext);
          default:
            throw new Error(`Unknown report type: ${reportType}`);
        }
      })();

      // Race the timeout against report generation
      reportContent = await Promise.race([reportGenerationPromise, timeoutPromise]);
      
      // Log successful completion
      console.log(`[REPORT GENERATION] Successfully completed for reportType=${reportType}`, JSON.stringify({
        reportType,
        userName: input.name,
        contentLength: reportContent ? JSON.stringify(reportContent).length : 0,
        hasReportId: !!reportContent?.reportId,
        reportId: reportContent?.reportId || "N/A",
        requestId,
        timestamp: new Date().toISOString(),
      }, null, 2));
      
      // CRITICAL: Cache the generated report to prevent duplicate OpenAI calls
      cacheReport(idempotencyKey, reportId, reportContent, reportType, input);
      console.log(`[IDEMPOTENCY] Cached report for key: ${idempotencyKey.substring(0, 30)}...`, {
        requestId,
        reportId,
      });
  } catch (error: any) {
    // COMPREHENSIVE ERROR LOGGING for production debugging
    const errorContext = {
      requestId,
      timestamp: new Date().toISOString(),
      reportType,
      hasInput: !!input,
      inputName: input?.name || "N/A", // Name only, no sensitive data
      inputDOB: input?.dob ? `${input.dob.substring(0, 4)}-XX-XX` : "N/A", // Year only for privacy
      isPaidReport: isPaidReportType(reportType),
      isDemoMode,
      isTestUser,
      errorType: error.constructor?.name || "Unknown",
      errorMessage: error.message || "Unknown error",
      errorStack: error.stack || "No stack trace",
    };
    
    console.error("[REPORT GENERATION ERROR]", JSON.stringify(errorContext, null, 2));
    
    // Provide user-friendly error message without exposing internal details
    const errorMessage = error.message || "Unknown error";
    const errorString = JSON.stringify(error).toLowerCase();
      
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
      
      // Check for Prokerala API credit exhaustion (403 with "insufficient credit balance")
      const isProkeralaCreditError = 
        errorMessage.includes("PROKERALA_CREDIT_EXHAUSTED") ||
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
        isProkeralaCreditError; // Include credit errors in config errors
      
      // For Prokerala credit errors, we'll use fallback/mock data instead of failing
      // This allows the service to continue working when API credits are exhausted
      if (isProkeralaCreditError) {
        // Suppress verbose error logging - credit errors are expected and handled gracefully
        console.warn("[AI Astrology] Prokerala API credit exhausted, using fallback data generation");
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
    const contentWithoutReportId = { ...reportContent };
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

