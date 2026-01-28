"use client";

import { clsx } from "clsx";
import { getZodiacImage } from "@/lib/astroImages";
import Image from "next/image";

type ZodiacIconProps = {
  sign: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

// Indian spiritual colors and images for each zodiac sign (Rashi)
// Using meaningful images related to each zodiac sign's characteristics
const zodiacData: Record<string, { 
  icon: string; 
  color: string; 
  gradient: string;
  imageUrl: string;
  sanskritName: string;
  deity?: string;
}> = {
  "Aries": { 
    icon: "♈", 
    color: "from-red-600 to-red-700", 
    gradient: "from-red-100 to-red-200",
    imageUrl: getZodiacImage("Aries"), // Fire/energy/ram constellation
    sanskritName: "मेष",
    deity: "Mars (मंगल)"
  },
  "Taurus": { 
    icon: "♉", 
    color: "from-green-600 to-green-700", 
    gradient: "from-green-100 to-green-200",
    imageUrl: getZodiacImage("Taurus"), // Earth/bull constellation
    sanskritName: "वृषभ",
    deity: "Venus (शुक्र)"
  },
  "Gemini": { 
    icon: "♊", 
    color: "from-yellow-500 to-yellow-600", 
    gradient: "from-yellow-100 to-yellow-200",
    imageUrl: getZodiacImage("Gemini"), // Air/twins constellation
    sanskritName: "मिथुन",
    deity: "Mercury (बुध)"
  },
  "Cancer": { 
    icon: "♋", 
    color: "from-slate-500 to-slate-600", 
    gradient: "from-slate-100 to-slate-200",
    imageUrl: getZodiacImage("Cancer"), // Water/crab/moon constellation
    sanskritName: "कर्क",
    deity: "Moon (चंद्र)"
  },
  "Leo": { 
    icon: "♌", 
    color: "from-orange-600 to-orange-700", 
    gradient: "from-orange-100 to-orange-200",
    imageUrl: getZodiacImage("Leo"), // Fire/lion/sun constellation
    sanskritName: "सिंह",
    deity: "Sun (सूर्य)"
  },
  "Virgo": { 
    icon: "♍", 
    color: "from-emerald-600 to-emerald-700", 
    gradient: "from-emerald-100 to-emerald-200",
    imageUrl: getZodiacImage("Virgo"), // Earth/virgin constellation
    sanskritName: "कन्या",
    deity: "Mercury (बुध)"
  },
  "Libra": { 
    icon: "♎", 
    color: "from-pink-600 to-pink-700", 
    gradient: "from-pink-100 to-pink-200",
    imageUrl: getZodiacImage("Libra"), // Air/balance constellation
    sanskritName: "तुला",
    deity: "Venus (शुक्र)"
  },
  "Scorpio": { 
    icon: "♏", 
    color: "from-red-700 to-red-800", 
    gradient: "from-red-100 to-red-200",
    imageUrl: getZodiacImage("Scorpio"), // Water/scorpion constellation
    sanskritName: "वृश्चिक",
    deity: "Mars (मंगल)"
  },
  "Sagittarius": { 
    icon: "♐", 
    color: "from-amber-600 to-amber-700", 
    gradient: "from-amber-100 to-amber-200",
    imageUrl: getZodiacImage("Sagittarius"), // Fire/archer constellation
    sanskritName: "धनु",
    deity: "Jupiter (गुरु)"
  },
  "Capricorn": { 
    icon: "♑", 
    color: "from-indigo-600 to-indigo-700", 
    gradient: "from-indigo-100 to-indigo-200",
    imageUrl: getZodiacImage("Capricorn"), // Earth/goat constellation
    sanskritName: "मकर",
    deity: "Saturn (शनि)"
  },
  "Aquarius": { 
    icon: "♒", 
    color: "from-blue-600 to-blue-700", 
    gradient: "from-blue-100 to-blue-200",
    imageUrl: getZodiacImage("Aquarius"), // Air/water bearer constellation
    sanskritName: "कुम्भ",
    deity: "Saturn (शनि)"
  },
  "Pisces": { 
    icon: "♓", 
    color: "from-cyan-600 to-cyan-700", 
    gradient: "from-cyan-100 to-cyan-200",
    imageUrl: getZodiacImage("Pisces"), // Water/fish constellation
    sanskritName: "मीन",
    deity: "Jupiter (गुरु)"
  }
};

const sizeClasses = {
  sm: "w-12 h-12 text-xl",
  md: "w-20 h-20 text-3xl",
  lg: "w-32 h-32 text-5xl"
};

export function ZodiacIcon({ sign, size = "md", className = "" }: ZodiacIconProps) {
  const zodiac = zodiacData[sign] || { 
    icon: "✨", 
    color: "from-amber-500 to-amber-600", 
    gradient: "from-amber-100 to-amber-200",
    imageUrl: getZodiacImage("Aries"), // Default fallback
    sanskritName: ""
  };
  
  return (
    <div className={clsx(
      "relative rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg hover:shadow-xl transition-all overflow-hidden group",
      zodiac.gradient,
      sizeClasses[size],
      className
    )}>
      {/* Background image with overlay */}
      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
        <Image
          src={zodiac.imageUrl}
          alt={sign}
          width={200}
          height={200}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>
      
      {/* Gradient overlay */}
      <div className={clsx(
        "absolute inset-0 bg-gradient-to-br opacity-60",
        zodiac.color
      )} />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <span className="font-bold text-white drop-shadow-lg">{zodiac.icon}</span>
        {size === "lg" && zodiac.sanskritName && (
          <span className="text-xs text-white/90 font-semibold mt-1">{zodiac.sanskritName}</span>
        )}
      </div>
    </div>
  );
}
