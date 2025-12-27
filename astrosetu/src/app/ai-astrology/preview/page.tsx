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

function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [input, setInput] = useState<AIAstrologyInput | null>(null);
  const [reportType, setReportType] = useState<ReportType>("life-summary");
  const [reportContent, setReportContent] = useState<ReportContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    // Get input from sessionStorage
    const savedInput = sessionStorage.getItem("aiAstrologyInput");
    const savedReportType = sessionStorage.getItem("aiAstrologyReportType") as ReportType;
    const paymentVerified = sessionStorage.getItem("aiAstrologyPaymentVerified") === "true";

    if (!savedInput) {
      router.push("/ai-astrology/input");
      return;
    }

    try {
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
      console.error("Error parsing saved input:", e);
      router.push("/ai-astrology/input");
    }
  }, [router]);

  const generateReport = async (inputData: AIAstrologyInput, type: ReportType) => {
    setLoading(true);
    setError(null);

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
        reportType: type,
      });

      if (!response.ok) {
        throw new Error(response.error || "Failed to generate report");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-2 border-red-200 bg-white">
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-4 text-red-700">Error Generating Report</h2>
              <p className="text-slate-600 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => window.location.reload()}>Try Again</Button>
                <Link href="/ai-astrology/input">
                  <Button variant="secondary">Start Over</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!reportContent || !input) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/ai-astrology" className="text-sm text-purple-600 hover:text-purple-700 mb-4 inline-block">
            ← Back to AI Astrology
          </Link>
          <div className="flex items-center justify-center gap-3 mb-3">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">{reportContent.title}</h1>
            {!isPaidReport && (
              <Badge tone="green" className="text-sm">FREE</Badge>
            )}
          </div>
          <p className="text-slate-600">
            Generated for {input.name} • {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Report Content */}
        <Card className="bg-white shadow-lg border-2 border-purple-200 mb-6">
          <CardContent className="p-8">
            {/* Summary */}
            {reportContent.summary && (
              <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                <h2 className="text-xl font-bold mb-3 text-purple-900">Summary</h2>
                <p className="text-slate-700 leading-relaxed">{reportContent.summary}</p>
              </div>
            )}

            {/* Sections */}
            <div className="space-y-8">
              {reportContent.sections.map((section, idx) => (
                <div key={idx} className="border-b border-slate-200 last:border-0 pb-8 last:pb-0">
                  <h2 className="text-2xl font-bold mb-4 text-slate-900">{section.title}</h2>
                  
                  {section.content && (
                    <div className="prose prose-slate max-w-none mb-4">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{section.content}</p>
                    </div>
                  )}

                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {section.bullets.map((bullet, bulletIdx) => (
                        <li key={bulletIdx} className="flex items-start gap-3">
                          <span className="text-purple-600 mt-1">•</span>
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
          </CardContent>
        </Card>

        {/* Key Insights */}
        {reportContent.keyInsights && reportContent.keyInsights.length > 0 && (
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 mb-6">
            <CardHeader>
              <h2 className="text-xl font-bold text-amber-900">Key Insights</h2>
            </CardHeader>
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

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isPaidReport && (
            <>
              <Link href="/ai-astrology/input?report=marriage-timing">
                <Button className="bg-purple-600 hover:bg-purple-700 px-8">
                  Get Marriage Timing Report ($29) →
                </Button>
              </Link>
              <Link href="/ai-astrology/input?report=career-money">
                <Button className="bg-indigo-600 hover:bg-indigo-700 px-8">
                  Get Career & Money Report ($29) →
                </Button>
              </Link>
              <Link href="/ai-astrology/input?report=full-life">
                <Button variant="secondary" className="px-8">
                  Get Full Life Report ($49) →
                </Button>
              </Link>
            </>
          )}
          {isPaidReport && (
            <Link href="/ai-astrology">
              <Button variant="secondary" className="px-8">
                Get Another Report
              </Button>
            </Link>
          )}
        </div>

        {/* Disclaimer */}
        <Card className="mt-8 bg-slate-50 border-slate-200">
          <CardContent className="p-6">
            <p className="text-xs text-slate-600 text-center">
              <strong>Disclaimer:</strong> This report is generated by AI for educational and entertainment purposes only.
              It should not be used as a substitute for professional advice. Results are based on astrological calculations
              and AI interpretation, and should be taken as guidance rather than absolute predictions.
            </p>
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

