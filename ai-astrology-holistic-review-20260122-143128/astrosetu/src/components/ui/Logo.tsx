"use client";

import Link from "next/link";
import { clsx } from "clsx";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const sizes = {
    sm: { container: "h-12 w-12", svg: "h-10 w-10", text: "text-base" },
    md: { container: "h-16 w-16", svg: "h-14 w-14", text: "text-xl" },
    lg: { container: "h-24 w-24", svg: "h-20 w-20", text: "text-2xl" }
  };

  const currentSize = sizes[size];

  return (
    <Link href="/" className={clsx("flex items-center gap-3 group", className)}>
      <div className={clsx("relative flex items-center justify-center rounded-full overflow-hidden shadow-2xl border-2 border-white/40", currentSize.container)}>
        {/* Background circle with Indian spiritual colors - Enhanced contrast */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-saffron-600 via-amber-600 to-orange-600 shadow-2xl">
          {/* Enhanced pattern overlay for better visibility */}
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: `radial-gradient(circle, #FFFFFF 1.5px, transparent 1.5px)`,
            backgroundSize: '8px 8px'
          }} />
        </div>
        
        {/* Main Logo SVG - Meaningful Indian Astrology Logo */}
        <svg 
          className={clsx("relative z-10 drop-shadow-2xl", currentSize.svg)} 
          viewBox="0 0 200 200" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Saffron/Orange gradient for Indian spiritual theme */}
            <linearGradient id="saffronGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" stopOpacity="1" />
              <stop offset="50%" stopColor="#FB923C" stopOpacity="1" />
              <stop offset="100%" stopColor="#FCD34D" stopOpacity="1" />
            </linearGradient>
            {/* Gold gradient */}
            <radialGradient id="goldGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#FCD34D" stopOpacity="1" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="1" />
            </radialGradient>
            {/* Purple gradient */}
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="1" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Central Om Symbol (ॐ) - Most important spiritual symbol */}
          <text
            x="100"
            y="110"
            fontSize="80"
            fill="url(#goldGradient)"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="serif"
            fontWeight="bold"
            filter="url(#glow)"
          >
            ॐ
          </text>

          {/* Bridge/Setu representation - connecting elements */}
          <path
            d="M 40 140 Q 100 120 160 140"
            stroke="url(#saffronGradient)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M 50 150 Q 100 130 150 150"
            stroke="url(#saffronGradient)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Sun (Surya) - Top center */}
          <circle cx="100" cy="50" r="15" fill="url(#goldGradient)" filter="url(#glow)" />
          <line x1="100" y1="30" x2="100" y2="38" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="100" y1="62" x2="100" y2="70" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="80" y1="50" x2="88" y2="50" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="112" y1="50" x2="120" y2="50" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="85" y1="35" x2="90" y2="40" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="110" y1="60" x2="115" y2="65" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="115" y1="35" x2="110" y2="40" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="90" y1="60" x2="85" y2="65" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Moon (Chandra) - Left side */}
          <path
            d="M 50 80 A 18 18 0 0 1 50 120 A 12 12 0 0 0 50 80"
            fill="url(#goldGradient)"
            opacity="0.95"
          />

          {/* Stars (Nakshatra representation) */}
          <path
            d="M 70 60 L 72 65 L 77 65 L 73 68 L 75 73 L 70 70 L 65 73 L 67 68 L 63 65 L 68 65 Z"
            fill="url(#goldGradient)"
            opacity="0.9"
          />
          <path
            d="M 130 75 L 131 78 L 134 78 L 132 80 L 133 83 L 130 81 L 127 83 L 128 80 L 126 78 L 129 78 Z"
            fill="url(#goldGradient)"
            opacity="0.9"
          />
          <path
            d="M 150 100 L 151 103 L 154 103 L 152 105 L 153 108 L 150 106 L 147 108 L 148 105 L 146 103 L 149 103 Z"
            fill="url(#goldGradient)"
            opacity="0.9"
          />

          {/* Lotus petals around Om (bottom) */}
          <ellipse cx="100" cy="155" rx="25" ry="8" fill="url(#purpleGradient)" opacity="0.6" />
          <ellipse cx="85" cy="150" rx="15" ry="6" fill="url(#purpleGradient)" opacity="0.5" />
          <ellipse cx="115" cy="150" rx="15" ry="6" fill="url(#purpleGradient)" opacity="0.5" />

          {/* Planetary orbits (representing astrology) */}
          <circle
            cx="100"
            cy="100"
            r="75"
            stroke="url(#saffronGradient)"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="3 3"
            opacity="0.4"
          />
          <circle
            cx="100"
            cy="100"
            r="60"
            stroke="url(#purpleGradient)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="2 2"
            opacity="0.3"
          />
        </svg>

        {/* Subtle orbiting rings animation */}
        <div className="absolute inset-0 rounded-full border border-amber-300/40 animate-spin" style={{ animationDuration: "30s" }} />
        
        {/* Glow effect on hover */}
        <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-saffron-400/30 via-amber-400/30 to-orange-400/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      
            {showText && (
              <div className={clsx("leading-tight", currentSize.text)}>
                <div className="font-bold drop-shadow-lg">
                  <span className="text-white">Astro</span>
                  <span className="text-amber-200">Setu</span>
                </div>
                <div className="text-xs text-white font-semibold drop-shadow-md">Cosmic Guidance</div>
              </div>
            )}
    </Link>
  );
}
