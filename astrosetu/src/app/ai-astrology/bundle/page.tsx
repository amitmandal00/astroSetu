"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { REPORT_PRICES, BUNDLE_PRICES } from "@/lib/ai-astrology/payments";
import type { ReportType } from "@/lib/ai-astrology/types";
import Link from "next/link";

// P1: Bundle Feature Flag (MVP Compliance)
const BUNDLES_ENABLED = process.env.NEXT_PUBLIC_BUNDLES_ENABLED === "true";

type BundleType = "any-2" | "all-3" | "life-decision-pack";

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

  // P1: Bundle Feature Flag Check (MVP Compliance - PATH A)
  if (!BUNDLES_ENABLED) {
    return (
      <div className="cosmic-bg min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <h1 className="text-3xl font-bold text-center mb-4">Bundles Temporarily Paused</h1>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-lg">
              Bundles are temporarily paused for stability improvements. Please purchase single reports instead.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push("/ai-astrology")}
                className="w-full sm:w-auto"
              >
                Browse Single Reports
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/ai-astrology/input")}
                className="w-full sm:w-auto"
              >
                Get Started
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pre-select reports for life-decision-pack
  useEffect(() => {
    if (bundleType === "life-decision-pack" && selectedReports.length === 0) {
      setSelectedReports(["marriage-timing", "career-money", "year-analysis"]);
    }
  }, [bundleType, selectedReports.length]);

  const handleReportToggle = (reportType: PaidReportType) => {
    if (bundleType === "life-decision-pack") {
      // Life decision pack is fixed, don't allow changes
      return;
    }
    const maxSelection = bundleType === "all-3" ? 3 : 2;
    
    setSelectedReports((prev) => {
      if (prev.includes(reportType)) {
        return prev.filter((t) => t !== reportType);
      } else if (prev.length < maxSelection) {
        return [...prev, reportType];
      } else {
        // Replace the first selected report
        return [...prev.slice(1), reportType];
      }
    });
  };

  const handleContinue = () => {
    const requiredCount = bundleType === "life-decision-pack" ? 3 : (bundleType === "all-3" ? 3 : 2);
    
    if (selectedReports.length !== requiredCount) {
      alert(`Please select exactly ${requiredCount} reports`);
      return;
    }
    
    const reportsParam = selectedReports.join(",");
    router.push(`/ai-astrology/input?bundle=${bundleType}&reports=${reportsParam}`);
  };

    const bundleInfo = bundleType === "life-decision-pack" 
      ? BUNDLE_PRICES["life-decision-pack"] 
      : (bundleType === "all-3" ? BUNDLE_PRICES["all-3"] : BUNDLE_PRICES["any-2"]);
    const requiredCount = bundleType === "life-decision-pack" ? 3 : (bundleType === "all-3" ? 3 : 2);
  const canContinue = selectedReports.length === requiredCount;

  return (
    <div className="cosmic-bg">
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-800">
              {bundleType === "life-decision-pack" 
                ? "Complete Life Decision Pack" 
                : bundleType === "all-3" 
                ? "All 3 Reports Bundle" 
                : "Any 2 Reports Bundle"}
            </h1>
            <p className="text-slate-600 text-lg">
              {bundleType === "life-decision-pack"
                ? "Marriage + Career + Year Analysis - Save 25%"
                : bundleType === "all-3" 
                ? "Choose any 3 premium reports and save 25%"
                : "Choose any 2 premium reports and save 15%"}
            </p>
          </div>

          {/* Bundle Summary Card */}
          <Card className="cosmic-card mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    {bundleType === "life-decision-pack" 
                      ? "Complete Life Decision Pack" 
                      : bundleType === "all-3" 
                      ? "All 3 Reports Bundle" 
                      : "Any 2 Reports Bundle"}
                  </h2>
                  <p className="text-slate-600">
                    {bundleType === "life-decision-pack"
                      ? "Marriage Timing + Career & Money + Year Analysis (pre-selected)"
                      : bundleType === "all-3" 
                      ? "Select 3 reports to include in your bundle"
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
              eyebrow={bundleType === "life-decision-pack" ? "Pre-selected Reports" : (bundleType === "all-3" ? "Select 3 Reports" : "Select 2 Reports")}
              title={bundleType === "life-decision-pack" ? "Your Life Decision Pack" : (bundleType === "all-3" ? "Choose Your 3 Reports" : "Choose Your Reports")}
            />
            <CardContent className="p-6">
              <div className="space-y-4">
                {AVAILABLE_REPORTS.map((report) => {
                  const isSelected = selectedReports.includes(report.type);
                  const isDisabled = !isSelected && selectedReports.length >= requiredCount;

                    return (
                      <button
                        key={report.type}
                        onClick={() => handleReportToggle(report.type)}
                        disabled={isDisabled || bundleType === "life-decision-pack"}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50"
                            : (isDisabled || bundleType === "life-decision-pack")
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
                        <strong>Selected:</strong> {selectedReports.length} of {requiredCount} reports
                        {selectedReports.length === requiredCount && " - Ready to continue!"}
                      </p>
                    </div>
                  )}
                </div>

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
                  {selectedReports.length === requiredCount ? "Continue to Input" : `Select ${requiredCount - selectedReports.length} more`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}

export default function BundleSelectionPage() {
  return (
    <Suspense fallback={
      <div className="cosmic-bg">
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">🌙</div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <BundleSelectionPageContent />
    </Suspense>
  );
}

