"use client";

import { clsx } from "clsx";

type SpiritualPatternProps = {
  variant?: "om" | "swastika" | "lotus" | "mandala" | "chakra" | "shankh";
  className?: string;
  opacity?: number;
};

export function SpiritualPattern({ variant = "om", className = "", opacity = 0.1 }: SpiritualPatternProps) {
  const patterns = {
    om: (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <text
          x="50"
          y="50"
          fontSize="60"
          fill="currentColor"
          opacity={opacity}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="serif"
          fontWeight="bold"
        >
          ॐ
        </text>
      </svg>
    ),
    swastika: (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d="M50 20 L50 40 M60 30 L40 30 M50 60 L50 80 M60 70 L40 70 M20 50 L40 50 M30 60 L30 40 M80 50 L60 50 M70 40 L70 60"
          stroke="currentColor"
          strokeWidth="3"
          opacity={opacity}
          fill="none"
        />
      </svg>
    ),
    lotus: (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2" opacity={opacity} />
        <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={opacity} />
        <circle cx="50" cy="50" r="10" fill="currentColor" opacity={opacity * 0.5} />
        <path
          d="M50 20 Q45 30 50 40 Q55 30 50 20 M50 80 Q45 70 50 60 Q55 70 50 80 M20 50 Q30 45 40 50 Q30 55 20 50 M80 50 Q70 45 60 50 Q70 55 80 50"
          fill="currentColor"
          opacity={opacity * 0.7}
        />
      </svg>
    ),
    mandala: (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400/10 to-saffron-400/10 animate-spin-slow" style={{ animationDuration: '60s' }} />
        <div className="absolute inset-1/4 rounded-full bg-gradient-to-br from-purple-400/10 to-indigo-400/10 animate-spin-slow" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
        <div className="absolute inset-1/3 rounded-full border border-amber-300/20 animate-pulse" />
      </div>
    ),
    chakra: (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" opacity={opacity} />
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={opacity} />
        <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1" opacity={opacity} />
        <circle cx="50" cy="50" r="10" fill="currentColor" opacity={opacity * 0.5} />
        {[...Array(24)].map((_, i) => (
          <line
            key={i}
            x1="50"
            y1="50"
            x2={50 + 35 * Math.cos((i * 15 * Math.PI) / 180)}
            y2={50 + 35 * Math.sin((i * 15 * Math.PI) / 180)}
            stroke="currentColor"
            strokeWidth="1"
            opacity={opacity}
          />
        ))}
      </svg>
    ),
    shankh: (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d="M30 20 Q40 15 50 20 Q60 15 70 20 L65 80 Q50 85 35 80 Z"
          fill="currentColor"
          opacity={opacity * 0.3}
        />
        <path
          d="M35 25 Q45 20 50 25 Q55 20 65 25 L60 75 Q50 78 40 75 Z"
          fill="currentColor"
          opacity={opacity * 0.5}
        />
      </svg>
    )
  };

  return <div className={clsx("pointer-events-none", className)}>{patterns[variant]}</div>;
}

