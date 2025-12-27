/**
 * AI Astrology Preview Page
 * Displays free Life Summary or preview of paid reports
 */

"use client";

import { useState, useEffect, Suspense } from "react";
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

  useEffect(() => {
    // Check if sessionStorage is available
    if (typeof window === "undefined") return;
    
    try {
      // Get input from sessionStorage
      const savedInput = sessionStorage.getItem("aiAstrologyInput");
      const savedReportType = sessionStorage.getItem("aiAstrologyReportType") as ReportType;
      const paymentVerified = sessionStorage.getItem("aiAstrologyPaymentVerified") === "true";

      if (!savedInput) {
        router.push("/ai-astrology/input");
        return;
      }

      const inputData = JSON.parse(savedInput);
      const reportTypeToUse = savedReportType || "life-summary";
      
      setInput(inputData);
      setReportType(reportTypeToUse);
      setPaymentVerified(paymentVerified);

      // Check if payment is required
      const isPaidReport = reportTypeToUse !== "life-summary";
      
      if (isPaidReport && !paymentVerified) {
        // Don't generate report, show payment prompt instead
        setLoading(false);
        return;
      }
      
      // Auto-generate report
      generateReport(inputData, reportTypeToUse);
    } catch (e) {
      // Handle JSON parse errors or sessionStorage errors (e.g., private browsing mode)
      console.error("Error accessing sessionStorage or parsing saved input:", e);
      router.push("/ai-astrology/input");
    }
  }, [router]);

  const generateReport = async (inputData: AIAstrologyInput, type: ReportType) => {
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
  };

  const isPaidReport = reportType !== "life-summary";
  const needsPayment = isPaidReport && !paymentVerified;

  const getReportName = (type: ReportType | null) => {
    switch (type) {
      case "marriage-timing":
        return "Marriage Timing Report";
      case "career-money":
        return "Career & Money Report";
      case "full-life":
        return "Full Life Report";
      default:
        return "Life Summary";
    }
  };

  const handlePurchase = async () => {
    if (!input || !reportType) return;

    try {
      setLoading(true);
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

      // Redirect to Stripe checkout
      if (response.data?.url) {
        window.location.href = response.data.url;
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
    const price = REPORT_PRICES[reportType as keyof typeof REPORT_PRICES];
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

  // Calculate content gating for free reports
  const sections = reportContent.sections || [];
  const shouldGateContent = !isPaidReport && sections.length > 0;
  const gateAfterSection = shouldGateContent ? Math.max(1, Math.floor(sections.length * 0.3)) : sections.length;
  const visibleSections = shouldGateContent ? sections.slice(0, gateAfterSection) : sections;
  const gatedSections = shouldGateContent ? sections.slice(gateAfterSection) : [];

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
            <span>{reportContent.title}</span>
            <span>•</span>
            <span>Fully automated</span>
            <span>•</span>
            <span>No live support</span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">{reportContent.title}</h1>
                {!isPaidReport && (
                  <Badge tone="green" className="text-sm">FREE</Badge>
                )}
              </div>
              <p className="text-slate-600">
                Generated for {input.name} • {new Date().toLocaleDateString()}
              </p>
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
                      <span>Download PDF</span>
                    </span>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    const mailtoLink = `mailto:?subject=${encodeURIComponent(reportContent.title)}&body=${encodeURIComponent(`Check out my ${reportContent.title} from AstroSetu AI Astrology`)}`;
                    window.open(mailtoLink);
                  }}
                  className="cosmic-button-secondary px-6 py-3"
                >
                  <span className="flex items-center gap-2">
                    <span>✉️</span>
                    <span>Email Me a Copy</span>
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
                          <div className="font-bold text-slate-800 mb-1">See My Marriage Timing</div>
                          <div className="text-sm text-amber-700 font-semibold">AU$0.01 (incl. GST)</div>
                        </div>
                      </Link>
                      <Link href="/ai-astrology/input?reportType=career-money" className="block">
                        <div className="p-4 bg-white rounded-lg border-2 border-slate-300 hover:border-amber-400 hover:shadow-md transition-all">
                          <div className="font-bold text-slate-800 mb-1">See My Career & Money</div>
                          <div className="text-sm text-slate-600 font-semibold">AU$0.01 (incl. GST)</div>
                        </div>
                      </Link>
                    </div>

                    {/* Best Value - Full Life Report */}
                    <Link href="/ai-astrology/input?reportType=full-life" className="block mb-6">
                      <div className="p-5 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg border-2 border-purple-400 hover:border-purple-500 hover:shadow-lg transition-all relative">
                        <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          BEST VALUE
                        </div>
                        <div className="font-bold text-slate-800 mb-1 text-lg">See My Full Life Report</div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-lg font-bold text-purple-700">AU$0.01</span>
                        </div>
                        <div className="text-xs text-slate-700">(incl. GST) • Most comprehensive</div>
                      </div>
                    </Link>

                    {/* Trust Strip */}
                    <div className="pt-6 border-t border-amber-300">
                      <div className="space-y-2 text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-600">✓</span>
                          <span>Instant access after payment</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-600">✓</span>
                          <span>Downloadable PDF included</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-600">✓</span>
                          <span>Fully automated - no humans</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-600">✓</span>
                          <span>Educational guidance only</span>
                        </div>
                      </div>
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
            <Card className="cosmic-card mb-6">
              <CardContent className="p-8">
                {/* Summary */}
                {reportContent.summary && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <h2 className="text-xl font-bold mb-3 text-amber-900">Summary</h2>
                    <p className="text-slate-700 leading-relaxed">{reportContent.summary}</p>
                  </div>
                )}

                {/* Sections */}
                <div className="space-y-8">
                  {visibleSections.map((section, idx) => (
                <div key={idx} className="border-b border-slate-200 last:border-0 pb-8 last:pb-0">
                  <h2 className="text-2xl font-bold mb-4 text-slate-800">{section.title}</h2>
                  
                  {section.content && (
                    <div className="prose prose-slate max-w-none mb-4">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{section.content}</p>
                    </div>
                  )}

                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {section.bullets.map((bullet, bulletIdx) => (
                        <li key={bulletIdx} className="flex items-start gap-3">
                          <span className="text-amber-700 mt-1">•</span>
                          <span className="text-slate-700">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.subsections && section.subsections.length > 0 && (
                    <div className="ml-6 mt-4 space-y-4">
                      {section.subsections.map((subsection, subIdx) => (
                        <div key={subIdx}>
                          <h3 className="text-lg font-semibold mb-2 text-slate-800">{subsection.title}</h3>
                          {subsection.content && (
                            <p className="text-slate-700">{subsection.content}</p>
                          )}
                          {subsection.bullets && (
                            <ul className="space-y-1 mt-2">
                              {subsection.bullets.map((bullet, bulletIdx) => (
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
                </div>
              ))}
            </div>

            {/* Visual Gating - Blur Overlay for Free Reports */}
            {shouldGateContent && gatedSections.length > 0 && (
                  <div className="relative mt-8">
                    {/* Blurred Preview of Gated Content */}
                    <div className="relative blur-sm opacity-50 pointer-events-none" style={{ maxHeight: '400px', overflow: 'hidden' }}>
                      {gatedSections.slice(0, 1).map((section, idx) => (
                        <div key={`gated-${idx}`} className="border-b border-slate-200 pb-8 mb-8">
                          <h2 className="text-2xl font-bold mb-4 text-slate-800">{section.title}</h2>
                          {section.content && (
                            <div className="prose prose-slate max-w-none mb-4">
                              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{section.content.substring(0, 200)}...</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Overlay CTA Card */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <Card className="cosmic-card border-purple-400 bg-white shadow-2xl max-w-lg mx-4">
                        <CardContent className="p-8 text-center">
                          <div className="text-5xl mb-4">🔒</div>
                          <h3 className="text-2xl font-bold mb-3 text-slate-800">Unlock the Full Interpretation</h3>
                          <p className="text-slate-600 mb-6">
                            Get complete insights including:
                          </p>
                          <ul className="text-left space-y-2 mb-6 text-slate-700">
                            <li>• Marriage timing windows</li>
                            <li>• Career & money cycles</li>
                            <li>• Actionable guidance & remedies</li>
                            <li>• Full life predictions & more</li>
                          </ul>

                          {/* Trust Strip */}
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                              <div className="flex items-center gap-1">
                                <span className="text-emerald-600">✓</span>
                                <span>Instant access</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-emerald-600">✓</span>
                                <span>Downloadable PDF</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-emerald-600">✓</span>
                                <span>Fully automated</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-emerald-600">✓</span>
                                <span>No humans</span>
                              </div>
                            </div>
                          </div>

                          {/* CTA Buttons */}
                          <div className="space-y-3">
                            <Link href="/ai-astrology/input?reportType=full-life" className="block">
                              <Button className="w-full cosmic-button py-4 text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-2 border-purple-700">
                                <span className="flex items-center justify-center gap-2">
                                  <span>See My Full Life Report</span>
                                  <span className="bg-white/20 px-2 py-1 rounded text-sm">AU$0.01</span>
                                </span>
                                <div className="text-sm font-normal mt-1">Best Value</div>
                              </Button>
                            </Link>
                            <div className="grid grid-cols-2 gap-3">
                              <Link href="/ai-astrology/input?reportType=marriage-timing" className="block">
                                <Button className="w-full cosmic-button py-3 bg-amber-600 hover:bg-amber-700 border-2 border-amber-700">
                                  See My Marriage Timing
                                  <div className="text-xs font-normal mt-1">AU$0.01</div>
                                </Button>
                              </Link>
                              <Link href="/ai-astrology/input?reportType=career-money" className="block">
                                <Button className="w-full cosmic-button-secondary py-3 border-2 border-slate-400 hover:border-amber-500">
                                  See My Career & Money
                                  <div className="text-xs font-normal mt-1">AU$0.01</div>
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          {/* Key Insights */}
            {reportContent.keyInsights && reportContent.keyInsights.length > 0 && (
              <Card className="cosmic-card border-amber-200 mb-6 bg-gradient-to-r from-amber-50 to-orange-50">
                <CardHeader title="Key Insights" />
                <CardContent>
                  <ul className="space-y-2">
                    {reportContent.keyInsights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-amber-600 mt-1">✨</span>
                        <span className="text-amber-900">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Additional CTA Section for Paid Reports */}
            {isPaidReport && (
              <div className="text-center">
                <Link href="/ai-astrology">
                  <Button className="cosmic-button-secondary px-8">
                    Get Another Report
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <Card className="mt-8 cosmic-card border-amber-200 bg-amber-50/50">
          <CardContent className="p-6">
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-center mb-3">⚠️ Important Disclaimer</h3>
              <div className="text-sm text-slate-700 space-y-2">
                <p>
                  <strong>Educational Guidance Only:</strong> This report is generated by AI for educational and entertainment purposes only. 
                  It provides astrological guidance based on traditional calculations, not absolute predictions or certainties.
                </p>
                <p>
                  <strong>Not Professional Advice:</strong> This report should not be used as a substitute for professional medical, legal, 
                  financial, or psychological advice. Always consult qualified professionals for important life decisions.
                </p>
                <p>
                  <strong>No Guarantees:</strong> Results are based on astrological calculations and AI interpretation. 
                  Astrology is not a science and cannot predict future events with certainty.
                </p>
                <p>
                  <strong>Fully Automated Platform:</strong> This platform is 100% automated. No human astrologers review or modify reports. 
                  No live support is available. For questions, please see our <Link href="/ai-astrology/faq" className="text-amber-700 hover:text-amber-800 underline font-semibold">FAQ page</Link>.
                </p>
                <p className="pt-2 border-t border-amber-200">
                  <strong>No Refunds:</strong> All digital reports are final sale. Once purchased, reports cannot be refunded or returned.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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

