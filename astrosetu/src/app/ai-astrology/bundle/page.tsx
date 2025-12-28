"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AIHeader } from "@/components/ai-astrology/AIHeader";
import { AIFooter } from "@/components/ai-astrology/AIFooter";
import { REPORT_PRICES, BUNDLE_PRICES } from "@/lib/ai-astrology/payments";
import type { ReportType } from "@/lib/ai-astrology/types";
import Link from "next/link";

type BundleType = "any-2" | "all-3";

// Only paid reports are available for bundles (excludes "life-summary" which is free)
type PaidReportType = Exclude<ReportType, "life-summary" | "daily-guidance">;

const AVAILABLE_REPORTS: { type: PaidReportType; name: string; description: string }[] = [
  {
    type: "marriage-timing",
    name: "Marriage Timing Report",
    description: "Ideal marriage windows, compatibility, and remedies",
  },
  {
    type: "career-money",
    name: "Career & Money Report",
    description: "Career direction, timing, and financial phases",
  },
  {
    type: "full-life",
    name: "Full Life Report",
    description: "Comprehensive analysis covering all aspects of life",
  },
  {
    type: "year-analysis",
    name: "Year Analysis Report",
    description: "12-month strategic guidance with quarterly breakdown",
  },
  {
    type: "major-life-phase",
    name: "3-5 Year Strategic Life Phase Report",
    description: "Strategic outlook with major transitions and opportunities",
  },
  {
    type: "decision-support",
    name: "Decision Support Report",
    description: "Astrological guidance for major life decisions",
  },
];

function BundleSelectionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bundleType = (searchParams.get("type") as BundleType) || "any-2";
  const [selectedReports, setSelectedReports] = useState<PaidReportType[]>([]);

  const handleReportToggle = (reportType: PaidReportType) => {
    if (bundleType === "all-3") {
      // For all-3 bundle, we use fixed reports: marriage-timing, career-money, full-life
      return;
    }

    setSelectedReports((prev) => {
      if (prev.includes(reportType)) {
        return prev.filter((t) => t !== reportType);
      } else if (prev.length < 2) {
        return [...prev, reportType];
      } else {
        // Replace the first selected report
        return [prev[1], reportType];
      }
    });
  };

  const handleContinue = () => {
    if (bundleType === "all-3") {
      // For all-3, use fixed reports
      const bundleReports = ["marriage-timing", "career-money", "full-life"] as PaidReportType[];
      const reportsParam = bundleReports.join(",");
      router.push(`/ai-astrology/input?bundle=all-3&reports=${reportsParam}`);
    } else {
      // For any-2, use selected reports
      if (selectedReports.length !== 2) {
        alert("Please select exactly 2 reports");
        return;
      }
      const reportsParam = selectedReports.join(",");
      router.push(`/ai-astrology/input?bundle=any-2&reports=${reportsParam}`);
    }
  };

  // For all-3 bundle, show fixed reports
  const bundleReports = bundleType === "all-3" 
    ? ["marriage-timing", "career-money", "full-life"] as PaidReportType[]
    : selectedReports;

  const bundleInfo = bundleType === "all-3" ? BUNDLE_PRICES["all-3"] : BUNDLE_PRICES["any-2"];
  const canContinue = bundleType === "all-3" || selectedReports.length === 2;

  return (
    <div className="min-h-screen flex flex-col">
      <AIHeader />
      <main className="flex-1 cosmic-bg">
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-800">
              {bundleType === "all-3" ? "All 3 Reports Bundle" : "Any 2 Reports Bundle"}
            </h1>
            <p className="text-slate-600 text-lg">
              {bundleType === "all-3" 
                ? "Get all premium reports in one comprehensive package"
                : "Choose any 2 premium reports and save 15%"}
            </p>
          </div>

          {/* Bundle Summary Card */}
          <Card className="cosmic-card mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    {bundleType === "all-3" ? "All 3 Reports Bundle" : "Any 2 Reports Bundle"}
                  </h2>
                  <p className="text-slate-600">
                    {bundleType === "all-3" 
                      ? "Marriage Timing + Career & Money + Full Life Reports"
                      : "Select 2 reports to include in your bundle"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-700">
                    AU${(bundleInfo.amount / 100).toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-500 line-through">
                    AU${(bundleInfo.individualTotal / 100).toFixed(2)}
                  </div>
                  <div className="text-sm font-semibold text-green-600 mt-1">
                    Save AU${(bundleInfo.savings / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Selection */}
          <Card className="cosmic-card">
            <CardHeader 
              eyebrow={bundleType === "all-3" ? "Included Reports" : "Select 2 Reports"}
              title={bundleType === "all-3" ? "All 3 Reports Included" : "Choose Your Reports"}
            />
            <CardContent className="p-6">
              {bundleType === "all-3" ? (
                <div className="space-y-4">
                  {AVAILABLE_REPORTS.filter(r => 
                    ["marriage-timing", "career-money", "full-life"].includes(r.type)
                  ).map((report) => (
                    <div
                      key={report.type}
                      className="p-4 rounded-lg border-2 border-purple-300 bg-purple-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-800 mb-1">{report.name}</h3>
                          <p className="text-sm text-slate-600">{report.description}</p>
                        </div>
                        <div className="ml-4">
                          <span className="text-purple-600 font-bold">✓ Included</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {AVAILABLE_REPORTS.map((report) => {
                    const isSelected = selectedReports.includes(report.type);
                    const isDisabled = !isSelected && selectedReports.length >= 2;

                    return (
                      <button
                        key={report.type}
                        onClick={() => handleReportToggle(report.type)}
                        disabled={isDisabled}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50"
                            : isDisabled
                            ? "border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed"
                            : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800 mb-1">{report.name}</h3>
                            <p className="text-sm text-slate-600">{report.description}</p>
                            <p className="text-sm text-slate-500 mt-1">
                              AU${(REPORT_PRICES[report.type].amount / 100).toFixed(2)}
                            </p>
                          </div>
                          <div className="ml-4">
                            {isSelected ? (
                              <span className="text-emerald-600 font-bold text-lg">✓</span>
                            ) : (
                              <span className="text-slate-400 text-lg">○</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {selectedReports.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Selected:</strong> {selectedReports.length} of 2 reports
                        {selectedReports.length === 2 && " - Ready to continue!"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 flex gap-4">
                <Link href="/ai-astrology" className="flex-1">
                  <Button className="w-full" variant="secondary">
                    Back
                  </Button>
                </Link>
                <Button
                  className="flex-1 cosmic-button bg-purple-600 hover:bg-purple-700"
                  onClick={handleContinue}
                  disabled={!canContinue}
                >
                  {bundleType === "all-3" ? "Continue to Input" : selectedReports.length === 2 ? "Continue to Input" : `Select ${2 - selectedReports.length} more`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <AIFooter />
    </div>
  );
}

export default function BundleSelectionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <AIHeader />
        <main className="flex-1 cosmic-bg">
          <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">🌙</div>
              <p className="text-slate-600">Loading...</p>
            </div>
          </div>
        </main>
        <AIFooter />
      </div>
    }>
      <BundleSelectionPageContent />
    </Suspense>
  );
}

