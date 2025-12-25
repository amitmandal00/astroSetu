"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { KundliResult } from "@/types/astrology";

type KundliDashboardProps = {
  kundliData: KundliResult;
  userName?: string;
};

export function KundliDashboard({ kundliData, userName = "User" }: KundliDashboardProps) {
  const services = [
    {
      icon: "🔮",
      title: "Birth Chart / Kundli",
      description: "Planetary position and your complete birth chart analysis",
      href: "#chart",
      color: "from-saffron-100 to-amber-100",
      borderColor: "border-saffron-300"
    },
    {
      icon: "💑",
      title: "Match Horoscope",
      description: "Match Horoscope (Guna Milan) for marriage compatibility",
      href: "/match",
      color: "from-rose-100 to-pink-100",
      borderColor: "border-rose-300"
    },
    {
      icon: "💬",
      title: "Talk to Astrologer",
      description: "Get First Chat Free with expert astrologers",
      href: "/astrologers",
      color: "from-indigo-100 to-purple-100",
      borderColor: "border-indigo-300"
    },
    {
      icon: "📄",
      title: "Your Life Predictions",
      description: "Know about your Nature, Career, Health, and Relationships",
      href: "#predictions",
      color: "from-emerald-100 to-green-100",
      borderColor: "border-emerald-300"
    },
    {
      icon: "🔄",
      title: "Gochar Phal (Transit)",
      description: "How does position of current planets affect your life",
      href: "#transit",
      color: "from-blue-100 to-cyan-100",
      borderColor: "border-blue-300"
    },
    {
      icon: "🔢",
      title: "Numerology",
      description: "Numerology analysis based on your name and birth date",
      href: "/numerology",
      color: "from-purple-100 to-indigo-100",
      borderColor: "border-purple-300"
    },
    {
      icon: "📿",
      title: "Dasha",
      description: "Current and upcoming planetary periods (Dasha)",
      href: "#dasha",
      color: "from-amber-100 to-orange-100",
      borderColor: "border-amber-300"
    },
    {
      icon: "📚",
      title: "Lal Kitab Horoscope",
      description: "Lal Kitab remedies and predictions",
      href: "#lalkitab",
      color: "from-red-100 to-rose-100",
      borderColor: "border-red-300"
    },
    {
      icon: "🔥",
      title: "Mangal Dosha",
      description: "Check Mangal Dosha and remedies",
      href: "#mangal",
      color: "from-orange-100 to-red-100",
      borderColor: "border-orange-300"
    },
    {
      icon: "💎",
      title: "Remedies & Solutions",
      description: "Personalized remedies for planetary doshas",
      href: "/remedies",
      color: "from-teal-100 to-emerald-100",
      borderColor: "border-teal-300"
    },
    {
      icon: "⭐",
      title: "Horoscope",
      description: "Daily, Weekly, Monthly, and Yearly horoscope",
      href: "/horoscope",
      color: "from-yellow-100 to-amber-100",
      borderColor: "border-yellow-300"
    },
    {
      icon: "❓",
      title: "Ask A Question",
      description: "Get quick answers from expert astrologers",
      href: "/astrologers",
      color: "from-slate-100 to-gray-100",
      borderColor: "border-slate-300"
    }
  ];

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6">
      {/* Left Sidebar - Navigation */}
      <div className="hidden lg:block">
        <Card className="bg-gradient-to-br from-saffron-600 to-orange-600 text-white border-0 shadow-xl sticky top-4">
          <CardContent className="p-0">
            <div className="p-4 border-b border-white/20">
              <div className="text-sm font-bold mb-1">{userName}&apos;s Kundli</div>
              <div className="text-xs text-white/80">Complete Astrology Portal</div>
            </div>
            <nav className="p-2">
              <Link href="#chart" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold">Birth Chart</span>
                <span>→</span>
              </Link>
              <Link href="/profile" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold">Profile</span>
                <span>→</span>
              </Link>
              <Link href="#print" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold">Print Birth Chart</span>
                <span>→</span>
              </Link>
              <Link href="#calculations" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold">Calculations</span>
                <span>→</span>
              </Link>
              <Link href="#predictions" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold">Predictions & Reports</span>
                <span>→</span>
              </Link>
              <Link href="/numerology" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold">Numerology</span>
                <span>→</span>
              </Link>
              <Link href="#dasha" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold">Dasha</span>
                <span>→</span>
              </Link>
              <Link href="#lalkitab" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold">Lal Kitab</span>
                <span>→</span>
              </Link>
              <Link href="/match" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold">Match Horoscope</span>
                <span>→</span>
              </Link>
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Success Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border-2 border-emerald-300 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(circle, #10b981 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }} />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-3xl shadow-lg border-2 border-white">
              ✅
            </div>
            <div>
              <div className="font-bold text-emerald-900 text-xl mb-1">Kundli Generated Successfully!</div>
              <div className="text-sm text-emerald-700">Your complete birth chart analysis is ready</div>
            </div>
          </div>
        </div>

        {/* Premium Astrologers Banner */}
        <Card className="bg-gradient-to-r from-saffron-500 via-amber-500 to-orange-500 text-white border-0 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 text-5xl">👨‍🏫</div>
            <div className="absolute bottom-4 right-4 text-5xl">💬</div>
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <Badge className="!bg-white/20 !text-white !border-white/30 mb-3">AstroSetu Varta</Badge>
                <div className="text-2xl font-bold mb-2">Talk to Premium ASTROLOGERS</div>
                <div className="text-lg font-semibold mb-4">First Chat FREE</div>
                <Link href="/astrologers">
                  <Button className="bg-white text-saffron-600 hover:bg-white/90 shadow-lg">
                    Chat Now →
                  </Button>
                </Link>
              </div>
              <div className="hidden md:block text-right">
                <div className="text-8xl opacity-80">👨‍🏫</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => (
            <Link key={index} href={service.href}>
              <Card className={`bg-gradient-to-br ${service.color} border-2 ${service.borderColor} hover:shadow-xl transition-all cursor-pointer h-full`}>
                <CardContent className="p-5">
                  <div className="text-4xl mb-3">{service.icon}</div>
                  <div className="text-base font-bold text-slate-900 mb-2">{service.title}</div>
                  <div className="text-xs text-slate-600 leading-relaxed">{service.description}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Ask Your Question Section */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <CardHeader eyebrow="💬 Quick Help" title="Ask Your Question" subtitle="Let Our Expert Astrologers Guide Your Decisions" />
          <CardContent>
            <p className="text-sm text-slate-700 mb-4">
              Do you have a question and need answer quickly? Get urgent answer to your question.
            </p>
            <Link href="/astrologers">
              <Button className="w-full">
                Ask Your Question →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

