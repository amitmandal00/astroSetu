"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { AstroImage } from "@/components/ui/AstroImage";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { AppDownload } from "@/components/mobile/AppDownload";
import { session } from "@/lib/session";
import { getPrioritizedModules, type UserGoal } from "@/lib/goalPrioritization";

export default function Home() {
  // Get user goals and prioritize modules
  const userGoals = useMemo(() => {
    const goals = session.getGoals();
    return (goals || []) as UserGoal[];
  }, []);

  const { astrologyTools, consultations } = useMemo(() => {
    return getPrioritizedModules(userGoals);
  }, [userGoals]);
  return (
    <div className="grid gap-10">
      {/* Hero Section - Indian spiritual theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-saffron-500 via-amber-500 to-orange-500 text-white shadow-2xl p-8 lg:p-12">
        <HeaderPattern />
        {/* Spiritual symbols overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-6 left-6 text-6xl opacity-20">ॐ</div>
          <div className="absolute top-6 right-6 text-6xl opacity-20">🕉️</div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-5xl opacity-15">🪷</div>
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-saffron-400/20 blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }} />
        </div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge className="!text-xs !font-bold !px-4 !py-1.5 bg-white/10 text-white border-white/20">🔮 AstroSetu</Badge>
              <Badge className="!text-xs !font-bold !px-4 !py-1.5 bg-white/10 text-white border-white/20">✨ Premium Tools</Badge>
              <Badge className="!text-xs !font-bold !px-4 !py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white !border-0">🇮🇳 Made for India</Badge>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-white">
              Bridging humans with
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-300 bg-clip-text text-transparent">
                cosmic guidance
              </span>
            </h1>
            <p className="text-lg text-white/80 mt-4 max-w-2xl leading-relaxed">
              Complete astrology platform with AI-powered insights: Generate Kundli, match compatibility, horoscopes, Panchang, Muhurat, Numerology, Remedies, Online Puja, Live Sessions, Community Forum, and chat with expert astrologers.
            </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/onboarding/birth">
              <Button className="text-base px-8 py-4">
                🔮 Generate Kundli
              </Button>
            </Link>
            <Link href="/match">
              <Button variant="secondary" className="text-base px-8 py-4">
                💑 Match Kundli
              </Button>
            </Link>
            <Link href="/astrologers">
              <Button variant="ghost" className="text-base px-8 py-4">
                👨‍🏫 Chat with Astrologer
              </Button>
            </Link>
          </div>

            <div className="mt-10 grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-sm p-5 hover:bg-white/20 transition-all shadow-xl">
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-bold text-white mb-1">Lightning Fast</div>
                <div className="text-sm text-white/80">Instant results with advanced astrology engine</div>
              </div>
              <div className="rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-sm p-5 hover:bg-white/20 transition-all shadow-xl">
                <div className="text-2xl mb-2">🛡️</div>
                <div className="font-bold text-white mb-1">Trusted & Accurate</div>
                <div className="text-sm text-white/80">Industry-standard calculations and reports</div>
              </div>
              <div className="rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-sm p-5 hover:bg-white/20 transition-all shadow-xl">
                <div className="text-2xl mb-2">💎</div>
                <div className="font-bold text-white mb-1">Premium Experience</div>
                <div className="text-sm text-white/80">Expert consultations and detailed analysis</div>
              </div>
            </div>
                </div>
                <div className="hidden lg:block relative">
                  <div className="rounded-3xl shadow-2xl relative overflow-hidden min-h-[400px] border-2 border-white/20">
                    <AstroImage
                      src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=600&h=600&fit=crop&q=80&auto=format"
                      alt="Vedic astrology and spiritual guidance - Indian astrology charts and spiritual symbols"
                      width={600}
                      height={600}
                      className="w-full h-full"
                      fallback="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=600&h=600&fit=crop&q=80&auto=format"
                    />
                    {/* Overlay text */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-8">
                      <div className="text-2xl font-bold text-white mb-2">Vedic Astrology</div>
                      <div className="text-lg text-white/90">Spiritual Guidance</div>
                    </div>
                  </div>
                </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader eyebrow="🔮 Astrology Tools" title="Complete Astrology Suite" subtitle="All tools you need for accurate predictions." icon="🔮" />
          <CardContent className="grid gap-4">
            {astrologyTools.map((module) => (
              <Link key={module.id} href={module.href} className="group block">
                <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 hover:border-purple-300 bg-white hover:bg-purple-50 transition-all cursor-pointer">
                  <ServiceIcon service={module.id === "kundli" ? "Kundli" : module.id === "match" ? "Match" : module.id === "horoscope" ? "Horoscope" : "Panchang"} size="md" />
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 group-hover:text-purple-700 flex items-center gap-2">
                      {module.title}
                      {userGoals.length > 0 && module.goals.some(g => userGoals.includes(g)) && (
                        <Badge tone="green" className="text-xs">✓ Matches your goals</Badge>
                      )}
                    </div>
                    <div className="text-sm text-slate-600">{module.description}</div>
                  </div>
                  <span className="text-purple-400 group-hover:text-purple-600">→</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader eyebrow="👨‍🏫 Consultations" title="Expert Astrologers" subtitle="Connect with verified astrologers for personalized guidance." icon="👨‍🏫" />
          <CardContent className="grid gap-4">
            {consultations.map((module) => (
              <Link key={module.id} href={module.href} className="group block">
                <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 hover:border-purple-300 bg-white hover:bg-purple-50 transition-all cursor-pointer">
                  <ServiceIcon service={module.id === "astrologers" ? "Astrologers" : module.id === "sessions" ? "Sessions" : module.id === "puja" ? "Puja" : "Community"} size="md" />
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 group-hover:text-purple-700 flex items-center gap-2">
                      {module.title}
                      {userGoals.length > 0 && module.goals.some(g => userGoals.includes(g)) && (
                        <Badge tone="green" className="text-xs">✓ Matches your goals</Badge>
                      )}
                    </div>
                    <div className="text-sm text-slate-600">{module.description}</div>
                  </div>
                  <span className="text-purple-400 group-hover:text-purple-600">→</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Trust Indicators */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-purple-600 mb-1">10K+</div>
            <div className="text-sm text-slate-600">Happy Users</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-amber-600 mb-1">500+</div>
            <div className="text-sm text-slate-600">Expert Astrologers</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-purple-600 mb-1">4.8★</div>
            <div className="text-sm text-slate-600">Average Rating</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-purple-600 mb-1">24/7</div>
            <div className="text-sm text-slate-600">Available</div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile App Download Section */}
      <AppDownload />
    </div>
  );
}
