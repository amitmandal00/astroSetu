/**
 * AI Astrology Platform Landing Page
 * Fully autonomous AI-powered astrology reports
 */

"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { Badge } from "@/components/ui/Badge";

export default function AIAstrologyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white">
        <HeaderPattern />
        <div className="relative z-10 container mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4">
              <Badge className="bg-white/20 text-white border-white/30 text-sm px-4 py-1">
                🤖 AI-Powered • 100% Autonomous
              </Badge>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              AI-Powered Personal Astrology Advisor
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Get personalized astrology insights powered by AI. No human astrologers needed.
              Clear guidance for marriage timing, career direction, and life decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/ai-astrology/input">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 px-8 py-6 text-lg">
                  Get Your Free Life Summary →
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="ghost" className="text-white border-white/30 hover:bg-white/10 px-8 py-6 text-lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-2 border-purple-200 bg-white/80">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">💑</div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Marriage Timing</h3>
                <p className="text-slate-600">
                  Know the ideal time for marriage, understand delays, and get compatibility insights.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-indigo-200 bg-white/80">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">💼</div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Career & Money</h3>
                <p className="text-slate-600">
                  Discover your best career direction, job change timing, and money growth phases.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-pink-200 bg-white/80">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Daily Guidance</h3>
                <p className="text-slate-600">
                  Get daily personalized guidance on what to do and what to avoid each day.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <div id="how-it-works" className="mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12 text-slate-900">
              How It Works
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">1</span>
                </div>
                <h3 className="font-bold mb-2">Enter Details</h3>
                <p className="text-sm text-slate-600">Name, birth date, time, and place</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">2</span>
                </div>
                <h3 className="font-bold mb-2">AI Analysis</h3>
                <p className="text-sm text-slate-600">AI generates personalized insights</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-pink-600">3</span>
                </div>
                <h3 className="font-bold mb-2">Get Preview</h3>
                <p className="text-sm text-slate-600">Free life summary to start</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-amber-600">4</span>
                </div>
                <h3 className="font-bold mb-2">Unlock Reports</h3>
                <p className="text-sm text-slate-600">Purchase detailed reports or subscribe</p>
              </div>
            </div>
          </div>

          {/* Report Types */}
          <div className="mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12 text-slate-900">
              Available Reports
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Free Preview */}
              <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">Life Summary</h3>
                    <Badge tone="green" className="text-xs">FREE</Badge>
                  </div>
                  <p className="text-sm text-slate-600">Personality, strengths, and life themes</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-700 mb-6">
                    <li>✓ Personality overview</li>
                    <li>✓ Natural strengths</li>
                    <li>✓ Areas for growth</li>
                    <li>✓ Major life themes</li>
                  </ul>
                  <Link href="/ai-astrology/input">
                    <Button variant="secondary" className="w-full">Get Free Preview</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Marriage Timing */}
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">Marriage Timing</h3>
                    <Badge className="bg-purple-600 text-white text-xs">$29</Badge>
                  </div>
                  <p className="text-sm text-slate-600">Ideal marriage windows & compatibility</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-700 mb-6">
                    <li>✓ Ideal marriage windows</li>
                    <li>✓ Delay causes explained</li>
                    <li>✓ Compatibility indicators</li>
                    <li>✓ Remedies & guidance</li>
                  </ul>
                  <Link href="/ai-astrology/input?report=marriage">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">Get Report</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Career & Money */}
              <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">Career & Money</h3>
                    <Badge className="bg-indigo-600 text-white text-xs">$29</Badge>
                  </div>
                  <p className="text-sm text-slate-600">Career direction & financial phases</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-700 mb-6">
                    <li>✓ Best career fields</li>
                    <li>✓ Job change timing</li>
                    <li>✓ Money growth phases</li>
                    <li>✓ Financial guidance</li>
                  </ul>
                  <Link href="/ai-astrology/input?report=career">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Get Report</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Full Life Report */}
              <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">Full Life Report</h3>
                    <Badge className="bg-amber-600 text-white text-xs">$49</Badge>
                  </div>
                  <p className="text-sm text-slate-600">Comprehensive analysis of everything</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-700 mb-6">
                    <li>✓ Everything in Marriage & Career</li>
                    <li>✓ Detailed planetary analysis</li>
                    <li>✓ Life predictions & timing</li>
                    <li>✓ Comprehensive remedies</li>
                  </ul>
                  <Link href="/ai-astrology/input?report=full-life">
                    <Button className="w-full bg-amber-600 hover:bg-amber-700">Get Full Report</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Premium Subscription */}
              <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 md:col-span-2 lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">Premium Subscription</h3>
                    <Badge className="bg-pink-600 text-white text-xs">$9.99/month</Badge>
                  </div>
                  <p className="text-sm text-slate-600">Daily personalized guidance & insights</p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li>✓ Daily guidance engine</li>
                      <li>✓ "Today is good for..."</li>
                      <li>✓ "Avoid today..."</li>
                      <li>✓ Simple daily actions</li>
                    </ul>
                    <div>
                      <Link href="/ai-astrology/subscription">
                        <Button className="w-full bg-pink-600 hover:bg-pink-700">Subscribe Now</Button>
                      </Link>
                      <p className="text-xs text-slate-500 mt-2 text-center">Cancel anytime</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Why AI-Powered */}
          <Card className="bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-300 mb-16">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-center">Why AI-Powered?</h2>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl mb-2">⚡</div>
                  <h3 className="font-bold mb-2">Instant Results</h3>
                  <p className="text-sm text-slate-700">Get insights immediately, no waiting</p>
                </div>
                <div>
                  <div className="text-3xl mb-2">💰</div>
                  <h3 className="font-bold mb-2">Affordable</h3>
                  <p className="text-sm text-slate-700">Fraction of the cost of human consultations</p>
                </div>
                <div>
                  <div className="text-3xl mb-2">🔒</div>
                  <h3 className="font-bold mb-2">Privacy First</h3>
                  <p className="text-sm text-slate-700">Your data stays private and secure</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Ready to Discover Your Path?</h2>
            <p className="text-lg text-slate-600 mb-8">Start with a free life summary, no payment required.</p>
            <Link href="/ai-astrology/input">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-8 py-6 text-lg">
                Get Your Free Life Summary Now →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

