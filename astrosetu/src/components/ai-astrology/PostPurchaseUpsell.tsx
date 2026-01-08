"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { REPORT_PRICES, BUNDLE_PRICES } from "@/lib/ai-astrology/payments";

type ReportType = "marriage-timing" | "career-money" | "full-life" | "year-analysis" | "major-life-phase" | "decision-support" | "life-summary";

interface PostPurchaseUpsellProps {
  currentReport: ReportType;
  onClose?: () => void;
}

// Helper to get report name
function getReportName(reportType: ReportType): string {
  const names: Record<ReportType, string> = {
    "life-summary": "Life Summary",
    "marriage-timing": "Marriage Timing",
    "career-money": "Career & Money Path",
    "full-life": "Full Life Report",
    "year-analysis": "Year Analysis",
    "major-life-phase": "Major Life Phase",
    "decision-support": "Decision Support",
  };
  return names[reportType] || reportType;
}

// Smart recommendations based on current report
function getRecommendations(currentReport: ReportType) {
  const recommendations: Array<{
    type: "upgrade" | "related" | "bundle";
    title: string;
    description: string;
    reportType?: ReportType;
    bundleType?: string;
    discount?: string;
    savings?: number;
    cta: string;
    link: string;
  }> = [];

  // Upgrade suggestions
  if (currentReport === "marriage-timing") {
    recommendations.push({
      type: "upgrade",
      title: "Complete Your Journey",
      description: "Get comprehensive life insights including career, health, and relationships",
      reportType: "full-life",
      discount: "20% off",
      cta: "Upgrade to Full Life Report",
      link: `/ai-astrology/input?reportType=full-life`,
    });
  } else if (currentReport === "career-money") {
    recommendations.push({
      type: "upgrade",
      title: "Complete Life Picture",
      description: "Add marriage timing and health insights for complete guidance",
      reportType: "full-life",
      discount: "20% off",
      cta: "Upgrade to Full Life Report",
      link: `/ai-astrology/input?reportType=full-life`,
    });
  }

  // Related report suggestions
  if (currentReport !== "year-analysis") {
    recommendations.push({
      type: "related",
      title: "Plan Your Year Ahead",
      description: "Get quarterly breakdown and strategic planning for the next 12 months",
      reportType: "year-analysis",
      cta: "Add Year Analysis",
      link: `/ai-astrology/input?reportType=year-analysis`,
    });
  }

  if (currentReport !== "marriage-timing") {
    recommendations.push({
      type: "related",
      title: "Discover Marriage Timing",
      description: "Find ideal windows for your wedding and understand delay factors",
      reportType: "marriage-timing",
      cta: "Add Marriage Timing",
      link: `/ai-astrology/input?reportType=marriage-timing`,
    });
  }

  // Bundle recommendations
  if (currentReport === "marriage-timing" || currentReport === "career-money") {
    recommendations.push({
      type: "bundle",
      title: "Complete Life Decision Pack",
      description: "Get all 3 essential reports (Marriage, Career, Full Life) and save big",
      bundleType: "life-decision-pack",
      savings: BUNDLE_PRICES["life-decision-pack"]?.savings || 0,
      cta: "Get Complete Pack",
      link: `/ai-astrology/bundle?type=life-decision-pack`,
    });
  } else {
    recommendations.push({
      type: "bundle",
      title: "Any 2 Reports Bundle",
      description: "Choose any 2 reports and save money",
      bundleType: "any-2",
      savings: BUNDLE_PRICES["any-2"]?.savings || 0,
      cta: "Get 2 Reports Bundle",
      link: `/ai-astrology/bundle?type=any-2`,
    });
  }

  return recommendations.slice(0, 3); // Show max 3 recommendations
}

export function PostPurchaseUpsell({ currentReport, onClose }: PostPurchaseUpsellProps) {
  const [isVisible, setIsVisible] = useState(true);
  const recommendations = getRecommendations(currentReport);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="cosmic-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Enjoying Your {getReportName(currentReport)}?
              </h2>
              <p className="text-slate-600">
                Discover more insights to complete your astrological journey
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 text-2xl"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Recommendations */}
          <div className="space-y-4 mb-6">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  rec.type === "bundle"
                    ? "border-emerald-300 bg-emerald-50"
                    : rec.type === "upgrade"
                    ? "border-purple-300 bg-purple-50"
                    : "border-blue-300 bg-blue-50"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800">{rec.title}</h3>
                      {rec.type === "bundle" && (
                        <Badge className="bg-emerald-600 text-white text-xs">
                          Best Value
                        </Badge>
                      )}
                      {rec.discount && (
                        <Badge className="bg-purple-600 text-white text-xs">
                          {rec.discount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{rec.description}</p>
                    
                    {/* Pricing */}
                    <div className="flex items-center gap-2 mb-3">
                      {rec.reportType && rec.reportType !== "life-summary" && REPORT_PRICES[rec.reportType as keyof typeof REPORT_PRICES] && (
                        <span className="text-lg font-bold text-slate-800">
                          AU${(REPORT_PRICES[rec.reportType as keyof typeof REPORT_PRICES].amount / 100).toFixed(2)}
                        </span>
                      )}
                      {rec.bundleType && BUNDLE_PRICES[rec.bundleType as keyof typeof BUNDLE_PRICES] && (
                        <>
                          <span className="text-lg font-bold text-slate-800">
                            AU${(BUNDLE_PRICES[rec.bundleType as keyof typeof BUNDLE_PRICES].amount / 100).toFixed(2)}
                          </span>
                          {rec.savings && rec.savings > 0 && (
                            <span className="text-sm text-emerald-600 font-semibold">
                              Save AU${(rec.savings / 100).toFixed(2)}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Link href={rec.link} onClick={handleClose}>
                  <Button
                    className={`w-full ${
                      rec.type === "bundle"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : rec.type === "upgrade"
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "cosmic-button"
                    }`}
                  >
                    {rec.cta} →
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 text-center">
            <button
              onClick={handleClose}
              className="text-sm text-slate-500 hover:text-slate-700 underline"
            >
              No thanks, I&apos;m good for now
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

