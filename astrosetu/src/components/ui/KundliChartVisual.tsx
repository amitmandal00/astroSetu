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

      {/* Main chart grid with North Indian Diamond Style - matching AstroSage */}
      <div className="relative grid grid-cols-4 gap-1 p-4 bg-white rounded-xl border-2 border-slate-300 shadow-lg">
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
                  aspect-square border border-dashed border-orange-400 p-1 flex flex-col items-center justify-center
                  ${isLagna 
                    ? "bg-blue-50 border-blue-500 border-2" 
                    : "bg-white"
                  }
                  relative overflow-hidden
                `}
                title={getHouseSignificance(houseNum)}
              >
                {/* Spiritual corner decorations */}
                <div className="absolute top-0 right-0 w-4 h-4">
                  <div className="w-full h-full border-t-2 border-r-2 border-saffron-400 rounded-tr" />
                </div>
                <div className="absolute bottom-0 left-0 w-4 h-4">
                  <div className="w-full h-full border-b-2 border-l-2 border-saffron-400 rounded-bl" />
                </div>

                {/* House number - AstroSage style (colored numbers) */}
                <div className={`
                  absolute top-0.5 left-0.5 text-[11px] font-bold
                  ${isLagna 
                    ? "text-blue-600" 
                    : houseNum === 10 ? "text-red-600" : houseNum === 7 ? "text-red-600" : houseNum === 4 ? "text-red-600" :
                    houseNum === 11 ? "text-purple-600" : houseNum === 12 ? "text-green-600" : houseNum === 3 ? "text-green-600" :
                    "text-black"
                  }
                `}>
                  {houseNum}
                </div>

                {/* Planets with AstroSage style (2-letter abbreviations, colored) */}
                {house.planets && house.planets.length > 0 ? (
                  <div className="flex flex-wrap gap-0.5 justify-center max-w-full mt-1">
                    {house.planets.map((planet, idx) => {
                      const planetInfo = PLANET_NAMES[planet] || { hindi: planet, symbol: "•", color: "from-slate-400 to-slate-500" };
                      const abbr = getPlanetAbbr(planet);
                      // Color mapping matching AstroSage
                      const planetColor = planet === "Rahu" || planet === "Uranus" ? "text-red-600" :
                                        planet === "Jupiter" || planet === "Moon" ? "text-purple-600" :
                                        planet === "Venus" || planet === "Neptune" ? "text-green-600" :
                                        planet === "Mercury" ? "text-blue-600" :
                                        planet === "Sun" || planet === "Mars" || planet === "Saturn" ? "text-red-600" :
                                        "text-black";
                      return (
                        <div
                          key={idx}
                          className={`text-[10px] font-bold ${planetColor}`}
                          title={`${planet} (${planetInfo.hindi})`}
                        >
                          {abbr}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-[9px] text-slate-400 mt-1">—</div>
                )}

                {/* Sign name - Enhanced visibility */}
                <div className="absolute bottom-0 left-0 right-0 text-[8px] sm:text-[9px] font-bold text-slate-900 bg-white/90 px-1 py-0.5 rounded-b border-t border-slate-200">
                  {signAbbr}
                </div>

                {/* Lagna indicator */}
                {isLagna && (
                  <div className="absolute bottom-6 right-1 text-[8px] font-bold text-saffron-700 bg-saffron-100 px-1.5 py-0.5 rounded border border-saffron-300 shadow-sm">
                    लग्न
                  </div>
                )}
              </div>
            );
          })
        ))}
      </div>

      {/* Center diamond - North Indian style (matching AstroSage) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-dashed border-orange-400 rotate-45 bg-white/50 z-10 flex items-center justify-center">
        <div className="rotate-[-45deg] text-xs font-bold text-red-600">1</div>
        <div className="absolute -top-1 -right-1 text-[8px] font-bold text-red-600">10</div>
        <div className="absolute -bottom-1 -left-1 text-[8px] font-bold text-red-600">7</div>
        <div className="absolute -top-1 -left-1 text-[8px] font-bold text-red-600">4</div>
      </div>

      {/* Legend for planets */}
      <div className="mt-6 p-4 rounded-2xl border-2 border-saffron-200 bg-gradient-to-r from-saffron-50 to-amber-50">
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
