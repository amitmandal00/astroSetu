"use client";

import { clsx } from "clsx";

type ServiceIconProps = {
  service: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const serviceIcons: Record<string, string> = {
  "Kundli": "🔮",
  "Match": "💑",
  "Horoscope": "📅",
  "Panchang": "📿",
  "Muhurat": "⏰",
  "Numerology": "🔢",
  "Remedies": "💎",
  "Puja": "🕉️",
  "Sessions": "🎥",
  "Community": "💬",
  "Learn": "📚",
  "Astrologers": "👨‍🏫",
  "Wallet": "💰",
  "Love": "💕",
  "Marriage": "💍",
  "Career": "💼",
  "Finance": "💵",
  "Health": "🏥",
  "Travel": "✈️",
  "Education": "📖",
  "Child": "👶",
  "Ganesh": "🐘",
  "Lakshmi": "🪙",
  "Shani": "🪐",
  "Mangal": "🔥",
  "Rahu-Ketu": "🌑",
  "Navagraha": "⭐"
};

const sizeClasses = {
  sm: "w-12 h-12 text-2xl",
  md: "w-16 h-16 text-3xl",
  lg: "w-24 h-24 text-5xl"
};

export function ServiceIcon({ service, size = "md", className = "" }: ServiceIconProps) {
  const icon = serviceIcons[service] || "✨";
  
  return (
    <div className={clsx(
      "rounded-2xl bg-gradient-to-br from-saffron-100 via-amber-100 to-orange-100 flex items-center justify-center shadow-md hover:shadow-lg transition-all border-2 border-saffron-200/50",
      sizeClasses[size],
      className
    )}>
      <span className="relative z-10">{icon}</span>
      {/* Spiritual pattern overlay */}
      <div className="absolute inset-0 opacity-5 text-2xl">ॐ</div>
    </div>
  );
}

