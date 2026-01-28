/**
 * Enhanced Dasha Analysis Component
 * Shows detailed dasha periods, antardashas, and predictions
 * Inspired by AstroSage/AstroTalk comprehensive dasha displays
 */

"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { KundliResult, KundliChart } from "@/types/astrology";

type EnhancedDashaAnalysisProps = {
  kundliData: KundliResult & { chart?: KundliChart };
};

type DashaPeriod = {
  planet: string;
  period: string;
  startDate: string;
  endDate: string;
  description?: string;
};

const PLANET_COLORS: Record<string, string> = {
  Sun: "from-orange-500 to-amber-500",
  Moon: "from-slate-300 to-slate-400",
  Mars: "from-red-500 to-rose-500",
  Mercury: "from-emerald-500 to-green-500",
  Jupiter: "from-amber-500 to-yellow-500",
  Venus: "from-pink-400 to-rose-400",
  Saturn: "from-slate-600 to-slate-700",
  Rahu: "from-purple-500 to-indigo-500",
  Ketu: "from-orange-600 to-red-600",
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mars: "♂",
  Mercury: "☿",
  Jupiter: "♃",
  Venus: "♀",
  Saturn: "♄",
  Rahu: "☊",
  Ketu: "☋",
};

export function EnhancedDashaAnalysis({ kundliData }: EnhancedDashaAnalysisProps) {

  // Fallback to chart dasha if enhanced not available
  const currentDasha: DashaPeriod | null = kundliData.chart?.dasha?.current ? {
    planet: kundliData.chart.dasha.current,
    period: "Calculating...",
    startDate: kundliData.chart.dasha.startDate || "",
    endDate: "",
  } : null;

  const nextDasha: DashaPeriod | null = kundliData.chart?.dasha?.next ? {
    planet: kundliData.chart.dasha.next,
    period: "Calculating...",
    startDate: "",
    endDate: "",
  } : null;

  if (!currentDasha) {
    return null;
  }

  return (
    <Card>
      <CardHeader 
        eyebrow="Dasha Analysis" 
        title="Planetary Periods (दशा / महादशा)" 
        subtitle="Current and upcoming planetary periods influencing your life"
        icon="📿"
      />
      <CardContent className="card-enhanced space-y-6">
        {/* Current Dasha - Highlighted */}
        {currentDasha && (
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 border-2 border-indigo-300 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${PLANET_COLORS[currentDasha.planet] || "from-slate-400 to-slate-500"} flex items-center justify-center text-3xl shadow-lg`}>
                  {PLANET_SYMBOLS[currentDasha.planet] || "•"}
                </div>
                <div>
                  <div className="text-xs font-semibold text-indigo-600 mb-1">Current Mahadasha</div>
                  <div className="text-2xl font-bold text-slate-900">{currentDasha.planet}</div>
                  <div className="text-sm text-slate-600 mt-1">{currentDasha.period}</div>
                </div>
              </div>
              <Badge tone="green" className="text-xs">Active</Badge>
            </div>
            
            {currentDasha.startDate && (
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <div className="p-3 rounded-xl bg-white/70 border border-indigo-200">
                  <div className="text-xs font-semibold text-slate-600 mb-1">Start Date</div>
                  <div className="text-sm font-bold text-slate-900">{new Date(currentDasha.startDate).toLocaleDateString()}</div>
                </div>
                {currentDasha.endDate && (
                  <div className="p-3 rounded-xl bg-white/70 border border-indigo-200">
                    <div className="text-xs font-semibold text-slate-600 mb-1">End Date</div>
                    <div className="text-sm font-bold text-slate-900">{new Date(currentDasha.endDate).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            )}

            {currentDasha.description && (
              <div className="mt-4 p-4 rounded-xl bg-white/70 border border-indigo-200">
                <div className="text-sm text-slate-700 leading-relaxed">{currentDasha.description}</div>
              </div>
            )}

          </div>
        )}

        {/* Next Dasha */}
        {nextDasha && (
          <div className="p-5 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${PLANET_COLORS[nextDasha.planet] || "from-slate-400 to-slate-500"} flex items-center justify-center text-2xl shadow-md`}>
                {PLANET_SYMBOLS[nextDasha.planet] || "•"}
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-600 mb-1">Next Mahadasha</div>
                <div className="text-lg font-bold text-slate-900">{nextDasha.planet}</div>
              </div>
            </div>
            {nextDasha.startDate && (
              <div className="text-xs text-slate-600">
                Starts: {new Date(nextDasha.startDate).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        {/* Info Note */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-xs text-slate-600 leading-relaxed">
            <strong>About Dasha:</strong> Planetary periods (Dasha) influence different phases of life. The current Mahadasha (major period) and its Antardashas (sub-periods) determine the themes and experiences you&apos;ll encounter. Each planet brings its unique energies and lessons.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

