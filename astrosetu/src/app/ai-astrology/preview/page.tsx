/**
 * AI Astrology Preview Page
 * Displays free Life Summary or preview of paid reports
 */

"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { apiPost, apiGet } from "@/lib/http";
import type { AIAstrologyInput, ReportType } from "@/lib/ai-astrology/types";
import type { ReportContent } from "@/lib/ai-astrology/types";
import { REPORT_PRICES, BUNDLE_PRICES } from "@/lib/ai-astrology/payments";
import { downloadPDF } from "@/lib/ai-astrology/pdfGenerator";
import { PostPurchaseUpsell } from "@/components/ai-astrology/PostPurchaseUpsell";

function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [input, setInput] = useState<AIAstrologyInput | null>(null);
  const [reportType, setReportType] = useState<ReportType>("life-summary");
  const [reportContent, setReportContent] = useState<ReportContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellShown, setUpsellShown] = useState(false);
  const [refundAcknowledged, setRefundAcknowledged] = useState(false);
  const [emailCopySuccess, setEmailCopySuccess] = useState(false);
  const [loadingStage, setLoadingStage] = useState<"verifying" | "generating" | null>(null); // Track loading stage for better UX
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null); // Track when loading started for elapsed time
  const [elapsedTime, setElapsedTime] = useState<number>(0); // Track elapsed time in seconds
  const [progressSteps, setProgressSteps] = useState<{
    birthChart: boolean;
    planetaryAnalysis: boolean;
    generatingInsights: boolean;
  }>({
    birthChart: false,
    planetaryAnalysis: false,
    generatingInsights: false,
  }); // Track progress steps for better UX
  
  // Dynamic progress step for life-summary pre-loading screen
  const [lifeSummaryProgressStep, setLifeSummaryProgressStep] = useState<number>(0);
  
  // Bundle state
  const [bundleType, setBundleType] = useState<string | null>(null);
  const [bundleReports, setBundleReports] = useState<ReportType[]>([]);
  const [bundleContents, setBundleContents] = useState<Map<ReportType, ReportContent>>(new Map());
  const [bundleGenerating, setBundleGenerating] = useState(false);
  const [bundleProgress, setBundleProgress] = useState<{ current: number; total: number; currentReport: string } | null>(null);
  
  // Request lock to prevent concurrent report generation
  const isGeneratingRef = useRef(false);
  const generationAttemptRef = useRef(0);
  const hasRedirectedRef = useRef(false); // Track redirect to prevent loops

  // Valid report types for validation
  const validReportTypes: ReportType[] = ["life-summary", "marriage-timing", "career-money", "full-life", "year-analysis", "major-life-phase", "decision-support"];

  const getReportName = (type: ReportType | null) => {
    switch (type) {
      case "marriage-timing":
        return "Marriage Timing Report";
      case "career-money":
        return "Career & Money Report";
      case "full-life":
        return "Full Life Report";
      case "year-analysis":
        return "Year Analysis Report";
      case "major-life-phase":
        return "3-5 Year Strategic Life Phase Report";
      case "decision-support":
        return "Decision Support Report";
      default:
        return "Life Summary";
    }
  };

  // Get value propositions for the report type (shown during loading)
  const getReportBenefits = (type: ReportType | null): string[] => {
    switch (type) {
      case "marriage-timing":
        return [
          "✓ Optimal marriage timing windows (month-by-month)",
          "✓ Planetary influence analysis for relationships",
          "✓ Personalized, non-generic insights"
        ];
      case "career-money":
        return [
          "✓ Career direction and growth opportunities",
          "✓ Financial stability and money growth insights",
          "✓ Personalized, non-generic guidance"
        ];
      case "full-life":
        return [
          "✓ Comprehensive life overview (career, relationships, health)",
          "✓ Long-term strategic insights (next 5-10 years)",
          "✓ Personalized, non-generic analysis"
        ];
      case "year-analysis":
        return [
          "✓ 12-month strategic overview",
          "✓ Career, money & relationship focus",
          "✓ Personalized, non-generic insights"
        ];
      case "major-life-phase":
        return [
          "✓ 3-5 year strategic life phase overview",
          "✓ Major transitions and opportunities",
          "✓ Personalized, non-generic insights"
        ];
      case "decision-support":
        return [
          "✓ Personalized decision guidance",
          "✓ Timing and opportunity analysis",
          "✓ Non-generic, contextual insights"
        ];
      default:
        return [
          "✓ Personalized life summary",
          "✓ Key insights from your birth chart",
          "✓ Free comprehensive overview"
        ];
    }
  };

  // Guard to prevent multiple auto-generation triggers
  const hasAutoGeneratedRef = useRef(false);
  const autoRecoveryTriggeredRef = useRef(false);
  
  const generateReport = useCallback(async (inputData: AIAstrologyInput, type: ReportType, currentSessionId?: string, currentPaymentIntentId?: string) => {
    // Prevent concurrent requests - if already generating, ignore this call
    if (isGeneratingRef.current) {
      console.warn("[Report Generation] Request ignored - already generating a report");
      return;
    }
    
    // Set lock immediately
    isGeneratingRef.current = true;
    generationAttemptRef.current += 1;
    const currentAttempt = generationAttemptRef.current;
    
    setLoading(true);
    setLoadingStage("generating"); // Ensure stage is set when generating
    setLoadingStartTime(Date.now()); // Track when loading started
    setElapsedTime(0); // Reset elapsed time
    setError(null);
    // CRITICAL: Reset progress steps when starting generation (for ALL report types including free)
    setProgressSteps({
      birthChart: false,
      planetaryAnalysis: false,
      generatingInsights: false,
    });

    try {
      // Get payment token and payment intent ID for paid reports (handle sessionStorage errors)
      let paymentToken: string | undefined;
      let sessionId: string | undefined;
      let paymentIntentId: string | undefined;
      
      try {
        paymentToken = sessionStorage.getItem("aiAstrologyPaymentToken") || undefined;
        sessionId = sessionStorage.getItem("aiAstrologyPaymentSessionId") || undefined;
        paymentIntentId = sessionStorage.getItem("aiAstrologyPaymentIntentId") || undefined;
      } catch (storageError) {
        console.error("Failed to read payment data from sessionStorage:", storageError);
        // Try to get session_id from URL params as fallback
        const urlParams = new URLSearchParams(window.location.search);
        sessionId = urlParams.get("session_id") || undefined;
      }
      
      // CRITICAL FIX: Use provided parameters as fallback if sessionStorage is empty
      if (currentSessionId) {
        sessionId = currentSessionId;
      } else if (!sessionId) {
        // Also check URL params for session_id (fallback if sessionStorage lost)
        const urlParams = new URLSearchParams(window.location.search);
        sessionId = urlParams.get("session_id") || undefined;
      }
      
      if (currentPaymentIntentId) {
        paymentIntentId = currentPaymentIntentId;
      }
      
      const isPaid = type !== "life-summary";
      
      // Note: Payment verification is handled server-side
      // In demo mode (development), payment token is not required
      // The API will return appropriate error if payment is required in production
      // CRITICAL FIX: API can now accept session_id as fallback if token is missing

      // Build API URL with session_id if available and token is missing
      // CRITICAL: Always include session_id if available, even if we have token (as backup)
      let apiUrl = "/api/ai-astrology/generate-report";
      if (sessionId && isPaid) {
        apiUrl = `/api/ai-astrology/generate-report?session_id=${encodeURIComponent(sessionId)}`;
      }

      // DEBUG: Log payment verification details (help diagnose issues)
      if (isPaid) {
        console.log("[Report Generation] Payment verification:", {
          hasToken: !!paymentToken,
          hasSessionId: !!sessionId,
          sessionId: sessionId?.substring(0, 20) + "...",
          reportType: type,
          apiUrl: apiUrl.substring(0, 80) + "..."
        });
      }

      // Calculate timeout based on report type (match server-side timeout + buffer)
      // Server timeout: 65s (free), 60s (regular paid), or 90s (complex)
      // Client should be slightly longer to avoid premature timeout
      const isComplexReport = type === "full-life" || type === "major-life-phase";
      const isFreeReport = type === "life-summary";
      // Free reports: 70s (server: 65s) - Prokerala API call can add 5-10s
      // Regular paid: 65s (server: 60s)
      // Complex: 100s (server: 90s + 10s buffer) - Increased to accommodate longer generation time
      const clientTimeout = isComplexReport ? 100000 : (isFreeReport ? 70000 : 65000);
      
      const response = await apiPost<{
        ok: boolean;
        data?: {
          status?: "completed" | "processing" | "pending" | "failed";
          reportId?: string;
          reportType: ReportType;
          input: AIAstrologyInput;
          content: ReportContent;
          generatedAt: string;
          redirectUrl?: string;
          fullRedirectUrl?: string;
          message?: string;
        };
        error?: string;
      }>(apiUrl, {
        input: inputData,
        reportType: type,
        paymentToken: isPaid ? paymentToken : undefined, // Only include for paid reports
        paymentIntentId: isPaid ? paymentIntentId : undefined, // CRITICAL: For manual capture after report generation
        sessionId: isPaid ? (sessionId || undefined) : undefined, // For token regeneration fallback
      }, { timeoutMs: clientTimeout });

      // Handle "processing" status - start polling instead of retrying
      if (response.ok && response.data?.status === "processing" && response.data?.reportId) {
        console.log(`[CLIENT] Report is processing, starting polling for reportId: ${response.data.reportId}`);
        const reportId = response.data.reportId;
        
        // Poll every 3 seconds for report completion
        const pollInterval = 3000; // 3 seconds
        const maxPollAttempts = Math.floor(clientTimeout / pollInterval); // Don't poll longer than timeout
        let pollAttempts = 0;
        
        const pollForReport = async (): Promise<void> => {
          if (pollAttempts >= maxPollAttempts) {
            console.warn(`[CLIENT] Polling timeout after ${maxPollAttempts} attempts`);
            throw new Error("Report generation is taking longer than expected. Please try again.");
          }
          
          pollAttempts++;
          console.log(`[CLIENT] Polling attempt ${pollAttempts}/${maxPollAttempts} for reportId: ${reportId}`);
          
          try {
            const statusResponse = await fetch(`/api/ai-astrology/generate-report?reportId=${encodeURIComponent(reportId)}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            });
            
            if (!statusResponse.ok) {
              // If status check fails, wait and retry
              await new Promise(resolve => setTimeout(resolve, pollInterval));
              return pollForReport();
            }
            
            const statusData = await statusResponse.json();
            
            if (statusData.ok && statusData.data) {
              if (statusData.data.status === "completed") {
                // Report is ready - handle completion
                console.log(`[CLIENT] Polling success - report completed for reportId: ${reportId}`);
                
                // Store content if available
                if (statusData.data.content && statusData.data.reportId) {
                  try {
                    const reportData = JSON.stringify({
                      content: statusData.data.content,
                      reportType: statusData.data.reportType,
                      input: statusData.data.input,
                      generatedAt: statusData.data.generatedAt,
                      reportId: statusData.data.reportId,
                    });
                    sessionStorage.setItem(`aiAstrologyReport_${statusData.data.reportId}`, reportData);
                    localStorage.setItem(`aiAstrologyReport_${statusData.data.reportId}`, reportData);
                    console.log("[CLIENT] Stored report content from polling");
                  } catch (storageError) {
                    console.warn("[CLIENT] Failed to store report from polling:", storageError);
                  }
                }
                
                // Navigate to report
                if (statusData.data.redirectUrl) {
                  console.log("[CLIENT] Navigating to report from polling:", statusData.data.redirectUrl);
                  router.replace(statusData.data.redirectUrl);
                  return;
                }
              } else if (statusData.data.status === "processing") {
                // Still processing - wait and poll again
                await new Promise(resolve => setTimeout(resolve, pollInterval));
                return pollForReport();
              }
            }
          } catch (pollError: any) {
            console.warn(`[CLIENT] Polling error (attempt ${pollAttempts}):`, pollError);
            // Wait and retry unless we've exceeded max attempts
            if (pollAttempts < maxPollAttempts) {
              await new Promise(resolve => setTimeout(resolve, pollInterval));
              return pollForReport();
            }
            throw pollError;
          }
        };
        
        // Start polling (don't await - let it run in background)
        pollForReport().catch((pollError: any) => {
          console.error("[CLIENT] Polling failed:", pollError);
          setError(pollError.message || "Failed to check report status. Please try again.");
          setLoading(false);
          setLoadingStage(null);
          isGeneratingRef.current = false;
          hasAutoGeneratedRef.current = false;
        });
        
        // Return early - polling will handle completion
        return;
      }

      if (!response.ok) {
        // CLIENT-SIDE ERROR LOGGING
        const clientErrorContext = {
          timestamp: new Date().toISOString(),
          reportType: type,
          error: response.error || "Unknown error",
          hasToken: !!paymentToken,
          hasSessionId: !!sessionId,
          apiUrl: apiUrl.substring(0, 80) + "...",
        };
        console.error("[CLIENT REPORT GENERATION ERROR]", JSON.stringify(clientErrorContext, null, 2));
        
        // CRITICAL: Stop immediately on 403/429/500 errors - don't retry
        // This prevents retry loops that drain API credits
        const errorMessage = response.error || "Failed to generate report. Please try again.";
        const isFatalError = errorMessage.includes("403") || 
                            errorMessage.includes("429") || 
                            errorMessage.includes("500") ||
                            errorMessage.includes("Access restricted") ||
                            errorMessage.includes("rate limit") ||
                            errorMessage.includes("SERVICE_DISABLED");
        
        if (isFatalError) {
          // Set error and stop - don't retry
          setError(errorMessage);
          setLoading(false);
          setLoadingStage(null);
          isGeneratingRef.current = false; // Clear lock
          hasAutoGeneratedRef.current = false; // Reset to allow manual retry
          return; // Exit immediately - no retry
        }
        
        // For other errors, throw to show error message
        throw new Error(errorMessage);
      }

      // CRITICAL: If report is completed and we have redirectUrl, navigate immediately
      // This prevents the UI from staying stuck on "Generating..." screen
      // Stop any polling/retry loops - we have the content, just navigate
      if (response.data?.status === "completed" && response.data?.redirectUrl) {
        // Store the content in sessionStorage before navigating (so it's available on the new page)
        if (response.data?.content && response.data?.reportId) {
          try {
            const reportId = response.data.reportId;
            const reportData = JSON.stringify({
              content: response.data.content,
              reportType: response.data.reportType,
              input: response.data.input,
              generatedAt: response.data.generatedAt,
              reportId, // Store canonical reportId for consistency
            });
            
            // Save to both sessionStorage (current session) and localStorage (persists across refreshes)
            sessionStorage.setItem(`aiAstrologyReport_${reportId}`, reportData);
            localStorage.setItem(`aiAstrologyReport_${reportId}`, reportData);
            console.log("[CLIENT] Stored report content in sessionStorage and localStorage for reportId:", reportId);
          } catch (storageError) {
            console.warn("[CLIENT] Failed to store report in storage:", storageError);
          }
        }
        
        // Navigate immediately using redirectUrl from API response
        // This is the single source of truth - don't construct URLs manually
        console.log("[CLIENT] Report generation completed, navigating to:", response.data.redirectUrl);
        router.replace(response.data.redirectUrl);
        
        // Show upsell for paid reports after a delay (30 seconds)
        const currentReportType = response.data?.reportType || type;
        if (currentReportType !== "life-summary" && !upsellShown) {
          setTimeout(() => {
            setShowUpsell(true);
            setUpsellShown(true);
          }, 30000); // 30 seconds after report generation
        }
        
        // CRITICAL: Return immediately - stop any further processing/polling
        return;
      }

      // If no redirect (older API versions), use existing behavior
      // CRITICAL: Ensure we have content before setting it
      if (response.data?.content) {
        setReportContent(response.data.content);
        setLoading(false);
        setLoadingStage(null);
        
        // Show upsell for paid reports after a delay (30 seconds)
        const currentReportType = response.data?.reportType || type;
        if (currentReportType !== "life-summary" && !upsellShown) {
          setTimeout(() => {
            setShowUpsell(true);
            setUpsellShown(true);
          }, 30000); // 30 seconds after report generation
        }
      } else {
        // No content received - this shouldn't happen if status is "completed"
        console.warn("[CLIENT] API returned ok but no content:", response.data);
        setError("Report generation completed but no content was returned. Please try again.");
        setLoading(false);
        setLoadingStage(null);
      }
    } catch (e: any) {
      // CLIENT-SIDE EXCEPTION LOGGING
      const exceptionContext = {
        timestamp: new Date().toISOString(),
        reportType: type,
        errorType: e.constructor?.name || "Unknown",
        errorMessage: e.message || "Unknown error",
        errorStack: e.stack || "No stack trace",
        stopRetry: (e as any).stopRetry || false,
        elapsedTime: Date.now() - (loadingStartTime || Date.now()),
      };
      console.error("[CLIENT REPORT GENERATION EXCEPTION]", JSON.stringify(exceptionContext, null, 2));
      
      // CRITICAL: Check for timeout errors specifically
      const isTimeoutError = e.message?.includes("timed out") || 
                            e.message?.includes("AbortError") ||
                            e.name === "AbortError" ||
                            e.message?.includes("taking longer than expected");
      
      // CRITICAL: Stop immediately on fatal errors (403/429/500) - don't retry
      // This prevents retry loops that drain API credits
      if ((e as any).stopRetry || e.message?.includes("403") || e.message?.includes("429") || e.message?.includes("500") || e.message?.includes("Access restricted") || e.message?.includes("SERVICE_DISABLED")) {
        setError(e.message || "Request failed. Please check your permissions or try again later.");
        setLoading(false);
        setLoadingStage(null);
        setLoadingStartTime(null); // Clear loading start time
        setElapsedTime(0); // Reset elapsed time
        isGeneratingRef.current = false; // Clear lock immediately
        hasAutoGeneratedRef.current = false; // Reset to allow manual retry
        return; // Exit - no retry
      }
      
      // Handle timeout errors with better messaging
      if (isTimeoutError) {
        // Calculate timeout from report type (same logic as in try block)
        const isComplexReportType = type === "full-life" || type === "major-life-phase";
        const calculatedTimeout = isComplexReportType ? 80000 : 65000;
        const timeoutMessage = `Report generation timed out after ${calculatedTimeout / 1000} seconds. This can happen with complex reports. Your payment has been automatically cancelled. Please try again or contact support if the issue persists.`;
        setError(timeoutMessage);
      } 
      // Improved error message for rate limits
      else if (e.message && (e.message.includes("rate limit") || e.message.includes("Rate limit") || e.message.includes("high demand"))) {
        setError("Our AI service is experiencing high demand right now. Please wait 2-3 minutes and try again. Your request will be processed as soon as capacity is available. If you've paid, your payment has been automatically cancelled and you will NOT be charged.");
      } else {
        setError(e.message || "Failed to generate report. Please try again.");
      }
      
      // CRITICAL: Always clear loading state on error
      setLoading(false);
      setLoadingStage(null);
      setLoadingStartTime(null);
      setElapsedTime(0);
      isGeneratingRef.current = false;
      // CRITICAL: Reset auto-generated ref on error to allow retry
      hasAutoGeneratedRef.current = false;
    } finally {
      // Only clear lock if this is still the current attempt (prevent race conditions)
      if (currentAttempt === generationAttemptRef.current) {
        isGeneratingRef.current = false;
      }
      // Loading state is already cleared in catch block, but ensure it's cleared here too as fallback
      setLoading(false);
      setLoadingStage(null);
    }
    // Note: loadingStartTime is intentionally not in dependencies - we read it in error handler but set it inside the function
    // Including it would cause unnecessary re-renders. The state value is always current when accessed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upsellShown, router]);

  const generateBundleReports = useCallback(async (inputData: AIAstrologyInput, reports: ReportType[], currentSessionId?: string, currentPaymentIntentId?: string) => {
    // Prevent concurrent requests
    if (isGeneratingRef.current || bundleGenerating) {
      console.warn("[Bundle Generation] Request ignored - already generating reports");
      return;
    }
    
    // Set lock
    isGeneratingRef.current = true;
    generationAttemptRef.current += 1;
    const currentAttempt = generationAttemptRef.current;
    
    setBundleGenerating(true);
    setLoading(true);
    setError(null);
    setBundleProgress({ current: 0, total: reports.length, currentReport: getReportName(reports[0]) });

    try {
      // Get payment token, session ID, and payment intent ID for paid reports (handle sessionStorage errors)
      let paymentToken: string | undefined;
      let sessionId: string | undefined;
      let paymentIntentId: string | undefined;
      
      try {
        paymentToken = sessionStorage.getItem("aiAstrologyPaymentToken") || undefined;
        sessionId = sessionStorage.getItem("aiAstrologyPaymentSessionId") || undefined;
        paymentIntentId = sessionStorage.getItem("aiAstrologyPaymentIntentId") || undefined;
      } catch (storageError) {
        console.error("Failed to read payment data from sessionStorage:", storageError);
        // Try to get session_id from URL params as fallback
        const urlParams = new URLSearchParams(window.location.search);
        sessionId = urlParams.get("session_id") || undefined;
      }
      
      // CRITICAL FIX: Use provided parameters as fallback if sessionStorage is empty
      if (currentSessionId) {
        sessionId = currentSessionId;
      } else if (!sessionId) {
        // Also check URL params for session_id (fallback if sessionStorage lost)
        const urlParams = new URLSearchParams(window.location.search);
        sessionId = urlParams.get("session_id") || undefined;
      }
      
      if (currentPaymentIntentId) {
        paymentIntentId = currentPaymentIntentId;
      }

      // Generate all reports in parallel for faster loading
      // Use Promise.allSettled to handle partial failures gracefully
      const completedReports = new Set<ReportType>();
      const updateProgress = (reportType: ReportType, success: boolean) => {
        completedReports.add(reportType);
        setBundleProgress({ 
          current: completedReports.size, 
          total: reports.length, 
          currentReport: getReportName(reportType) 
        });
        console.log(`[BUNDLE PROGRESS] ${completedReports.size}/${reports.length} reports completed (${success ? 'success' : 'failed'}): ${getReportName(reportType)}`);
      };

      // Individual timeout for each report (match server timeout + buffer)
      // Server timeout: 60s (regular) or 75s (complex), use the longer one for bundles to be safe
      // Optimized for faster generation
      // Client timeout should be slightly longer to account for network overhead
      const INDIVIDUAL_REPORT_TIMEOUT = 80000; // 80s - slightly longer than server max (75s, optimized)

      const reportPromises = reports.map(async (reportType) => {
        const reportName = getReportName(reportType);
        console.log(`[BUNDLE] Starting generation: ${reportName}`);
        
        // Create abort controller for timeout
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => {
          abortController.abort();
        }, INDIVIDUAL_REPORT_TIMEOUT);

        try {
          // Build API URL with session_id as query param (for test session detection)
          let apiUrl = "/api/ai-astrology/generate-report";
          if (sessionId) {
            apiUrl += `?session_id=${encodeURIComponent(sessionId)}`;
          }

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              input: inputData,
              reportType: reportType,
              paymentToken: paymentToken,
              sessionId: sessionId, // For token regeneration fallback
              paymentIntentId: paymentIntentId, // For manual capture after report generation
            }),
            signal: abortController.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
            console.error(`[BUNDLE] Failed to generate ${reportName}:`, errorData.error || response.statusText);
            const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
            
            updateProgress(reportType, false);
            
            // Make timeout errors more user-friendly
            const friendlyError = errorMessage.includes("timeout") || errorMessage.includes("timed out") || errorMessage.includes("aborted")
              ? "This report is taking longer than expected. It may time out - try generating it individually for better results."
              : errorMessage;
            
            return { 
              reportType, 
              content: null, 
              success: false, 
              error: friendlyError
            };
          }

          const data = await response.json();
          
          if (data.ok && data.data?.content) {
            console.log(`[BUNDLE] Successfully generated: ${reportName}`);
            updateProgress(reportType, true);
            return { reportType, content: data.data.content, success: true };
          } else {
            console.error(`[BUNDLE] Failed to generate ${reportName}:`, data.error || "Unknown error");
            const errorMessage = data.error || "Failed to generate report";
            updateProgress(reportType, false);
            
            // Make timeout errors more user-friendly
            const friendlyError = errorMessage.includes("timeout") || errorMessage.includes("timed out")
              ? "This report is taking longer than expected. It may time out - try generating it individually for better results."
              : errorMessage;
            
            return { 
              reportType, 
              content: null, 
              success: false, 
              error: friendlyError
            };
          }
        } catch (e: any) {
          clearTimeout(timeoutId);
          console.error(`[BUNDLE] Error generating ${reportName}:`, e);
          
          const errorMessage = e.name === 'AbortError' 
            ? "Request timed out. This report is taking longer than expected. Please try generating it individually."
            : e.message || "Failed to generate report";
          
          updateProgress(reportType, false);
          
          // Make timeout errors more user-friendly
          const friendlyError = errorMessage.includes("timeout") || errorMessage.includes("timed out") || errorMessage.includes("aborted")
            ? "Request timed out. This report is taking longer than expected. Please try generating it individually."
            : errorMessage;
          
          return { 
            reportType, 
            content: null, 
            success: false, 
            error: friendlyError
          };
        }
      });

      // Use Promise.allSettled to wait for all reports (success or failure)
      const results = await Promise.allSettled(reportPromises);
      
      // Extract results from settled promises
      const reportResults = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          // Promise was rejected (shouldn't happen with our error handling, but handle it)
          return {
            reportType: reports[index],
            content: null,
            success: false,
            error: result.reason?.message || "Unexpected error occurred"
          };
        }
      });
      
      // Separate successful and failed reports
      const successes = reportResults.filter(r => r.success);
      const failures = reportResults.filter(r => !r.success);
      
      // If we have at least one successful report, show partial success
      if (successes.length > 0) {
        const bundleContentsMap = new Map<ReportType, ReportContent>();
        successes.forEach(result => {
          if (result.content) {
            bundleContentsMap.set(result.reportType, result.content);
          }
        });

        // Set bundle contents with successful reports
        setBundleContents(bundleContentsMap);
        // Set the first successful report as the primary report for display
        setReportContent(bundleContentsMap.get(reports[0]) || bundleContentsMap.values().next().value || null);
        setReportType(successes[0].reportType);
        setBundleProgress(null);

        // If there were failures, show a warning but don't block the user
        if (failures.length > 0) {
          const failedNames = failures.map(f => getReportName(f.reportType)).join(", ");
          const successCount = successes.length;
          const totalCount = reports.length;
          
          // Show partial success message
          const partialSuccessMessage = `Successfully generated ${successCount} of ${totalCount} reports. ${failedNames} ${failures.length === 1 ? 'failed' : 'failed'} to generate. ${failures.some(f => f.error?.includes('timeout')) ? 'The failed reports timed out - you can try generating them individually later.' : 'You can try generating the failed reports individually.'}`;
          
          // Set as a non-blocking warning (user can still view successful reports)
          console.warn("[BUNDLE PARTIAL SUCCESS]", partialSuccessMessage);
          
          // Show error but allow user to continue with successful reports
          setError(partialSuccessMessage);
          
          // Auto-clear error after 10 seconds so user can view reports
          setTimeout(() => {
            setError(null);
          }, 10000);
        }
      } else {
        // All reports failed
        const failedReport = failures[0];
        const errorDetails = failures.length > 1 
          ? `All ${failures.length} reports failed to generate. ${failures[0].error || "Please try again."}`
          : `Failed to generate ${getReportName(failedReport.reportType)}. ${failedReport.error || "Please try again."}`;
        
        setError(errorDetails);
        setBundleProgress(null);
      }
    } catch (e: any) {
      console.error("Bundle generation error:", e);
      // Improved error message for rate limits
      if (e.message && (e.message.includes("rate limit") || e.message.includes("Rate limit") || e.message.includes("high demand"))) {
        setError("Our AI service is experiencing high demand right now. Please wait 2-3 minutes and try again. Your request will be processed as soon as capacity is available. If you've paid, your payment has been automatically cancelled and you will NOT be charged.");
      } else {
        setError(e.message || "Failed to generate bundle reports. Please try again.");
      }
      setBundleProgress(null);
    } finally {
      // Only clear lock if this is still the current attempt
      if (currentAttempt === generationAttemptRef.current) {
        isGeneratingRef.current = false;
      }
      setBundleGenerating(false);
      setLoading(false);
      setLoadingStage(null);
    }
  }, [bundleGenerating]);

  useEffect(() => {
    // Check if sessionStorage is available
    if (typeof window === "undefined") return;
    
    // CRITICAL FIX: Prevent redirect loops by checking if we're already redirecting
    // BUT: Don't skip if loading - we need to check sessionStorage even during initial loading
    // Only skip if we've already redirected or are currently generating
    if (hasRedirectedRef.current || isGeneratingRef.current) {
      return;
    }
    
    try {
      // CRITICAL: Check for reportId in URL - if present, try to load from sessionStorage or localStorage
      // This check happens BEFORE the delay to ensure immediate loading when report exists
      const reportId = searchParams.get("reportId");
      if (reportId && !reportContent) {
        try {
          // Try sessionStorage first (same session)
          let storedReport = sessionStorage.getItem(`aiAstrologyReport_${reportId}`);
          
          // If not in sessionStorage, try localStorage (persists across refreshes)
          if (!storedReport) {
            storedReport = localStorage.getItem(`aiAstrologyReport_${reportId}`);
            if (storedReport) {
              console.log("[CLIENT] Loaded report from localStorage for reportId:", reportId);
            }
          } else {
            console.log("[CLIENT] Loaded report from sessionStorage for reportId:", reportId);
          }
          
          if (storedReport) {
            const parsed = JSON.parse(storedReport);
            setReportContent(parsed.content);
            setReportType(parsed.reportType || (searchParams.get("reportType") as ReportType) || "life-summary");
            setInput(parsed.input);
            setLoading(false);
            // Don't continue with auto-generation if we already have content
            return;
          } else {
            // ReportId in URL but not found in storage - don't try to regenerate
            // This would create a new reportId which is wrong
            // Instead, show error or redirect to input page
            console.warn("[CLIENT] ReportId found in URL but not in storage:", reportId);
            setError("Report not found. Please generate a new report.");
            setLoading(false);
            return; // Exit early - don't try to regenerate with different ID
          }
        } catch (error) {
          console.warn("[CLIENT] Failed to load report from storage:", error);
          setError("Failed to load report. Please try again.");
          setLoading(false);
          return; // Exit early on error
        }
      }
      
      // CRITICAL FIX: Get session_id from URL params first (fallback if sessionStorage is lost)
      const urlSessionId = searchParams.get("session_id");
      const autoGenerate = searchParams.get("auto_generate") === "true"; // Trigger auto-generation after payment
      
      // CRITICAL FIX: Add delay to allow sessionStorage to be written after navigation
      // This prevents race condition where we check before data is saved from input page
      // This fixes the redirect loop issue
      // IMPORTANT: This delay ONLY applies when there's NO reportId in URL (coming from input page)
      // If reportId exists, it's already handled above (before this delay)
      // Increased delay to 500ms to ensure sessionStorage is fully available
      const timeoutId = setTimeout(() => {
        // CRITICAL: Double-check we haven't redirected or started loading in the meantime
        if (hasRedirectedRef.current || loading || isGeneratingRef.current) {
          return;
        }
        
        try {
          // Get input from sessionStorage
        const savedInput = sessionStorage.getItem("aiAstrologyInput");
        const savedReportType = sessionStorage.getItem("aiAstrologyReportType") as ReportType;
        const paymentVerified = sessionStorage.getItem("aiAstrologyPaymentVerified") === "true";
        
        // Get bundle information
        const savedBundleType = sessionStorage.getItem("aiAstrologyBundle");
        const savedBundleReports = sessionStorage.getItem("aiAstrologyBundleReports");

        // CRITICAL FIX: Only redirect if we truly don't have input data AND haven't redirected already
        // Also check that we're not currently on the input page (prevent infinite loops)
        // Also preserve reportType when redirecting to prevent loops
        if (!savedInput && !hasRedirectedRef.current) {
          // Check if we're already on the input page to prevent loops
          const currentPath = window.location.pathname;
          if (currentPath.includes("/input")) {
            console.log("[Preview] Already on input page, not redirecting to prevent loop");
            return;
          }
          
          // Preserve reportType from URL params or use savedReportType if available
          const urlReportType = searchParams.get("reportType");
          const redirectUrl = urlReportType 
            ? `/ai-astrology/input?reportType=${encodeURIComponent(urlReportType)}`
            : savedReportType && savedReportType !== "life-summary"
            ? `/ai-astrology/input?reportType=${encodeURIComponent(savedReportType)}`
            : "/ai-astrology/input";
          console.log("[Preview] No saved input found after delay, redirecting to:", redirectUrl);
          hasRedirectedRef.current = true; // Prevent multiple redirects
          router.push(redirectUrl);
          return;
        }
        
        // If no input after delay, exit early
        if (!savedInput) return;
        
        // Continue with the rest of the logic only if we have savedInput
        const inputData = JSON.parse(savedInput);
        // CRITICAL: Prefer reportType from URL params (most reliable), then sessionStorage, then default
        // URL params are most reliable because they persist even if sessionStorage is cleared
        const urlReportTypeForUse = searchParams.get("reportType") as ReportType | null;
        let reportTypeToUse: ReportType;
        
        if (urlReportTypeForUse && validReportTypes.includes(urlReportTypeForUse)) {
          // URL param is most reliable - use it and update sessionStorage
          reportTypeToUse = urlReportTypeForUse;
          try {
            sessionStorage.setItem("aiAstrologyReportType", reportTypeToUse);
          } catch (e) {
            console.warn("Failed to save reportType to sessionStorage:", e);
          }
        } else if (savedReportType && validReportTypes.includes(savedReportType)) {
          // Fallback to sessionStorage
          reportTypeToUse = savedReportType;
        } else {
          // Default to life-summary only if no other option
          reportTypeToUse = "life-summary";
        }
        
        console.log("[Preview] Using reportType:", reportTypeToUse, {
          fromUrl: urlReportTypeForUse,
          fromStorage: savedReportType,
          final: reportTypeToUse
        });
        
        // CRITICAL: Set input and reportType state IMMEDIATELY before any other checks
        // This ensures the component has the data it needs to render correctly
        // and prevents the "no input" redirect logic from triggering
        setInput(inputData);
        setReportType(reportTypeToUse);
          
        // CRITICAL FIX: If payment verified flag is missing but session_id exists, try to re-verify
        // IMPORTANT: Wait for verification before allowing report generation
        if (!paymentVerified && urlSessionId) {
          // Attempt to regenerate payment token from session_id - MUST WAIT for this
          // CRITICAL: Set loading state IMMEDIATELY to prevent redirect logic from triggering
          setLoading(true); // Show loading while verifying
          setLoadingStage("verifying"); // Show payment verification stage
          setLoadingStartTime(Date.now()); // Track when loading started
          setElapsedTime(0); // Reset elapsed time
          // Also set generating lock to prevent redirects during verification
          isGeneratingRef.current = true;
          
          (async () => {
            try {
              console.log("[Preview] Attempting to regenerate payment token from session_id:", urlSessionId.substring(0, 20) + "...");
              
              const verifyResponse = await apiGet<{
                ok: boolean;
                data?: {
                  paid: boolean;
                  paymentToken?: string;
                  reportType?: string;
                  paymentIntentId?: string;
                };
                error?: string;
              }>(`/api/ai-astrology/verify-payment?session_id=${encodeURIComponent(urlSessionId)}`);
              
              console.log("[Preview] Payment verification response:", {
                ok: verifyResponse.ok,
                paid: verifyResponse.data?.paid,
                hasToken: !!verifyResponse.data?.paymentToken,
                error: verifyResponse.error
              });
              
              if (verifyResponse.ok && verifyResponse.data?.paid) {
                // Store regenerated token and payment intent ID
                try {
                  if (verifyResponse.data.paymentToken) {
                    sessionStorage.setItem("aiAstrologyPaymentToken", verifyResponse.data.paymentToken);
                  }
                  if (verifyResponse.data.paymentIntentId) {
                    sessionStorage.setItem("aiAstrologyPaymentIntentId", verifyResponse.data.paymentIntentId);
                  }
                  sessionStorage.setItem("aiAstrologyPaymentVerified", "true");
                  sessionStorage.setItem("aiAstrologyPaymentSessionId", urlSessionId);
                  // CRITICAL: Update reportType from verification response if available (most reliable source)
                  const verifiedReportType = verifyResponse.data.reportType as ReportType;
                  if (verifiedReportType && validReportTypes.includes(verifiedReportType)) {
                    sessionStorage.setItem("aiAstrologyReportType", verifiedReportType);
                    setReportType(verifiedReportType);
                    // Update reportTypeToUse for this generation
                    const finalReportType = verifiedReportType;
                    setPaymentVerified(true);
                    console.log("[Preview] Payment token and intent ID regenerated successfully, reportType:", finalReportType);
                    
                    // Now trigger report generation with verified payment
                    // CRITICAL: Set auto-generated guard to prevent duplicate calls from auto_generate path
                    hasAutoGeneratedRef.current = true;
                    setLoadingStage("generating"); // Switch to report generation stage
                    generateReport(inputData, finalReportType, urlSessionId, verifyResponse.data.paymentIntentId);
                  } else {
                    // Fallback to reportTypeToUse if verification didn't return reportType
                    setPaymentVerified(true);
                    console.log("[Preview] Payment token and intent ID regenerated successfully, using existing reportType:", reportTypeToUse);
                    
                    // Now trigger report generation with verified payment
                    hasAutoGeneratedRef.current = true;
                    setLoadingStage("generating");
                    generateReport(inputData, reportTypeToUse, urlSessionId, verifyResponse.data.paymentIntentId);
                  }
                  return;
                } catch (e) {
                  console.error("Failed to store regenerated payment token:", e);
                  setLoading(false);
                  setLoadingStage(null);
                  isGeneratingRef.current = false; // Clear lock on error
                }
              } else {
                console.error("[Preview] Payment verification failed:", verifyResponse.error);
                setError(`Payment verification failed: ${verifyResponse.error || "Please complete payment again."}`);
                setLoading(false);
                setLoadingStage(null);
                isGeneratingRef.current = false; // Clear lock on error
              }
            } catch (e: any) {
              console.error("Failed to regenerate payment token from session_id:", e);
              setError(`Failed to verify payment: ${e.message || "Please try again or contact support."}`);
              setLoading(false);
              setLoadingStage(null);
              isGeneratingRef.current = false; // Clear lock on error
            }
          })();
          
          // Don't proceed with report generation yet - wait for verification
          return;
        } else {
          setPaymentVerified(paymentVerified);
        }
        
        // Parse bundle information
        if (savedBundleType && savedBundleReports) {
          try {
            const bundleReportsList = JSON.parse(savedBundleReports) as ReportType[];
            setBundleType(savedBundleType);
            setBundleReports(bundleReportsList);
          } catch (e) {
            console.error("Failed to parse bundle reports:", e);
          }
        }

        // Check if payment is required
        const isPaidReport = reportTypeToUse !== "life-summary";
        const isBundle = savedBundleType && savedBundleReports;
          
        // CRITICAL FIX: If paid report and no payment verified, but we have session_id, try verification first
        if (isPaidReport && !paymentVerified && !urlSessionId) {
          // No payment and no session_id - show payment prompt
          // CRITICAL: Set loading to false AFTER input state is set (which happens above)
          // This allows payment prompt UI to render (checks !loading)
          // Since input is now set, redirect logic won't trigger (checks !input)
          setLoading(false);
          return;
        }
        
        // If we have session_id but payment not verified yet, the verification will trigger report generation
        if (isPaidReport && !paymentVerified && urlSessionId) {
          // Verification is in progress (handled above), don't proceed yet
          return;
        }

        // CRITICAL: Auto-generate report for:
        // 1. Paid reports: if payment verified (with or without auto_generate flag, to support existing flows)
        // 2. Free reports: immediately when reaching preview page (no payment needed)
        // This ensures ALL reports follow the same flow and auto-generate consistently
        // IMPORTANT: Don't require auto_generate=true for paid reports - if payment is verified and we have input, generate
        // This fixes issues where year-analysis and other paid reports worked before but broke after changes
        const shouldAutoGenerate = 
          // Paid reports: generate if payment verified (supports both auto_generate flow and direct navigation)
          (isPaidReport && paymentVerified && !reportContent) ||
          // Free reports: auto-generate immediately if we have input and no content yet
          (!isPaidReport && !reportContent);
        
        if (shouldAutoGenerate && inputData && reportTypeToUse && !loading && !hasAutoGeneratedRef.current) {
          hasAutoGeneratedRef.current = true; // Set guard immediately
          console.log("[Preview] Auto-generating report:", { 
            reportType: reportTypeToUse, 
            hasInput: !!inputData,
            isPaidReport,
            autoGenerate,
            paymentVerified,
            isFreeReport: !isPaidReport
          });
          
          // Get paymentIntentId from sessionStorage if available (for paid reports only)
          let paymentIntentIdFromStorage: string | undefined;
          try {
            paymentIntentIdFromStorage = sessionStorage.getItem("aiAstrologyPaymentIntentId") || undefined;
          } catch (e) {
            console.error("Failed to read paymentIntentId from sessionStorage:", e);
          }
          
          // Show loading immediately and set stage to generating (for ALL report types)
          setLoading(true);
          setLoadingStage("generating");
          setLoadingStartTime(Date.now());
          setElapsedTime(0);
          // Reset progress steps for all reports
          setProgressSteps({
            birthChart: false,
            planetaryAnalysis: false,
            generatingInsights: false,
          });
          
          // CRITICAL FIX: For free life-summary reports, trigger generation immediately without delay
          // The delay was causing issues where the component might unmount or state might change before generation starts
          // For free reports, we can generate immediately since there's no payment verification needed
          const isFreeLifeSummary = !isPaidReport && reportTypeToUse === "life-summary";
          const generationDelay = isFreeLifeSummary ? 0 : 300; // No delay for free reports, 300ms for paid
          
          // Small delay to ensure state is set (or immediate for free reports)
          setTimeout(() => {
            // Double-check conditions before generating (prevent race conditions)
            if (!inputData || !reportTypeToUse) {
              console.error("[Preview] Input data or report type missing in generation timer");
              hasAutoGeneratedRef.current = false; // Reset guard on error
              setLoading(false);
              return;
            }
            
            if (isBundle && savedBundleReports) {
              try {
                const bundleReportsList = JSON.parse(savedBundleReports) as ReportType[];
                generateBundleReports(inputData, bundleReportsList, urlSessionId || undefined, paymentIntentIdFromStorage);
              } catch (e) {
                console.error("Failed to parse bundle reports:", e);
                hasAutoGeneratedRef.current = false; // Reset guard on error
                generateReport(inputData, reportTypeToUse, urlSessionId || undefined, paymentIntentIdFromStorage);
              }
            } else {
              // For free reports, don't pass session_id or paymentIntentId
              const sessionIdForGeneration = isPaidReport ? (urlSessionId || undefined) : undefined;
              const paymentIntentIdForGeneration = isPaidReport ? paymentIntentIdFromStorage : undefined;
              console.log("[Preview] Calling generateReport with delay:", generationDelay, "ms");
              generateReport(inputData, reportTypeToUse, sessionIdForGeneration, paymentIntentIdForGeneration);
            }
          }, generationDelay);
          return; // Exit early to avoid duplicate generation
        }
        } catch (e) {
          // Handle errors within setTimeout
          console.error("[Preview] Error in delayed sessionStorage check:", e);
          // Don't redirect on error here - let outer catch handle it
          // Only redirect if we haven't already redirected and it's a critical error
          if (!hasRedirectedRef.current && e instanceof Error && e.message.includes("sessionStorage")) {
            // Only redirect for sessionStorage errors, not other errors
            const currentPath = window.location.pathname;
            if (!currentPath.includes("/input")) {
              hasRedirectedRef.current = true;
              const urlReportType = searchParams.get("reportType");
              const redirectUrl = urlReportType 
                ? `/ai-astrology/input?reportType=${encodeURIComponent(urlReportType)}`
                : "/ai-astrology/input";
              router.push(redirectUrl);
            }
          }
        }
      }, 500); // Increased delay to 500ms to ensure sessionStorage is fully available after navigation
      
      // Cleanup timeout on unmount
      return () => {
        clearTimeout(timeoutId);
      };
    } catch (e) {
      // Handle JSON parse errors or sessionStorage errors (e.g., private browsing mode)
      console.error("Error accessing sessionStorage or parsing saved input:", e);
      
      // CRITICAL: Only redirect if we haven't already redirected and we're not already on input page
      if (!hasRedirectedRef.current) {
        const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
        if (!currentPath.includes("/input")) {
          hasRedirectedRef.current = true;
          // CRITICAL: Preserve reportType when redirecting to prevent loops
          const urlReportType = searchParams.get("reportType");
          const redirectUrl = urlReportType 
            ? `/ai-astrology/input?reportType=${encodeURIComponent(urlReportType)}`
            : "/ai-astrology/input";
          router.push(redirectUrl);
        }
      }
    }
    // CRITICAL: Intentionally limited dependencies to prevent redirect loops and unnecessary re-renders:
    // - 'loading' removed: Would cause re-runs on every loading state change, triggering redirect loops
    // - 'reportContent' removed: We check reportContent inside, but don't want re-run when it changes (would interrupt generation)
    // - 'searchParams' removed: We read searchParams inside but intentionally removed .toString() to avoid re-runs on every URL change
    // - 'validReportTypes' removed: Constant array, doesn't need to be in dependencies
    // Only re-run when router, generateReport, or generateBundleReports change (which indicates a new render cycle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, generateReport, generateBundleReports]);

  // Bundle reports are always paid, so check for bundle OR paid report type
  const isBundleReport = bundleType && bundleReports.length > 0;
  const isPaidReport = reportType !== "life-summary" || isBundleReport;
  const needsPayment = isPaidReport && !paymentVerified;

  const handlePurchase = async () => {
    if (!input) return;
    
    // Check if this is a bundle purchase
    const isBundle = bundleType && bundleReports.length > 0;
    if (isBundle && !reportType) {
      // For bundles, we need at least one reportType (will be handled by bundleReports)
      console.warn("[Purchase] Bundle purchase but no reportType set");
    }
    if (!isBundle && !reportType) {
      setError("Report type is required");
      return;
    }

    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // CRITICAL: For bundles, send bundleReports to create separate line items for each report
      const checkoutPayload: any = {
        input,
      };
      
      if (isBundle) {
        // Bundle: Send bundle information for separate charges
        checkoutPayload.bundleReports = bundleReports;
        checkoutPayload.bundleType = bundleType;
        // Still include reportType for metadata (use first report in bundle)
        checkoutPayload.reportType = bundleReports[0] || reportType;
        console.log(`[Purchase] Creating bundle checkout for ${bundleReports.length} reports:`, bundleReports);
      } else {
        // Single report
        checkoutPayload.reportType = reportType;
        console.log(`[Purchase] Creating single report checkout for:`, reportType);
      }
      
      const response = await apiPost<{
        ok: boolean;
        data?: { url: string; sessionId: string };
        error?: string;
      }>("/api/ai-astrology/create-checkout", checkoutPayload);

      if (!response.ok) {
        throw new Error(response.error || "Failed to create checkout");
      }

      // Redirect to Stripe checkout (validate URL to prevent open redirects)
      if (response.data?.url) {
        const checkoutUrl = response.data.url;
        // Validate URL is from Stripe, localhost, relative path, or same origin (for test users)
        try {
          const url = new URL(checkoutUrl, window.location.origin);
          const isStripe = url.hostname === "checkout.stripe.com";
          const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
          const isSameOrigin = url.origin === window.location.origin;
          const isRelative = checkoutUrl.startsWith("/");
          
          if (isStripe || isLocalhost || isSameOrigin || isRelative) {
            window.location.href = checkoutUrl;
          } else {
            throw new Error("Invalid checkout URL");
          }
        } catch (urlError) {
          // If URL parsing fails, check if it's a relative path
          if (checkoutUrl.startsWith("/")) {
            window.location.href = checkoutUrl;
          } else {
            throw new Error("Invalid checkout URL");
          }
        }
      }
    } catch (e: any) {
      setError(e.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportContent || !input) return;

    setDownloadingPDF(true);
    setError(null); // Clear any previous errors
    
    // Add timeout to prevent infinite hanging (60 seconds for single, 120 seconds for bundle)
    const isBundle = bundleType && bundleReports.length > 0 && bundleContents.size > 0;
    const timeoutDuration = isBundle ? 120000 : 60000; // 120s for bundles, 60s for single
    
    const timeoutId = setTimeout(() => {
      if (downloadingPDF) {
        console.error("[PDF] Generation timeout after", timeoutDuration / 1000, "seconds");
        setError("PDF generation is taking longer than expected. Please try again. If the issue persists, the report may be too large.");
        setDownloadingPDF(false);
      }
    }, timeoutDuration);
    
    try {
      // Check if this is a bundle download
      if (isBundle) {
        // Download bundle PDF with all reports
        const bundleContentsMap = new Map<string, ReportContent>();
        bundleReports.forEach(reportType => {
          const content = bundleContents.get(reportType);
          if (content) {
            bundleContentsMap.set(reportType, content);
          }
        });
        
        // Ensure we have all bundle contents before downloading
        if (bundleContentsMap.size === bundleReports.length) {
          console.log("[PDF] Starting bundle PDF generation...");
          const success = await downloadPDF(
            reportContent, // Still needed for function signature but bundle data is used
            input,
            reportType || "life-summary",
            undefined, // filename
            bundleContentsMap,
            bundleReports,
            bundleType
          );
          clearTimeout(timeoutId);
          if (!success) {
            setError("Failed to generate bundle PDF. Please try again. If the issue persists, try downloading individual reports.");
          }
        } else {
          clearTimeout(timeoutId);
          setError("Not all bundle reports are available. Please wait for all reports to generate.");
        }
      } else {
        // Download single report PDF
        console.log("[PDF] Starting single report PDF generation...");
        const success = await downloadPDF(reportContent, input, reportType || "life-summary");
        clearTimeout(timeoutId);
        if (!success) {
          setError("Failed to generate PDF. Please try again. If the issue persists, try refreshing the page.");
        }
      }
    } catch (e: any) {
      clearTimeout(timeoutId);
      console.error("[PDF] PDF download error:", e);
      setError(`Failed to download PDF: ${e.message || "Unknown error"}. Please try again or refresh the page.`);
    } finally {
      clearTimeout(timeoutId);
      setDownloadingPDF(false);
    }
  };

  // Track elapsed time during loading and update progress steps
  useEffect(() => {
    if (loading && loadingStartTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - loadingStartTime) / 1000);
        setElapsedTime(elapsed);
        
        // Update progress steps (simulated progress for UX - not actual backend status)
        // These are visual indicators to show work is happening
        if (elapsed >= 5) {
          setProgressSteps(prev => ({ ...prev, birthChart: true }));
        }
        if (elapsed >= 15) {
          setProgressSteps(prev => ({ ...prev, planetaryAnalysis: true }));
        }
        if (elapsed >= 25) {
          setProgressSteps(prev => ({ ...prev, generatingInsights: true }));
        }
        
        // CRITICAL: Auto-detect timeout and show error if stuck
        // Timeout thresholds: 130s for complex reports (matches increased 90s server timeout + buffer), 100s for regular reports, 30s for verification
        // Increased from 120s to 130s to match increased server timeout for complex reports
        const timeoutThreshold = loadingStage === "verifying" 
          ? 30 
          : (reportType === "full-life" || reportType === "major-life-phase") 
          ? 130 
          : 100;
        
        if (elapsed >= timeoutThreshold) {
          console.error(`[CLIENT TIMEOUT] Report generation stuck for ${elapsed}s, showing timeout error`);
          setError(`Report generation is taking longer than expected (${elapsed}s). This may indicate a timeout. Your payment has been automatically cancelled and you will NOT be charged. Please try again or contact support if the issue persists.`);
          setLoading(false);
          setLoadingStage(null);
          setLoadingStartTime(null);
          setElapsedTime(0);
          isGeneratingRef.current = false; // Clear lock
          hasAutoGeneratedRef.current = false; // Reset to allow retry
        }
      }, 1000); // Update every second
      
      return () => clearInterval(interval);
    } else {
      // Reset progress steps when not loading
      setProgressSteps({
        birthChart: false,
        planetaryAnalysis: false,
        generatingInsights: false,
      });
    }
  }, [loading, loadingStartTime, loadingStage, reportType]);

  // AGGRESSIVE AUTO-RECOVERY: If stuck on "Preparing Your Report..." screen, auto-trigger recovery
  const urlSessionIdForRecovery = searchParams.get("session_id");
  const autoGenerateForRecovery = searchParams.get("auto_generate") === "true";
  const hasSessionIdForRecovery = !!urlSessionIdForRecovery;
  const isFreeReportForRecovery = reportType === "life-summary";
  
  useEffect(() => {
    // CRITICAL FIX: Trigger recovery if we have session_id but NO reportContent (regardless of input state)
    // OR if it's a free report that's stuck (no session_id needed for free reports)
    // This handles cases where input is loaded but report generation never happened or failed silently
    // Wait a short delay to let main useEffect finish first
    // IMPORTANT: Only trigger if NOT currently loading/generating to avoid conflicts
    const shouldTriggerRecovery = (
      ((hasSessionIdForRecovery || autoGenerateForRecovery) || (isFreeReportForRecovery && input && !reportContent)) && 
      !reportContent && 
      !loading &&
      !isGeneratingRef.current &&
      !autoRecoveryTriggeredRef.current // Prevent multiple triggers
      // Note: Don't check hasAutoGeneratedRef here - recovery should work even if auto-generation was attempted
    );
    
    if (shouldTriggerRecovery) {
      console.log("[AUTO-RECOVERY] Stuck state detected:", {
        hasSessionId: hasSessionIdForRecovery,
        hasInput: !!input,
        hasContent: !!reportContent,
        loading,
        error: !!error,
        autoGenerate: autoGenerateForRecovery
      });
      
      // Mark as triggered immediately to prevent multiple calls
      autoRecoveryTriggeredRef.current = true;
      
      // Small delay to let other useEffects complete, then trigger recovery
      const timer = setTimeout(() => {
        const triggerRecovery = async () => {
        try {
          // Get input from sessionStorage (it might already be in state, but get fresh copy)
          const savedInput = sessionStorage.getItem("aiAstrologyInput");
          const savedReportType = sessionStorage.getItem("aiAstrologyReportType");
          
          // Use state input if sessionStorage is empty (fallback)
          const inputData = savedInput ? JSON.parse(savedInput) : input;
          const reportTypeToUse = (savedReportType || reportType) as ReportType;
          
          if (!inputData || !reportTypeToUse) {
            console.error("[AUTO-RECOVERY] Missing input data or report type");
            setError("Missing input data. Please start over.");
            return;
          }
          
          // If we have session_id, verify payment and regenerate (works for both real and test sessions)
          if (urlSessionIdForRecovery) {
            console.log("[AUTO-RECOVERY] Verifying payment and regenerating report...");
            setLoading(true);
            setLoadingStage("generating");
            setLoadingStartTime(Date.now());
            setError(null);
            
            try {
              // Verify payment first (handles both real Stripe sessions and test sessions)
              // apiGet throws on error, so we catch and handle separately
              const verifyResponse = await apiGet<{
                ok: boolean;
                data?: {
                  paid: boolean;
                  paymentToken?: string;
                  reportType?: string;
                  paymentIntentId?: string;
                };
              }>(`/api/ai-astrology/verify-payment?session_id=${encodeURIComponent(urlSessionIdForRecovery)}`);
              
              console.log("[AUTO-RECOVERY] Payment verification result:", {
                ok: verifyResponse.ok,
                paid: verifyResponse.data?.paid,
                hasToken: !!verifyResponse.data?.paymentToken,
                sessionId: urlSessionIdForRecovery.startsWith("test_session_") ? "TEST_SESSION" : "REAL_SESSION",
                reportType: verifyResponse.data?.reportType
              });
              
              if (verifyResponse.ok && verifyResponse.data?.paid) {
                // Store payment data (test sessions may not have paymentToken, that's OK - generate-report handles test users)
                if (verifyResponse.data.paymentToken) {
                  sessionStorage.setItem("aiAstrologyPaymentToken", verifyResponse.data.paymentToken);
                }
                if (verifyResponse.data.paymentIntentId) {
                  sessionStorage.setItem("aiAstrologyPaymentIntentId", verifyResponse.data.paymentIntentId);
                }
                // Use reportType from verification if available
                const finalReportType = (verifyResponse.data.reportType || reportTypeToUse) as ReportType;
                sessionStorage.setItem("aiAstrologyPaymentVerified", "true");
                sessionStorage.setItem("aiAstrologyPaymentSessionId", urlSessionIdForRecovery);
                if (verifyResponse.data.reportType) {
                  sessionStorage.setItem("aiAstrologyReportType", verifyResponse.data.reportType);
                }
                setPaymentVerified(true);
                setInput(inputData);
                setReportType(finalReportType);
                
                // Regenerate report (works for both test users and real users)
                // generate-report API will detect test users and handle accordingly
                console.log("[AUTO-RECOVERY] Calling generateReport (session_id will be used for test user detection)...");
                await generateReport(inputData, finalReportType, urlSessionIdForRecovery, verifyResponse.data.paymentIntentId);
              } else {
                throw new Error("Payment verification failed - payment not confirmed. Please complete payment again.");
              }
            } catch (e: any) {
              console.error("[AUTO-RECOVERY] Payment verification or generation failed:", e);
              setError(e.message || "Failed to recover report. Please use the manual recovery button below.");
              setLoading(false);
              setLoadingStage(null);
              setLoadingStartTime(null);
              autoRecoveryTriggeredRef.current = false; // Allow retry
              hasAutoGeneratedRef.current = false; // Reset to allow manual retry
            }
          } else if (reportTypeToUse === "life-summary") {
            // Free report - just regenerate directly
            console.log("[AUTO-RECOVERY] Regenerating free report...");
            setLoading(true);
            setLoadingStage("generating"); // CRITICAL: Set to "generating" for free reports too
            setLoadingStartTime(Date.now());
            setElapsedTime(0); // Reset elapsed time
            setError(null);
            setInput(inputData);
            setReportType(reportTypeToUse);
            // CRITICAL: Reset progress steps for free reports
            setProgressSteps({
              birthChart: false,
              planetaryAnalysis: false,
              generatingInsights: false,
            });
            
            try {
              await generateReport(inputData, reportTypeToUse);
            } catch (e: any) {
              console.error("[AUTO-RECOVERY] Free report generation failed:", e);
              setError(e.message || "Failed to generate report. Please try again.");
              setLoading(false);
              setLoadingStage(null);
              setLoadingStartTime(null);
              setElapsedTime(0);
              autoRecoveryTriggeredRef.current = false; // Allow retry
              hasAutoGeneratedRef.current = false; // Reset to allow manual retry
            }
          } else {
            setError("Missing payment session. Please complete payment again.");
          }
        } catch (e: any) {
          console.error("[AUTO-RECOVERY] Recovery failed:", e);
          setError(e.message || "Failed to recover report. Please start over.");
          autoRecoveryTriggeredRef.current = false; // Allow retry
          hasAutoGeneratedRef.current = false; // Reset to allow manual retry
        }
        };
        
        // Trigger recovery
        triggerRecovery();
      }, 1000); // Wait 1 second to let main useEffect finish
      
      return () => clearTimeout(timer);
    }
    
    // Reset trigger flag if we get content (successful recovery)
    if (reportContent) {
      autoRecoveryTriggeredRef.current = false;
    }
  }, [hasSessionIdForRecovery, autoGenerateForRecovery, reportContent, urlSessionIdForRecovery, generateReport, input, reportType, loading, error, isFreeReportForRecovery]);

  // Update life-summary progress step dynamically (for pre-loading screen only)
  // Also add fallback to ensure auto-generation triggers if stuck
  useEffect(() => {
    const urlHasReportType = searchParams.get("reportType") !== null;
    const urlSessionId = searchParams.get("session_id");
    const urlReportId = searchParams.get("reportId");
    const autoGenerate = searchParams.get("auto_generate") === "true";
    const shouldWaitForProcess = loading || isGeneratingRef.current || urlHasReportType || urlSessionId || urlReportId || autoGenerate;
    const isWaitingForState = urlHasReportType && !input && !hasRedirectedRef.current && !loading;
    const isLifeSummaryStuck = reportType === "life-summary" && input && !loading && !reportContent && !isGeneratingRef.current && hasAutoGeneratedRef.current;
    
    let progressInterval: NodeJS.Timeout | null = null;
    let stuckTimeout: NodeJS.Timeout | null = null;
    
    // Only update progress steps for life-summary when on pre-loading screen (not main loading screen)
    if (reportType === "life-summary" && (shouldWaitForProcess || isWaitingForState) && !loading && !reportContent) {
      progressInterval = setInterval(() => {
        setLifeSummaryProgressStep(prev => (prev + 1) % 3); // Cycle through 0, 1, 2
      }, 4000); // Update every 4 seconds
    } else {
      // Reset progress step when not on pre-loading screen
      setLifeSummaryProgressStep(0);
    }
    
    // FALLBACK: If life-summary is stuck (has input but hasn't generated after a delay), reset hasAutoGeneratedRef and trigger generation
    // This handles cases where hasAutoGeneratedRef was set but generation failed silently or didn't start
    // CRITICAL FIX: Also check if hasAutoGeneratedRef is false but we should have generated (catches cases where auto-generation never triggered)
    const shouldHaveGenerated = reportType === "life-summary" && input && !loading && !reportContent && !isGeneratingRef.current;
    const isStuckWithGuard = shouldHaveGenerated && hasAutoGeneratedRef.current; // Guard was set but generation didn't happen
    const isStuckWithoutGuard = shouldHaveGenerated && !hasAutoGeneratedRef.current && !autoRecoveryTriggeredRef.current; // Guard was never set, auto-generation never triggered
    
    if (isStuckWithGuard || isStuckWithoutGuard) {
      const delay = isStuckWithGuard ? 2000 : 3000; // Wait longer if guard was never set (main useEffect might still be processing)
      stuckTimeout = setTimeout(() => {
        // Double-check we're still stuck before retrying
        const stillStuck = reportType === "life-summary" && input && !loading && !reportContent && !isGeneratingRef.current;
        if (stillStuck) {
          console.warn("[Life Summary] Detected stuck state after delay - resetting guards and triggering generation", {
            hadGuard: hasAutoGeneratedRef.current,
            recoveryTriggered: autoRecoveryTriggeredRef.current
          });
          hasAutoGeneratedRef.current = false; // Reset to allow retry
          autoRecoveryTriggeredRef.current = false; // Reset recovery flag too
          setLoading(true);
          setLoadingStage("generating");
          setLoadingStartTime(Date.now());
          setElapsedTime(0);
          setProgressSteps({
            birthChart: false,
            planetaryAnalysis: false,
            generatingInsights: false,
          });
          // Small delay to ensure state is set
          setTimeout(() => {
            if (input && reportType === "life-summary" && !isGeneratingRef.current) {
              console.log("[Life Summary] Triggering generation from stuck state recovery");
              generateReport(input, "life-summary");
            }
          }, 300);
        }
      }, delay);
    }
    
    // Cleanup function
    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (stuckTimeout) clearTimeout(stuckTimeout);
    };
  }, [reportType, input, loading, reportContent, searchParams, generateReport]);

  // Helper functions for loading screen (accessible in both loading and content blocks)
  const urlSessionIdForLoading = searchParams.get("session_id");
  const urlReportIdForLoading = searchParams.get("reportId");
  const currentReportIdForLoading = reportContent?.reportId || urlReportIdForLoading;
  const hasSessionIdForLoading = !!urlSessionIdForLoading;
  
  // Get report link for copying
  const reportLinkForLoading = typeof window !== "undefined" && currentReportIdForLoading 
    ? `${window.location.origin}/ai-astrology/preview?reportId=${currentReportIdForLoading}`
    : typeof window !== "undefined" && urlSessionIdForLoading
    ? `${window.location.origin}/ai-astrology/preview?session_id=${urlSessionIdForLoading}`
    : typeof window !== "undefined" ? window.location.href : "";
  
  // Helper to retry loading by reportId or sessionId
  const handleRetryLoading = useCallback(async () => {
    if (!currentReportIdForLoading && !urlSessionIdForLoading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Try to load from sessionStorage first, then localStorage (for reportId)
      if (currentReportIdForLoading) {
        let storedReport = sessionStorage.getItem(`aiAstrologyReport_${currentReportIdForLoading}`);
        if (!storedReport) {
          storedReport = localStorage.getItem(`aiAstrologyReport_${currentReportIdForLoading}`);
        }
        if (storedReport) {
          const parsed = JSON.parse(storedReport);
          setReportContent(parsed.content);
          setInput(parsed.input);
          setReportType(parsed.reportType);
          setLoading(false);
          return;
        }
      }
      
      // For bundles with sessionId, trigger auto-recovery by refreshing
      if (urlSessionIdForLoading && bundleType && bundleReports.length > 0) {
        window.location.href = `/ai-astrology/preview?session_id=${urlSessionIdForLoading}&auto_generate=true`;
        return;
      }
      
      // If not in sessionStorage, try to fetch from API or show error
      throw new Error("Report not found in cache. Please regenerate your report.");
    } catch (e: any) {
      setError(e.message || "Failed to load report. Please try regenerating.");
      setLoading(false);
    }
  }, [currentReportIdForLoading, urlSessionIdForLoading, bundleType, bundleReports.length]);
  
  // Helper to copy report link
  const handleCopyReportLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(reportLinkForLoading);
      setEmailCopySuccess(true);
      setTimeout(() => setEmailCopySuccess(false), 2000);
    } catch (e) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = reportLinkForLoading;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setEmailCopySuccess(true);
      setTimeout(() => setEmailCopySuccess(false), 2000);
    }
  }, [reportLinkForLoading]);

  if (loading) {
    const isBundleLoading = bundleType && bundleReports.length > 0;
    const isVerifying = loadingStage === "verifying";
    const isPaidReport = reportType !== "life-summary";
    const urlSessionId = urlSessionIdForLoading;
    const urlReportId = urlReportIdForLoading;
    const currentReportId = currentReportIdForLoading;
    const hasSessionId = hasSessionIdForLoading;
    
    // Calculate time remaining or elapsed (optimized estimates for faster generation)
    // Free reports: ~60 seconds, Regular paid: ~60 seconds, Complex: ~75-90 seconds
    const estimatedTime = loadingStage === "verifying" 
      ? 10 
      : (reportType === "full-life" || reportType === "major-life-phase") 
      ? 90  // Complex reports: up to 90 seconds (comprehensive analysis takes longer)
      : reportType === "life-summary"
      ? 65  // Free reports: ~65 seconds
      : 60; // Regular paid reports: ~60 seconds
    const timeRemaining = Math.max(0, estimatedTime - elapsedTime);
    const isTakingLonger = elapsedTime > estimatedTime;
    
    return (
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 flex items-center justify-center min-h-[60vh]">
        {/* Legal Banner - Reduced Contrast During Loading */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 max-w-2xl w-full mx-4 px-4">
          <div className="bg-orange-50/60 border border-orange-200/60 rounded-lg p-3 flex flex-wrap items-center justify-center gap-4 text-xs text-orange-700/70">
            <span>Educational guidance only</span>
            <span className="hidden sm:inline">•</span>
            <span>Fully automated</span>
            <span className="hidden sm:inline">•</span>
            <span>No live support</span>
          </div>
        </div>
        <Card className="max-w-2xl w-full mx-4 mt-16">
          <CardContent className="p-12 text-center">
            <div className="animate-spin text-6xl mb-6">🌙</div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900">
              {isVerifying 
                ? "Verifying Your Payment..." 
                : isBundleLoading 
                ? "Generating Your Bundle Reports..." 
                : `Generating Your ${getReportName(reportType || "life-summary")}...`}
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              {isVerifying
                ? "One quick moment while we confirm everything is ready"
                : isBundleLoading
                ? "Creating comprehensive insights across multiple life areas"
                : "Our AI is analyzing your birth chart and generating personalized insights"}
            </p>
            
            {/* Elapsed time indicator - Always show for ALL reports */}
            <div className="mb-4">
              <p className="text-sm text-slate-500">
                {isTakingLonger ? (
                  <span className="text-amber-600 font-semibold">
                    ⏱️ Taking longer than expected ({elapsedTime}s elapsed) - Still processing...
                  </span>
                ) : (
                  <span className="text-slate-600">
                    ⏱️ Elapsed: {elapsedTime}s {timeRemaining > 0 && `• Est. remaining: ${timeRemaining}s`}
                  </span>
                )}
              </p>
              {/* Note for complex reports */}
              {(reportType === "full-life" || reportType === "major-life-phase") && !isTakingLonger && (
                <p className="text-xs text-slate-500 mt-1">
                  💡 Complex reports take longer to generate comprehensive insights (typically 60-90 seconds)
                </p>
              )}
            </div>
            
            {/* Payment reassurance for paid reports only - Free reports don't show this */}
            {isPaidReport && !isVerifying && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-left">
                <div className="flex items-start gap-2">
                  <span className="text-lg">💳</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-green-800 mb-1">
                      Payment Verified & Protected
                    </p>
                    <p className="text-xs text-green-700">
                      Your payment is confirmed. If report generation fails, you will <strong>automatically receive a refund</strong> - no action needed.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {isVerifying ? (
              <div className="space-y-4">
                <p className="text-slate-600 mb-4">
                  We&apos;re confirming your payment was successful. This usually takes just a few seconds and happens automatically.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="text-xl">💳</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-800 mb-1">
                        Payment Verification in Progress
                      </p>
                      <p className="text-xs text-blue-700">
                        Please wait while we verify your payment. This usually takes just 2-5 seconds. Your report will start generating automatically once verification is complete.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : isBundleLoading && bundleProgress ? (
              // Enhanced bundle loading screen - matching marriage report UX
              <div className="space-y-4">
                {/* Progress Stepper - Same style as single reports */}
                <div className="mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-purple-600 animate-pulse"></div>
                      <div className="w-12 h-0.5 bg-purple-300"></div>
                      <div className={`w-3 h-3 rounded-full ${bundleProgress.current > 0 ? 'bg-purple-600' : 'bg-purple-300'}`}></div>
                      <div className={`w-12 h-0.5 ${bundleProgress.current > 0 ? 'bg-purple-300' : 'bg-slate-300'}`}></div>
                      <div className={`w-3 h-3 rounded-full ${bundleProgress.current >= bundleProgress.total ? 'bg-purple-600' : 'bg-slate-300'}`}></div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-center text-slate-600 mb-4">
                    This usually completes within 1-2 minutes for {bundleProgress.total} comprehensive reports.
                    {elapsedTime >= 120 && (
                      <span className="block mt-2 text-amber-700 font-medium">
                        If this screen stays for more than 2 minutes, please refresh this page. Your reports will not be lost.
                      </span>
                    )}
                    {!elapsedTime || elapsedTime < 120 ? (
                      <span className="block mt-2">If it takes longer, your reports are still being prepared safely.</span>
                    ) : null}
                  </p>
                  
                  {/* Bundle Progress Status Indicators */}
                  <div className="space-y-2 mb-6 text-left bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className={`flex items-center gap-2 text-sm ${bundleProgress.current > 0 ? 'text-green-700' : 'text-slate-400'}`}>
                      {bundleProgress.current > 0 ? '✓' : '⏳'} 
                      <span className={bundleProgress.current > 0 ? 'font-medium' : ''}>
                        Analyzing your birth chart data
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${bundleProgress.current >= bundleProgress.total ? 'text-green-700' : bundleProgress.current > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {bundleProgress.current >= bundleProgress.total ? '✓' : bundleProgress.current > 0 ? '⏳' : '○'} 
                      <span className={bundleProgress.current > 0 ? 'font-medium' : ''}>
                        Generating personalized insights ({bundleProgress.current} of {bundleProgress.total} reports completed)
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${bundleProgress.current >= bundleProgress.total ? 'text-green-700' : 'text-slate-400'}`}>
                      {bundleProgress.current >= bundleProgress.total ? '✓' : '⏳'} 
                      <span className={bundleProgress.current >= bundleProgress.total ? 'font-medium' : ''}>
                        Preparing your complete bundle package
                      </span>
                    </div>
                    
                    {/* Current Report Status */}
                    {bundleProgress.currentReport && bundleProgress.current > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-300">
                        <p className="text-xs text-purple-600 font-medium">
                          ✓ Latest completed: {bundleProgress.currentReport}
                        </p>
                      </div>
                    )}
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="bg-slate-100 rounded-full h-2.5 mb-2">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${Math.min((bundleProgress.current / bundleProgress.total) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-center text-purple-600 font-medium">
                        {bundleProgress.current} of {bundleProgress.total} reports completed ({Math.round((bundleProgress.current / bundleProgress.total) * 100)}%)
                      </p>
                    </div>
                  </div>
                  
                  {/* Enhanced Value Reinforcement During Wait - Bundle Benefits */}
                  <div className="mb-6 text-left bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 rounded-lg p-5 border-2 border-purple-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">✨</span>
                      <p className="text-sm font-bold text-purple-900">Your Bundle Package</p>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5">✓</span>
                        <span><strong>{bundleProgress.total} comprehensive AI-generated reports</strong> covering multiple life areas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5">✓</span>
                        <span>Personalized insights tailored to your unique birth chart</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5">✓</span>
                        <span>Complete downloadable PDF bundle package</span>
                      </li>
                      {bundleType && (
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600 mt-0.5">✓</span>
                          <span>Special bundle pricing - save money with this package</span>
                        </li>
                      )}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <p className="text-xs text-slate-600 italic">
                        💡 Each report is being individually crafted based on your astrological data
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Use the improved loading screen for all single reports (unified UX)
              <div className="space-y-4">
                {/* Progress Stepper - Same as new loading screen */}
                <div className="mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-purple-600 animate-pulse"></div>
                      <div className="w-12 h-0.5 bg-purple-300"></div>
                      <div className="w-3 h-3 rounded-full bg-purple-300"></div>
                      <div className="w-12 h-0.5 bg-slate-300"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                    </div>
                  </div>
                  
                  <div className="mb-4 text-center">
                    <p className="text-sm text-slate-600 mb-2">
                      {elapsedTime < 30 
                        ? "✨ Our AI is crafting your personalized insights..."
                        : elapsedTime < 60
                        ? "📊 Analyzing planetary positions and calculating insights..."
                        : elapsedTime < 90
                        ? "🎯 Fine-tuning predictions and recommendations..."
                        : "⏳ Finalizing your comprehensive report..."}
                    </p>
                    <p className="text-xs text-slate-500">
                      Typically completes in {
                        reportType === "life-summary" 
                          ? "60-70 seconds" 
                          : reportType === "full-life" || reportType === "major-life-phase"
                          ? "75-90 seconds"
                          : "60-75 seconds"
                      } • Elapsed: {elapsedTime}s
                    </p>
                    {elapsedTime >= 90 && (
                      <p className="text-xs text-amber-700 font-medium mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
                        💡 Taking longer than usual? Your report is still being prepared. If this continues beyond 2 minutes, you can refresh - your progress will be saved.
                      </p>
                    )}
                  </div>
                  
                  {/* Enhanced Progress Status Indicators */}
                  <div className="space-y-3 mb-6 text-left bg-gradient-to-br from-slate-50 to-purple-50 rounded-lg p-5 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wide">Generation Progress</p>
                    <div className={`flex items-center gap-3 text-sm transition-all duration-300 ${progressSteps.birthChart ? 'text-green-700' : 'text-slate-500'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progressSteps.birthChart ? 'bg-green-100 border-2 border-green-500' : 'bg-slate-100 border-2 border-slate-300'}`}>
                        {progressSteps.birthChart ? '✓' : elapsedTime >= 5 ? '⏳' : '○'}
                      </div>
                      <div className="flex-1">
                        <span className={progressSteps.birthChart ? 'font-semibold' : ''}>Birth Chart Calculation</span>
                        {progressSteps.birthChart && <span className="text-xs text-green-600 ml-2">✓ Complete</span>}
                      </div>
                    </div>
                    <div className={`flex items-center gap-3 text-sm transition-all duration-300 ${progressSteps.planetaryAnalysis ? 'text-green-700' : 'text-slate-500'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progressSteps.planetaryAnalysis ? 'bg-green-100 border-2 border-green-500' : progressSteps.birthChart ? 'bg-blue-100 border-2 border-blue-400 animate-pulse' : 'bg-slate-100 border-2 border-slate-300'}`}>
                        {progressSteps.planetaryAnalysis ? '✓' : progressSteps.birthChart && elapsedTime >= 15 ? '⏳' : '○'}
                      </div>
                      <div className="flex-1">
                        <span className={progressSteps.planetaryAnalysis ? 'font-semibold' : ''}>Planetary Position Analysis</span>
                        {progressSteps.planetaryAnalysis && <span className="text-xs text-green-600 ml-2">✓ Complete</span>}
                        {progressSteps.birthChart && !progressSteps.planetaryAnalysis && <span className="text-xs text-blue-600 ml-2">In progress...</span>}
                      </div>
                    </div>
                    <div className={`flex items-center gap-3 text-sm transition-all duration-300 ${progressSteps.generatingInsights ? 'text-green-700' : 'text-slate-500'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progressSteps.generatingInsights ? 'bg-green-100 border-2 border-green-500' : progressSteps.planetaryAnalysis ? 'bg-purple-100 border-2 border-purple-400 animate-pulse' : 'bg-slate-100 border-2 border-slate-300'}`}>
                        {progressSteps.generatingInsights ? '✓' : progressSteps.planetaryAnalysis && elapsedTime >= 25 ? '⏳' : '○'}
                      </div>
                      <div className="flex-1">
                        <span className={progressSteps.generatingInsights ? 'font-semibold' : ''}>AI-Powered Insight Generation</span>
                        {progressSteps.generatingInsights && <span className="text-xs text-green-600 ml-2">✓ Complete</span>}
                        {progressSteps.planetaryAnalysis && !progressSteps.generatingInsights && <span className="text-xs text-purple-600 ml-2">Crafting your insights...</span>}
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Value Reinforcement During Wait */}
                  <div className="mb-6 text-left bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 rounded-lg p-5 border-2 border-purple-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">✨</span>
                      <p className="text-sm font-bold text-purple-900">What You&apos;re Getting</p>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700">
                      {getReportBenefits(reportType).map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-purple-600 mt-0.5">✓</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <p className="text-xs text-slate-600 italic">
                        💡 Your report is being tailored specifically to your birth details and planetary positions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Action Buttons Footer - Same for bundles and single reports */}
            <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
              {/* Copy Report Link Button (if session ID available for bundles or reportId for single reports) */}
              {(currentReportId || urlSessionId) && (
                <div>
                  <Button
                    onClick={handleCopyReportLink}
                    className="w-full cosmic-button-secondary"
                    disabled={loading}
                  >
                    {emailCopySuccess ? "✓ Link Copied!" : "📋 Copy Report Link"}
                  </Button>
                </div>
              )}
              
              {/* Primary Action: Retry Loading (Safe - No Regeneration) - Works for both bundles and single reports */}
              {(currentReportId || (isBundleLoading && urlSessionId)) ? (
                <div className="space-y-3">
                  <Button
                    onClick={handleRetryLoading}
                    disabled={loading}
                    className="w-full cosmic-button-secondary"
                  >
                    🔄 Retry Loading {isBundleLoading ? "Bundle" : "Report"}
                  </Button>
                  
                  {/* Secondary Action: Start New (Small Link) - Preserve report type if available */}
                  <div className="text-center">
                    <Link 
                      href={reportType && reportType !== "life-summary" 
                        ? `/ai-astrology/input?reportType=${reportType}` 
                        : "/ai-astrology/input"} 
                      className="text-sm text-slate-600 hover:text-slate-800 underline"
                    >
                      Start a new {isBundleLoading ? "bundle" : reportType && reportType !== "life-summary" ? getReportName(reportType).toLowerCase() : "report"} instead
                    </Link>
                  </div>
                </div>
                ) : (
                <div className="space-y-3">
                  <Link 
                    href={reportType && reportType !== "life-summary" 
                      ? `/ai-astrology/input?reportType=${reportType}` 
                      : "/ai-astrology/input"} 
                    className="block"
                  >
                    <Button 
                      className="w-full cosmic-button-secondary"
                      onClick={(e) => {
                        if (loading) {
                          e.preventDefault();
                          if (window.confirm("Report generation is in progress. Are you sure you want to cancel? Your payment will be automatically refunded if generation hasn't completed.")) {
                            setLoading(false);
                            setLoadingStage(null);
                            setLoadingStartTime(null);
                            setElapsedTime(0);
                            isGeneratingRef.current = false;
                            const url = reportType && reportType !== "life-summary" 
                              ? `/ai-astrology/input?reportType=${reportType}` 
                              : "/ai-astrology/input";
                            window.location.href = url;
                          }
                        }
                      }}
                    >
                      Start Over {loading ? "(Cancel Generation)" : ""}
                    </Button>
                  </Link>
                </div>
              )}
              
              {/* Report ID / Session ID Footer */}
              {(currentReportId || (isBundleLoading && urlSessionId)) && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-center text-slate-500">
                    <strong className="text-slate-700">
                      {isBundleLoading ? "Bundle Session ID:" : "Report ID:"}
                    </strong>{" "}
                    <span className="font-mono">{currentReportId || urlSessionId}</span>
                  </p>
                </div>
              )}
              
              {/* Warning about not closing tab (only if using session storage) */}
              {hasSessionId && !currentReportId && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">⚠️</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-amber-800 mb-1">
                        Do not close this tab
                      </p>
                      <p className="text-xs text-amber-700">
                        Your {isBundleLoading ? "bundle is" : "report is"} being loaded from your session. If you close this tab, you may need to regenerate.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    // Check if error is payment-related and we might be able to recover
    const isPaymentError = error.toLowerCase().includes("payment") || 
                          error.toLowerCase().includes("permission") ||
                          error.toLowerCase().includes("verification");
    const urlSessionId = searchParams.get("session_id");
    const canRecover = isPaymentError && urlSessionId;
    
    return (
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="cosmic-card border-red-500/30">
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-4 text-red-700">Error Generating Report</h2>
              
              {/* Check if this is a paid report failure - show refund information */}
              {error && (error.toLowerCase().includes("payment") || error.toLowerCase().includes("generation") || error.toLowerCase().includes("timeout") || error.toLowerCase().includes("unable")) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">✅</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-800 mb-2">
                        Automatic Refund Protection
                      </p>
                      <p className="text-sm text-green-700 mb-2">
                        Your payment has been automatically cancelled and you will <strong>NOT be charged</strong> for this failed report generation.
                      </p>
                      <div className="mt-3 space-y-1 text-xs text-green-600">
                        <p>• <strong>Authorization Released:</strong> Any payment authorization has been automatically released</p>
                        <p>• <strong>No Charge:</strong> You will not see any charge on your card</p>
                        <p>• <strong>Timeline:</strong> If any amount was authorized, it will be released within 1-3 business days</p>
                        <p>• <strong>No Action Required:</strong> The refund process is automatic - you don&apos;t need to do anything</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-slate-600 mb-6">{error}</p>
              
              {canRecover && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-blue-800 font-semibold mb-2">💡 Recovery Option Available:</p>
                  <p className="text-sm text-blue-700 mb-3">
                    We detected a payment verification issue. If you&apos;ve already completed payment, 
                    you can recover your access by clicking the button below.
                  </p>
                  <Button 
                    onClick={async () => {
                      setLoading(true);
                      setError(null);
                      try {
                        // Attempt to verify payment and regenerate token
                        const verifyResponse = await apiGet<{
                          ok: boolean;
                          data?: {
                            paid: boolean;
                            paymentToken?: string;
                            reportType?: string;
                          };
                        }>(`/api/ai-astrology/verify-payment?session_id=${encodeURIComponent(urlSessionId!)}`);
                        
                        if (verifyResponse.ok && verifyResponse.data?.paid && input) {
                          try {
                            if (verifyResponse.data.paymentToken) {
                              sessionStorage.setItem("aiAstrologyPaymentToken", verifyResponse.data.paymentToken);
                            }
                            sessionStorage.setItem("aiAstrologyPaymentVerified", "true");
                            sessionStorage.setItem("aiAstrologyPaymentSessionId", urlSessionId!);
                            if (verifyResponse.data.reportType) {
                              sessionStorage.setItem("aiAstrologyReportType", verifyResponse.data.reportType);
                            }
                            
                            // Retry report generation
                            const reportTypeToGenerate = verifyResponse.data.reportType || reportType || "life-summary";
                            await generateReport(input, reportTypeToGenerate as ReportType);
                          } catch (e) {
                            console.error("Failed to store token:", e);
                            setError("Failed to recover payment verification. Please contact support with your payment receipt.");
                          }
                        } else {
                          setError("Payment verification failed. Please contact support with your payment receipt if you've already paid.");
                        }
                      } catch (e: any) {
                        console.error("Recovery failed:", e);
                        setError(`Recovery failed: ${e.message || "Please contact support with your payment receipt."}`);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-3"
                  >
                    🔄 Recover My Report Access
                  </Button>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => {
                  setError(null);
                  if (input && reportType) {
                    generateReport(input, reportType);
                  } else {
                    window.location.reload();
                  }
                }}>
                  Try Again
                </Button>
                {canRecover && (
                  <Link href={`/ai-astrology/payment/success?session_id=${encodeURIComponent(urlSessionId!)}`}>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Return to Payment Success
                    </Button>
                  </Link>
                )}
                <Link 
                  href={reportType && reportType !== "life-summary" 
                    ? `/ai-astrology/input?reportType=${reportType}` 
                    : "/ai-astrology/input"}
                >
                  <Button className="cosmic-button-secondary">Start Over</Button>
                </Link>
              </div>
              
              {/* Always show refund information for any error */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <p className="text-sm font-semibold text-blue-800 mb-2">💰 Payment Protection Guarantee</p>
                  <p className="text-xs text-blue-700 mb-2">
                    <strong>Your payment is protected:</strong> If report generation fails for any reason, your payment will be automatically cancelled or refunded.
                  </p>
                  <div className="text-xs text-blue-600 space-y-1 mt-2">
                    <p>• Payment authorization will be automatically released</p>
                    <p>• No charge will be made for failed report generation</p>
                    <p>• If already charged, full refund will be processed within 1-3 business days</p>
                    <p>• Refund will go back to your original payment method</p>
                  </div>
                </div>
                
                {isPaymentError && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-500 mb-2">Need Help?</p>
                    <p className="text-xs text-slate-600">
                      If you&apos;ve completed payment but still see this error, please contact support with your payment receipt. Your payment will be automatically refunded.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show payment prompt for paid reports
  if (needsPayment && !loading) {
    // CRITICAL FIX: Check if this is a bundle FIRST before validating reportType
    // For bundles, reportType might be defaulted to "life-summary" but we should use bundleType/bundleReports
    const isBundle = bundleType && bundleReports.length > 0;
    
    // Declare price variable outside the conditional block for use later
    let price: typeof REPORT_PRICES[keyof typeof REPORT_PRICES] | undefined;
    
    if (!isBundle) {
      // Only validate reportType for non-bundle reports
      if (!reportType) {
        // Should not happen, but handle gracefully
        return (
          <div className="cosmic-bg py-8">
            <div className="container mx-auto px-4 max-w-2xl">
              <Card className="cosmic-card">
                <CardContent className="p-8 text-center">
                  <div className="text-5xl mb-4">⚠️</div>
                  <h2 className="text-2xl font-bold mb-4 text-red-700">Invalid Report Type</h2>
                  <p className="text-slate-600 mb-6">Please select a valid report type.</p>
                  <Link href="/ai-astrology/input">
                    <Button className="cosmic-button-secondary">Choose Report Type</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      }
      
      price = REPORT_PRICES[reportType as keyof typeof REPORT_PRICES];
      if (!price) {
        // Invalid report type - should not happen but handle gracefully
        return (
          <div className="cosmic-bg py-8">
            <div className="container mx-auto px-4 max-w-2xl">
              <Card className="cosmic-card">
                <CardContent className="p-8 text-center">
                  <div className="text-5xl mb-4">⚠️</div>
                  <h2 className="text-2xl font-bold mb-4 text-red-700">Invalid Report Type</h2>
                  <p className="text-slate-600 mb-6">The selected report type is not available.</p>
                  <Link href="/ai-astrology/input">
                    <Button className="cosmic-button-secondary">Choose Report Type</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      }
    }
    
    const bundlePrice = isBundle 
      ? (bundleType === "life-decision-pack" 
          ? BUNDLE_PRICES["life-decision-pack"] 
          : bundleType === "all-3" 
          ? BUNDLE_PRICES["all-3"] 
          : BUNDLE_PRICES["any-2"]) 
      : null;

    return (
      <div className="cosmic-bg py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="cosmic-card">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold mb-4 text-slate-800">
                {isBundle 
                  ? `Unlock Your ${bundleType === "life-decision-pack" 
                      ? "Complete Life Decision Pack" 
                      : bundleType === "all-3" 
                      ? "All 3 Reports" 
                      : "Any 2 Reports"} Bundle`
                  : `Unlock Your ${getReportName(reportType)}`}
              </h2>
              <p className="text-slate-600 mb-6">
                {isBundle
                  ? `Get ${bundleReports.length} comprehensive reports for just AU$${((bundlePrice?.amount || 0) / 100).toFixed(2)} (includes GST).`
                  : `Get detailed, AI-powered insights for just AU$${(price?.amount || 0) / 100} (includes GST).`}
              </p>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl mb-6 border border-amber-200">
                <div className="text-3xl font-bold text-amber-700 mb-2">
                  AU${isBundle ? ((bundlePrice?.amount || 0) / 100).toFixed(2) : ((price?.amount || 0) / 100).toFixed(2)}
                  <span className="text-lg font-normal text-amber-600 ml-2">(incl. GST)</span>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  {isBundle ? bundlePrice?.description : price?.description}
                </p>
                
                {/* Bundle Reports List */}
                {isBundle && bundleReports.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <p className="text-sm font-semibold text-amber-800 mb-3">Your Bundle Includes:</p>
                    <div className="space-y-2 text-left">
                      {bundleReports.map((reportTypeInBundle, idx) => (
                        <div key={reportTypeInBundle} className="flex items-start gap-2 p-2 bg-white/50 rounded">
                          <span className="text-amber-700 font-bold mt-0.5">{idx + 1}.</span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800">{getReportName(reportTypeInBundle)}</p>
                            <p className="text-xs text-slate-600">{REPORT_PRICES[reportTypeInBundle as keyof typeof REPORT_PRICES]?.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* What You'll Get */}
                <div className={`mt-4 pt-4 border-t border-amber-200 ${isBundle ? '' : ''}`}>
                  <p className="text-sm font-semibold text-amber-800 mb-2">What you&apos;ll get:</p>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>• {isBundle ? `${bundleReports.length} detailed AI-generated reports` : 'Detailed AI-generated analysis'}</li>
                    <li>• Personalized insights based on your birth chart</li>
                    <li>• {isBundle ? `${bundleReports.length} downloadable PDF reports` : 'Downloadable PDF report'}</li>
                    <li>• Instant access after payment</li>
                    {isBundle && bundlePrice && (
                      <li>• Save AU${(bundlePrice.savings / 100).toFixed(2)} compared to buying individually</li>
                    )}
                  </ul>
                </div>
              </div>
              {/* Refund Policy Acknowledgment */}
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={refundAcknowledged}
                    onChange={(e) => setRefundAcknowledged(e.target.checked)}
                    className="mt-1 w-5 h-5 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                    required
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-slate-800">
                      I understand this is a digital product with no change-of-mind refunds
                    </span>
                    <p className="text-xs text-slate-600 mt-1">
                      Digital reports are non-refundable for change of mind. This does not limit your rights under Australian Consumer Law.
                    </p>
                  </div>
                </label>
              </div>

              <div className="mb-4 text-center">
                <Link href="/ai-astrology/faq" className="text-sm text-purple-600 hover:text-purple-700 underline">
                  Read FAQs before buying
                </Link>
              </div>
              <Button
                onClick={handlePurchase}
                disabled={loading || !refundAcknowledged}
                className="w-full cosmic-button py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading 
                  ? "Processing..." 
                  : isBundle 
                    ? `Purchase ${bundleType === "life-decision-pack" 
                        ? "Complete Life Decision Pack" 
                        : bundleType === "all-3" 
                        ? "All 3 Reports" 
                        : "Any 2 Reports"} Bundle →`
                    : `Purchase ${getReportName(reportType)} →`}
              </Button>
              <Link href="/ai-astrology/input?reportType=life-summary">
                <Button className="cosmic-button-secondary w-full mt-4">
                  Get Free Life Summary Instead
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // CRITICAL FIX: Unified check for when we need to wait vs redirect
  // Never redirect if:
  // 1. Currently loading or generating
  // 2. Have reportType in URL (coming from input page) - wait for useEffect
  // 3. Have session_id or reportId (indicates ongoing process)
  // 4. Already redirected
  const urlHasReportType = searchParams.get("reportType") !== null;
  const urlSessionId = searchParams.get("session_id");
  const urlReportId = searchParams.get("reportId");
  const autoGenerate = searchParams.get("auto_generate") === "true";
  
  // Determine if we should wait (loading, generating, or have URL params indicating process)
  const shouldWaitForProcess = loading || isGeneratingRef.current || urlHasReportType || urlSessionId || urlReportId || autoGenerate;
  
  // Determine if we're waiting for state to be set (have URL params but no input yet)
  const isWaitingForState = urlHasReportType && !input && !hasRedirectedRef.current && !loading;
  
  if (!reportContent || !input) {
    // CRITICAL: If we're in loading state OR generating, ALWAYS show loading screen
    // Do NOT redirect - the loading screen handles the generation process
    if (loading || isGeneratingRef.current) {
      return null; // Main loading screen will handle this (lines 1220+)
    }
    
    // CRITICAL: If we have any URL params indicating a process (reportType, session_id, reportId),
    // OR if we're waiting for state, show loading and wait
    // This prevents redirects during the critical setup phase
    if (shouldWaitForProcess || isWaitingForState) {
      // Show loading state while waiting for useEffect or recovery to process
      const reportName = reportType 
        ? getReportName(reportType).replace(" Report", "")
        : "Your Report";
      
      // Enhanced loading screen for life-summary only (as per ChatGPT feedback)
      const isLifeSummary = reportType === "life-summary";
      
      // Dynamic progress steps for life-summary (uses state that updates every 4 seconds)
      const getLifeSummaryProgressStep = (step: number) => {
        switch (step) {
          case 0:
            return { icon: "✓", text: "Birth data validated", color: "text-green-600" };
          case 1:
            return { icon: "✓", text: "Life themes identified", color: "text-green-600" };
          case 2:
            return { icon: "⏳", text: "Generating personalized insights", color: "text-purple-600" };
          default:
            return { icon: "⏳", text: "Generating personalized insights", color: "text-purple-600" };
        }
      };
      
      const progressStep = isLifeSummary ? getLifeSummaryProgressStep(lifeSummaryProgressStep) : null;
      
      return (
        <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-2xl w-full mx-4">
            <CardContent className="p-12 text-center">
              <div className="animate-spin text-6xl mb-6">🌙</div>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">
                {urlHasReportType 
                  ? `Preparing ${reportName}...` 
                  : "Initializing Report Generation..."}
              </h2>
              {isLifeSummary ? (
                <>
                  {/* Enhanced copy for life-summary with time context and anti-refresh protection */}
                  <p className="text-slate-600 mb-4">
                    Most life summaries are ready in 10–20 seconds.<br />
                    Your report is being prepared securely — please don&apos;t refresh.
                  </p>
                  
                  {/* Dynamic progress steps for life-summary */}
                  <div className="mt-6 mb-6 space-y-3 text-left bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className={`flex items-center gap-2 text-sm ${progressStep?.color || 'text-slate-600'}`}>
                      <span className="font-bold">{progressStep?.icon || '⏳'}</span>
                      <span className={progressStep?.icon === '✓' ? 'font-medium' : ''}>{progressStep?.text || 'Preparing your report...'}</span>
                    </div>
                  </div>
                  
                  {/* Value reinforcement for life-summary */}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-700 mb-3">You&apos;ll receive:</p>
                    <div className="space-y-2 text-left bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                      <div className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-amber-600 font-bold">✓</span>
                        <span>A personalized life overview</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-amber-600 font-bold">✓</span>
                        <span>Key strengths & focus areas</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-amber-600 font-bold">✓</span>
                        <span>Clear, practical guidance (not predictions)</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Original copy for other report types (unchanged) */}
                  <p className="text-slate-600 mb-4">
                    {urlHasReportType 
                      ? `We're setting up your personalized ${reportName.toLowerCase()} report. This will only take a moment...` 
                      : "We're preparing everything needed to generate your personalized astrology report."}
                  </p>
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span>Almost ready...</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }
    
    // CRITICAL: Only redirect if ALL of the following are true:
    // 1. Not loading or generating
    // 2. No reportType in URL (didn't come from input page)
    // 3. No session_id or reportId (no ongoing process)
    // 4. Haven't redirected already
    // 5. Not already on input page
    // This ensures we ONLY redirect when truly necessary (user navigated directly without context)
    if (!hasRedirectedRef.current && !loading && !isGeneratingRef.current && !urlHasReportType && !urlSessionId && !urlReportId) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      if (!currentPath.includes("/input")) {
        hasRedirectedRef.current = true;
        // Preserve reportType from state if available
        const reportTypeForRedirect = reportType && reportType !== "life-summary" ? reportType : null;
        const redirectUrl = reportTypeForRedirect
          ? `/ai-astrology/input?reportType=${encodeURIComponent(reportTypeForRedirect)}` 
          : "/ai-astrology/input";
        console.log("[Preview] Redirecting to input page (no context found):", redirectUrl);
        setTimeout(() => {
          router.push(redirectUrl);
        }, 100);
      }
    }
    
    // Show loading state while redirecting (prevents flash of content)
    return (
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-2xl w-full mx-4">
          <CardContent className="p-12 text-center">
            <div className="animate-spin text-6xl mb-6">🌙</div>
            <h2 className="text-2xl font-bold mb-4">Redirecting...</h2>
            <p className="text-slate-600">Please wait while we redirect you to the input page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract report content rendering into a reusable function
  const renderSingleReportContent = (content: ReportContent | null, type: ReportType) => {
    if (!content) return null;

    const sections = content.sections || [];
    const isPaid = type !== "life-summary";
    const shouldGateContent = !isPaid && sections.length > 0;
    // Show 35% of content (what + why), then gate the rest (when + how long + specific windows)
    const gateAfterSection = shouldGateContent ? Math.max(1, Math.floor(sections.length * 0.35)) : sections.length;
    const visibleSections = shouldGateContent 
      ? sections.slice(0, gateAfterSection).filter(s => s && s.title) 
      : sections.filter(s => s && s.title);
    const gatedSections = shouldGateContent 
      ? sections.slice(gateAfterSection).filter(s => s && s.title) 
      : [];

    return (
      <>
                {/* Executive Summary (for Full Life Report) */}
                {type === "full-life" && content?.executiveSummary && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-purple-300 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-3xl">📋</div>
                      <h2 className="text-2xl font-bold text-purple-900">Your Key Life Insights (Summary)</h2>
                    </div>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">{content?.executiveSummary}</p>
                    </div>
                  </div>
                )}

                {/* Enhanced Summary for Marriage Timing Report */}
                {type === "marriage-timing" && content?.summary && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 rounded-xl border-2 border-pink-300 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-3xl">💑</div>
                      <h2 className="text-2xl font-bold text-pink-900">Marriage Timing Summary</h2>
                    </div>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">{content.summary}</p>
                    </div>
                    {/* Extract and display timing strength if mentioned in summary */}
                    {content?.summary && content.summary.toLowerCase().includes("timing strength") && (
                      <div className="mt-4 pt-4 border-t border-pink-200">
                        <p className="text-sm font-semibold text-pink-800">
                          {content?.summary && (content.summary.match(/timing strength:.*?(\d+\/10|strong|moderate)/i)?.[0] || 
                           content.summary.match(/confidence level:.*?\d+\/10/i)?.[0] || "")}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Enhanced Summary for Career & Money Report */}
                {type === "career-money" && content?.summary && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl border-2 border-blue-300 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-3xl">💼</div>
                      <h2 className="text-2xl font-bold text-blue-900">Career & Money Summary</h2>
                    </div>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">{content.summary}</p>
                    </div>
                    {/* Extract and display confidence indicators if mentioned in summary */}
                    {(content?.summary && (content.summary.toLowerCase().includes("career direction clarity") || 
                      content.summary.toLowerCase().includes("money growth stability"))) && (
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <div className="flex flex-wrap gap-4 text-sm">
                          {content?.summary && content.summary.match(/career direction clarity:.*?(strong|moderate|weak)/i)?.[0] && (
                            <p className="font-semibold text-blue-800">
                              {content.summary.match(/career direction clarity:.*?(strong|moderate|weak)/i)?.[0]}
                            </p>
                          )}
                          {content?.summary && content.summary.match(/money growth stability:.*?(steady|stable|moderate|strong)/i)?.[0] && (
                            <p className="font-semibold text-blue-800">
                              {content.summary.match(/money growth stability:.*?(steady|stable|moderate|strong)/i)?.[0]}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-blue-700 mt-2">Directional confidence indicators, not income predictions</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Enhanced Summary for Year Analysis Report */}
                {type === "year-analysis" && content?.summary && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 rounded-xl border-2 border-indigo-300 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-3xl">📅</div>
                      <h2 className="text-2xl font-bold text-indigo-900">Year Analysis Summary</h2>
                    </div>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">{content.summary}</p>
                    </div>
                  </div>
                )}

                {/* Enhanced Summary for Major Life Phase Report */}
                {type === "major-life-phase" && content?.summary && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-violet-50 via-purple-50 to-violet-50 rounded-xl border-2 border-violet-300 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-3xl">🗺️</div>
                      <h2 className="text-2xl font-bold text-violet-900">3-5 Year Strategic Life Phase Summary</h2>
                    </div>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">{content.summary}</p>
                    </div>
                  </div>
                )}

                {/* Enhanced Summary for Decision Support Report */}
                {type === "decision-support" && content?.summary && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-xl border-2 border-emerald-300 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-3xl">🎯</div>
                      <h2 className="text-2xl font-bold text-emerald-900">Decision Support Summary</h2>
                    </div>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">{content.summary}</p>
                    </div>
                  </div>
                )}

                {/* Enhanced Summary for Life Summary Report (Free) */}
                {type === "life-summary" && content?.summary && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-xl border-2 border-amber-300 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-3xl">📊</div>
                      <h2 className="text-2xl font-bold text-amber-900">Life Summary</h2>
                    </div>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">{content.summary}</p>
                    </div>
                  </div>
                )}

                {/* Sections */}
                <div className="space-y-8">
                  {visibleSections.map((section, idx) => {
                    // Check if section has key insight (title contains "- Key Insight")
                    const hasKeyInsight = section.title.toLowerCase().includes("- key insight") || section.title.toLowerCase().includes("key insight");
                    const sectionTitle = section.title.replace(/- Key Insight/gi, "").trim();
                    
                    // Enhanced section detection for ALL report types (standardized like marriage report)
                    const isMarriageTimingReport = type === "marriage-timing";
                    const isCareerMoneyReport = type === "career-money";
                    const isYearAnalysisReport = type === "year-analysis";
                    const isMajorLifePhaseReport = type === "major-life-phase";
                    const isDecisionSupportReport = type === "decision-support";
                    const isLifeSummaryReport = type === "life-summary";
                    
                    // Summary sections (already displayed above, skip in section list)
                    const isMarriageSummarySection = isMarriageTimingReport && section.title.toLowerCase().includes("marriage timing summary");
                    const isCareerMoneySummarySection = isCareerMoneyReport && section.title.toLowerCase().includes("career & money summary");
                    
                    // Decision Guidance (applies to multiple report types)
                    const isDecisionGuidanceSection = (
                      isMarriageTimingReport || 
                      isCareerMoneyReport || 
                      isYearAnalysisReport ||
                      isMajorLifePhaseReport ||
                      isDecisionSupportReport
                    ) && (
                      section.title.toLowerCase().includes("what you should focus") || 
                      section.title.toLowerCase().includes("decision guidance") || 
                      section.title.toLowerCase().includes("focus on now") ||
                      section.title.toLowerCase().includes("key actions") ||
                      section.title.toLowerCase().includes("recommendations")
                    );
                    
                    // Marriage-specific sections
                    const isIdealWindowsSection = isMarriageTimingReport && section.title.toLowerCase().includes("ideal marriage window");
                    const isDelayFactorsSection = isMarriageTimingReport && (section.title.toLowerCase().includes("delay") || section.title.toLowerCase().includes("potential delay"));
                    
                    // Career & Money sections
                    const isCareerMomentumSection = isCareerMoneyReport && section.title.toLowerCase().includes("career momentum");
                    const isMoneyGrowthSection = isCareerMoneyReport && (section.title.toLowerCase().includes("money growth") || section.title.toLowerCase().includes("financial growth"));
                    const isCareerDirectionSection = isCareerMoneyReport && (section.title.toLowerCase().includes("career direction") || section.title.toLowerCase().includes("best career"));
                    
                    // Year Analysis sections
                    const isYearOverviewSection = isYearAnalysisReport && (section.title.toLowerCase().includes("year overview") || section.title.toLowerCase().includes("12 month"));
                    const isMonthlyHighlightsSection = isYearAnalysisReport && (section.title.toLowerCase().includes("monthly") || section.title.toLowerCase().includes("key months"));
                    
                    // Major Life Phase sections
                    const isPhaseOverviewSection = isMajorLifePhaseReport && (section.title.toLowerCase().includes("phase overview") || section.title.toLowerCase().includes("strategic phase"));
                    const isLongTermTrendsSection = isMajorLifePhaseReport && (section.title.toLowerCase().includes("long term") || section.title.toLowerCase().includes("trends"));
                    
                    // Decision Support sections
                    const isDecisionAnalysisSection = isDecisionSupportReport && (section.title.toLowerCase().includes("decision analysis") || section.title.toLowerCase().includes("astrological perspective"));
                    const isRecommendationsSection = isDecisionSupportReport && (section.title.toLowerCase().includes("recommendations") || section.title.toLowerCase().includes("guidance"));
                    
                    // Major sections (enhanced visual treatment)
                    const isMajorSection = idx === 0 || 
                      section.title.toLowerCase().includes("personality") || 
                      section.title.toLowerCase().includes("marriage") || 
                      section.title.toLowerCase().includes("career") || 
                      section.title.toLowerCase().includes("money") ||
                      section.title.toLowerCase().includes("life") ||
                      section.title.toLowerCase().includes("overview") ||
                      isDecisionGuidanceSection ||
                      isIdealWindowsSection ||
                      isCareerMomentumSection ||
                      isMoneyGrowthSection ||
                      isCareerDirectionSection ||
                      isYearOverviewSection ||
                      isMonthlyHighlightsSection ||
                      isPhaseOverviewSection ||
                      isLongTermTrendsSection ||
                      isDecisionAnalysisSection ||
                      isRecommendationsSection;
                    
                    // Skip summary sections if we already displayed them above (for all report types)
                    if (isMarriageSummarySection || isCareerMoneySummarySection || 
                        (isYearAnalysisReport && section.title.toLowerCase().includes("year analysis summary")) ||
                        (isMajorLifePhaseReport && section.title.toLowerCase().includes("strategic life phase summary")) ||
                        (isDecisionSupportReport && section.title.toLowerCase().includes("decision support summary")) ||
                        (isLifeSummaryReport && section.title.toLowerCase().includes("life summary"))) {
                      return null;
                    }
                    
                    return (
                <div key={idx} className={isMajorSection ? "relative" : ""}>
                  {/* Visual Section Divider for Major Sections */}
                  {isMajorSection && idx > 0 && (
                    <div className="mb-8 pt-8 border-t-2 border-slate-300">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-4">
                        <div className="w-12 h-1 bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 rounded-full"></div>
                      </div>
                    </div>
                  )}
                  
                  <div className={`${
                    isDecisionGuidanceSection ? "bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-emerald-300 shadow-sm" :
                    isIdealWindowsSection ? "bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border-2 border-pink-300 shadow-sm" :
                    isDelayFactorsSection ? "bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-300 shadow-sm" :
                    isCareerMomentumSection ? "bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-300 shadow-sm" :
                    isMoneyGrowthSection ? "bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-300 shadow-sm" :
                    isCareerDirectionSection ? "bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border-2 border-purple-300 shadow-sm" :
                    isYearOverviewSection ? "bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-300 shadow-sm" :
                    isMonthlyHighlightsSection ? "bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-300 shadow-sm" :
                    isPhaseOverviewSection ? "bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-xl border-2 border-violet-300 shadow-sm" :
                    isLongTermTrendsSection ? "bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-300 shadow-sm" :
                    isDecisionAnalysisSection ? "bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-emerald-300 shadow-sm" :
                    isRecommendationsSection ? "bg-gradient-to-br from-teal-50 to-green-50 p-6 rounded-xl border-2 border-teal-300 shadow-sm" :
                    isMajorSection ? "bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 rounded-xl border border-slate-200" : ""
                  }`}>
                      <div className="flex items-start gap-3 mb-4">
                        {(isMajorSection || isDecisionGuidanceSection || isIdealWindowsSection || isDelayFactorsSection || 
                          isCareerMomentumSection || isMoneyGrowthSection || isCareerDirectionSection ||
                          isYearOverviewSection || isMonthlyHighlightsSection || isPhaseOverviewSection || 
                          isLongTermTrendsSection || isDecisionAnalysisSection || isRecommendationsSection) && (
                          <div className="text-xl sm:text-2xl mt-1">
                          {isDecisionGuidanceSection ? "✅" :
                           isCareerMomentumSection ? "📈" :
                           isMoneyGrowthSection ? "💰" :
                           isCareerDirectionSection ? "🎯" :
                           isIdealWindowsSection ? "🕒" :
                           isDelayFactorsSection ? "⚠️" :
                           isYearOverviewSection ? "📅" :
                           isMonthlyHighlightsSection ? "📆" :
                           isPhaseOverviewSection ? "🗺️" :
                           isLongTermTrendsSection ? "📊" :
                           isDecisionAnalysisSection ? "🎯" :
                           isRecommendationsSection ? "💡" :
                           section.title.toLowerCase().includes("personality") ? "👤" :
                           section.title.toLowerCase().includes("marriage") ? "💑" :
                           section.title.toLowerCase().includes("career") ? "💼" :
                           section.title.toLowerCase().includes("money") ? "💰" : 
                           section.title.toLowerCase().includes("life") ? "🌟" : "📊"}
                        </div>
                      )}
                      <div className="flex-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{sectionTitle}</h2>
                        {hasKeyInsight && section.content && (
                          <div className="mt-3 mb-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                            <p className="text-sm font-semibold text-amber-900 leading-relaxed">{section.content.split('\n')[0]}</p>
                          </div>
                        )}
                        {/* Timing Strength Indicator for Marriage Timing sections */}
                        {isMarriageTimingReport && (isIdealWindowsSection || section.title.toLowerCase().includes("timing")) && section.content && (
                          (() => {
                            const timingStrengthMatch = section.content.match(/timing strength:.*?(strong|moderate|weak)/i);
                            const confidenceMatch = section.content.match(/confidence level:.*?(\d+\/10)/i);
                            if (timingStrengthMatch || confidenceMatch) {
                              return (
                                <div className="mt-3 mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                                  <p className="text-sm font-semibold text-blue-900">
                                    {timingStrengthMatch?.[0] || ""} {confidenceMatch?.[0] || ""}
                                  </p>
                                  <p className="text-xs text-blue-700 mt-1">Guidance strength indicator, not certainty</p>
                                </div>
                              );
                            }
                            return null;
                          })()
                        )}
                        {/* Confidence Indicators for Career & Money sections */}
                        {isCareerMoneyReport && (isCareerMomentumSection || isMoneyGrowthSection || isCareerDirectionSection) && section.content && (
                          (() => {
                            const careerClarityMatch = section.content.match(/career direction clarity:.*?(strong|moderate|weak)/i);
                            const moneyStabilityMatch = section.content.match(/money growth stability:.*?(steady|stable|moderate|strong)/i);
                            if (careerClarityMatch || moneyStabilityMatch) {
                              return (
                                <div className="mt-3 mb-4 p-3 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg">
                                  <div className="space-y-1">
                                    {careerClarityMatch?.[0] && (
                                      <p className="text-sm font-semibold text-indigo-900">{careerClarityMatch[0]}</p>
                                    )}
                                    {moneyStabilityMatch?.[0] && (
                                      <p className="text-sm font-semibold text-indigo-900">{moneyStabilityMatch[0]}</p>
                                    )}
                                  </div>
                                  <p className="text-xs text-indigo-700 mt-1">Directional confidence indicators, not income predictions</p>
                                </div>
                              );
                            }
                            return null;
                          })()
                        )}
                        
                        {/* Confidence/Strength Indicators for Year Analysis sections */}
                        {(isYearAnalysisReport && (isYearOverviewSection || isMonthlyHighlightsSection) && section.content) && (
                          (() => {
                            const yearStrengthMatch = section.content.match(/year strength:.*?(strong|moderate|weak|favorable)/i);
                            const phaseMatch = section.content.match(/current phase:.*?(favorable|challenging|transformative)/i);
                            if (yearStrengthMatch || phaseMatch) {
                              return (
                                <div className="mt-3 mb-4 p-3 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg">
                                  <div className="space-y-1">
                                    {yearStrengthMatch?.[0] && (
                                      <p className="text-sm font-semibold text-indigo-900">{yearStrengthMatch[0]}</p>
                                    )}
                                    {phaseMatch?.[0] && (
                                      <p className="text-sm font-semibold text-indigo-900">{phaseMatch[0]}</p>
                                    )}
                                  </div>
                                  <p className="text-xs text-indigo-700 mt-1">Astrological phase indicators, not absolute predictions</p>
                                </div>
                              );
                            }
                            return null;
                          })()
                        )}
                        
                        {/* Confidence Indicators for Major Life Phase sections */}
                        {(isMajorLifePhaseReport && (isPhaseOverviewSection || isLongTermTrendsSection) && section.content) && (
                          (() => {
                            const phaseStrengthMatch = section.content.match(/phase strength:.*?(strong|moderate|weak)/i);
                            const strategicClarityMatch = section.content.match(/strategic clarity:.*?(high|moderate|developing)/i);
                            if (phaseStrengthMatch || strategicClarityMatch) {
                              return (
                                <div className="mt-3 mb-4 p-3 bg-violet-50 border-l-4 border-violet-400 rounded-r-lg">
                                  <div className="space-y-1">
                                    {phaseStrengthMatch?.[0] && (
                                      <p className="text-sm font-semibold text-violet-900">{phaseStrengthMatch[0]}</p>
                                    )}
                                    {strategicClarityMatch?.[0] && (
                                      <p className="text-sm font-semibold text-violet-900">{strategicClarityMatch[0]}</p>
                                    )}
                                  </div>
                                  <p className="text-xs text-violet-700 mt-1">Strategic phase indicators for long-term planning</p>
                                </div>
                              );
                            }
                            return null;
                          })()
                        )}
                        
                        {/* Confidence Indicators for Decision Support sections */}
                        {(isDecisionSupportReport && (isDecisionAnalysisSection || isRecommendationsSection) && section.content) && (
                          (() => {
                            const decisionClarityMatch = section.content.match(/decision clarity:.*?(strong|moderate|developing)/i);
                            const alignmentMatch = section.content.match(/astrological alignment:.*?(favorable|neutral|consider)/i);
                            if (decisionClarityMatch || alignmentMatch) {
                              return (
                                <div className="mt-3 mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-400 rounded-r-lg">
                                  <div className="space-y-1">
                                    {decisionClarityMatch?.[0] && (
                                      <p className="text-sm font-semibold text-emerald-900">{decisionClarityMatch[0]}</p>
                                    )}
                                    {alignmentMatch?.[0] && (
                                      <p className="text-sm font-semibold text-emerald-900">{alignmentMatch[0]}</p>
                                    )}
                                  </div>
                                  <p className="text-xs text-emerald-700 mt-1">Guidance indicators to support your decision-making</p>
                                </div>
                              );
                            }
                            return null;
                          })()
                        )}
                      </div>
                    </div>
                  
                  {section.content && (
                    <div className="prose prose-slate max-w-none mb-4">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {hasKeyInsight ? section.content.split('\n').slice(1).join('\n') : section.content}
                      </p>
                    </div>
                  )}

                  {section.bullets && section.bullets.length > 0 && (
                    <ul className={`space-y-2 mb-4 ${isDecisionGuidanceSection ? "list-none" : ""}`}>
                      {section.bullets && section.bullets.length > 0 && section.bullets.map((bullet, bulletIdx) => {
                        // Limit bullet display to 15 words for better readability
                        const bulletWords = bullet.split(' ');
                        const displayBullet = bulletWords.length > 15 ? bulletWords.slice(0, 15).join(' ') + '...' : bullet;
                        return (
                          <li key={bulletIdx} className={`flex items-start gap-3 ${
                            isDecisionGuidanceSection ? "p-2 bg-white/50 rounded-lg" : 
                            isCareerMomentumSection ? "p-2 bg-white/30 rounded" :
                            isMoneyGrowthSection ? "p-2 bg-white/30 rounded" :
                            isCareerDirectionSection ? "p-2 bg-white/30 rounded" :
                            isYearOverviewSection || isMonthlyHighlightsSection ? "p-2 bg-white/30 rounded" :
                            isPhaseOverviewSection || isLongTermTrendsSection ? "p-2 bg-white/30 rounded" :
                            isDecisionAnalysisSection || isRecommendationsSection ? "p-2 bg-white/50 rounded-lg" :
                            isIdealWindowsSection ? "p-2 bg-white/50 rounded-lg" : ""
                          }`}>
                            <span className={`mt-1 ${
                              isDecisionGuidanceSection || isDecisionAnalysisSection || isRecommendationsSection ? "text-emerald-600" : 
                              isCareerMomentumSection ? "text-blue-600" :
                              isMoneyGrowthSection ? "text-green-600" :
                              isCareerDirectionSection ? "text-purple-600" :
                              isYearOverviewSection || isMonthlyHighlightsSection ? "text-indigo-600" :
                              isPhaseOverviewSection || isLongTermTrendsSection ? "text-violet-600" :
                              isIdealWindowsSection ? "text-pink-600" : 
                              "text-amber-700"
                            }`}>
                              {isDecisionGuidanceSection || isDecisionAnalysisSection || isRecommendationsSection ? "✓" : 
                               isCareerMomentumSection || isMoneyGrowthSection || isCareerDirectionSection ? "→" :
                               isYearOverviewSection || isMonthlyHighlightsSection || isPhaseOverviewSection || isLongTermTrendsSection ? "→" :
                               isIdealWindowsSection ? "🕒" :
                               "•"}
                            </span>
                            <span className={`${
                              isDecisionGuidanceSection || isDecisionAnalysisSection || isRecommendationsSection ? "font-medium" : 
                              isCareerMomentumSection || isMoneyGrowthSection || isCareerDirectionSection ? "font-medium" :
                              isYearOverviewSection || isMonthlyHighlightsSection || isPhaseOverviewSection || isLongTermTrendsSection ? "font-medium" :
                              isIdealWindowsSection ? "font-medium" : ""
                            } text-slate-700`}>{displayBullet}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {section.subsections && section.subsections.length > 0 && (
                    <div className="ml-6 mt-4 space-y-4">
                      {section.subsections && section.subsections.length > 0 && section.subsections.map((subsection, subIdx) => (
                        <div key={subIdx} className="border-l-2 border-slate-200 pl-4">
                          <h3 className="text-lg font-semibold mb-2 text-slate-800">{subsection.title}</h3>
                          {subsection.content && (
                            <p className="text-slate-700">{subsection.content}</p>
                          )}
                          {subsection.bullets && (
                            <ul className="space-y-1 mt-2">
                              {subsection.bullets && subsection.bullets.length > 0 && subsection.bullets.map((bullet, bulletIdx) => (
                                <li key={bulletIdx} className="flex items-start gap-2">
                                  <span className="text-purple-600">•</span>
                                  <span className="text-slate-700">{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* "What this means for you" section - Check if content ends with this pattern */}
                  {section.content && section.content.toLowerCase().includes("what this means") && (
                    <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">What This Means For You</h4>
                      <p className="text-blue-800 text-sm leading-relaxed">
                        {section.content.split(/what this means/i).pop()?.trim()}
                      </p>
                    </div>
                  )}
                  </div>
                </div>
                    );
                  })}

                {/* Blurred Gated Content for Life Summary */}
                {shouldGateContent && gatedSections.length > 0 && (
                  <div className="relative mt-12">
                    {/* Blurred sections in background */}
                    <div className="blur-sm pointer-events-none select-none opacity-60">
                      {gatedSections.map((section, idx) => {
                        const hasKeyInsight = section.title.toLowerCase().includes("- key insight") || section.title.toLowerCase().includes("key insight");
                        const sectionTitle = section.title.replace(/- Key Insight/gi, "").trim();
                        
                        return (
                          <div key={`gated-${idx}`} className="mb-8">
                            <div className="bg-white rounded-xl p-6 border border-slate-200">
                              <h3 className="text-xl font-bold text-slate-900 mb-4">
                                {hasKeyInsight && <span className="text-amber-600 mr-2">✨</span>}
                                {sectionTitle}
                              </h3>
                              {section.content && (
                                <div className="prose prose-slate max-w-none">
                                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {section.content.substring(0, 300)}...
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Gradient overlay with unlock message */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white rounded-xl">
                      <div className="flex items-center justify-center min-h-[400px] p-8">
                        <div className="text-center max-w-2xl">
                          <div className="text-5xl mb-4">🔒</div>
                          <h3 className="text-2xl font-bold text-amber-900 mb-3">
                            Unlock the Full Life Summary Report
                          </h3>
                          <p className="text-slate-700 mb-6 leading-relaxed">
                            You&apos;ve seen the overview ({Math.round((visibleSections.length / sections.length) * 100)}% of your report). 
                            Purchase to unlock the remaining {gatedSections.length} section{gatedSections.length > 1 ? 's' : ''} with <strong>specific timing windows, detailed guidance, and actionable steps</strong>.
                          </p>
                          <div className="flex flex-wrap justify-center gap-3">
                            <Link href="/ai-astrology/input?reportType=marriage-timing">
                              <Button className="cosmic-button px-6 py-3">
                                See Marriage Timing →
                              </Button>
                            </Link>
                            <Link href="/ai-astrology/input?reportType=career-money">
                              <Button className="cosmic-button px-6 py-3">
                                See Career & Money →
                              </Button>
                            </Link>
                            <Link href="/ai-astrology/input?reportType=full-life">
                              <Button className="cosmic-button px-6 py-3">
                                Get Full Life Report →
                              </Button>
                            </Link>
                          </div>
                          <p className="text-xs text-slate-600 mt-4">
                            All reports: AU$0.01 each • Instant access • Downloadable PDF
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
      </>
    );
  };

  return (
    <div className="cosmic-bg py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header with Breadcrumb */}
        <div className="mb-6">
          <Link href="/ai-astrology" className="text-sm text-amber-700 hover:text-amber-800 mb-3 inline-flex items-center gap-2">
            <span>←</span>
            <span>Back to AI Astrology</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <span>{reportContent?.title || "AI Astrology Report"}</span>
            <span>•</span>
            <span>Fully automated</span>
            <span>•</span>
            <span>No live support</span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <div>
              {/* Bundle Heading */}
              {bundleType && bundleReports.length > 0 && (
                <div className="mb-6 p-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 rounded-xl border-4 border-purple-800 shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-4xl">📦</div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">
                        {bundleType === "life-decision-pack" 
                          ? "Complete Life Decision Pack" 
                          : bundleType === "all-3" 
                          ? "All 3 Reports Bundle" 
                          : "Any 2 Reports Bundle"}
                      </h1>
                      <p className="text-purple-100 text-lg">
                        {bundleReports.map((rt, idx) => {
                          const name = getReportName(rt);
                          return idx === bundleReports.length - 1 ? name : `${name} + `;
                        }).join("")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-purple-400">
                    <p className="text-white text-sm">
                      <strong>Bundle Contents:</strong> This bundle includes {bundleReports.length} comprehensive reports, each providing detailed insights into different aspects of your life.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">
                  {bundleType && bundleReports.length > 0 
                    ? `${getReportName(bundleReports[0])} (Part 1 of ${bundleReports.length})`
                    : (reportContent?.title || "AI Astrology Report")}
                </h1>
              </div>
              <p className="text-sm sm:text-base text-slate-600 mb-1">
                Prepared exclusively for <strong>{input.name}</strong>
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500">
                <span>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
                {reportContent.reportId && (
                  <>
                    <span>•</span>
                    <span>Report ID: {reportContent.reportId}</span>
                  </>
                )}
                <span>•</span>
                <span>Not publicly available</span>
              </div>
            </div>
          
            {/* PDF Download & Email Buttons */}
            {(isPaidReport || (isBundleReport && bundleContents.size > 0)) && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleDownloadPDF}
                  disabled={downloadingPDF}
                  className="cosmic-button px-4 sm:px-6 py-3 text-sm sm:text-base min-h-[44px]"
                >
                  {downloadingPDF ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">📄</span>
                      <span>Generating PDF... This may take {isBundleReport ? '60-120' : '30-60'} seconds</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>📥</span>
                      <span>{isBundleReport ? 'Download Bundle PDF (All Reports)' : 'Download Personal PDF (Keep Forever)'}</span>
                    </span>
                  )}
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      // Validate reportContent before sharing
                      if (!reportContent || !reportContent.title) {
                        setError("Cannot share: Report content is missing");
                        return;
                      }
                      // Get the current page URL to share
                      const currentUrl = window.location.href;
                      const shareData = {
                        title: reportContent.title,
                        text: `Check out my ${reportContent.title} from AstroSetu AI Astrology`,
                        url: currentUrl,
                      };

                      // Try native share API first (works on mobile and modern browsers)
                      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                        await navigator.share(shareData);
                        setEmailCopySuccess(true);
                        setTimeout(() => setEmailCopySuccess(false), 3000);
                      } else {
                        // Fallback: Copy URL to clipboard
                        await navigator.clipboard.writeText(currentUrl);
                        setEmailCopySuccess(true);
                        setTimeout(() => setEmailCopySuccess(false), 3000);
                      }
                    } catch (error) {
                      // If share was cancelled, don't show error
                      if ((error as Error).name !== 'AbortError') {
                        console.error('Failed to share:', error);
                        // Fallback: Copy URL to clipboard
                        try {
                          await navigator.clipboard.writeText(window.location.href);
                          setEmailCopySuccess(true);
                          setTimeout(() => setEmailCopySuccess(false), 3000);
                        } catch (clipboardError) {
                          console.error('Failed to copy to clipboard:', clipboardError);
                        }
                      }
                    }
                  }}
                  className="cosmic-button-secondary px-4 sm:px-6 py-3 text-sm sm:text-base min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <span>✉️</span>
                    <span>{emailCopySuccess ? "Copied!" : "Email Me a Copy"}</span>
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Layout: Left (Upgrade Card) + Right (Report Content) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Sticky Upgrade Card (30-35%) - Shows at bottom on mobile */}
          {!isPaidReport && (
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24">
                <Card className="cosmic-card border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
                  <CardHeader title="Unlock Full Insights" />
                  <CardContent className="p-6">
                    <p className="text-slate-700 mb-6 text-sm leading-relaxed">
                      Get detailed, personalized reports with actionable guidance for your life path.
                    </p>

                    {/* Individual Reports */}
                    <div className="space-y-3 mb-6">
                      <Link href="/ai-astrology/input?reportType=marriage-timing" className="block">
                        <div className="p-4 bg-white rounded-lg border-2 border-amber-400 hover:border-amber-500 hover:shadow-md transition-all">
                          <div className="font-bold text-slate-800 mb-2">See My Marriage Timing (Instant)</div>
                          <div className="text-sm text-amber-700 font-semibold mb-3">AU$0.01 (incl. GST)</div>
                          <ul className="text-xs text-slate-700 space-y-1 mt-3 pt-3 border-t border-amber-100">
                            <li>• Best marriage windows (date ranges)</li>
                            <li>• Reasons for delay (plain English)</li>
                            <li>• Practical guidance</li>
                          </ul>
                        </div>
                      </Link>
                      <Link href="/ai-astrology/input?reportType=career-money" className="block">
                        <div className="p-4 bg-white rounded-lg border-2 border-slate-300 hover:border-amber-400 hover:shadow-md transition-all">
                          <div className="font-bold text-slate-800 mb-2">Unlock My Career & Money Path</div>
                          <div className="text-sm text-slate-600 font-semibold mb-3">AU$0.01 (incl. GST)</div>
                          <ul className="text-xs text-slate-700 space-y-1 mt-3 pt-3 border-t border-slate-100">
                            <li>• Career direction</li>
                            <li>• Job-change windows</li>
                            <li>• Money growth phases</li>
                          </ul>
                        </div>
                      </Link>
                      <Link href="/ai-astrology/input?reportType=year-analysis" className="block">
                        <div className="p-4 bg-white rounded-lg border-2 border-slate-300 hover:border-amber-400 hover:shadow-md transition-all">
                          <div className="font-bold text-slate-800 mb-2">Year Analysis Report</div>
                          <div className="text-sm text-slate-600 font-semibold mb-3">AU$0.01 (incl. GST)</div>
                          <ul className="text-xs text-slate-700 space-y-1 mt-3 pt-3 border-t border-slate-100">
                            <li>• Quarterly breakdown</li>
                            <li>• Year strategy & focus areas</li>
                            <li>• Low-return periods</li>
                          </ul>
                        </div>
                      </Link>
                      <Link href="/ai-astrology/input?reportType=major-life-phase" className="block">
                        <div className="p-4 bg-white rounded-lg border-2 border-slate-300 hover:border-amber-400 hover:shadow-md transition-all">
                          <div className="font-bold text-slate-800 mb-2">3-5 Year Strategic Life Phase Report</div>
                          <div className="text-sm text-slate-600 font-semibold mb-3">AU$0.01 (incl. GST)</div>
                          <ul className="text-xs text-slate-700 space-y-1 mt-3 pt-3 border-t border-slate-100">
                            <li>• Long-term life phases</li>
                            <li>• Major transitions & opportunities</li>
                            <li>• Strategic planning guidance</li>
                          </ul>
                        </div>
                      </Link>
                      <Link href="/ai-astrology/input?reportType=decision-support" className="block">
                        <div className="p-4 bg-white rounded-lg border-2 border-slate-300 hover:border-amber-400 hover:shadow-md transition-all">
                          <div className="font-bold text-slate-800 mb-2">Decision Support Report</div>
                          <div className="text-sm text-slate-600 font-semibold mb-3">AU$0.01 (incl. GST)</div>
                          <ul className="text-xs text-slate-700 space-y-1 mt-3 pt-3 border-t border-slate-100">
                            <li>• Decision options analysis</li>
                            <li>• Timing recommendations</li>
                            <li>• Decision anchor guidance</li>
                          </ul>
                        </div>
                      </Link>
                    </div>

                    {/* Best Value - Full Life Report */}
                    <Link href="/ai-astrology/input?reportType=full-life" className="block mb-6">
                      <div className="p-5 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg border-4 border-purple-500 hover:border-purple-600 hover:shadow-xl transition-all relative scale-105">
                        <div className="absolute -top-2 -right-2 bg-purple-700 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg border-2 border-purple-800 uppercase tracking-wide">
                          BEST VALUE
                        </div>
                        <div className="font-bold text-slate-800 mb-2 text-xl">Get My Full Life Report</div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-xl font-bold text-purple-700">AU$0.01</span>
                        </div>
                        <div className="text-xs text-slate-600 mb-3 italic">Most users choose this</div>
                        <ul className="text-xs text-slate-700 space-y-1 mt-3 pt-3 border-t border-purple-200">
                          <li>• Marriage + Career</li>
                          <li>• 5-year life phases</li>
                          <li>• Most comprehensive</li>
                        </ul>
                      </div>
                    </Link>

                    {/* Trust Strip */}
                    <div className="pt-6 border-t border-amber-300">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="space-y-2 text-xs text-slate-700">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>Instant access after payment</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>Downloadable PDF</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>Fully automated – no humans involved</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>One-time purchase</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 text-center mt-4">
                        Educational guidance only • Instant access • No subscription required
                      </p>
                    </div>

                    {/* Pricing Anchor */}
                    <div className="mt-6 pt-6 border-t border-amber-300">
                      <p className="text-xs text-slate-600 text-center">
                        Individual reports: <strong>AU$0.01</strong> each<br />
                        Full Life Report: <strong>AU$0.01</strong>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Right Column: Report Content (65-70%) - Shows first on mobile */}
          <div className={isPaidReport ? "lg:col-span-3" : "lg:col-span-2 order-1 lg:order-2"}>
            {/* Short Disclaimer Summary (Only for paid reports, at top) */}
            {isPaidReport && (
              <Card className="cosmic-card mb-6 border-blue-200 bg-blue-50/50">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-600 text-center">
                    <strong>Educational guidance only</strong> • Fully automated • No guarantees
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Bundle Reports Display */}
            {bundleType && bundleReports.length > 0 && bundleContents.size > 0 ? (
              <div className="space-y-12">
                {bundleReports.map((reportTypeInBundle, bundleIdx) => {
                  const bundleReportContent = bundleContents.get(reportTypeInBundle);
                  if (!bundleReportContent) return null;

                  const bundleSections = bundleReportContent.sections || [];
                  const bundleVisibleSections = bundleSections.filter(s => s && s.title);

                  return (
                    <div key={reportTypeInBundle} className="relative">
                      {/* Report Separator with Heading */}
                      {bundleIdx > 0 && (
                        <div className="mb-12 pt-12 border-t-4 border-purple-500">
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white px-6 py-2 rounded-full border-4 border-purple-500 shadow-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">📄</span>
                              <span className="text-lg font-bold text-purple-700">
                                Report {bundleIdx + 1} of {bundleReports.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Individual Report Card */}
                      <Card className="cosmic-card mb-6 border-2 border-purple-300 shadow-lg">
                        <CardContent className="p-8">
                          {/* Report Header */}
                          <div className="mb-8 pb-6 border-b-2 border-purple-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl sm:text-4xl">
                          {reportTypeInBundle === "marriage-timing" ? "💑" :
                           reportTypeInBundle === "career-money" ? "💼" :
                           reportTypeInBundle === "full-life" ? "🌟" :
                           reportTypeInBundle === "year-analysis" ? "📅" :
                           reportTypeInBundle === "major-life-phase" ? "🗺️" :
                           reportTypeInBundle === "decision-support" ? "🎯" : "📊"}
                        </div>
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-bold text-purple-900 mb-1">
                            {getReportName(reportTypeInBundle)}
                          </h2>
                          <p className="text-purple-600 text-xs sm:text-sm">
                            Part {bundleIdx + 1} of {bundleReports.length} in your bundle
                          </p>
                        </div>
                      </div>
                          </div>

                          {/* Render this report's content - reuse existing rendering logic */}
                          {renderSingleReportContent(bundleReportContent, reportTypeInBundle)}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Single Report Display */
              <Card className="cosmic-card mb-6">
                <CardContent className="p-8">
                  {renderSingleReportContent(reportContent, reportType)}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Post-Purchase Upsell Modal - Show after 30 seconds for paid reports */}
      {showUpsell && reportType !== "life-summary" && reportType !== "daily-guidance" && !loading && !error && (
        <PostPurchaseUpsell
          currentReport={reportType as "marriage-timing" | "career-money" | "full-life" | "year-analysis" | "major-life-phase" | "decision-support"}
          onClose={() => setShowUpsell(false)}
        />
      )}
    </div>
    );
  }

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🌙</div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}

