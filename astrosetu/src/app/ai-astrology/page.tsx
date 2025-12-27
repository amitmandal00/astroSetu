/**
 * AI Astrology Landing Page
 * Cosmic-themed landing page with modern design
 */

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { AstroImage } from "@/components/ui/AstroImage";
import { ASTRO_IMAGES } from "@/lib/astroImages";

export default function AIAstrologyLandingPage() {
  return (
    <div className="min-h-screen cosmic-bg">
      {/* Hero Section */}
      <div className="relative py-16 lg:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
            <span className="cosmic-gradient-text">Discover Your Cosmic</span>
            <br />
            <span className="text-white">Insights with AI</span>
          </h1>
          <p className="text-xl lg:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Get personalized astrology readings powered by advanced AI. 
            Unlock precise, autonomous astrological insights for your life's biggest questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/ai-astrology/input?reportType=lifeSummary">
              <Button className="cosmic-button px-8 py-4 text-lg">
                Get Your Reading →
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
            <div className="relative h-48 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-purple-600/20 to-blue-600/20">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImEiIGN4PSI1MCUiIGN5PSI1MCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM4YjVjZjYiIHN0b3Atb3BhY2l0eT0iMC4zIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjM2I4MmY2IiBzdG9wLW9wYWNpdHk9IjAuMSIvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iODAiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl">🌙</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Personal Horoscopes</h3>
            <p className="text-slate-400 leading-relaxed mb-6">
              Discover your core personality traits, strengths, weaknesses, and major life themes. 
              Get insights tailored to your unique birth chart.
            </p>
            <Link href="/ai-astrology/input?reportType=lifeSummary">
              <span className="text-purple-400 font-semibold group-hover:text-purple-300 transition-colors inline-flex items-center">
                Explore Horoscopes →
              </span>
            </Link>
          </div>

          {/* Love & Relationships */}
          <div className="cosmic-card rounded-2xl p-8 cursor-pointer group">
            <div className="relative h-48 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-pink-600/20 to-rose-600/20">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImIiIGN4PSI1MCUiIGN5PSI1MCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNlYzQ4OTciIHN0b3Atb3BhY2l0eT0iMC4zIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmQ3MTQ3IiBzdG9wLW9wYWNpdHk9IjAuMSIvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iODAiIGZpbGw9InVybCgjYikiLz48L3N2Zz4=')] opacity-30"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl">💕</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Love & Relationships</h3>
            <p className="text-slate-400 leading-relaxed mb-6">
              Uncover ideal marriage windows, compatibility indicators, and personalized remedies. 
              Your guide to a harmonious partnership.
            </p>
            <Link href="/ai-astrology/input?report=marriage-timing">
              <span className="text-pink-400 font-semibold group-hover:text-pink-300 transition-colors inline-flex items-center">
                Check Compatibility →
              </span>
            </Link>
          </div>

          {/* Career & Finance */}
          <div className="cosmic-card rounded-2xl p-8 cursor-pointer group">
            <div className="relative h-48 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-600/20 to-teal-600/20">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImMiIGN4PSI1MCUiIGN5PSI1MCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxMGI5ODEiIHN0b3Atb3BhY2l0eT0iMC4zIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMTRiOGE4IiBzdG9wLW9wYWNpdHk9IjAuMSIvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iODAiIGZpbGw9InVybCgjYykiLz48L3N2Zz4=')] opacity-30"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl">💼</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Career & Finance</h3>
            <p className="text-slate-400 leading-relaxed mb-6">
              Navigate your professional journey with clarity. Best career directions, 
              job change timings, and insights into your money growth phases.
            </p>
            <Link href="/ai-astrology/input?report=career-money">
              <span className="text-emerald-400 font-semibold group-hover:text-emerald-300 transition-colors inline-flex items-center">
                Explore Career Path →
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <section id="features" className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Why AI-First Astrology?</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Leveraging advanced AI and authentic Vedic principles, we provide unbiased, instant, 
            and deeply personalized astrological reports.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          <div className="cosmic-card rounded-xl p-6 text-center">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-white mb-2">Autonomous Insights</h3>
            <p className="text-slate-400">Instant reports, 24/7. No human bias, no waiting lists.</p>
          </div>
          <div className="cosmic-card rounded-xl p-6 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">Precision & Clarity</h3>
            <p className="text-slate-400">Complex astrology explained in simple, actionable English.</p>
          </div>
          <div className="cosmic-card rounded-xl p-6 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-white mb-2">Private & Secure</h3>
            <p className="text-slate-400">Your birth details are processed securely for your eyes only.</p>
          </div>
        </div>
      </section>

      {/* Report Offerings */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold text-center text-white mb-12">Our AI-Powered Reports</h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Free Life Summary */}
            <div className="cosmic-card rounded-2xl overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <Badge tone="green" className="text-sm">FREE</Badge>
                  <span className="text-4xl">🌟</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Life Summary Report</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  Discover your core personality traits, strengths, weaknesses, and major life themes.
                  A perfect introduction to your astrological blueprint.
                </p>
                <Link href="/ai-astrology/input?reportType=lifeSummary" className="block">
                  <Button className="cosmic-button w-full">Get Free Preview</Button>
                </Link>
              </div>
            </div>

            {/* Marriage Timing */}
            <div className="cosmic-card rounded-2xl overflow-hidden border-2 border-pink-500/30">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-pink-600 text-white text-sm">PREMIUM</Badge>
                  <span className="text-4xl">❤️</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Marriage Timing Report</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  Uncover ideal marriage windows, potential delays, compatibility indicators, 
                  and personalized remedies. Your guide to a harmonious partnership.
                </p>
                <div className="text-3xl font-bold text-pink-400 mb-4">$29</div>
                <Link href="/ai-astrology/input?report=marriage-timing" className="block">
                  <Button className="cosmic-button w-full">Order Now</Button>
                </Link>
              </div>
            </div>

            {/* Career & Money */}
            <div className="cosmic-card rounded-2xl overflow-hidden border-2 border-emerald-500/30">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-emerald-600 text-white text-sm">PREMIUM</Badge>
                  <span className="text-4xl">💼</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Career & Money Path</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  Navigate your professional journey with clarity. Best career directions, 
                  job change timings, and insights into your money growth phases.
                </p>
                <div className="text-3xl font-bold text-emerald-400 mb-4">$29</div>
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
          <div className="cosmic-card rounded-3xl p-12 text-center border-2 border-purple-500/30">
            <div className="text-6xl mb-6">⭐</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Premium Subscription</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Get personalized daily guidance delivered to you every day. Know what's favorable, 
              what to avoid, and how to make the most of each day.
            </p>
            <div className="text-5xl font-bold cosmic-gradient-text mb-8">
              $9.99<span className="text-2xl text-slate-400">/month</span>
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
          <h2 className="text-4xl lg:text-5xl font-bold text-center text-white mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="cosmic-card rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">1️⃣</div>
              <h3 className="text-xl font-semibold text-white mb-2">Enter Details</h3>
              <p className="text-slate-400">Provide your birth information securely.</p>
            </div>
            <div className="cosmic-card rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">2️⃣</div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Generates</h3>
              <p className="text-slate-400">Our AI processes your data and generates your personalized report.</p>
            </div>
            <div className="cosmic-card rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">3️⃣</div>
              <h3 className="text-xl font-semibold text-white mb-2">Receive Insights</h3>
              <p className="text-slate-400">Read or download your report instantly after payment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center cosmic-card rounded-3xl p-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready for Your Personalized AI Astrology Report?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Experience the future of astrology – precise, private, and always available.
          </p>
          <Link href="/ai-astrology/input?reportType=lifeSummary">
            <Button className="cosmic-button px-12 py-4 text-lg">
              Get Started with a Free Summary →
            </Button>
          </Link>
        </div>
      </section>

      {/* Add blob animation styles */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
