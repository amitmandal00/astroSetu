import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";
import {
  generateLifeSummaryReport,
  generateMarriageTimingReport,
  generateCareerMoneyReport,
  generateFullLifeReport,
  isAIConfigured,
} from "@/lib/ai-astrology/reportGenerator";
import type { AIAstrologyInput, ReportType } from "@/lib/ai-astrology/types";
import { verifyPaymentToken, isPaidReportType } from "@/lib/ai-astrology/paymentToken";

/**
 * POST /api/ai-astrology/generate-report
 * Generate AI-powered astrology report
 */
export async function POST(req: Request) {
  const requestId = generateRequestId();

  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, "/api/ai-astrology/generate-report");
    if (rateLimitResponse) {
      rateLimitResponse.headers.set("X-Request-ID", requestId);
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
    }>(req);

    const { input, reportType, paymentToken } = json;

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
    const validReportTypes: ReportType[] = ["life-summary", "marriage-timing", "career-money", "full-life"];
    if (!reportType || !validReportTypes.includes(reportType)) {
      return NextResponse.json(
        { ok: false, error: `Invalid report type. Must be one of: ${validReportTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // CRITICAL SECURITY: Verify payment for paid reports
    if (isPaidReportType(reportType)) {
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

    // Generate report based on type
    let reportContent;
    try {
      switch (reportType) {
        case "life-summary":
          reportContent = await generateLifeSummaryReport(input);
          break;
        case "marriage-timing":
          reportContent = await generateMarriageTimingReport(input);
          break;
        case "career-money":
          reportContent = await generateCareerMoneyReport(input);
          break;
        case "full-life":
          reportContent = await generateFullLifeReport(input);
          break;
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }
    } catch (error: any) {
      console.error("[AI Astrology] Report generation error:", error);
      // Provide user-friendly error message without exposing internal details
      const errorMessage = error.message || "Unknown error";
      const isConfigError = errorMessage.includes("API key") || errorMessage.includes("not configured");
      
      return NextResponse.json(
        { 
          ok: false, 
          error: isConfigError 
            ? "AI service is temporarily unavailable. Please try again later."
            : "Server error. Please try again later.",
          code: isConfigError ? "AI_SERVICE_UNAVAILABLE" : "REPORT_GENERATION_FAILED",
          requestId 
        },
        { 
          status: isConfigError ? 503 : 500,
          headers: {
            "X-Request-ID": requestId,
            "Cache-Control": "no-cache, no-store, must-revalidate"
          }
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

