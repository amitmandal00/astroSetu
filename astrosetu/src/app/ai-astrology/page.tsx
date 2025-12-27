/**
 * AI Astrology Landing Page
 * Light, ethereal cosmic theme with celestial imagery
 */

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AstroImage } from "@/components/ui/AstroImage";
import { ASTRO_IMAGES } from "@/lib/astroImages";

export default function AIAstrologyLandingPage() {
  return (
    <div className="cosmic-bg">
      {/* Hero Section */}
      <div className="relative py-16 lg:py-24 px-4 overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight text-slate-800">
            Discover Your Cosmic Insights with AI
          </h1>
          <p className="text-xl lg:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Get personalized astrology readings powered by advanced AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/ai-astrology/input?reportType=lifeSummary">
              <Button className="cosmic-button px-8 py-4 text-lg">
                Get Your Reading
              </Button>
            </Link>
            <Link href="#features">
              <Button className="cosmic-button-secondary px-8 py-4 text-lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Personal Horoscopes */}
          <div className="cosmic-card rounded-2xl p-8 cursor-pointer group">
            <div className="relative h-48 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 text-6xl">🌙</div>
                <div className="absolute bottom-4 right-4 text-5xl">⭐</div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Personal Horoscopes</h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              Discover your core personality traits, strengths, weaknesses, and major life themes. 
              Get insights tailored to your unique birth chart.
            </p>
            <Link href="/ai-astrology/input?reportType=lifeSummary">
              <span className="text-amber-700 font-semibold group-hover:text-amber-800 transition-colors inline-flex items-center">
                Explore Horoscopes →
              </span>
            </Link>
          </div>

          {/* Love & Relationships */}
          <div className="cosmic-card rounded-2xl p-8 cursor-pointer group">
            <div className="relative h-48 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 text-6xl">💕</div>
                <div className="absolute bottom-4 right-4 text-5xl">❤️</div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Love & Relationships</h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              Uncover ideal marriage windows, compatibility indicators, and personalized remedies. 
              Your guide to a harmonious partnership.
            </p>
            <Link href="/ai-astrology/input?report=marriage-timing">
              <span className="text-pink-700 font-semibold group-hover:text-pink-800 transition-colors inline-flex items-center">
                Check Compatibility →
              </span>
            </Link>
          </div>

          {/* Career & Finance */}
          <div className="cosmic-card rounded-2xl p-8 cursor-pointer group">
            <div className="relative h-48 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 text-6xl">💼</div>
                <div className="absolute bottom-4 right-4 text-5xl">📈</div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Career & Finance</h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              Navigate your professional journey with clarity. Best career directions, 
              job change timings, and insights into your money growth phases.
            </p>
            <Link href="/ai-astrology/input?report=career-money">
              <span className="text-blue-700 font-semibold group-hover:text-blue-800 transition-colors inline-flex items-center">
                Explore Career Path →
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <section id="features" className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-4">Why AI-First Astrology?</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-4">
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

      {/* Report Offerings */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold text-center text-slate-800 mb-12">Our AI-Powered Reports</h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Free Life Summary */}
            <div className="cosmic-card rounded-2xl overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <Badge tone="green" className="text-sm">FREE</Badge>
                  <span className="text-4xl">🌟</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Life Summary Report</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Discover your core personality traits, strengths, weaknesses, and major life themes.
                  A perfect introduction to your astrological blueprint.
                </p>
                <Link href="/ai-astrology/input?reportType=lifeSummary" className="block">
                  <Button className="cosmic-button w-full">Get Free Preview</Button>
                </Link>
              </div>
            </div>

            {/* Marriage Timing */}
            <div className="cosmic-card rounded-2xl overflow-hidden border-2 border-pink-200">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-pink-600 text-white text-sm">PREMIUM</Badge>
                  <span className="text-4xl">❤️</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Marriage Timing Report</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Uncover ideal marriage windows, potential delays, compatibility indicators, 
                  and personalized remedies. Your guide to a harmonious partnership.
                </p>
                <div className="text-3xl font-bold text-pink-600 mb-4">$29</div>
                <Link href="/ai-astrology/input?report=marriage-timing" className="block">
                  <Button className="cosmic-button w-full">Order Now</Button>
                </Link>
              </div>
            </div>

            {/* Career & Money */}
            <div className="cosmic-card rounded-2xl overflow-hidden border-2 border-blue-200">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-blue-600 text-white text-sm">PREMIUM</Badge>
                  <span className="text-4xl">💼</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Career & Money Path</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Navigate your professional journey with clarity. Best career directions, 
                  job change timings, and insights into your money growth phases.
                </p>
                <div className="text-3xl font-bold text-blue-600 mb-4">$29</div>
                <Link href="/ai-astrology/input?report=career-money" className="block">
                  <Button className="cosmic-button w-full">Order Now</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Subscription CTA */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="cosmic-card rounded-3xl p-12 text-center border-2 border-amber-200">
            <div className="text-6xl mb-6">⭐</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">Premium Subscription</h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Get personalized daily guidance delivered to you every day. Know what's favorable, 
              what to avoid, and how to make the most of each day.
            </p>
            <div className="text-5xl font-bold text-amber-700 mb-8">
              $9.99<span className="text-2xl text-slate-500">/month</span>
            </div>
            <Link href="/ai-astrology/subscription">
              <Button className="cosmic-button px-12 py-4 text-lg">
                Subscribe to Premium →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold text-center text-slate-800 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="cosmic-card rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">1️⃣</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Enter Details</h3>
              <p className="text-slate-600">Provide your birth information securely.</p>
            </div>
            <div className="cosmic-card rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">2️⃣</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">AI Generates</h3>
              <p className="text-slate-600">Our AI processes your data and generates your personalized report.</p>
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
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
            Ready for Your Personalized AI Astrology Report?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Experience the future of astrology – precise, private, and always available.
          </p>
          <Link href="/ai-astrology/input?reportType=lifeSummary">
            <Button className="cosmic-button px-12 py-4 text-lg">
              Get Started with a Free Summary →
            </Button>
          </Link>
        </div>

        {/* Disclaimer Footer */}
        <Card className="mt-8 cosmic-card border-amber-200 bg-amber-50/50 max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <h3 className="font-bold text-slate-800">⚠️ Important Information</h3>
              <div className="text-sm text-slate-700 space-y-2">
                <p>
                  <strong>Educational Guidance Only:</strong> Our reports provide astrological insights for educational and entertainment purposes. 
                  They should not be used as a substitute for professional advice.
                </p>
                <p>
                  <strong>Fully Automated Platform:</strong> This platform is 100% automated. No human astrologers review reports. 
                  No live support is available. For questions, see our <Link href="/ai-astrology/faq" className="text-amber-700 hover:text-amber-800 underline font-semibold">FAQ page</Link>.
                </p>
                <p>
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
