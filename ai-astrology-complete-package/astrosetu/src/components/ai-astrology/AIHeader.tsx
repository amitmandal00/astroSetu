/**
 * AI Astrology Section Header
 * Premium, autonomous header with no human support elements
 * Mobile-first, clean design
 */

"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useMemo, Suspense } from "react";

function AIHeaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Determine the best redirect URL based on current context
  const generateReportUrl = useMemo(() => {
    // If we're on the input page, check if there's a reportType in URL
    if (pathname === "/ai-astrology/input") {
      const reportType = searchParams.get("reportType");
      if (reportType) {
        // Stay on the same report type input page
        return `/ai-astrology/input?reportType=${encodeURIComponent(reportType)}`;
      }
      // If no reportType, default to free life summary
      return "/ai-astrology/input?reportType=life-summary";
    }
    
    // If we're on the preview page, check if there's a reportType in URL
    if (pathname === "/ai-astrology/preview") {
      const reportType = searchParams.get("reportType");
      if (reportType && reportType !== "life-summary") {
        // Redirect to input page for the same report type
        return `/ai-astrology/input?reportType=${encodeURIComponent(reportType)}`;
      }
      // Default to free life summary
      return "/ai-astrology/input?reportType=life-summary";
    }
    
    // If we're on a bundle page, redirect to bundle selection
    if (pathname === "/ai-astrology/bundle") {
      const bundleType = searchParams.get("type");
      if (bundleType) {
        return `/ai-astrology/bundle?type=${encodeURIComponent(bundleType)}`;
      }
      return "/ai-astrology/bundle?type=any-2";
    }
    
    // If we're on the main AI astrology page, show report selection
    // Default to free life summary for best user experience
    if (pathname === "/ai-astrology" || pathname === "/") {
      return "/ai-astrology/input?reportType=life-summary";
    }
    
    // For any other page, default to free life summary
    return "/ai-astrology/input?reportType=life-summary";
  }, [pathname, searchParams]);
  
  // Determine button text based on context
  const buttonText = useMemo(() => {
    if (pathname === "/ai-astrology/input") {
      return { desktop: "Generate Report", mobile: "Start" };
    }
    if (pathname === "/ai-astrology/preview") {
      return { desktop: "New Report", mobile: "New" };
    }
    return { desktop: "Generate Report", mobile: "Start" };
  }, [pathname]);

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <Link href="/ai-astrology" className="flex items-center gap-2 sm:gap-3 group min-h-[44px]">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-white text-lg sm:text-xl font-bold">★</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold text-slate-900">AstroSetu AI</span>
                <span className="text-xs text-slate-500 hidden sm:block">Automated Astrology Reports</span>
              </div>
            </Link>

            {/* CTA Button - Context-aware redirect */}
            <Link href={generateReportUrl}>
              <Button className="cosmic-button px-3 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold min-h-[44px] whitespace-nowrap">
                <span className="hidden sm:inline">{buttonText.desktop}</span>
                <span className="sm:hidden">{buttonText.mobile}</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Sub-header Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200/50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-amber-800">
            <span className="font-medium">Educational guidance only</span>
            <span className="text-amber-600 hidden sm:inline">•</span>
            <span className="font-medium">Fully automated</span>
            <span className="text-amber-600 hidden sm:inline">•</span>
            <span className="font-medium">No live support</span>
          </div>
        </div>
      </div>
    </>
  );
}

export function AIHeader() {
  return (
    <Suspense fallback={
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/ai-astrology" className="flex items-center gap-2 sm:gap-3 group min-h-[44px]">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                <span className="text-white text-lg sm:text-xl font-bold">★</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold text-slate-900">AstroSetu AI</span>
                <span className="text-xs text-slate-500 hidden sm:block">Automated Astrology Reports</span>
              </div>
            </Link>
            <Link href="/ai-astrology/input?reportType=life-summary">
              <Button className="cosmic-button px-3 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold min-h-[44px] whitespace-nowrap">
                <span className="hidden sm:inline">Generate Report</span>
                <span className="sm:hidden">Start</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>
    }>
      <AIHeaderContent />
    </Suspense>
  );
}

