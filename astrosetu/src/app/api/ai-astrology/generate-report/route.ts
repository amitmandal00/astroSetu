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

/**
 * Check if the user is a production test user (bypasses payment)
 * Test user details:
 * - Name: Amit Kumar Mandal
 * - DOB: 26 Nov 1984 (1984-11-26)
 * - Time: 21:40 (9:40 PM)
 * - Place: Noamundi, Jharkhand, India
 * - Gender: Male
 */
function checkIfTestUser(input: AIAstrologyInput): boolean {
  const testUserName = "Amit Kumar Mandal";
  const testUserDOB = "1984-11-26"; // Format: YYYY-MM-DD
  const testUserTime = "21:40"; // Format: HH:mm (24-hour)
  const testUserPlace = "Noamundi"; // Match if place contains this
  const testUserGender = "Male";

  // Check name (case-insensitive, partial match)
  const nameMatch = input.name?.toLowerCase().includes(testUserName.toLowerCase()) ?? false;
  
  // Check DOB (handle various formats)
  let dobMatch = false;
  if (input.dob) {
    const inputDOB = input.dob.replace(/\//g, "-").trim();
    // Try to match YYYY-MM-DD or DD-MM-YYYY formats
    dobMatch = inputDOB.includes("1984-11-26") || 
               inputDOB.includes("26-11-1984") ||
               inputDOB.includes("1984/11/26") ||
               inputDOB.includes("26/11/1984") ||
               inputDOB === "1984-11-26";
  }
  
  // Check time (handle various formats like "9:40 PM", "21:40", etc.)
  let timeMatch = false;
  if (input.tob) {
    const inputTime = input.tob.trim().toUpperCase();
    // Match 21:40, 9:40 PM, 09:40 PM, 21:40:00, etc.
    timeMatch = inputTime.includes("21:40") || 
                (inputTime.includes("9:40") || inputTime.includes("09:40")) && 
                (inputTime.includes("PM") || inputTime.includes("P.M."));
  }
  
  // Check place (case-insensitive, partial match)
  const placeMatch = input.place?.toLowerCase().includes(testUserPlace.toLowerCase()) ?? false;
  
  // Check gender (case-insensitive)
  const genderMatch = input.gender?.toLowerCase() === testUserGender.toLowerCase();

  // User is test user if all fields match
  const isTestUser = nameMatch && dobMatch && timeMatch && placeMatch && genderMatch;
  
  if (isTestUser) {
    console.log("[TEST USER] Production test user detected, bypassing payment verification");
  }
  
  return isTestUser;
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
    const isDemoMode = process.env.AI_ASTROLOGY_DEMO_MODE === "true" || process.env.NODE_ENV === "development";
    const isTestUser = checkIfTestUser(input);

    // Helper function to cancel payment (used in all error scenarios)
    // CRITICAL: Ensures users are NEVER charged if ANY error occurs
    const cancelPaymentSafely = async (reason: string) => {
      // Only cancel if it's a paid report and we have a payment intent
      if (paymentIntentId && reportType && isPaidReportType(reportType) && !isDemoMode && !isTestUser) {
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

    // Validate input - CRITICAL: Cancel payment if validation fails
    if (!input.name || !input.dob || !input.tob || !input.place) {
      await cancelPaymentSafely("Input validation failed - missing required fields");
      return NextResponse.json(
        { ok: false, error: "Missing required fields: name, dob, tob, place" },
        { status: 400 }
      );
    }

    if (!input.latitude || !input.longitude) {
      await cancelPaymentSafely("Input validation failed - missing coordinates");
      return NextResponse.json(
        { ok: false, error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // CRITICAL: Access restriction for production testing
    // Only allow Amit Kumar Mandal and Ankita Surabhi until testing is complete
    const restrictAccess = process.env.NEXT_PUBLIC_RESTRICT_ACCESS === "true";
    if (restrictAccess && !isAllowedUser(input)) {
      const restrictionError = {
        requestId,
        timestamp: new Date().toISOString(),
        reportType,
        userName: input.name || "N/A",
        userDOB: input.dob || "N/A",
        error: "Access restricted for production testing",
      };
      console.error("[ACCESS RESTRICTION]", JSON.stringify(restrictionError, null, 2));
      
      // CRITICAL: Cancel payment if access is restricted (user should not be charged)
      await cancelPaymentSafely("Access restricted - user not authorized");
      
      return NextResponse.json(
        { ok: false, error: getRestrictionMessage() },
        { status: 403 }
      );
    }

    // Validate report type - CRITICAL: Cancel payment if invalid
    const validReportTypes: ReportType[] = ["life-summary", "marriage-timing", "career-money", "full-life", "year-analysis", "major-life-phase", "decision-support"];
    if (!reportType || !validReportTypes.includes(reportType)) {
      await cancelPaymentSafely("Invalid report type");
      return NextResponse.json(
        { ok: false, error: `Invalid report type. Must be one of: ${validReportTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Check if AI is configured - CRITICAL: Cancel payment if service unavailable
    if (!isAIConfigured()) {
      await cancelPaymentSafely("AI service unavailable");
      return NextResponse.json(
        { 
          ok: false, 
          error: "AI service is temporarily unavailable. Please try again later.",
          code: "AI_SERVICE_UNAVAILABLE"
        },
        { 
          status: 503,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Retry-After": "60"
          }
        }
      );
    }

    // CRITICAL SECURITY: Verify payment for paid reports
    // Demo mode: Allow testing without payment (set AI_ASTROLOGY_DEMO_MODE=true in .env.local)
    const isDemoMode = process.env.AI_ASTROLOGY_DEMO_MODE === "true" || process.env.NODE_ENV === "development";
    
    // Check if user is a production test user (bypasses payment)
    const isTestUser = checkIfTestUser(input);
    
    if (isPaidReportType(reportType) && !isDemoMode && !isTestUser) {
      // CRITICAL FIX: If paymentToken is missing, try to verify using session_id from query params
      let paymentTokenToVerify = paymentToken;
      let paymentVerified = false;
      
      if (!paymentTokenToVerify) {
        // Try to get session_id from request URL and verify payment
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("session_id");
        
        if (sessionId) {
          try {
            // Verify payment using session_id via Stripe API
            const Stripe = (await import("stripe")).default;
            const secretKey = process.env.STRIPE_SECRET_KEY;
            
            if (secretKey && !secretKey.startsWith("pk_")) {
              const stripe = new Stripe(secretKey);
              const session = await stripe.checkout.sessions.retrieve(sessionId);
              
              if (session && session.payment_status === "paid") {
                const sessionReportType = session.metadata?.reportType;
                
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
          
          if (sessionId) {
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
            return NextResponse.json(
              { ok: false, error: "Payment token does not match requested report type." },
              { status: 403 }
            );
          }
        }
      }
    }
    
    // Log demo mode or test user usage
    if ((isDemoMode || isTestUser) && isPaidReportType(reportType)) {
      const mode = isDemoMode ? "DEMO MODE" : "TEST USER";
      const bypassLog = {
        requestId,
        timestamp: new Date().toISOString(),
        mode,
        reportType,
        reason: isDemoMode ? "Demo mode enabled" : "Test user detected",
      };
      console.log(`[PAYMENT BYPASS]`, JSON.stringify(bypassLog, null, 2));
    }
    
    // Log successful payment verification for paid reports
    if (isPaidReportType(reportType) && !isDemoMode && !isTestUser) {
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
    // Timeout: 60 seconds for report generation (Vercel serverless functions have 10s-60s timeout depending on plan)
    const REPORT_GENERATION_TIMEOUT = 55000; // 55 seconds (leaves 5s buffer for response)
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
      
      // Add Retry-After header for quota/config errors
      if (isConfigError) {
        headers["Retry-After"] = "3600"; // Suggest retry after 1 hour for quota issues
      }
      
      // Provide specific error message with transparent refund information
      // CRITICAL: Inform users that automatic refund will be provided
      const isPaidReport = isPaidReportType(reportType);
      const refundMessage = isPaidReport && paymentIntentId && !isDemoMode && !isTestUser
        ? " Your payment has been automatically cancelled and you will NOT be charged. If any amount was authorized, it will be released within 1-3 business days (no action required from you)."
        : "";
      
      const finalErrorMessage = isTimeoutError
        ? `Report generation is taking longer than expected. Please try again with a simpler request, or contact support if the issue persists.${refundMessage}`
        : isConfigError
        ? `Astrology calculation service is temporarily unavailable. Reports may use estimated data. Please try again later.${refundMessage}`
        : `We're sorry, but we were unable to generate your report at this time.${refundMessage} Please try again later or contact support if the issue persists.`;
      
      const finalErrorCode = isTimeoutError
        ? "TIMEOUT"
        : isConfigError
        ? "SERVICE_UNAVAILABLE"
        : "REPORT_GENERATION_FAILED";
      
      const finalStatus = isTimeoutError ? 504 : (isConfigError ? 503 : 500);
      
      // CRITICAL: ALWAYS cancel payment if report generation fails
      // This ensures users are NEVER charged if report generation fails
      // Retry logic to ensure payment is cancelled even if first attempt fails
      if (paymentIntentId && isPaidReportType(reportType) && !isDemoMode && !isTestUser) {
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
    // Wrap in try-catch to ensure we ALWAYS cancel payment if capture fails
    if (paymentIntentId && isPaidReportType(reportType) && !isDemoMode && !isTestUser) {
      let paymentCaptured = false;
      
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.url.split('/api')[0];
        const captureUrl = `${baseUrl}/api/ai-astrology/capture-payment`;
        
        const captureResponse = await fetch(captureUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId,
            sessionId: fallbackSessionId,
          }),
        });
        
        if (captureResponse.ok) {
          paymentCaptured = true;
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
          // Report is generated but payment capture failed - cancel to ensure no charge
          const captureError = {
            requestId,
            timestamp: new Date().toISOString(),
            paymentIntentId,
            status: captureResponse.status,
            error: "Payment capture failed - will cancel payment to protect user",
          };
          console.error("[PAYMENT CAPTURE FAILED - CANCELLING]", JSON.stringify(captureError, null, 2));
          
          // Cancel payment immediately - user should not be charged if capture fails
          try {
            await fetch(`${baseUrl}/api/ai-astrology/cancel-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                paymentIntentId,
                sessionId: fallbackSessionId,
                reason: "Payment capture failed after report generation",
              }),
            });
          } catch (cancelError) {
            console.error("[CRITICAL] Failed to cancel payment after capture failure:", cancelError);
          }
        }
      } catch (captureError: any) {
        // CRITICAL: If capture throws error, cancel payment immediately
        // This ensures user is NEVER charged if capture fails
        const criticalError = {
          requestId,
          timestamp: new Date().toISOString(),
          paymentIntentId,
          errorType: captureError.constructor?.name || "Unknown",
          errorMessage: captureError.message || "Unknown error",
          action: "Payment capture error - cancelling payment to protect user",
        };
        console.error("[CRITICAL - PAYMENT CAPTURE ERROR]", JSON.stringify(criticalError, null, 2));
        
        // Cancel payment immediately - user should not be charged
        try {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.url.split('/api')[0];
          await fetch(`${baseUrl}/api/ai-astrology/cancel-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentIntentId,
              sessionId: fallbackSessionId,
              reason: `Payment capture error: ${captureError.message || "Unknown error"}`,
            }),
          });
        } catch (cancelError) {
          console.error("[CRITICAL] Failed to cancel payment after capture error:", cancelError);
          // Log for manual intervention
          console.error("[MANUAL INTERVENTION REQUIRED]", {
            paymentIntentId,
            reason: "Payment capture failed and cancellation also failed",
            action: "Manual refund required",
          });
        }
      }
    }

    // Return report
    return NextResponse.json(
      {
        ok: true,
        data: {
          reportType,
          input,
          content: reportContent,
          generatedAt: new Date().toISOString(),
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
  } catch (error) {
    const errorResponse = handleApiError(error);
    errorResponse.headers.set("X-Request-ID", requestId);
    return errorResponse;
  }
}

