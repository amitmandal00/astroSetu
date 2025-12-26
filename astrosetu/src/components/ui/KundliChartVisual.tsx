"use client";

import type { KundliChart } from "@/types/astrology";

// Indian planet names (Grahas) mapping
const PLANET_NAMES: Record<string, { hindi: string; symbol: string; color: string }> = {
  "Sun": { hindi: "सूर्य", symbol: "☉", color: "from-orange-500 to-amber-500" },
  "Moon": { hindi: "चंद्र", symbol: "☽", color: "from-slate-300 to-slate-400" },
  "Mars": { hindi: "मंगल", symbol: "♂", color: "from-red-500 to-rose-500" },
  "Mercury": { hindi: "बुध", symbol: "☿", color: "from-emerald-500 to-green-500" },
  "Jupiter": { hindi: "गुरु", symbol: "♃", color: "from-amber-500 to-yellow-500" },
  "Venus": { hindi: "शुक्र", symbol: "♀", color: "from-pink-400 to-rose-400" },
  "Saturn": { hindi: "शनि", symbol: "♄", color: "from-slate-600 to-slate-700" },
  "Rahu": { hindi: "राहु", symbol: "☊", color: "from-purple-500 to-indigo-500" },
  "Ketu": { hindi: "केतु", symbol: "☋", color: "from-orange-600 to-red-600" }
};

// Get planet abbreviation (Indian style - matching AstroSage)
const getPlanetAbbr = (planet: string): string => {
  const mapping: Record<string, string> = {
    "Sun": "Su", "Moon": "Mo", "Mars": "Ma", "Mercury": "Me",
    "Jupiter": "Ju", "Venus": "Ve", "Saturn": "Sa", "Rahu": "Ra", "Ketu": "Ke",
    "Uranus": "Ur", "Neptune": "Ne", "Pluto": "Pl"
  };
  return mapping[planet] || planet.substring(0, 2);
};

// Zodiac sign abbreviations (Indian style)
const SIGN_ABBR: Record<string, string> = {
  "Aries": "ARI", "Taurus": "TAU", "Gemini": "GEM", "Cancer": "CAN",
  "Leo": "LEO", "Virgo": "VIR", "Libra": "LIB", "Scorpio": "SCO",
  "Sagittarius": "SAG", "Capricorn": "CAP", "Aquarius": "AQU", "Pisces": "PIS"
};

export function KundliChartVisual({ chart, title }: { chart: KundliChart; title?: string }) {
  // North Indian Diamond Style Layout (matching AstroSage)
  // Houses arranged in traditional North Indian format: diamond in center, triangles and squares around
  const gridLayout = [
    [9, 10, 11, 12],
    [8, null, null, 1],
    [7, null, null, 2],
    [6, 5, 4, 3]
  ];

  const getHouseData = (houseNum: number | null) => {
    if (!houseNum) return null;
    return chart.houses.find(h => h.number === houseNum);
  };

  // House significance in Indian astrology
  const getHouseSignificance = (houseNum: number): string => {
    const significance: Record<number, string> = {
      1: "Lagna (Self)", 2: "Dhana (Wealth)", 3: "Sahaja (Siblings)",
      4: "Sukha (Happiness)", 5: "Putra (Children)", 6: "Ripu (Enemies)",
      7: "Kalatra (Spouse)", 8: "Ayush (Longevity)", 9: "Bhagya (Fortune)",
      10: "Karma (Career)", 11: "Labha (Gains)", 12: "Vyaya (Expenses)"
    };
    return significance[houseNum] || `House ${houseNum}`;
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Indian spiritual background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 400 400">
          <defs>
            <pattern id="kundli-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="#F97316" />
              <circle cx="0" cy="0" r="0.5" fill="#FB923C" />
              <circle cx="40" cy="40" r="0.5" fill="#FCD34D" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#kundli-pattern)" />
        </svg>
      </div>

      {/* Chart Title Header - AstroSage Style */}
      {title && (
        <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 rounded-t-xl p-3 border-b-2 border-amber-300 mb-4">
          <div className="text-base font-bold text-slate-900">{title}</div>
          {title.includes("Varshphal") && (
            <div className="text-xs text-slate-700 mt-1">Varshphal Chart (Solar Return Chart)</div>
          )}
        </div>
      )}

      {/* Main chart grid with North Indian Diamond Style - improved spacing and colors */}
      <div className="relative grid grid-cols-4 gap-2 p-6 bg-white rounded-xl border-2 border-slate-200 shadow-lg chart-container">
        {gridLayout.map((row, rowIdx) => (
          row.map((houseNum, colIdx) => {
            const house = getHouseData(houseNum);
            if (!houseNum) {
              return (
                <div key={`${rowIdx}-${colIdx}`} className="aspect-square" />
              );
            }
            
            if (!house) {
              return (
                <div key={houseNum} className="aspect-square rounded-xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center">
                  <div className="text-xs text-slate-400 font-semibold">H{houseNum}</div>
                </div>
              );
            }

            const signAbbr = SIGN_ABBR[house.sign] || house.sign?.substring(0, 3).toUpperCase() || `H${houseNum}`;
            const isLagna = houseNum === 1;

            return (
              <div
                key={houseNum}
                className={`
                  aspect-square border border-dashed border-slate-300 p-2 flex flex-col items-center justify-center
                  ${isLagna 
                    ? "bg-indigo-50 border-indigo-400 border-2" 
                    : "bg-white hover:bg-slate-50"
                  }
                  relative overflow-hidden rounded-lg transition-colors
                `}
                title={getHouseSignificance(houseNum)}
              >
                {/* Subtle corner decorations (reduced visual noise) */}
                {isLagna && (
                  <>
                    <div className="absolute top-0 right-0 w-3 h-3">
                      <div className="w-full h-full border-t-2 border-r-2 border-indigo-400 rounded-tr" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-3 h-3">
                      <div className="w-full h-full border-b-2 border-l-2 border-indigo-400 rounded-bl" />
                    </div>
                  </>
                )}

                {/* House number - improved hierarchy (smaller, less prominent) */}
                <div className={`
                  absolute top-1 left-1 text-[10px] font-semibold text-slate-500
                  ${isLagna ? "text-indigo-600 font-bold" : ""}
                `}>
                  {houseNum}
                </div>

                {/* Planets - improved hierarchy (medium size, tooltip on hover/tap) */}
                {house.planets && house.planets.length > 0 ? (
                  <div className="flex flex-wrap gap-1 justify-center max-w-full mt-2">
                    {house.planets.map((planet, idx) => {
                      const planetInfo = PLANET_NAMES[planet] || { hindi: planet, symbol: "•", color: "from-slate-400 to-slate-500" };
                      const abbr = getPlanetAbbr(planet);
                      // Improved color mapping - muted jewel tones (P0 fix)
                      const planetColor = planet === "Rahu" || planet === "Uranus" ? "text-red-500" :
                                        planet === "Jupiter" || planet === "Moon" ? "text-indigo-600" :
                                        planet === "Venus" || planet === "Neptune" ? "text-teal-600" :
                                        planet === "Mercury" ? "text-blue-600" :
                                        planet === "Sun" ? "text-amber-600" :
                                        planet === "Mars" ? "text-red-500" :
                                        planet === "Saturn" ? "text-slate-600" :
                                        planet === "Ketu" ? "text-amber-600" :
                                        "text-slate-700";
                      return (
                        <div
                          key={idx}
                          className={`text-xs font-semibold ${planetColor} cursor-help`}
                          title={`${planet} (${planetInfo.hindi}) - ${planetInfo.symbol || ""}`}
                        >
                          {abbr}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 mt-2" title="No planets in this house">—</div>
                )}

                {/* Sign name - Improved visibility and hierarchy */}
                <div className="absolute bottom-0 left-0 right-0 text-[9px] sm:text-[10px] font-semibold text-slate-700 bg-white/95 px-1.5 py-1 rounded-b border-t border-slate-200">
                  {signAbbr}
                </div>

                {/* Lagna indicator - improved styling */}
                {isLagna && (
                  <div className="absolute bottom-7 right-1 text-[9px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-300 shadow-sm">
                    लग्न
                  </div>
                )}
              </div>
            );
          })
        ))}
      </div>

      {/* Center diamond - North Indian style (reduced visual noise) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-dashed border-slate-300 rotate-45 bg-white/50 z-10 flex items-center justify-center">
        <div className="rotate-[-45deg] text-xs font-bold text-red-600">1</div>
        <div className="absolute -top-1 -right-1 text-[8px] font-bold text-red-600">10</div>
        <div className="absolute -bottom-1 -left-1 text-[8px] font-bold text-red-600">7</div>
        <div className="absolute -top-1 -left-1 text-[8px] font-bold text-red-600">4</div>
      </div>

      {/* Legend for planets (improved styling) */}
      <div className="mt-6 p-5 rounded-2xl border-2 border-slate-200 bg-slate-50">
        <div className="text-xs font-bold text-slate-900 mb-3 text-center">Planets (ग्रह) Legend</div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {Object.entries(PLANET_NAMES).map(([planet, info]) => (
            <div key={planet} className="flex items-center gap-1.5 text-[10px]">
              <div className={`w-5 h-5 rounded bg-gradient-to-r ${info.color} flex items-center justify-center text-white text-xs shadow-sm`}>
                {info.symbol}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900">{getPlanetAbbr(planet)}</span>
                <span className="text-[8px] text-slate-600">{info.hindi}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
