/**
 * Comprehensive Chart Summary Card
 * Key insights at a glance - inspired by AstroSage dashboard
 * Shows most important information in a compact, scannable format
 */

"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TermTooltip } from "@/components/ui/ProgressiveDisclosure";
import type { KundliResult, DoshaAnalysis } from "@/types/astrology";
import { calculatePlanetaryStrengths } from "@/lib/chartAnalysis";

type ChartSummaryCardProps = {
  kundliData: KundliResult;
  dosha?: DoshaAnalysis;
};

export function ChartSummaryCard({ kundliData, dosha }: ChartSummaryCardProps) {
  const strengths = calculatePlanetaryStrengths(kundliData.planets);
  
  // Calculate overall chart strength
  const avgStrength = Object.values(strengths).reduce((sum, s) => sum + (s.strength || 0), 0) / kundliData.planets.length;
  const chartStrength = Math.round(avgStrength);

  // Count strong planets (strength > 70)
  const strongPlanets = Object.values(strengths).filter(s => s.strength > 70).length;
  
  // Count exalted/own sign planets
  const favorablePlanets = Object.values(strengths).filter(
    s => s.position === "exalted" || s.position === "own"
  ).length;

  // Get retrograde planets
  const retrogradePlanets = kundliData.planets.filter(p => p.retrograde);

  return (
    <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-300">
      <CardHeader 
        eyebrow="Chart Summary" 
        title="Birth Chart Overview"
        subtitle="Key insights at a glance"
        icon="🔮"
      />
      <CardContent className="card-enhanced">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Chart Strength */}
          <div className="p-4 rounded-xl bg-white border-2 border-indigo-200">
            <div className="text-xs font-semibold text-slate-600 mb-2">Overall Strength</div>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-indigo-700">{chartStrength}%</div>
              <div className="flex-1">
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${
                      chartStrength >= 70 ? "from-emerald-500 to-green-600" :
                      chartStrength >= 50 ? "from-amber-500 to-yellow-600" :
                      "from-orange-500 to-amber-600"
                    } transition-all`}
                    style={{ width: `${chartStrength}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Favorable Planets */}
          <div className="p-4 rounded-xl bg-white border-2 border-emerald-200">
            <div className="text-xs font-semibold text-slate-600 mb-2">Favorable Planets</div>
            <div className="text-3xl font-bold text-emerald-700">{favorablePlanets}</div>
            <div className="text-xs text-slate-600 mt-1">Exalted/Own Sign</div>
          </div>

          {/* Strong Planets */}
          <div className="p-4 rounded-xl bg-white border-2 border-blue-200">
            <div className="text-xs font-semibold text-slate-600 mb-2">Strong Planets</div>
            <div className="text-3xl font-bold text-blue-700">{strongPlanets}</div>
            <div className="text-xs text-slate-600 mt-1">Strength &gt; 70%</div>
          </div>

          {/* Retrograde Planets */}
          <div className="p-4 rounded-xl bg-white border-2 border-amber-200">
            <div className="text-xs font-semibold text-slate-600 mb-2">Retrograde Planets</div>
            <div className="text-3xl font-bold text-amber-700">{retrogradePlanets.length}</div>
            <div className="text-xs text-slate-600 mt-1">
              {retrogradePlanets.length > 0 
                ? retrogradePlanets.map(p => p.name).join(", ")
                : "None"
              }
            </div>
          </div>
        </div>

        {/* Key Identifiers Grid */}
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-white/70 border border-indigo-200">
            <div className="text-xs font-semibold text-indigo-600 mb-1">
              <TermTooltip term="Lagna">Ascendant (Lagna)</TermTooltip>
            </div>
            <div className="text-xl font-bold text-slate-900">{kundliData.ascendant || "—"}</div>
          </div>

          <div className="p-4 rounded-xl bg-white/70 border border-purple-200">
            <div className="text-xs font-semibold text-purple-600 mb-1">
              <TermTooltip term="Rashi">Moon Sign (Rashi)</TermTooltip>
            </div>
            <div className="text-xl font-bold text-slate-900">{kundliData.rashi || "—"}</div>
          </div>

          <div className="p-4 rounded-xl bg-white/70 border border-pink-200">
            <div className="text-xs font-semibold text-pink-600 mb-1">
              <TermTooltip term="Nakshatra">Nakshatra</TermTooltip>
            </div>
            <div className="text-xl font-bold text-slate-900">{kundliData.nakshatra || "—"}</div>
          </div>

          {/* Current Dasha - removed chart.dasha access as it's not in KundliResult type */}
        </div>

        {/* Dosha Summary */}
        {dosha && (
          <div className="p-4 rounded-xl bg-white/70 border-2 border-rose-200">
            <div className="text-xs font-bold text-rose-700 mb-3">Dosha Status</div>
            <div className="grid sm:grid-cols-3 gap-3">
              {dosha.manglik && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge tone={dosha.manglik.status === "Manglik" ? "red" : "green"} className="text-xs">
                      {dosha.manglik.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-600">Mangal Dosha</div>
                </div>
              )}
              {dosha.kaalSarp && dosha.kaalSarp.present && (
                <div>
                  <Badge tone="red" className="text-xs">Kaal Sarp Dosha</Badge>
                  <div className="text-xs text-slate-600 mt-1">Present{dosha.kaalSarp.type ? ` (${dosha.kaalSarp.type})` : ""}</div>
                </div>
              )}
              {dosha.shani && dosha.shani.effects && dosha.shani.effects.length > 0 && (
                <div>
                  <Badge tone="amber" className="text-xs">Shani Dosha</Badge>
                  <div className="text-xs text-slate-600 mt-1">
                    {dosha.shani.severity || "Present"}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-slate-900">{kundliData.planets.length}</div>
              <div className="text-xs text-slate-600">Planets</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">12</div>
              <div className="text-xs text-slate-600">Houses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">27</div>
              <div className="text-xs text-slate-600">Nakshatras</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

