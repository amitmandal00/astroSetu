/**
 * AI Astrology Section Header
 * Premium, autonomous header with no human support elements
 * Mobile-first, clean design
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function AIHeader() {
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

            {/* CTA Button */}
            <Link href="/ai-astrology/input?reportType=life-summary">
              <Button className="cosmic-button px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold min-h-[44px]">
                <span className="hidden sm:inline">Generate Report</span>
                <span className="sm:hidden">Generate</span>
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

