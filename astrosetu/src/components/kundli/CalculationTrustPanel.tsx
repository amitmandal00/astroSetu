"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type Props = {
  ayanamsa: number;
  place: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
  isAPIConfigured?: boolean | null;
};

/**
 * Compact, user‑facing explanation of how calculations are done.
 * Goal: make it obvious that AstroSetu matches industry‑standard
 * setups like AstroSage (Lahiri ayanamsa, high‑quality ephemeris, etc.).
 */
export function CalculationTrustPanel({
  ayanamsa,
  place,
  latitude,
  longitude,
  timezone,
  isAPIConfigured,
}: Props) {
  const isLahiri = ayanamsa === 1;

  return (
    <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/70 mt-4">
      <CardHeader
        eyebrow="Why you can trust this Kundli"
        title="Calculation Settings & Proof"
        icon="🧭"
      />
      <CardContent className="space-y-3 text-sm text-slate-700">
        <div className="flex flex-wrap gap-2">
          <Badge tone={isLahiri ? "green" : "amber"}>
            Ayanamsa: {isLahiri ? "Lahiri (matches AstroSage)" : `Custom (${ayanamsa})`}
          </Badge>
          <Badge tone={isAPIConfigured ? "green" : "amber"}>
            Ephemeris: {isAPIConfigured ? "Live Prokerala API" : "Local fallback engine"}
          </Badge>
          <Badge tone="indigo">Rahu / Ketu: Mean node model</Badge>
          <Badge tone="indigo">Timezone: {timezone}</Badge>
        </div>

        <div className="space-y-1">
          <div className="font-semibold text-slate-900">Birth place resolved</div>
          <p>
            <span className="font-medium">Place:</span> {place || "Not set yet"}
          </p>
          {latitude != null && longitude != null && (
            <p className="text-xs text-slate-600">
              <span className="font-medium text-slate-700">Coordinates:</span>{" "}
              {latitude.toFixed(4)}, {longitude.toFixed(4)} &bull; standardised for
              accurate lagna / house calculations.
            </p>
          )}
        </div>

        <div className="mt-2 rounded-xl bg-white/70 border border-emerald-100 p-3 text-xs leading-relaxed text-slate-700">
          <p className="font-semibold mb-1 text-emerald-800">Aligned with industry practice</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Same Lahiri ayanamsa configuration used by popular apps like AstroSage.</li>
            <li>Ephemeris data comes from a professional API provider (Prokerala) when configured.</li>
            <li>Timezone and coordinates are applied so ascendant and planetary degrees stay consistent.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

