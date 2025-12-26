"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { PlanetPosition } from "@/types/astrology";
import { calculatePlanetaryStrengths } from "@/lib/chartAnalysis";

type PlanetaryAnalysisProps = {
  planets: PlanetPosition[];
};

export function PlanetaryAnalysis({ planets }: PlanetaryAnalysisProps) {
  const strengths = calculatePlanetaryStrengths(planets);
  
  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return "from-emerald-500 to-green-600";
    if (strength >= 60) return "from-amber-500 to-yellow-600";
    if (strength >= 40) return "from-orange-500 to-amber-600";
    return "from-red-500 to-rose-600";
  };
  
  const getPositionBadgeColor = (position: string) => {
    switch (position) {
      case "exalted": return "emerald";
      case "own": return "blue";
      case "friendly": return "indigo";
      case "enemy": return "orange";
      case "debilitated": return "red";
      default: return "slate";
    }
  };
  
  return (
    <Card>
      <CardHeader 
        eyebrow="Planetary Analysis" 
        title="Graha Bal (Planetary Strengths)" 
        subtitle="Analysis of planetary positions and strengths"
        icon="⭐"
      />
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {planets.map((planet) => {
            const strength = strengths[planet.name];
            if (!strength) return null;
            
            return (
              <div
                key={planet.name}
                className="p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-purple-300 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{planet.name}</div>
                    <div className="text-xs text-slate-600">
                      {planet.sign} • House {planet.house}
                    </div>
                  </div>
                  {planet.retrograde && (
                    <Badge tone="red" className="text-xs">R</Badge>
                  )}
                </div>
                
                {/* Strength Bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-600">Strength</span>
                    <span className="text-xs font-bold text-slate-900">{strength.strength}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getStrengthColor(strength.strength)} transition-all`}
                      style={{ width: `${strength.strength}%` }}
                    />
                  </div>
                </div>
                
                {/* Position Badge */}
                <div className="mt-3">
                  <Badge tone={getPositionBadgeColor(strength.position)} className="text-xs">
                    {strength.position.charAt(0).toUpperCase() + strength.position.slice(1)}
                  </Badge>
                </div>
                
                {/* Description */}
                <div className="mt-2 text-xs text-slate-600">
                  {strength.description}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

