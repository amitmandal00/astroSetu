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

    // Check if AI is configured
    if (!isAIConfigured()) {
      // Return a user-friendly error message (don't expose internal configuration details)
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

    // Parse and validate request body
    const json = await parseJsonBody<{
      input: AIAstrologyInput;
      reportType: ReportType;
      paymentToken?: string; // Payment verification token for paid reports
      decisionContext?: string; // Optional context for decision support reports
    }>(req);

    const { input, reportType, paymentToken, decisionContext } = json;

    // Validate input
    if (!input.name || !input.dob || !input.tob || !input.place) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: name, dob, tob, place" },
        { status: 400 }
      );
    }

    if (!input.latitude || !input.longitude) {
      return NextResponse.json(
        { ok: false, error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Validate report type
    const validReportTypes: ReportType[] = ["life-summary", "marriage-timing", "career-money", "full-life", "year-analysis", "major-life-phase", "decision-support"];
    if (!reportType || !validReportTypes.includes(reportType)) {
      return NextResponse.json(
        { ok: false, error: `Invalid report type. Must be one of: ${validReportTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // CRITICAL SECURITY: Verify payment for paid reports
    // Demo mode: Allow testing without payment (set AI_ASTROLOGY_DEMO_MODE=true in .env.local)
    const isDemoMode = process.env.AI_ASTROLOGY_DEMO_MODE === "true" || process.env.NODE_ENV === "development";
    
    // Check if user is a production test user (bypasses payment)
    const isTestUser = checkIfTestUser(input);
    
    if (isPaidReportType(reportType) && !isDemoMode && !isTestUser) {
      if (!paymentToken) {
        return NextResponse.json(
          { ok: false, error: "Payment verification required for paid reports. Please complete payment first." },
          { status: 403 }
        );
      }

      const tokenData = verifyPaymentToken(paymentToken);
      if (!tokenData) {
        return NextResponse.json(
          { ok: false, error: "Invalid or expired payment token. Please complete payment again." },
          { status: 403 }
        );
      }

      // Verify the token matches the requested report type
      if (tokenData.reportType !== reportType) {
        return NextResponse.json(
          { ok: false, error: "Payment token does not match requested report type." },
          { status: 403 }
        );
      }
    }
    
    // Log demo mode or test user usage
    if ((isDemoMode || isTestUser) && isPaidReportType(reportType)) {
      const mode = isDemoMode ? "DEMO MODE" : "TEST USER";
      console.log(`[${mode}] Bypassing payment verification for ${reportType} report`);
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
            const targetYear = new Date().getFullYear() + 1; // Default to next year
            return await generateYearAnalysisReport(input, targetYear);
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
      console.error("[AI Astrology] Report generation error:", error);
      // Provide user-friendly error message without exposing internal details
      const errorMessage = error.message || "Unknown error";
      const errorString = JSON.stringify(error).toLowerCase();
      
      // Check if it's a timeout error
      const isTimeoutError = 
        errorMessage.includes("timed out") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("Report generation timed out");
      
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
      
      // Provide specific error message for timeout
      const finalErrorMessage = isTimeoutError
        ? "Report generation is taking longer than expected. Please try again with a simpler request, or contact support if the issue persists."
        : isConfigError
        ? "Astrology calculation service is temporarily unavailable. Reports may use estimated data. Please try again later."
        : "Server error. Please try again later.";
      
      const finalErrorCode = isTimeoutError
        ? "TIMEOUT"
        : isConfigError
        ? "SERVICE_UNAVAILABLE"
        : "REPORT_GENERATION_FAILED";
      
      const finalStatus = isTimeoutError ? 504 : (isConfigError ? 503 : 500);
      
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

