"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { session } from "@/lib/session";
import { apiGet } from "@/lib/http";

type Service = {
  id: string;
  icon: string;
  title: string;
  description?: string;
  href: string;
  color: string;
  borderColor: string;
  category?: string;
};

const SERVICES: Service[] = [
  {
    id: "kundli",
    icon: "🔮",
    title: "Kundli (Birth Chart)",
    description: "Complete birth chart with planetary positions",
    href: "/kundli",
    color: "from-saffron-100 to-amber-100",
    borderColor: "border-saffron-300",
    category: "Basic"
  },
  {
    id: "ascendant",
    icon: "📄",
    title: "Ascendant Report",
    description: "Detailed analysis of your Lagna (Ascendant)",
    href: "/reports/ascendant",
    color: "from-orange-100 to-amber-100",
    borderColor: "border-orange-300",
    category: "Reports"
  },
  {
    id: "lalkitab",
    icon: "📚",
    title: "Lal Kitab Horoscope",
    description: "Lal Kitab remedies and predictions",
    href: "/reports/lalkitab",
    color: "from-red-100 to-rose-100",
    borderColor: "border-red-300",
    category: "Reports"
  },
  {
    id: "lifereport",
    icon: "📖",
    title: "Life Report PDF",
    description: "Complete life analysis report in PDF format",
    href: "/lifereport",
    color: "from-blue-100 to-indigo-100",
    borderColor: "border-blue-300",
    category: "Reports"
  },
  {
    id: "sadesati",
    icon: "🪐",
    title: "Sade Sati Life Report",
    description: "Analysis of Saturn's 7.5 year period",
    href: "/reports/sadesati",
    color: "from-slate-100 to-gray-100",
    borderColor: "border-slate-300",
    category: "Reports"
  },
  {
    id: "varshphal",
    icon: "📊",
    title: "Year Analysis (Varshphal)",
    description: "Annual predictions based on your birth chart",
    href: "/reports/varshphal",
    color: "from-purple-100 to-indigo-100",
    borderColor: "border-purple-300",
    category: "Predictions"
  },
  {
    id: "babyname",
    icon: "👶",
    title: "Baby Name Suggestion",
    description: "Astrologically suitable names for your child",
    href: "/reports/babyname",
    color: "from-pink-100 to-rose-100",
    borderColor: "border-pink-300",
    category: "Tools"
  },
  {
    id: "gochar",
    icon: "🔄",
    title: "Gochar Phal (Transit Report)",
    description: "How current planetary positions affect you",
    href: "/reports/gochar",
    color: "from-cyan-100 to-blue-100",
    borderColor: "border-cyan-300",
    category: "Predictions"
  },
  {
    id: "prediction",
    icon: "🔮",
    title: "General Prediction",
    description: "Overall predictions for your life",
    href: "/reports/general",
    color: "from-amber-100 to-yellow-100",
    borderColor: "border-amber-300",
    category: "Predictions"
  },
  {
    id: "mangal",
    icon: "🔥",
    title: "Mangal Dosha",
    description: "Check Mangal Dosha and remedies",
    href: "/reports/mangal-dosha",
    color: "from-orange-100 to-red-100",
    borderColor: "border-orange-300",
    category: "Dosha"
  },
  {
    id: "dasha",
    icon: "⏳",
    title: "Dasha Phal Analysis",
    description: "Detailed analysis of planetary periods",
    href: "/reports/dasha-phal",
    color: "from-emerald-100 to-green-100",
    borderColor: "border-emerald-300",
    category: "Predictions"
  },
  {
    id: "love",
    icon: "💖",
    title: "Love Horoscope",
    description: "Love and relationship predictions",
    href: "/reports/love",
    color: "from-rose-100 to-pink-100",
    borderColor: "border-rose-300",
    category: "Predictions"
  }
];

export default function ServicesPage() {
  const router = useRouter();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [userName, setUserName] = useState("User");

  // Get user from session
  useEffect(() => {
    const user = session.getUser();
    if (user) {
      setUserName(user.name);
    }
  }, []);

  // Fetch wallet balance
  useEffect(() => {
    apiGet<{ ok: boolean; data?: { balance: number } }>("/api/wallet")
      .then((res) => {
        if (res.ok && res.data) {
          setWalletBalance(res.data.balance);
        }
      })
      .catch(() => {
        // Ignore errors
      });
  }, []);

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6 min-h-screen">
      {/* Left Sidebar - Navigation */}
      <div className="hidden lg:block">
        <Card className="bg-gradient-to-br from-saffron-600 to-orange-600 text-white border-0 shadow-xl sticky top-4">
          <CardContent className="p-0">
            <div className="p-4 border-b border-white/20 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold mb-1">{userName}&apos;s Kundli</div>
                <div className="text-xs text-white/80">Complete Astrology Portal</div>
              </div>
              <button className="text-white/80 hover:text-white">✕</button>
            </div>
            <nav className="p-2">
              <Link href="/kundli" className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-colors mb-1 flex items-center justify-between">
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
        {/* Top Toolbar */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 rounded-2xl p-4 shadow-lg border-2 border-amber-500">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                <span className="text-xl">🏠</span>
              </Link>
              <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                <span className="text-xl">📁</span>
              </button>
              <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                <span className="text-xl">📄</span>
              </button>
              <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                <span className="text-xl">🖨️</span>
              </button>
              <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                <span className="text-xl">✏️</span>
              </button>
              <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                <span className="text-xl">🗑️</span>
              </button>
              <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                <span className="text-xl">🔗</span>
              </button>
              <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                <span className="text-xl">⊞</span>
              </button>
              <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                <span className="text-xl">🔍</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/wallet" className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center gap-2 font-semibold">
                <span className="text-xl">💰</span>
                <span>₹ {walletBalance !== null ? walletBalance.toFixed(1) : "0.0"}</span>
              </Link>
              <div className="flex items-center gap-1 bg-white/20 rounded-lg p-1">
                <button className="px-3 py-1 rounded bg-white text-amber-600 font-semibold text-sm">EN</button>
                <button className="px-3 py-1 rounded text-white hover:bg-white/20 font-semibold text-sm">हिं</button>
                <button className="px-3 py-1 rounded text-white hover:bg-white/20 font-semibold text-sm">த</button>
                <button className="px-3 py-1 rounded text-white hover:bg-white/20 font-semibold text-sm">ಕ</button>
                <button className="px-3 py-1 rounded text-white hover:bg-white/20 font-semibold text-sm">తె</button>
                <button className="px-3 py-1 rounded text-white hover:bg-white/20 font-semibold text-sm">ગુ</button>
                <button className="px-3 py-1 rounded text-white hover:bg-white/20 font-semibold text-sm">म</button>
                <button className="px-3 py-1 rounded text-white hover:bg-white/20 font-semibold text-sm">বা</button>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((service) => (
            <Link key={service.id} href={service.href}>
              <Card className={`bg-gradient-to-br ${service.color} border-2 ${service.borderColor} hover:shadow-xl transition-all cursor-pointer h-full`}>
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4">{service.icon}</div>
                  <div className="text-base font-bold text-slate-900 mb-2">{service.title}</div>
                  {service.description && (
                    <div className="text-xs text-slate-600 leading-relaxed">{service.description}</div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Paid Services Section */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-xl p-4 border-2 border-amber-200 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>💎</span>
                  <span>Paid Services</span>
                </h2>
                <p className="text-sm text-slate-600 mt-1">Premium astrology reports and services</p>
              </div>
              <Link href="/services/paid">
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold">
                  View All Paid Services →
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Brihat Kundli */}
            <Card className="border-2 border-slate-200 hover:shadow-xl transition-all">
              <CardContent className="p-0">
                <div className="flex flex-col items-center gap-3 p-4">
                  <div className="w-20 h-28 rounded-xl bg-gradient-to-br from-saffron-100 to-amber-100 border-2 border-saffron-300 flex items-center justify-center text-4xl shadow-lg">
                    📖
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-bold text-slate-900 mb-1">AstroSetu Brihat Kundli</h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-lg font-bold text-slate-900">₹299</span>
                      <span className="text-xs text-slate-500 line-through">₹499</span>
                    </div>
                    <Link href="/services/paid#brihat-kundli">
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold py-2">
                        ORDER NOW
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Raj Yoga Report */}
            <Card className="border-2 border-slate-200 hover:shadow-xl transition-all">
              <CardContent className="p-0">
                <div className="flex flex-col items-center gap-3 p-4">
                  <div className="w-20 h-28 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-300 flex items-center justify-center text-4xl shadow-lg">
                    ⭐
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Raj Yoga Report</h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-lg font-bold text-slate-900">₹499</span>
                      <span className="text-xs text-slate-500 line-through">₹799</span>
                    </div>
                    <Link href="/services/paid#raj-yoga">
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold py-2">
                        ORDER NOW
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personalized Horoscope 2025 */}
            <Card className="border-2 border-slate-200 hover:shadow-xl transition-all">
              <CardContent className="p-0">
                <div className="flex flex-col items-center gap-3 p-4">
                  <div className="w-20 h-28 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 border-2 border-red-300 flex items-center justify-center text-4xl shadow-lg">
                    📅
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Personalized Horoscope 2025</h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-lg font-bold text-slate-900">₹399</span>
                      <span className="text-xs text-slate-500 line-through">₹699</span>
                    </div>
                    <Link href="/services/paid#personalized-horoscope-2025">
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold py-2">
                        ORDER NOW
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-saffron-50 to-amber-50 border-2 border-saffron-200">
          <CardHeader eyebrow="ℹ️ Information" title="Planet Position & Services" />
          <CardContent>
            <p className="text-sm text-slate-700 leading-relaxed">
              Access all astrological reports and services based on your birth chart. Each service provides detailed insights into different aspects of your life including career, relationships, health, and finances.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

