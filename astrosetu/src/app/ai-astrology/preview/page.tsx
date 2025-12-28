/**
 * AI Astrology Preview Page
 * Displays free Life Summary or preview of paid reports
 */

"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { apiPost, apiGet } from "@/lib/http";
import type { AIAstrologyInput, ReportType } from "@/lib/ai-astrology/types";
import type { ReportContent } from "@/lib/ai-astrology/types";
import { REPORT_PRICES } from "@/lib/ai-astrology/payments";
import { downloadPDF } from "@/lib/ai-astrology/pdfGenerator";

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
  const [refundAcknowledged, setRefundAcknowledged] = useState(false);
  const [emailCopySuccess, setEmailCopySuccess] = useState(false);
  
  // Bundle state
  const [bundleType, setBundleType] = useState<string | null>(null);
  const [bundleReports, setBundleReports] = useState<ReportType[]>([]);
  const [bundleContents, setBundleContents] = useState<Map<ReportType, ReportContent>>(new Map());
  const [bundleGenerating, setBundleGenerating] = useState(false);

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

  const generateReport = useCallback(async (inputData: AIAstrologyInput, type: ReportType) => {
    setLoading(true);
    setError(null);

    try {
      // Get payment token for paid reports (handle sessionStorage errors)
      let paymentToken: string | undefined;
      try {
        paymentToken = sessionStorage.getItem("aiAstrologyPaymentToken") || undefined;
      } catch (storageError) {
        console.error("Failed to read paymentToken from sessionStorage:", storageError);
        // Continue without token - API will return appropriate error
      }
      const isPaid = type !== "life-summary";
      
      // Note: Payment verification is handled server-side
      // In demo mode (development), payment token is not required
      // The API will return appropriate error if payment is required in production

      const response = await apiPost<{
        ok: boolean;
        data?: {
          reportType: ReportType;
          input: AIAstrologyInput;
          content: ReportContent;
          generatedAt: string;
        };
        error?: string;
      }>("/api/ai-astrology/generate-report", {
        input: inputData,
        reportType: type,
        paymentToken: isPaid ? paymentToken : undefined, // Only include for paid reports
      });

      if (!response.ok) {
        // The API already returns user-friendly error messages
        throw new Error(response.error || "Failed to generate report. Please try again.");
      }

      setReportContent(response.data?.content || null);
    } catch (e: any) {
      console.error("Report generation error:", e);
      setError(e.message || "Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const generateBundleReports = useCallback(async (inputData: AIAstrologyInput, reports: ReportType[]) => {
    setBundleGenerating(true);
    setLoading(true);
    setError(null);

    try {
      // Get payment token for paid reports (handle sessionStorage errors)
      let paymentToken: string | undefined;
      try {
        paymentToken = sessionStorage.getItem("aiAstrologyPaymentToken") || undefined;
      } catch (storageError) {
        console.error("Failed to read paymentToken from sessionStorage:", storageError);
      }

      const bundleContentsMap = new Map<ReportType, ReportContent>();
      
      // Generate all reports in the bundle sequentially
      for (const reportType of reports) {
        try {
          const response = await apiPost<{
            ok: boolean;
            data?: {
              reportType: ReportType;
              input: AIAstrologyInput;
              content: ReportContent;
              generatedAt: string;
            };
            error?: string;
          }>("/api/ai-astrology/generate-report", {
            input: inputData,
            reportType: reportType,
            paymentToken: paymentToken,
          });

          if (response.ok && response.data?.content) {
            bundleContentsMap.set(reportType, response.data.content);
          } else {
            console.error(`Failed to generate ${reportType}:`, response.error);
            setError(`Failed to generate ${getReportName(reportType)}. ${response.error || "Please try again."}`);
            break;
          }
        } catch (e: any) {
          console.error(`Error generating ${reportType}:`, e);
          setError(`Failed to generate ${getReportName(reportType)}. ${e.message || "Please try again."}`);
          break;
        }
      }

      if (bundleContentsMap.size === reports.length) {
        setBundleContents(bundleContentsMap);
        // Set the first report as the primary report for display purposes
        setReportContent(bundleContentsMap.get(reports[0]) || null);
        setReportType(reports[0]);
      }
    } catch (e: any) {
      console.error("Bundle generation error:", e);
      setError(e.message || "Failed to generate bundle reports. Please try again.");
    } finally {
      setBundleGenerating(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if sessionStorage is available
    if (typeof window === "undefined") return;
    
    try {
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
      setPaymentVerified(paymentVerified);
      
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
      
      if (isPaidReport && !paymentVerified) {
        // Don't generate report, show payment prompt instead
        setLoading(false);
        return;
      }
      
      // Generate bundle reports or single report
      if (isBundle && savedBundleReports) {
        try {
          const bundleReportsList = JSON.parse(savedBundleReports) as ReportType[];
          generateBundleReports(inputData, bundleReportsList);
        } catch (e) {
          console.error("Failed to parse bundle reports:", e);
          generateReport(inputData, reportTypeToUse);
        }
      } else {
        // Auto-generate single report
        generateReport(inputData, reportTypeToUse);
      }
    } catch (e) {
      // Handle JSON parse errors or sessionStorage errors (e.g., private browsing mode)
      console.error("Error accessing sessionStorage or parsing saved input:", e);
      router.push("/ai-astrology/input");
    }
  }, [router, generateReport, generateBundleReports]);

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
      const success = await downloadPDF(reportContent, input, reportType || "life-summary");
      if (!success) {
        setError("Failed to generate PDF. Please try again.");
      }
    } catch (e: any) {
      console.error("PDF download error:", e);
      setError("Failed to download PDF. Please try again.");
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-2xl w-full mx-4">
          <CardContent className="p-12 text-center">
            <div className="animate-spin text-6xl mb-6">🌙</div>
            <h2 className="text-2xl font-bold mb-4">Generating Your Report...</h2>
            <p className="text-slate-600">
              Our AI is analyzing your birth chart and generating personalized insights.
              This may take a moment.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="cosmic-card border-red-500/30">
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-4 text-red-700">Error Generating Report</h2>
              <p className="text-slate-600 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => window.location.reload()}>Try Again</Button>
                <Link href="/ai-astrology/input">
                  <Button className="cosmic-button-secondary">Start Over</Button>
                </Link>
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
    
    return (
      <div className="cosmic-bg py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="cosmic-card">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Unlock Your {getReportName(reportType)}</h2>
              <p className="text-slate-600 mb-6">
                Get detailed, AI-powered insights for just AU${(price?.amount || 0) / 100} (includes GST).
              </p>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl mb-6 border border-amber-200">
                <div className="text-3xl font-bold text-amber-700 mb-2">
                  AU${((price?.amount || 0) / 100).toFixed(2)}
                  <span className="text-lg font-normal text-amber-600 ml-2">(incl. GST)</span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{price?.description}</p>
                
                {/* What You'll Get */}
                <div className="mt-4 pt-4 border-t border-amber-200">
                  <p className="text-sm font-semibold text-amber-800 mb-2">What you&apos;ll get:</p>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>• Detailed AI-generated analysis</li>
                    <li>• Personalized insights based on your birth chart</li>
                    <li>• Downloadable PDF report</li>
                    <li>• Instant access after payment</li>
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
                {loading ? "Processing..." : `Purchase ${getReportName(reportType)} →`}
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
    // Reduce preview to 30-40% to avoid preview fatigue
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
                        <div className="text-2xl mt-1">
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
                        <h2 className="text-2xl font-bold text-slate-800">{sectionTitle}</h2>
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

                {/* Gated Content Message for Life Summary */}
                {shouldGateContent && gatedSections.length > 0 && (
                  <div className="mt-12 mb-8 p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-4 border-amber-400 shadow-lg">
                    <div className="text-center">
                      <div className="text-5xl mb-4">🔒</div>
                      <h3 className="text-2xl font-bold text-amber-900 mb-3">
                        Unlock the Full Life Summary Report
                      </h3>
                      <p className="text-slate-700 mb-6 leading-relaxed">
                        You&apos;ve viewed {Math.round((visibleSections.length / sections.length) * 100)}% of your report. 
                        Purchase a detailed report to see the remaining {gatedSections.length} section{gatedSections.length > 1 ? 's' : ''} with complete insights.
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
                        {bundleType === "all-3" ? "All 3 Reports Bundle" : "Any 2 Reports Bundle"}
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
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">
                  {bundleType && bundleReports.length > 0 
                    ? `${getReportName(bundleReports[0])} (Part 1 of ${bundleReports.length})`
                    : (reportContent?.title || "AI Astrology Report")}
                </h1>
              </div>
              <p className="text-slate-600 mb-1">
                Prepared exclusively for <strong>{input.name}</strong>
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
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
                  className="cosmic-button px-6 py-3"
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
                  className="cosmic-button-secondary px-6 py-3"
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
          {/* Left Column: Sticky Upgrade Card (30-35%) */}
          {!isPaidReport && (
            <div className="lg:col-span-1">
              <div className="sticky top-24">
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

          {/* Right Column: Report Content (65-70%) */}
          <div className={isPaidReport ? "lg:col-span-3" : "lg:col-span-2"}>
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
                              <div className="text-4xl">
                                {reportTypeInBundle === "marriage-timing" ? "💑" :
                                 reportTypeInBundle === "career-money" ? "💼" :
                                 reportTypeInBundle === "full-life" ? "🌟" :
                                 reportTypeInBundle === "year-analysis" ? "📅" :
                                 reportTypeInBundle === "major-life-phase" ? "🗺️" :
                                 reportTypeInBundle === "decision-support" ? "🎯" : "📊"}
                              </div>
                              <div>
                                <h2 className="text-3xl font-bold text-purple-900 mb-1">
                                  {getReportName(reportTypeInBundle)}
                                </h2>
                                <p className="text-purple-600 text-sm">
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

