import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { generateSEOMetadata } from "@/lib/seo";

export const metadata: Metadata = generateSEOMetadata({
  title: "2026 Astrology Year Analysis – What This Year Means for You | AstroSetu AI",
  description: "Get your personalized 2026 astrology year analysis. Discover career opportunities, marriage timing, financial forecasts, and health cycles for the year ahead. AI-powered Vedic astrology insights.",
  keywords: [
    "2026 astrology year analysis",
    "yearly astrology report 2026",
    "annual horoscope analysis",
    "astrology forecast 2026",
    "yearly prediction astrology",
    "2026 astrological forecast",
    "annual astrology reading"
  ],
  type: "article",
  image: "/og-year-analysis-2026.jpg",
  url: "/ai-astrology/year-analysis-2026",
});

export default function YearAnalysis2026Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <nav className="mb-6 text-sm text-slate-600">
          <Link href="/" className="hover:text-purple-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/ai-astrology" className="hover:text-purple-600">AI Astrology</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">2026 Year Analysis</span>
        </nav>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            2026 Astrology Year Analysis – What This Year Means for You
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Discover what 2026 holds for your career, relationships, finances, and health. Get personalized insights based on your unique birth chart.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-purple-200 mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Get Your Personal 2026 Year Analysis
          </h2>
          <p className="text-lg text-slate-600 mb-6">
            Discover what 2026 holds for your career, relationships, finances, and health. 
            Get instant insights based on your unique birth chart - no appointment needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/ai-astrology/input?reportType=year-analysis">
              <Button className="cosmic-button px-8 py-4 text-lg">
                Get Your 2026 Year Analysis →
              </Button>
            </Link>
            <Link href="/ai-astrology/input?reportType=life-summary">
              <Button variant="secondary" className="px-8 py-4 text-lg">
                Try Free Life Summary First
              </Button>
            </Link>
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Coming Soon</h2>
            <p className="text-slate-600">
              Full content for this page is being developed. This page will include detailed information about 2026 year analysis, 
              including career opportunities, marriage timing, financial forecasts, and health cycles.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
