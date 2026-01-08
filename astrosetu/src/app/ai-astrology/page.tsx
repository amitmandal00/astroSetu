/**
 * AI Astrology Landing Page
 * Light, ethereal cosmic theme with celestial imagery
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AstroImage } from "@/components/ui/AstroImage";
import { ASTRO_IMAGES } from "@/lib/astroImages";
import { REPORT_PRICES, BUNDLE_PRICES } from "@/lib/ai-astrology/payments";
import { generateSEOMetadata, ASTROLOGY_KEYWORDS } from "@/lib/seo";
import { ServiceSchema } from "@/components/seo/StructuredData";

// Force dynamic rendering - prevent static generation and caching
// Ensures changes are reflected immediately after deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = generateSEOMetadata({
  title: "AI-Powered Astrology Reports - Marriage Timing, Career & Life Predictions",
  description: "Get instant AI-powered astrology reports including marriage timing, career guidance, full life predictions, year analysis, and more. Personalized horoscope and kundli insights with automated accuracy.",
  keywords: [
    ...ASTROLOGY_KEYWORDS,
    "marriage timing astrology",
    "career astrology report",
    "life predictions",
    "year analysis",
    "AI horoscope",
    "automated astrology",
  ],
  url: "/ai-astrology",
  type: "website",
});

export default function AIAstrologyLandingPage() {
  return (
    <div className="cosmic-bg">
      {/* Hero Section - Year Analysis as Hero */}
      <div className="relative py-12 sm:py-16 lg:py-20 px-4 overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="bg-purple-700 text-white text-xs sm:text-sm font-extrabold px-4 py-2 border-2 border-purple-800 shadow-lg uppercase tracking-wide mb-4">
              MOST CHOSEN BY USERS
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-slate-800">
              Plan Your Next 12 Months with Precision
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 mb-6 max-w-3xl mx-auto leading-relaxed">
              Year Analysis Report: Quarterly guidance, best timing windows, and strategic planning for the current year.
            </p>
          </div>

          {/* Hero CTA Card */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="cosmic-card rounded-3xl border-4 border-purple-500 bg-gradient-to-br from-purple-100 to-indigo-100 p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                <div className="text-6xl sm:text-7xl lg:text-8xl">📅</div>
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
                    Year Analysis Report
                  </h2>
                  <p className="text-slate-700 mb-4 text-sm sm:text-base">
                    Get quarterly breakdown, best periods for action, caution periods, and a complete year scorecard.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-4">
                    <div>
                      <div className="text-4xl sm:text-5xl font-bold text-purple-700 mb-1">
                        AU${(REPORT_PRICES["year-analysis"].amount / 100).toFixed(2)}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600">One-time • Instant PDF</p>
                    </div>
                    <Link href="/ai-astrology/input?reportType=year-analysis" className="w-full sm:w-auto">
                      <Button className="cosmic-button w-full sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-bold bg-purple-600 hover:bg-purple-700 min-h-[52px]">
                        Get My Year Analysis →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Strip */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✔</span>
                <span>Australian Consumer Law compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✔</span>
                <span>Fully automated – no human bias</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✔</span>
                <span>Transparent policies</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-16">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-amber-700 mb-2">Included in your report</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Personal Horoscopes */}
          <div className="cosmic-card rounded-2xl p-8">
            <div className="relative h-48 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 text-6xl">🌙</div>
                <div className="absolute bottom-4 right-4 text-5xl">⭐</div>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">Personal Horoscopes</h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Discover your core personality traits, strengths, weaknesses, and major life themes. 
              Get insights tailored to your unique birth chart.
            </p>
          </div>

          {/* Love & Relationships */}
          <div className="cosmic-card rounded-2xl p-8">
            <div className="relative h-48 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 text-6xl">💕</div>
                <div className="absolute bottom-4 right-4 text-5xl">❤️</div>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">Love & Relationships</h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Uncover ideal marriage windows, compatibility indicators, and personalized remedies. 
              Your guide to a harmonious partnership.
            </p>
          </div>

          {/* Career & Finance */}
          <div className="cosmic-card rounded-2xl p-8">
            <div className="relative h-48 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 text-6xl">💼</div>
                <div className="absolute bottom-4 right-4 text-5xl">📈</div>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">Career & Finance</h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Navigate your professional journey with clarity. Best career directions, 
              job change timings, and insights into your money growth phases.
            </p>
          </div>
        </div>
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500 italic">
            Hundreds of personalized reports generated instantly using AI.
          </p>
        </div>
      </div>

      {/* Value Proposition */}
      <section id="features" className="relative z-10 py-16 px-4 scroll-mt-20">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">Why AI-First Astrology?</h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-4">
            Leveraging advanced AI and authentic Vedic principles, we provide unbiased, instant, 
            and deeply personalized astrological reports.
          </p>
          <p className="text-lg text-amber-700 font-semibold">
            🤖 100% Automated • No Humans • No Waiting • Available 24/7
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          <div className="cosmic-card rounded-xl p-6 text-center">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Autonomous Insights</h3>
            <p className="text-slate-600">Instant reports, 24/7. No human bias, no waiting lists.</p>
          </div>
          <div className="cosmic-card rounded-xl p-6 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Precision & Clarity</h3>
            <p className="text-slate-600">Complex astrology explained in simple, actionable English.</p>
          </div>
          <div className="cosmic-card rounded-xl p-6 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Private & Secure</h3>
            <p className="text-slate-600">Your birth details are processed securely for your eyes only.</p>
          </div>
        </div>
      </section>

      {/* Report Accuracy Ladder */}
      <section className="relative z-10 py-16 px-4 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-slate-800 mb-4">
            How Accurate Are These Reports?
          </h2>
          <p className="text-center text-base sm:text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
            The more specific your question, the higher the precision. Our reports follow a clear accuracy hierarchy.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
            {/* Level 1 - Life Summary */}
            <div className="cosmic-card rounded-2xl p-6 border-2 border-slate-200">
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">🌟</div>
                <div className="text-2xl mb-2">★★★☆☆</div>
                <div className="text-xs text-slate-500 mb-3">Level 1</div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 text-center">Life Summary</h3>
              <p className="text-sm text-slate-600 mb-3 text-center">General</p>
              <p className="text-xs text-slate-600 text-center">Best for: Understanding personality & direction</p>
            </div>

            {/* Level 2 - Career / Marriage Reports */}
            <div className="cosmic-card rounded-2xl p-6 border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">💼❤️</div>
                <div className="text-2xl mb-2">★★★★☆</div>
                <div className="text-xs text-slate-500 mb-3">Level 2</div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 text-center">Career / Marriage</h3>
              <p className="text-sm text-slate-600 mb-3 text-center">Focused</p>
              <p className="text-xs text-slate-600 text-center">Best for: Timing & preparation</p>
            </div>

            {/* Level 3 - Year Analysis */}
            <div className="cosmic-card rounded-2xl p-6 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50">
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">📅</div>
                <div className="text-2xl mb-2">★★★★★</div>
                <div className="text-xs text-slate-500 mb-3">Level 3</div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 text-center">Year Analysis</h3>
              <p className="text-sm text-slate-600 mb-3 text-center">High Precision</p>
              <p className="text-xs text-slate-600 text-center">Best for: Planning the next 12 months</p>
            </div>

            {/* Level 4 - Decision Reports & Major Life Phase */}
            <div className="cosmic-card rounded-2xl p-6 border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50">
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-2xl mb-2">★★★★★+</div>
                <div className="text-xs text-slate-500 mb-3">Level 4</div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 text-center">Decision Support & Major Life Phase</h3>
              <p className="text-sm text-slate-600 mb-3 text-center">Highest</p>
              <p className="text-xs text-slate-600 text-center">Best for: Specific questions & 3-5 year outlook</p>
            </div>
          </div>

          <div className="cosmic-card rounded-xl p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 max-w-3xl mx-auto">
            <p className="text-sm text-slate-700 text-center italic">
              <strong>The more specific the question, the higher the precision.</strong> General reports provide overviews, 
              while focused reports offer detailed timing and actionable guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Bundle Pricing Section - Moved to Top */}
      <section className="relative z-10 py-16 px-4 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="bg-purple-700 text-white text-sm font-extrabold px-4 py-2 border-2 border-purple-800 shadow-lg uppercase tracking-wide mb-4">
              MOST CHOSEN BY USERS
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">Complete Life Decision Pack</h2>
            <p className="text-center text-base sm:text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
              Get comprehensive insights with our most popular bundle. Save 25% when you buy together.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
            {/* Complete Life Pack - NEW HERO BUNDLE */}
            <div className="cosmic-card rounded-3xl border-4 border-purple-500 bg-gradient-to-br from-purple-100 to-indigo-100 p-8 sm:p-10 shadow-2xl transform scale-105 lg:scale-110 relative z-10">
              <div className="absolute -top-3 -right-3 bg-purple-700 text-white text-xs font-extrabold px-4 py-2 rounded-full z-20 shadow-lg border-2 border-purple-800 uppercase tracking-wide">
                MOST CHOSEN
              </div>
              <Badge className="bg-purple-700 text-white text-sm font-extrabold px-4 py-2 border-2 border-purple-800 shadow-lg uppercase tracking-wide mb-4">LIFE DECISION PACK</Badge>
              <h3 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Marriage + Career + Year Analysis</h3>
              <p className="text-slate-700 mb-6 leading-relaxed text-base sm:text-lg">
                Everything you need to plan your next 12 months: marriage timing, career direction, and strategic year planning.
              </p>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-5xl sm:text-6xl font-bold text-purple-700">
                  AU${(BUNDLE_PRICES["life-decision-pack"].amount / 100).toFixed(2)}
                </span>
                <span className="text-xl text-slate-500 line-through">
                  AU${(BUNDLE_PRICES["life-decision-pack"].individualTotal / 100).toFixed(2)}
                </span>
              </div>
              <p className="text-sm sm:text-base text-purple-700 font-semibold mb-6">
                Save AU${(BUNDLE_PRICES["life-decision-pack"].savings / 100).toFixed(2)} • 3 comprehensive reports
              </p>
              <div className="space-y-3 mb-6 text-sm sm:text-base text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-purple-600 text-xl">✓</span>
                  <span>Marriage Timing Report</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600 text-xl">✓</span>
                  <span>Career & Money Report</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600 text-xl">✓</span>
                  <span>Year Analysis Report (12-month planning)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600 text-xl">✓</span>
                  <span>Instant PDF delivery for all 3 reports</span>
                </div>
              </div>
              <Link href="/ai-astrology/bundle?type=life-decision-pack" className="block">
                <Button className="cosmic-button w-full bg-purple-600 hover:bg-purple-700 py-5 text-lg sm:text-xl font-bold min-h-[56px]">
                  Get Complete Life Decision Pack →
                </Button>
              </Link>
            </div>

            {/* All 3 Reports Bundle */}
            <div className="cosmic-card rounded-2xl border-2 border-purple-400 bg-gradient-to-br from-purple-50 to-indigo-50 p-8">
              <Badge className="bg-purple-700 text-white text-sm font-extrabold px-4 py-1.5 border-2 border-purple-800 shadow-lg uppercase tracking-wide mb-4">BEST VALUE - SAVE 25%</Badge>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">All 3 Reports Bundle</h3>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Get all premium reports in one comprehensive package. Maximum savings for complete life insights.
              </p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-purple-700">
                  AU${(BUNDLE_PRICES["all-3"].amount / 100).toFixed(2)}
                </span>
                <span className="text-lg text-slate-500 line-through">
                  AU${(BUNDLE_PRICES["all-3"].individualTotal / 100).toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-purple-700 font-semibold mb-6">
                Save AU${(BUNDLE_PRICES["all-3"].savings / 100).toFixed(2)} when buying all together
              </p>
              <div className="space-y-2 mb-6 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>Marriage Timing Report</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>Career & Money Report</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>Full Life Report</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>Instant PDF delivery</span>
                </div>
              </div>
              <Link href="/ai-astrology/bundle?type=all-3" className="block">
                <Button className="cosmic-button w-full bg-purple-600 hover:bg-purple-700">
                  Get All 3 Reports →
                </Button>
              </Link>
            </div>
          </div>

          {/* Any 2 Reports Bundle */}
          <div className="max-w-2xl mx-auto">
            <div className="cosmic-card rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-8">
              <Badge className="bg-emerald-700 text-white text-sm font-extrabold px-4 py-1.5 border-2 border-emerald-800 shadow-lg uppercase tracking-wide mb-4">SAVE 15%</Badge>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Any 2 Reports Bundle</h3>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Choose any 2 premium reports and save 15%. Perfect for focusing on marriage timing and career together.
              </p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-emerald-700">
                  AU${(BUNDLE_PRICES["any-2"].amount / 100).toFixed(2)}
                </span>
                <span className="text-lg text-slate-500 line-through">
                  AU${(BUNDLE_PRICES["any-2"].individualTotal / 100).toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-emerald-700 font-semibold mb-6">
                Save AU${(BUNDLE_PRICES["any-2"].savings / 100).toFixed(2)} when buying together
              </p>
              <Link href="/ai-astrology/bundle?type=any-2" className="block">
                <Button className="cosmic-button w-full bg-emerald-600 hover:bg-emerald-700">
                  Get 2 Reports Bundle →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Ladder Section - Why Reports Feel Accurate */}
      <section className="relative z-10 py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-slate-800 mb-4">Why Our Reports Feel Accurate</h2>
          <p className="text-center text-base sm:text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
            Our AI combines authentic Vedic astrology principles with modern analysis to provide insights that resonate.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="cosmic-card rounded-xl p-6">
              <div className="text-4xl mb-4">🧮</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Authentic Calculations</h3>
              <p className="text-slate-600 leading-relaxed">
                We use traditional Vedic astrology calculations (Dasha, Transits, Yogas) that have been used for thousands of years. The AI interprets these calculations, not invents them.
              </p>
            </div>
            <div className="cosmic-card rounded-xl p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Specific Questions = Better Answers</h3>
              <p className="text-slate-600 leading-relaxed">
                The more specific your question (e.g., &quot;When should I get married?&quot; vs &quot;Tell me about my life&quot;), the more precise the timing windows and guidance become.
              </p>
            </div>
            <div className="cosmic-card rounded-xl p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Pattern Recognition</h3>
              <p className="text-slate-600 leading-relaxed">
                Our AI analyzes planetary patterns, timing cycles, and life phase indicators that correlate with real-world events. These patterns are based on astrological principles, not random guesses.
              </p>
            </div>
            <div className="cosmic-card rounded-xl p-6">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Personalized Analysis</h3>
              <p className="text-slate-600 leading-relaxed">
                Every report is generated from your unique birth chart. No templates, no generic advice. Your planetary positions determine the insights you receive.
              </p>
            </div>
          </div>
          <div className="mt-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <p className="text-sm text-slate-700 text-center italic">
              <strong>Important:</strong> These reports provide astrological guidance based on traditional calculations. They are educational tools for self-reflection, not absolute predictions. Astrology is not a science and cannot guarantee future outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Individual Report Offerings */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-slate-800 mb-4">Individual Reports</h2>
          <p className="text-center text-base sm:text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
            Choose a specific report if you want to focus on one area of your life.
          </p>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Free Life Summary */}
            <div className="cosmic-card rounded-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge tone="green" className="text-sm">FREE</Badge>
                  <span className="text-3xl">🌟</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Life Summary Report</h3>
                <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                  Discover your core personality traits, strengths, weaknesses, and major life themes.
                  A perfect introduction to your astrological blueprint.
                </p>
                <Link href="/ai-astrology/input?reportType=life-summary" className="block">
                  <Button className="cosmic-button w-full">Get Free Preview</Button>
                </Link>
              </div>
            </div>

            {/* Marriage Timing */}
            <div className="cosmic-card rounded-2xl border-2 border-pink-200 relative pt-4 pr-4">
              <div className="absolute -top-2 -right-2 bg-pink-700 text-white text-xs font-extrabold px-3 py-1.5 rounded-full z-20 shadow-lg border-2 border-pink-800 uppercase tracking-wide">
                MOST POPULAR
              </div>
              <div className="p-6 pt-2">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-pink-700 text-white text-sm font-extrabold px-4 py-1.5 border-2 border-pink-800 shadow-lg uppercase tracking-wide">PREMIUM</Badge>
                  <span className="text-3xl">❤️</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Marriage Timing Report</h3>
                <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                  Uncover ideal marriage windows, potential delays, compatibility indicators, 
                  and personalized remedies.
                </p>
                {/* Report Scope Box */}
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-pink-900 mb-2">What&apos;s Included:</p>
                  <ul className="text-xs text-pink-800 space-y-1">
                    <li>• Ideal marriage timing windows (date ranges)</li>
                    <li>• Compatibility indicators</li>
                    <li>• Potential delay factors explained</li>
                    <li>• Decision guidance (what to focus on now)</li>
                    <li>• Non-religious remedies</li>
                    <li>• Timing strength indicators</li>
                  </ul>
                </div>
                <div className="text-3xl font-bold text-pink-600 mb-2">
                  AU${(REPORT_PRICES["marriage-timing"].amount / 100).toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 mb-4">One-time report • Instant PDF • No subscription required</p>
                <Link href="/ai-astrology/input?reportType=marriage-timing" className="block">
                  <Button className="cosmic-button w-full">Order Now</Button>
                </Link>
              </div>
            </div>

            {/* Career & Money */}
            <div className="cosmic-card rounded-2xl border-2 border-blue-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-blue-700 text-white text-sm font-extrabold px-4 py-1.5 border-2 border-blue-800 shadow-lg uppercase tracking-wide">PREMIUM</Badge>
                  <span className="text-3xl">💼</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Career & Money Path</h3>
                <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                  Navigate your professional journey with clarity. Best career directions, 
                  job change timings, and insights into your money growth phases.
                </p>
                {/* Report Scope Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-blue-900 mb-2">What&apos;s Included:</p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Career momentum windows (timing guidance)</li>
                    <li>• Money growth phases & patterns</li>
                    <li>• Best career directions for you</li>
                    <li>• Decision guidance (what to focus on now)</li>
                    <li>• Career direction clarity indicators</li>
                    <li>• Money growth stability indicators</li>
                  </ul>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  AU${(REPORT_PRICES["career-money"].amount / 100).toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 mb-4">One-time report • Instant PDF • No subscription required</p>
                <Link href="/ai-astrology/input?reportType=career-money" className="block">
                  <Button className="cosmic-button w-full">Order Now</Button>
                </Link>
              </div>
            </div>

            {/* Full Life Report */}
            <div className="cosmic-card rounded-2xl border-2 border-purple-400 bg-gradient-to-br from-purple-50 to-indigo-50">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-purple-700 text-white text-sm font-extrabold px-4 py-1.5 border-2 border-purple-800 shadow-lg uppercase tracking-wide">BEST VALUE</Badge>
                  <span className="text-3xl">⭐</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Full Life Report</h3>
                <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                  Includes Marriage + Career + Life Overview. Comprehensive analysis covering all aspects of life.
                </p>
                {/* Report Scope Box */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-purple-900 mb-2">What&apos;s Included:</p>
                  <ul className="text-xs text-purple-800 space-y-1">
                    <li>• Executive summary with key insights</li>
                    <li>• Complete personality analysis</li>
                    <li>• Marriage timing & compatibility</li>
                    <li>• Career & money path guidance</li>
                    <li>• Life phases & timing windows</li>
                    <li>• Decision guidance for each area</li>
                    <li>• Personalized remedies & recommendations</li>
                  </ul>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  AU${(REPORT_PRICES["full-life"].amount / 100).toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 mb-4">One-time report • Instant PDF • No subscription required</p>
                <Link href="/ai-astrology/input?reportType=full-life" className="block">
                  <Button className="cosmic-button w-full bg-purple-600 hover:bg-purple-700">Order Now</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Additional Reports Row */}
          <div className="grid lg:grid-cols-3 gap-6 mt-8">
            {/* Year Analysis Report */}
            <div className="cosmic-card rounded-2xl border-2 border-purple-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-purple-700 text-white text-sm font-extrabold px-4 py-1.5 border-2 border-purple-800 shadow-lg uppercase tracking-wide">PREMIUM</Badge>
                  <span className="text-3xl">📅</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Year Analysis Report</h3>
                <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                  12-month strategic guidance with quarterly breakdown, best periods, and year scorecard.
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-purple-900 mb-2">What&apos;s Included:</p>
                  <ul className="text-xs text-purple-800 space-y-1">
                    <li>• Year theme and at-a-glance summary</li>
                    <li>• Quarter-by-quarter breakdown</li>
                    <li>• Best periods for action, relationships, finances</li>
                    <li>• Caution periods to be aware of</li>
                    <li>• Year scorecard (career, relationships, money)</li>
                    <li>• Strategic guidance for the year</li>
                  </ul>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  AU${(REPORT_PRICES["year-analysis"].amount / 100).toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 mb-4">One-time report • Instant PDF • No subscription required</p>
                <Link href="/ai-astrology/input?reportType=year-analysis" className="block">
                  <Button className="cosmic-button w-full">Order Now</Button>
                </Link>
              </div>
            </div>

            {/* Major Life Phase Report */}
            <div className="cosmic-card rounded-2xl border-2 border-indigo-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-indigo-700 text-white text-sm font-extrabold px-4 py-1.5 border-2 border-indigo-800 shadow-lg uppercase tracking-wide">PREMIUM</Badge>
                  <span className="text-3xl">🌟</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">3-5 Year Strategic Life Phase Report</h3>
                <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                  3-5 year outlook with major transitions, long-term opportunities, and strategic navigation.
                </p>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-indigo-900 mb-2">What&apos;s Included:</p>
                  <ul className="text-xs text-indigo-800 space-y-1">
                    <li>• 3-5 year phase theme</li>
                    <li>• Year-by-year breakdown</li>
                    <li>• Major transitions (career, relationships, finances)</li>
                    <li>• Long-term opportunities</li>
                    <li>• Strategic navigation guidance</li>
                    <li>• Preparation steps for transitions</li>
                  </ul>
                </div>
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  AU${(REPORT_PRICES["major-life-phase"].amount / 100).toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 mb-4">One-time report • Instant PDF • No subscription required</p>
                <Link href="/ai-astrology/input?reportType=major-life-phase" className="block">
                  <Button className="cosmic-button w-full">Order Now</Button>
                </Link>
              </div>
            </div>

            {/* Decision Support Report */}
            <div className="cosmic-card rounded-2xl border-2 border-emerald-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-emerald-700 text-white text-sm font-extrabold px-4 py-1.5 border-2 border-emerald-800 shadow-lg uppercase tracking-wide">PREMIUM</Badge>
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Decision Support Report</h3>
                <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                  Astrological guidance for major life decisions with timing and alignment analysis.
                </p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-emerald-900 mb-2">What&apos;s Included:</p>
                  <ul className="text-xs text-emerald-800 space-y-1">
                    <li>• Current astrological climate for decisions</li>
                    <li>• Analysis of decision options</li>
                    <li>• Recommended timing (best/avoid periods)</li>
                    <li>• Key factors to consider</li>
                    <li>• Strategic approach recommendations</li>
                    <li>• Alignment indicators for options</li>
                  </ul>
                </div>
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  AU${(REPORT_PRICES["decision-support"].amount / 100).toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 mb-4">One-time report • Instant PDF • No subscription required</p>
                <Link href="/ai-astrology/input?reportType=decision-support" className="block">
                  <Button className="cosmic-button w-full">Order Now</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* How It Works */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-slate-800 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="cosmic-card rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">1️⃣</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Enter Details</h3>
              <p className="text-slate-600">Provide your birth information securely (1–2 minutes).</p>
            </div>
            <div className="cosmic-card rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">2️⃣</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">AI Generates</h3>
              <p className="text-slate-600">Our AI processes your data and generates your personalized report (seconds).</p>
            </div>
            <div className="cosmic-card rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">3️⃣</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Receive Insights</h3>
              <p className="text-slate-600">Read or download your report instantly after payment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center cosmic-card rounded-3xl p-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
            Ready for Your Personalized AI Astrology Report?
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 mb-8">
            Experience the future of astrology – precise, private, and always available.
          </p>
          <Link href="/ai-astrology/input?reportType=life-summary">
            <Button className="cosmic-button px-12 py-4 text-lg">
              Get Started with a Free Summary →
            </Button>
          </Link>
        </div>

        {/* Optional Subscription - Very De-emphasized */}
        <div className="max-w-3xl mx-auto mt-12 pt-12 border-t border-slate-200">
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-3 italic">Optional • Most users prefer one-time reports</p>
            <p className="text-sm text-slate-600 mb-2">
              <Link href="/ai-astrology/subscription" className="text-amber-600 hover:text-amber-700 underline">
                Monthly Astrology Outlook
              </Link>
              {" "}– Get monthly theme-based guidance (not daily predictions)
            </p>
            <p className="text-xs text-slate-500 italic">
              This is an optional subscription. Most users find one-time reports sufficient.
            </p>
          </div>
        </div>

        {/* Disclaimer Footer */}
        <Card className="mt-8 cosmic-card border-amber-200 bg-amber-50/50 max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-center mb-3">⚠️ Important Disclaimer</h3>
              <div className="text-sm text-slate-700 space-y-2">
                <p>
                  <strong>Educational Guidance Only:</strong> This report is generated by AI for educational and entertainment purposes only. 
                  It provides astrological guidance based on traditional calculations, not absolute predictions or certainties.
                </p>
                <p>
                  <strong>Not Professional Advice:</strong> Personalised astrological insights for educational and self-reflection purposes only. Not professional advice. Always consult qualified professionals for important life decisions.
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
                  <strong>Refund Policy:</strong> No change-of-mind refunds on digital reports. This does not limit your rights under Australian Consumer Law.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
