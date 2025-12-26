"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { PlanetPosition, KundliChart } from "@/types/astrology";
import { analyzeHouses } from "@/lib/chartAnalysis";

type HouseAnalysisProps = {
  planets: PlanetPosition[];
  chart?: KundliChart;
};

export function HouseAnalysis({ planets, chart }: HouseAnalysisProps) {
  if (!chart) {
    return (
      <Card>
        <CardHeader 
          eyebrow="Houses" 
          title="House Analysis" 
          subtitle="Detailed analysis of each house in your birth chart"
          icon="🏠"
        />
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <div className="text-4xl mb-2">🔍</div>
            <div className="text-sm">Chart data not available</div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const analyses = analyzeHouses(planets, chart);
  
  const houseNames: Record<number, string> = {
    1: "Lagna (Self)",
    2: "Dhana (Wealth)",
    3: "Sahaja (Siblings)",
    4: "Sukha (Happiness)",
    5: "Putra (Children)",
    6: "Ripu (Enemies)",
    7: "Kalatra (Spouse)",
    8: "Ayush (Longevity)",
    9: "Bhagya (Fortune)",
    10: "Karma (Career)",
    11: "Labha (Gains)",
    12: "Vyaya (Expenses)",
  };
  
  return (
    <Card>
      <CardHeader 
        eyebrow="House Analysis" 
        title="Bhav Phal (House Analysis)" 
        subtitle="Detailed analysis of all 12 houses"
        icon="🏠"
      />
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyses.map((analysis) => (
            <div
              key={analysis.houseNumber}
              className={`p-4 rounded-xl border-2 ${
                analysis.houseNumber === 1
                  ? "border-blue-300 bg-blue-50/50"
                  : [4, 7, 10].includes(analysis.houseNumber)
                  ? "border-red-300 bg-red-50/50"
                  : [1, 5, 9].includes(analysis.houseNumber)
                  ? "border-purple-300 bg-purple-50/50"
                  : "border-slate-200 bg-white"
              } hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-sm text-slate-900">
                  {analysis.houseNumber}st House
                </div>
                <Badge tone="indigo" className="text-xs">
                  {analysis.sign}
                </Badge>
              </div>
              
              <div className="text-xs font-semibold text-slate-600 mb-2">
                {houseNames[analysis.houseNumber]}
              </div>
              
              <div className="mb-2">
                <div className="text-xs font-semibold text-slate-600 mb-1">Lord: {analysis.lord}</div>
                {analysis.planets.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysis.planets.map((planet, idx) => (
                      <Badge key={idx} tone="purple" className="text-xs">
                        {planet}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              {analysis.strengths.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-semibold text-emerald-700 mb-1">✓ Strengths:</div>
                  <ul className="text-xs text-slate-700 space-y-0.5">
                    {analysis.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span>•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysis.challenges.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-semibold text-orange-700 mb-1">⚠ Challenges:</div>
                  <ul className="text-xs text-slate-700 space-y-0.5">
                    {analysis.challenges.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span>•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-2 pt-2 border-t border-slate-200">
                <div className="text-xs text-slate-600 leading-relaxed">
                  {analysis.analysis}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

