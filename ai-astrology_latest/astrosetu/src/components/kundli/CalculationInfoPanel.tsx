/**
 * Calculation Info Panel
 * Shows Ayanamsa, coordinates, timezone, ephemeris info for credibility
 */

"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface CalculationInfoPanelProps {
  ayanamsa: string;
  coordinates?: { latitude: number; longitude: number };
  timezone: string;
  ephemeris?: string;
  place?: string;
  className?: string;
}

export function CalculationInfoPanel({
  ayanamsa,
  coordinates,
  timezone,
  ephemeris = "Standard planetary model",
  place,
  className = ""
}: CalculationInfoPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className={className}>
      <CardContent className="pt-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">ℹ️</span>
            <span className="text-sm font-semibold text-slate-900">
              Calculation Information
            </span>
          </div>
          <span className="text-slate-500 text-xs">
            {isOpen ? "▲" : "▼"}
          </span>
        </button>
        
        {isOpen && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-600">Ayanamsa:</span>
              <Badge tone="indigo" className="text-xs">{ayanamsa}</Badge>
            </div>
            
            {coordinates && (
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-slate-600">Coordinates:</span>
                <span className="text-xs text-slate-900 font-mono">
                  {coordinates.latitude.toFixed(4)}°N, {coordinates.longitude.toFixed(4)}°E
                </span>
              </div>
            )}
            
            {place && (
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-slate-600">Location:</span>
                <span className="text-xs text-slate-900">{place}</span>
              </div>
            )}
            
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-600">Timezone:</span>
              <span className="text-xs text-slate-900">{timezone}</span>
            </div>
            
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-600">Ephemeris:</span>
              <span className="text-xs text-slate-900">{ephemeris}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

