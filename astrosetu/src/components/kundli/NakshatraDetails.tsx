/**
 * Nakshatra Details Component
 * Comprehensive nakshatra information with pada, lord, deity, characteristics
 * Inspired by AstroSage detailed nakshatra displays
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getNakshatraDetails } from "@/lib/prokeralaEnhanced";
import type { BirthDetails } from "@/types/astrology";
import type { KundliResult } from "@/types/astrology";

type NakshatraDetailsProps = {
  kundliData: KundliResult;
  birthDetails: BirthDetails;
};

type NakshatraInfo = {
  name: string;
  pada?: number;
  lord?: string;
  deity?: string;
  symbol?: string;
  characteristics?: string[];
  compatibility?: string[];
};

const NAKSHATRA_INFO: Record<string, { deity: string; symbol: string; characteristics: string[] }> = {
  "Ashwini": {
    deity: "Ashwini Kumaras",
    symbol: "Horse's Head",
    characteristics: ["Fast-paced", "Healing abilities", "Pioneering spirit"],
  },
  "Bharani": {
    deity: "Yama",
    symbol: "Vagina",
    characteristics: ["Determined", "Passionate", "Transformation"],
  },
  "Krittika": {
    deity: "Agni",
    symbol: "Razor",
    characteristics: ["Sharp intellect", "Ambitious", "Cutting-edge"],
  },
  "Rohini": {
    deity: "Brahma",
    symbol: "Cart/Chariot",
    characteristics: ["Creative", "Materialistic", "Beautiful"],
  },
  "Mrigashirsha": {
    deity: "Soma",
    symbol: "Deer's Head",
    characteristics: ["Curious", "Wanderlust", "Searching nature"],
  },
  "Ardra": {
    deity: "Rudra",
    symbol: "Tear Drop",
    characteristics: ["Intense", "Transformative", "Emotional depth"],
  },
  "Punarvasu": {
    deity: "Aditi",
    symbol: "Bow",
    characteristics: ["Renewal", "Return", "Abundance"],
  },
  "Pushya": {
    deity: "Brihaspati",
    symbol: "Cow's Udder",
    characteristics: ["Nurturing", "Prosperous", "Caring"],
  },
  "Ashlesha": {
    deity: "Nagas",
    symbol: "Coiled Serpent",
    characteristics: ["Mysterious", "Intuitive", "Protective"],
  },
  "Magha": {
    deity: "Pitris",
    symbol: "Royal Throne",
    characteristics: ["Regal", "Traditional", "Authority"],
  },
  "Purva Phalguni": {
    deity: "Bhaga",
    symbol: "Hammock",
    characteristics: ["Romantic", "Leisure-loving", "Artistic"],
  },
  "Uttara Phalguni": {
    deity: "Aryaman",
    symbol: "Fig Tree",
    characteristics: ["Leadership", "Philanthropy", "Marriage"],
  },
  "Hasta": {
    deity: "Savitar",
    symbol: "Hand",
    characteristics: ["Skilled", "Crafty", "Manipulation"],
  },
  "Chitra": {
    deity: "Vishwakarma",
    symbol: "Pearl",
    characteristics: ["Artistic", "Beautiful", "Creative"],
  },
  "Swati": {
    deity: "Vayu",
    symbol: "Sword",
    characteristics: ["Independent", "Freedom-loving", "Changeable"],
  },
  "Vishakha": {
    deity: "Indra-Agni",
    symbol: "Archway",
    characteristics: ["Goal-oriented", "Ambitious", "Purposeful"],
  },
  "Anuradha": {
    deity: "Mitra",
    symbol: "Lotus",
    characteristics: ["Friendship", "Loyalty", "Social"],
  },
  "Jyeshtha": {
    deity: "Indra",
    symbol: "Earring",
    characteristics: ["Elderly", "Protective", "Authority"],
  },
  "Mula": {
    deity: "Nirriti",
    symbol: "Root",
    characteristics: ["Rooted", "Destructive", "Transformation"],
  },
  "Purva Ashadha": {
    deity: "Apas",
    symbol: "Fan",
    characteristics: ["Influential", "Popular", "Inspiring"],
  },
  "Uttara Ashadha": {
    deity: "Vishvedevas",
    symbol: "Elephant Tusk",
    characteristics: ["Victory", "Persistence", "Invincibility"],
  },
  "Shravana": {
    deity: "Vishnu",
    symbol: "Ear",
    characteristics: ["Listening", "Learning", "Communication"],
  },
  "Dhanishta": {
    deity: "Vasus",
    symbol: "Drum",
    characteristics: ["Musical", "Wealthy", "Famous"],
  },
  "Shatabhisha": {
    deity: "Varuna",
    symbol: "100 Stars",
    characteristics: ["Healing", "Mystical", "Secretive"],
  },
  "Purva Bhadrapada": {
    deity: "Aja Ekapada",
    symbol: "Sword",
    characteristics: ["Spiritual", "Revolutionary", "Transformative"],
  },
  "Uttara Bhadrapada": {
    deity: "Ahir Budhnya",
    symbol: "Snake in Water",
    characteristics: ["Stable", "Serene", "Nourishing"],
  },
  "Revati": {
    deity: "Pushan",
    symbol: "Fish",
    characteristics: ["Nurturing", "Caring", "Protective"],
  },
};

export function NakshatraDetails({ kundliData, birthDetails }: NakshatraDetailsProps) {
  const [nakshatraInfo, setNakshatraInfo] = useState<NakshatraInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNakshatra() {
      if (!birthDetails.latitude || !birthDetails.longitude || !kundliData.nakshatra) {
        setLoading(false);
        return;
      }

      try {
        const enhanced = await getNakshatraDetails(birthDetails);
        if (enhanced && enhanced.name) {
          setNakshatraInfo(enhanced);
        } else {
          // Fallback to basic info
          const basicInfo = NAKSHATRA_INFO[kundliData.nakshatra];
          if (basicInfo) {
            setNakshatraInfo({
              name: kundliData.nakshatra,
              ...basicInfo,
            });
          }
        }
      } catch (error) {
        console.log("[NakshatraDetails] Could not fetch enhanced nakshatra:", error);
        // Use fallback
        const basicInfo = NAKSHATRA_INFO[kundliData.nakshatra];
        if (basicInfo) {
          setNakshatraInfo({
            name: kundliData.nakshatra,
            ...basicInfo,
          });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchNakshatra();
  }, [birthDetails, kundliData.nakshatra]);

  if (!kundliData.nakshatra) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader eyebrow="Nakshatra" title="Birth Nakshatra Details" icon="⭐" />
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron-600 mx-auto mb-4"></div>
            <div className="text-sm">Loading nakshatra details...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const info = nakshatraInfo || {
    name: kundliData.nakshatra,
    ...(NAKSHATRA_INFO[kundliData.nakshatra] || {
      deity: "Unknown",
      symbol: "Star",
      characteristics: [],
    }),
  };

  return (
    <Card>
      <CardHeader 
        eyebrow="Nakshatra Analysis" 
        title={`${info.name} Nakshatra (नक्षत्र)`}
        subtitle="Your birth nakshatra and its characteristics"
        icon="⭐"
      />
      <CardContent className="card-enhanced space-y-6">
        {/* Main Info Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 border-2 border-purple-300 shadow-lg">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-purple-700 mb-2">{info.name}</div>
            {info.pada && (
              <div className="inline-block px-4 py-1 rounded-full bg-purple-200 text-purple-800 text-sm font-semibold">
                Pada {info.pada}
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {info.deity && (
              <div className="p-4 rounded-xl bg-white/70 border border-purple-200">
                <div className="text-xs font-semibold text-purple-600 mb-1">Ruling Deity</div>
                <div className="text-lg font-bold text-slate-900">{info.deity}</div>
              </div>
            )}
            {info.symbol && (
              <div className="p-4 rounded-xl bg-white/70 border border-purple-200">
                <div className="text-xs font-semibold text-purple-600 mb-1">Symbol</div>
                <div className="text-lg font-bold text-slate-900">{info.symbol}</div>
              </div>
            )}
            {info.lord && (
              <div className="p-4 rounded-xl bg-white/70 border border-purple-200">
                <div className="text-xs font-semibold text-purple-600 mb-1">Planetary Lord</div>
                <div className="text-lg font-bold text-slate-900">{info.lord}</div>
              </div>
            )}
          </div>
        </div>

        {/* Characteristics */}
        {info.characteristics && info.characteristics.length > 0 && (
          <div>
            <div className="text-sm font-bold text-slate-900 mb-3">Key Characteristics</div>
            <div className="flex flex-wrap gap-2">
              {info.characteristics.map((char, idx) => (
                <Badge key={idx} tone="indigo" className="text-xs">
                  {char}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Compatibility */}
        {info.compatibility && info.compatibility.length > 0 && (
          <div>
            <div className="text-sm font-bold text-slate-900 mb-3">Compatible Nakshatras</div>
            <div className="flex flex-wrap gap-2">
              {info.compatibility.map((comp, idx) => (
                <Badge key={idx} tone="indigo" className="text-xs">
                  {comp}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Info Note */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-xs text-slate-600 leading-relaxed">
            <strong>About Nakshatra:</strong> Your birth nakshatra (lunar mansion) reveals deeper personality traits, emotional nature, and karmic patterns. The nakshatra's deity, symbol, and characteristics influence your life themes and compatibility with others.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

