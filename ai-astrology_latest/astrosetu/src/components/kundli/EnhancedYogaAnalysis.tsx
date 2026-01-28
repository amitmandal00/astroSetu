/**
 * Enhanced Yoga Analysis Component
 * Uses Prokerala API for detailed yoga analysis
 * Shows Raj Yogas, Dhan Yogas, and other planetary combinations
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { apiPost } from "@/lib/http";
import type { BirthDetails } from "@/types/astrology";

type EnhancedYogaAnalysisProps = {
  birthDetails: BirthDetails;
};

type Yoga = {
  name: string;
  type?: "benefic" | "malefic" | "neutral";
  planets: string[];
  description?: string;
  effects?: string[];
  impact?: string;
};

export function EnhancedYogaAnalysis({ birthDetails }: EnhancedYogaAnalysisProps) {
  const [yogas, setYogas] = useState<Yoga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchYogas() {
      if (!birthDetails.latitude || !birthDetails.longitude || !birthDetails.dob || !birthDetails.tob) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const res = await apiPost<{ ok: boolean; data?: { yogas: Yoga[] }; error?: string }>("/api/astrology/yoga", {
          dob: birthDetails.dob,
          tob: birthDetails.tob,
          place: birthDetails.place,
          latitude: birthDetails.latitude,
          longitude: birthDetails.longitude,
          timezone: birthDetails.timezone || "Asia/Kolkata",
          ayanamsa: birthDetails.ayanamsa || 1,
        });

        if (!res.ok) throw new Error(res.error || "Failed to fetch yoga analysis");
        setYogas(res.data?.yogas || []);
      } catch (e: any) {
        console.log("[EnhancedYoga] Could not fetch yoga analysis:", e);
        setError(e?.message || "Yoga analysis not available");
        setYogas([]);
      } finally {
        setLoading(false);
      }
    }

    fetchYogas();
  }, [birthDetails]);

  if (loading) {
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
            <div className="animate-spin text-4xl mb-2">🌙</div>
            <div className="text-sm">Analyzing yogas...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || yogas.length === 0) {
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
            <div className="text-sm">
              {error || "No major yogas detected in your chart"}
            </div>
            {error && (
              <Button 
                variant="secondary" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            )}
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
                    {yoga.type && (
                      <Badge 
                        tone={yoga.type === "benefic" ? "green" : yoga.type === "malefic" ? "red" : "amber"}
                        className="text-xs"
                      >
                        {yoga.type}
                      </Badge>
                    )}
                  </div>
                  {yoga.description && (
                    <div className="text-sm text-slate-600 mb-2">{yoga.description}</div>
                  )}
                </div>
              </div>
              
              {yoga.planets && yoga.planets.length > 0 && (
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
              )}
              
              {yoga.impact && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="text-xs font-semibold text-slate-700 mb-1">Impact:</div>
                  <div className="text-sm text-slate-800 leading-relaxed">{yoga.impact}</div>
                </div>
              )}

              {yoga.effects && yoga.effects.length > 0 && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="text-xs font-semibold text-slate-700 mb-1">Effects:</div>
                  <ul className="text-sm text-slate-800 space-y-1">
                    {yoga.effects.map((effect, eIdx) => (
                      <li key={eIdx}>• {effect}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

