"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { PlanetPosition } from "@/types/astrology";
import { calculateAspects, calculateRelationships, calculateConjunctions } from "@/lib/chartAnalysis";

type AspectsAndRelationshipsProps = {
  planets: PlanetPosition[];
};

export function AspectsAndRelationships({ planets }: AspectsAndRelationshipsProps) {
  const aspects = calculateAspects(planets);
  const relationships = calculateRelationships(planets);
  const conjunctions = calculateConjunctions(planets);
  
  return (
    <>
      {/* Planetary Aspects */}
      {aspects.length > 0 && (
        <Card>
          <CardHeader 
            eyebrow="Aspects" 
            title="Planetary Aspects (Drishti)" 
            subtitle="Planets aspecting each other in your chart"
            icon="👁️"
          />
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {aspects.map((aspect, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-purple-200 bg-purple-50/50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-purple-900">{aspect.from}</span>
                    <span className="text-purple-600">→</span>
                    <span className="font-bold text-sm text-purple-900">{aspect.to}</span>
                    <Badge tone="indigo" className="text-xs ml-auto">
                      {aspect.aspect}th
                    </Badge>
                  </div>
                  <div className="text-xs text-purple-700">{aspect.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Planetary Relationships */}
      <Card>
        <CardHeader 
          eyebrow="Relationships" 
          title="Planetary Relationships" 
          subtitle="How planets interact with each other"
          icon="🤝"
        />
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {relationships.filter(r => r.relationship !== "neutral").map((rel, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  rel.relationship === "friendly"
                    ? "border-green-200 bg-green-50/50"
                    : "border-orange-200 bg-orange-50/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm">{rel.planet1}</span>
                  <span className="text-slate-600">↔</span>
                  <span className="font-bold text-sm">{rel.planet2}</span>
                  <Badge 
                    tone={rel.relationship === "friendly" ? "green" : "orange"} 
                    className="text-xs ml-auto"
                  >
                    {rel.relationship}
                  </Badge>
                </div>
                <div className="text-xs text-slate-600">{rel.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Conjunctions */}
      {conjunctions.length > 0 && (
        <Card>
          <CardHeader 
            eyebrow="Conjunctions" 
            title="Planetary Conjunctions" 
            subtitle="Planets placed together in the same house"
            icon="🔗"
          />
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {conjunctions.map((conj, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-2 ${
                    conj.type === "benefic"
                      ? "border-emerald-300 bg-emerald-50/50"
                      : conj.type === "malefic"
                      ? "border-red-300 bg-red-50/50"
                      : "border-amber-300 bg-amber-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-sm">House {conj.house}</div>
                    <Badge 
                      tone={conj.type === "benefic" ? "green" : conj.type === "malefic" ? "red" : "amber"}
                      className="text-xs"
                    >
                      {conj.type}
                    </Badge>
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mb-1">
                    {conj.planets.join(", ")}
                  </div>
                  <div className="text-xs text-slate-600">{conj.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

