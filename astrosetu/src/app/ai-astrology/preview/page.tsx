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
  
  // Bundle state
  const [bundleType, setBundleType] = useState<string | null>(null);
  const [bundleReports, setBundleReports] = useState<ReportType[]>([]);
  const [bundleContents, setBundleContents] = useState<Map<ReportType, ReportContent>>(new Map());
  const [bundleGenerating, setBundleGenerating] = useState(false);
  const [bundleProgress, setBundleProgress] = useState<{ current: number; total: number; currentReport: string } | null>(null);
  
  // Request lock to prevent concurrent report generation
  const isGeneratingRef = useRef(false);
  const generationAttemptRef = useRef(0);

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
    setError(null);

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
      const isComplexReport = type === "full-life" || type === "major-life-phase";
      const clientTimeout = isComplexReport ? 95000 : 60000; // 95s for complex (server: 85s), 60s for others (server: 55s)
      
      const response = await apiPost<{
        ok: boolean;
        data?: {
          status?: "completed" | "pending" | "failed";
          reportId?: string;
          reportType: ReportType;
          input: AIAstrologyInput;
          content: ReportContent;
          generatedAt: string;
          redirectUrl?: string;
          fullRedirectUrl?: string;
        };
        error?: string;
      }>(apiUrl, {
        input: inputData,
        reportType: type,
        paymentToken: isPaid ? paymentToken : undefined, // Only include for paid reports
        paymentIntentId: isPaid ? paymentIntentId : undefined, // CRITICAL: For manual capture after report generation
        sessionId: isPaid ? (sessionId || undefined) : undefined, // For token regeneration fallback
      }, { timeout: clientTimeout });

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
        
        // The API already returns user-friendly error messages
        throw new Error(response.error || "Failed to generate report. Please try again.");
      }

      // CRITICAL: If report is completed and we have redirectUrl or reportId, navigate immediately
      // This prevents the UI from staying stuck on "Generating..." screen
      if (response.data?.status === "completed" && (response.data?.redirectUrl || response.data?.reportId)) {
        // Store the content in sessionStorage before navigating (so it's available on the new page)
        if (response.data?.content) {
          try {
            const reportId = response.data.reportId || `RPT-${Date.now()}`;
            sessionStorage.setItem(`aiAstrologyReport_${reportId}`, JSON.stringify({
              content: response.data.content,
              reportType: response.data.reportType,
              input: response.data.input,
              generatedAt: response.data.generatedAt,
            }));
            console.log("[CLIENT] Stored report content in sessionStorage for reportId:", reportId);
          } catch (storageError) {
            console.warn("[CLIENT] Failed to store report in sessionStorage:", storageError);
          }
        }
        
        const redirectTo = response.data.redirectUrl || `/ai-astrology/preview?reportId=${encodeURIComponent(response.data.reportId!)}&reportType=${encodeURIComponent(type)}`;
        console.log("[CLIENT] Report generation completed, navigating to:", redirectTo);
        
        // Set content in state first (in case navigation is slow or fails)
        setReportContent(response.data?.content || null);
        
        // Navigate immediately - this will cause a re-render with the new URL
        router.replace(redirectTo);
        
        // Show upsell for paid reports after a delay (30 seconds)
        const currentReportType = response.data?.reportType || type;
        if (currentReportType !== "life-summary" && !upsellShown) {
          setTimeout(() => {
            setShowUpsell(true);
            setUpsellShown(true);
          }, 30000); // 30 seconds after report generation
        }
        
        return;
      }

      // If no redirect (older API versions), use existing behavior
      setReportContent(response.data?.content || null);
      
      // Show upsell for paid reports after a delay (30 seconds)
      const currentReportType = response.data?.reportType || type;
      if (currentReportType !== "life-summary" && !upsellShown) {
        setTimeout(() => {
          setShowUpsell(true);
          setUpsellShown(true);
        }, 30000); // 30 seconds after report generation
      }
    } catch (e: any) {
      // CLIENT-SIDE EXCEPTION LOGGING
      const exceptionContext = {
        timestamp: new Date().toISOString(),
        reportType: type,
        errorType: e.constructor?.name || "Unknown",
        errorMessage: e.message || "Unknown error",
        errorStack: e.stack || "No stack trace",
      };
      console.error("[CLIENT REPORT GENERATION EXCEPTION]", JSON.stringify(exceptionContext, null, 2));
      
      // Improved error message for rate limits
      if (e.message && (e.message.includes("rate limit") || e.message.includes("Rate limit") || e.message.includes("high demand"))) {
        setError("Our AI service is experiencing high demand right now. Please wait 2-3 minutes and try again. Your request will be processed as soon as capacity is available. If you've paid, your payment has been automatically cancelled and you will NOT be charged.");
      } else {
        setError(e.message || "Failed to generate report. Please try again.");
      }
    } finally {
      // Only clear lock if this is still the current attempt (prevent race conditions)
      if (currentAttempt === generationAttemptRef.current) {
        isGeneratingRef.current = false;
      }
      setLoading(false);
      setLoadingStage(null);
    }
  }, [upsellShown]);

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
      // Complex reports: 95s (server: 85s), Others: 60s (server: 55s)
      // For bundles, use the longer timeout to be safe
      const INDIVIDUAL_REPORT_TIMEOUT = 95000;

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
    
    try {
      // CRITICAL: Check for reportId in URL - if present, try to load from sessionStorage
      const reportId = searchParams.get("reportId");
      if (reportId && !reportContent) {
        try {
          const storedReport = sessionStorage.getItem(`aiAstrologyReport_${reportId}`);
          if (storedReport) {
            const parsed = JSON.parse(storedReport);
            console.log("[CLIENT] Loaded report from sessionStorage for reportId:", reportId);
            setReportContent(parsed.content);
            setReportType(parsed.reportType || (searchParams.get("reportType") as ReportType) || "life-summary");
            setInput(parsed.input);
            setLoading(false);
            // Don't continue with auto-generation if we already have content
            return;
          }
        } catch (error) {
          console.warn("[CLIENT] Failed to load report from sessionStorage:", error);
        }
      }
      
      // CRITICAL FIX: Get session_id from URL params first (fallback if sessionStorage is lost)
      const urlSessionId = searchParams.get("session_id");
      const autoGenerate = searchParams.get("auto_generate") === "true"; // Trigger auto-generation after payment
      
      // Get input from sessionStorage
      const savedInput = sessionStorage.getItem("aiAstrologyInput");
      const savedReportType = sessionStorage.getItem("aiAstrologyReportType") as ReportType;
      const paymentVerified = sessionStorage.getItem("aiAstrologyPaymentVerified") === "true";
      
      // Get bundle information
      const savedBundleType = sessionStorage.getItem("aiAstrologyBundle");
      const savedBundleReports = sessionStorage.getItem("aiAstrologyBundleReports");

      if (!savedInput) {
        router.push("/ai-astrology/input");
        return;
      }

      const inputData = JSON.parse(savedInput);
      const reportTypeToUse = savedReportType || "life-summary";
      
      setInput(inputData);
      setReportType(reportTypeToUse);
      
      // CRITICAL FIX: If payment verified flag is missing but session_id exists, try to re-verify
      // IMPORTANT: Wait for verification before allowing report generation
      if (!paymentVerified && urlSessionId) {
        // Attempt to regenerate payment token from session_id - MUST WAIT for this
        setLoading(true); // Show loading while verifying
        setLoadingStage("verifying"); // Show payment verification stage
        
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
                if (verifyResponse.data.reportType) {
                  sessionStorage.setItem("aiAstrologyReportType", verifyResponse.data.reportType);
                  setReportType(verifyResponse.data.reportType as ReportType);
                }
                setPaymentVerified(true);
                console.log("[Preview] Payment token and intent ID regenerated successfully");
                
                // Now trigger report generation with verified payment
                setLoadingStage("generating"); // Switch to report generation stage
                generateReport(inputData, verifyResponse.data.reportType as ReportType || reportTypeToUse, urlSessionId, verifyResponse.data.paymentIntentId);
                return;
              } catch (e) {
                console.error("Failed to store regenerated payment token:", e);
                setLoading(false);
                setLoadingStage(null);
              }
            } else {
              console.error("[Preview] Payment verification failed:", verifyResponse.error);
              setError(`Payment verification failed: ${verifyResponse.error || "Please complete payment again."}`);
              setLoading(false);
              setLoadingStage(null);
            }
          } catch (e: any) {
            console.error("Failed to regenerate payment token from session_id:", e);
            setError(`Failed to verify payment: ${e.message || "Please try again or contact support."}`);
            setLoading(false);
            setLoadingStage(null);
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
        setLoading(false);
        return;
      }
      
      // If we have session_id but payment not verified yet, the verification will trigger report generation
      if (isPaidReport && !paymentVerified && urlSessionId) {
        // Verification is in progress (handled above), don't proceed yet
        return;
      }

      // Auto-generate report if auto_generate=true (after payment success)
      if (autoGenerate && paymentVerified && inputData && reportTypeToUse && !loading) {
        console.log("[Preview] Auto-generating report after payment:", { reportType: reportTypeToUse, hasInput: !!inputData });
        // Get paymentIntentId from sessionStorage if available
        let paymentIntentIdFromStorage: string | undefined;
        try {
          paymentIntentIdFromStorage = sessionStorage.getItem("aiAstrologyPaymentIntentId") || undefined;
        } catch (e) {
          console.error("Failed to read paymentIntentId from sessionStorage:", e);
        }
        // Show loading immediately and set stage to generating
        setLoading(true);
        setLoadingStage("generating");
        // Small delay to ensure state is set
        setTimeout(() => {
          if (isBundle && savedBundleReports) {
            try {
              const bundleReportsList = JSON.parse(savedBundleReports) as ReportType[];
              generateBundleReports(inputData, bundleReportsList, urlSessionId || undefined, paymentIntentIdFromStorage);
            } catch (e) {
              console.error("Failed to parse bundle reports:", e);
              generateReport(inputData, reportTypeToUse, urlSessionId || undefined, paymentIntentIdFromStorage);
            }
          } else {
            generateReport(inputData, reportTypeToUse, urlSessionId || undefined, paymentIntentIdFromStorage);
          }
        }, 300);
        return; // Exit early to avoid duplicate generation
      }
      
      // Generate bundle reports or single report (only if not auto-generating)
      if (isBundle && savedBundleReports && !autoGenerate) {
        try {
          const bundleReportsList = JSON.parse(savedBundleReports) as ReportType[];
          generateBundleReports(inputData, bundleReportsList);
        } catch (e) {
          console.error("Failed to parse bundle reports:", e);
          generateReport(inputData, reportTypeToUse);
        }
      } else if (!autoGenerate) {
        // Auto-generate single report
        generateReport(inputData, reportTypeToUse);
      }
    } catch (e) {
      // Handle JSON parse errors or sessionStorage errors (e.g., private browsing mode)
      console.error("Error accessing sessionStorage or parsing saved input:", e);
      router.push("/ai-astrology/input");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, generateReport, generateBundleReports, searchParams.toString(), loading]);

  const isPaidReport = reportType !== "life-summary";
  const needsPayment = isPaidReport && !paymentVerified;

  const handlePurchase = async () => {
    if (!input || !reportType) return;

    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const response = await apiPost<{
        ok: boolean;
        data?: { url: string; sessionId: string };
        error?: string;
      }>("/api/ai-astrology/create-checkout", {
        reportType,
        input,
      });

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
    try {
      // Check if this is a bundle download
      const isBundle = bundleType && bundleReports.length > 0 && bundleContents.size > 0;
      
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
          const success = await downloadPDF(
            reportContent, // Still needed for function signature but bundle data is used
            input,
            reportType || "life-summary",
            undefined, // filename
            bundleContentsMap,
            bundleReports,
            bundleType
          );
          if (!success) {
            setError("Failed to generate bundle PDF. Please try again.");
          }
        } else {
          setError("Not all bundle reports are available. Please wait for all reports to generate.");
        }
      } else {
        // Download single report PDF
        const success = await downloadPDF(reportContent, input, reportType || "life-summary");
        if (!success) {
          setError("Failed to generate PDF. Please try again.");
        }
      }
    } catch (e: any) {
      console.error("PDF download error:", e);
      setError("Failed to download PDF. Please try again.");
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (loading) {
    const isBundleLoading = bundleType && bundleReports.length > 0;
    const isVerifying = loadingStage === "verifying";
    
    return (
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-2xl w-full mx-4">
          <CardContent className="p-12 text-center">
            <div className="animate-spin text-6xl mb-6">🌙</div>
            <h2 className="text-2xl font-bold mb-4">
              {isVerifying 
                ? "Verifying Your Payment..." 
                : isBundleLoading 
                ? "Generating Your Bundle Reports..." 
                : "Generating Your Report..."}
            </h2>
            
            {isVerifying ? (
              <div className="space-y-4">
                <p className="text-slate-600 mb-4">
                  We&apos;re confirming your payment was successful. This usually takes just a few seconds...
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="text-xl">💳</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-800 mb-1">
                        Payment Verification in Progress
                      </p>
                      <p className="text-xs text-blue-700">
                        Please wait while we verify your payment. Your report will start generating automatically once verification is complete.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : isBundleLoading && bundleProgress ? (
              <div className="space-y-4">
                <p className="text-slate-600 mb-4">
                  Our AI is analyzing your birth chart and generating your personalized bundle reports.
                  This typically takes 1-2 minutes for {bundleProgress.total} comprehensive reports.
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="text-xl">✨</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-purple-800 mb-1">
                        Bundle Generation in Progress
                      </p>
                      <p className="text-xs text-purple-700 mb-3">
                        Creating {bundleProgress.total} comprehensive reports for you:
                      </p>
                      <div className="mb-3">
                        <div className="bg-slate-100 rounded-full h-2.5 mb-2">
                          <div 
                            className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${(bundleProgress.current / bundleProgress.total) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-purple-600 font-medium">
                          {bundleProgress.current} of {bundleProgress.total} reports completed
                        </p>
                        {bundleProgress.currentReport && bundleProgress.current > 0 && (
                          <p className="text-xs text-purple-500 mt-1 italic">
                            ✓ Latest: {bundleProgress.currentReport}
                          </p>
                        )}
                      </div>
                      <ul className="text-xs text-purple-600 space-y-1 ml-4 list-disc">
                        <li>Analyzing your birth chart data</li>
                        <li>Generating personalized insights for each report</li>
                        <li>Preparing your complete bundle package</li>
                      </ul>
                      <p className="text-xs text-purple-600 mt-3 font-medium">
                        ⏱️ Estimated time: 1-2 minutes for all reports
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-600 mb-4">
                  Our AI is analyzing your birth chart and generating personalized insights. 
                  {reportType === "life-summary" 
                    ? " This typically takes 20-40 seconds." 
                    : reportType === "full-life" || reportType === "major-life-phase"
                    ? " This typically takes 45-70 seconds for comprehensive analysis."
                    : " This typically takes 30-50 seconds."}
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="text-xl">✨</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-purple-800 mb-1">
                        Report Generation in Progress
                      </p>
                      <p className="text-xs text-purple-700 mb-2">
                        Your personalized AI astrology report is being created. This includes:
                      </p>
                      <ul className="text-xs text-purple-600 space-y-1 ml-4 list-disc">
                        <li>Fetching your birth chart data from NASA calculations</li>
                        <li>Analyzing planetary positions and aspects</li>
                        <li>Generating personalized AI insights</li>
                        <li>Structuring your complete report</li>
                      </ul>
                      <p className="text-xs text-purple-600 mt-2 font-medium">
                        ⏱️ Estimated time: {
                          reportType === "life-summary" 
                            ? "20-40 seconds" 
                            : reportType === "full-life" || reportType === "major-life-phase"
                            ? "45-70 seconds"
                            : "30-50 seconds"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                <Link href="/ai-astrology/input">
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
                  <Button className="cosmic-button-secondary">Start Over</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    
    const price = REPORT_PRICES[reportType as keyof typeof REPORT_PRICES];
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
                  <Button className="cosmic-button-secondary">Start Over</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    
    // Check if this is a bundle
    const isBundle = bundleType && bundleReports.length > 0;
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

  if (!reportContent || !input) {
    // Should not happen, but handle gracefully
    return (
      <div className="cosmic-bg py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="cosmic-card">
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Loading Report...</h2>
              <p className="text-slate-600 mb-6">Please wait while we prepare your report.</p>
              <Link href="/ai-astrology/input">
                <Button className="cosmic-button-secondary">Start Over</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
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

                {/* Summary (for other reports or if no executive summary) */}
                {content?.summary && 
                 !(type === "full-life" && content?.executiveSummary) && 
                 type !== "marriage-timing" && 
                 type !== "career-money" && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <h2 className="text-xl font-bold mb-3 text-amber-900">Summary</h2>
                    <p className="text-slate-700 leading-relaxed">{content.summary}</p>
                  </div>
                )}

                {/* Sections */}
                <div className="space-y-8">
                  {visibleSections.map((section, idx) => {
                    // Check if section has key insight (title contains "- Key Insight")
                    const hasKeyInsight = section.title.toLowerCase().includes("- key insight") || section.title.toLowerCase().includes("key insight");
                    const sectionTitle = section.title.replace(/- Key Insight/gi, "").trim();
                    
                    // Enhanced section detection for Marriage Timing Report
                    const isMarriageTimingReport = type === "marriage-timing";
                    const isMarriageSummarySection = isMarriageTimingReport && section.title.toLowerCase().includes("marriage timing summary");
                    const isDecisionGuidanceSection = (isMarriageTimingReport || type === "career-money") && 
                      (section.title.toLowerCase().includes("what you should focus") || 
                       section.title.toLowerCase().includes("decision guidance") || 
                       section.title.toLowerCase().includes("focus on now"));
                    const isIdealWindowsSection = isMarriageTimingReport && section.title.toLowerCase().includes("ideal marriage window");
                    const isDelayFactorsSection = isMarriageTimingReport && (section.title.toLowerCase().includes("delay") || section.title.toLowerCase().includes("potential delay"));
                    
                    // Enhanced section detection for Career & Money Report
                    const isCareerMoneyReport = type === "career-money";
                    const isCareerMoneySummarySection = isCareerMoneyReport && section.title.toLowerCase().includes("career & money summary");
                    const isCareerMomentumSection = isCareerMoneyReport && section.title.toLowerCase().includes("career momentum");
                    const isMoneyGrowthSection = isCareerMoneyReport && (section.title.toLowerCase().includes("money growth") || section.title.toLowerCase().includes("financial growth"));
                    const isCareerDirectionSection = isCareerMoneyReport && (section.title.toLowerCase().includes("career direction") || section.title.toLowerCase().includes("best career"));
                    
                    const isMajorSection = idx === 0 || 
                      section.title.toLowerCase().includes("personality") || 
                      section.title.toLowerCase().includes("marriage") || 
                      section.title.toLowerCase().includes("career") || 
                      section.title.toLowerCase().includes("money") ||
                      isDecisionGuidanceSection ||
                      isIdealWindowsSection ||
                      isCareerMomentumSection ||
                      isMoneyGrowthSection ||
                      isCareerDirectionSection;
                    
                    // Skip summary sections if we already displayed them above
                    if (isMarriageSummarySection || isCareerMoneySummarySection) {
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
                    isDelayFactorsSection ? "bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-300" :
                    isCareerMomentumSection ? "bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-300 shadow-sm" :
                    isMoneyGrowthSection ? "bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-300 shadow-sm" :
                    isCareerDirectionSection ? "bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border-2 border-purple-300 shadow-sm" :
                    isMajorSection ? "bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 rounded-xl border border-slate-200" : ""
                  }`}>
                      <div className="flex items-start gap-3 mb-4">
                        {(isMajorSection || isDecisionGuidanceSection || isIdealWindowsSection || isDelayFactorsSection || isCareerMomentumSection || isMoneyGrowthSection || isCareerDirectionSection) && (
                          <div className="text-xl sm:text-2xl mt-1">
                          {isDecisionGuidanceSection ? "✅" :
                           isCareerMomentumSection ? "📈" :
                           isMoneyGrowthSection ? "💰" :
                           isCareerDirectionSection ? "🎯" :
                           isIdealWindowsSection ? "🕒" :
                           isDelayFactorsSection ? "⚠️" :
                           section.title.toLowerCase().includes("personality") ? "👤" :
                           section.title.toLowerCase().includes("marriage") ? "💑" :
                           section.title.toLowerCase().includes("career") ? "💼" :
                           section.title.toLowerCase().includes("money") ? "💰" : "📊"}
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
                            isMoneyGrowthSection ? "p-2 bg-white/30 rounded" : ""
                          }`}>
                            <span className={`mt-1 ${
                              isDecisionGuidanceSection ? "text-emerald-600" : 
                              isCareerMomentumSection ? "text-blue-600" :
                              isMoneyGrowthSection ? "text-green-600" :
                              isCareerDirectionSection ? "text-purple-600" :
                              isIdealWindowsSection ? "text-pink-600" : 
                              "text-amber-700"
                            }`}>
                              {isDecisionGuidanceSection ? "✓" : 
                               isCareerMomentumSection ? "→" :
                               "•"}
                            </span>
                            <span className={`${
                              isDecisionGuidanceSection ? "font-medium" : 
                              isCareerMomentumSection ? "font-medium" :
                              isMoneyGrowthSection ? "font-medium" : ""
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
            {isPaidReport && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleDownloadPDF}
                  disabled={downloadingPDF}
                  className="cosmic-button px-4 sm:px-6 py-3 text-sm sm:text-base min-h-[44px]"
                >
                  {downloadingPDF ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">📄</span>
                      <span>Generating PDF...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>📥</span>
                      <span>Download Personal PDF (Keep Forever)</span>
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

