"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { PlanetPosition, KundliChart } from "@/types/astrology";
import { detectYogas } from "@/lib/chartAnalysis";

type YogasAnalysisProps = {
  planets: PlanetPosition[];
  chart?: KundliChart;
};

export function YogasAnalysis({ planets, chart }: YogasAnalysisProps) {
  if (!chart) {
    return (
      <Card>
        <CardHeader 
          eyebrow="Yogas" 
          title="Planetary Combinations (Yogas)" 
          subtitle="Important planetary combinations in your chart"
          icon="✨"
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
  
  const yogas = detectYogas(planets, chart);
  
  if (yogas.length === 0) {
    return (
      <Card>
        <CardHeader 
          eyebrow="Yogas" 
          title="Planetary Combinations (Yogas)" 
          subtitle="Important planetary combinations in your chart"
          icon="✨"
        />
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <div className="text-4xl mb-2">🔍</div>
            <div className="text-sm">No major yogas detected in your chart</div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader 
        eyebrow="Yogas" 
        title="Planetary Combinations (Yogas)" 
        subtitle="Important planetary combinations in your chart"
        icon="✨"
      />
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {yogas.map((yoga, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border-2 ${
                yoga.type === "benefic"
                  ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50"
                  : yoga.type === "malefic"
                  ? "border-red-300 bg-gradient-to-br from-red-50 to-rose-50"
                  : "border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50"
              } shadow-md hover:shadow-lg transition-all`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-slate-900">{yoga.name}</h3>
                    <Badge 
                      tone={yoga.type === "benefic" ? "green" : yoga.type === "malefic" ? "red" : "amber"}
                      className="text-xs"
                    >
                      {yoga.type}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600 mb-2">{yoga.description}</div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-xs font-semibold text-slate-600 mb-1">Planets Involved:</div>
                <div className="flex flex-wrap gap-1">
                  {yoga.planets.map((planet, pIdx) => (
                    <Badge key={pIdx} tone="indigo" className="text-xs">
                      {planet}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="pt-3 border-t border-slate-200">
                <div className="text-xs font-semibold text-slate-700 mb-1">Impact:</div>
                <div className="text-sm text-slate-800 leading-relaxed">{yoga.impact}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

