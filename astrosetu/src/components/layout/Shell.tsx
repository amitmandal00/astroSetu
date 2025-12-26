"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { AIChatbot } from "@/components/ai/AIChatbot";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { BottomNav } from "./BottomNav";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { Footer } from "./Footer";

const nav = [
  { href: "/kundli", label: "Kundli", icon: "🔮" },
  { href: "/match", label: "Match", icon: "💑" },
  { href: "/horoscope", label: "Horoscope", icon: "⭐" },
  { href: "/panchang", label: "Panchang", icon: "📿" },
  { href: "/muhurat", label: "Muhurat", icon: "⏰" },
  { href: "/numerology", label: "Numerology", icon: "🔢" },
  { href: "/remedies", label: "Remedies", icon: "💎" },
  { href: "/services", label: "Services", icon: "📊" },
  { href: "/puja", label: "Puja", icon: "🕉️" },
  { href: "/sessions", label: "Sessions", icon: "🎥" },
  { href: "/community", label: "Community", icon: "💬" },
  { href: "/learn", label: "Learn", icon: "📚" },
  { href: "/astrologers", label: "Astrologers", icon: "👨‍🏫" }
];

export function Shell({ children }: { children: ReactNode }) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "AstroSetu";
  const tagline = process.env.NEXT_PUBLIC_TAGLINE ?? "Bridging humans with cosmic guidance";

  return (
    <div className="min-h-screen bg-orbit">
        {/* Top app shell - Indian spiritual saffron header with enhanced contrast */}
        <header className="sticky top-0 z-50 bg-gradient-to-r from-saffron-600 via-amber-600 to-orange-600 text-white shadow-2xl relative overflow-hidden border-b-2 border-saffron-700/30">
          <HeaderPattern />
          {/* Spiritual pattern overlay */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-2 left-4 text-2xl drop-shadow-md">ॐ</div>
            <div className="absolute top-2 right-4 text-2xl drop-shadow-md">🕉️</div>
          </div>
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 lg:py-4 relative z-10">
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 lg:gap-3">
            <Logo size="md" showText={true} className="flex-shrink-0" />

            {/* Primary navigation – pill tabs with icons and labels, horizontally scrollable */}
            <nav className="hidden lg:flex items-center gap-1 bg-white/15 backdrop-blur-md rounded-2xl p-1.5 flex-1 min-w-0 mx-2 overflow-x-auto scrollbar-hide border border-white/20 shadow-lg">
              {nav.map((i) => (
                <Link 
                  key={i.href} 
                  href={i.href} 
                  className="px-3 xl:px-4 py-2 rounded-xl text-xs xl:text-sm font-bold text-white hover:text-white hover:bg-white/25 transition-all relative group flex items-center gap-1.5 xl:gap-2 whitespace-nowrap flex-shrink-0 border border-transparent hover:border-white/30 shadow-sm"
                >
                  {i.icon && <span className="text-sm xl:text-base drop-shadow-md">{i.icon}</span>}
                  <span className="drop-shadow-sm">{i.label}</span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>
            <Link 
              href="/wallet" 
              className="hidden xl:block px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-white/15 hover:bg-white/25 border-2 border-white/30 transition-all whitespace-nowrap shadow-md"
            >
              💰 Wallet
            </Link>
            <Link 
              href="/profile" 
              className="hidden xl:block px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-white/15 hover:bg-white/25 border-2 border-white/30 transition-all whitespace-nowrap shadow-md"
            >
              👤 Profile
            </Link>
            <Link
              href="/premium"
              className="hidden lg:block px-2 xl:px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xl border-2 border-amber-400/50 whitespace-nowrap hover:from-amber-600 hover:to-amber-700 transition-all cursor-pointer"
            >
              <span className="hidden xl:inline">Premium</span>
              <span className="xl:hidden">⭐</span>
            </Link>
              {/* Mobile menu button */}
              <Link
                href="/kundli"
                className="lg:hidden px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
              >
                Menu
              </Link>
            </div>
          </div>
          
          {/* Mobile navigation */}
          <nav className="lg:hidden mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/20 overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-max pb-2">
              {nav.slice(0, 6).map((i) => (
                <Link 
                  key={i.href} 
                  href={i.href} 
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs font-semibold text-white/90 bg-white/10 hover:bg-white/20 hover:text-white transition-all whitespace-nowrap border border-white/20 flex items-center gap-1 sm:gap-1.5 flex-shrink-0"
                >
                  {i.icon && <span className="text-xs sm:text-sm">{i.icon}</span>}
                  <span className="hidden xs:inline">{i.label}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Main content on soft light background */}
      <main className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 pb-20 sm:pb-20 lg:pb-12">
        {children}
      </main>

      {/* Enhanced Footer */}
      <Footer />

      {/* AI Chatbot */}
      <AIChatbot />
      
      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
}
