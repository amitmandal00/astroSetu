"use client";

import { useMemo, useState } from "react";
import type { TransitChart, BirthDetails } from "@/types/astrology";
import { apiPost } from "@/lib/http";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";

export default function TransitPage() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("1990-01-01");
  const [tob, setTob] = useState("10:30");
  const [place, setPlace] = useState("New York");
  const [transitDate, setTransitDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<TransitChart | null>(null);

  const canSubmit = useMemo(
    () => dob.length === 10 && tob.length >= 5 && place.trim().length >= 2,
    [dob, tob, place]
  );

  async function onSubmit(e?: React.MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    e?.stopPropagation();
    setErr(null);
    setLoading(true);
    try {
      const birthDetails: BirthDetails = {
        dob,
        tob,
        place,
        name: name || undefined,
        latitude: 40.7128, // Default - should be geocoded
        longitude: -74.0060,
      };

      const res = await apiPost<{ ok: boolean; data?: TransitChart; error?: string }>(
        "/api/astrology/transit",
        { birthDetails, transitDate }
      );
      if (!res.ok) throw new Error(res.error || "Failed");
      setData(res.data ?? null);
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const getQualityBadgeTone = (quality: string) => {
    switch (quality) {
      case "Positive":
        return "green";
      case "Challenging":
        return "red";
      case "Neutral":
        return "neutral";
      default:
        return "neutral";
    }
  };

  const getImportanceBadgeTone = (importance: string) => {
    switch (importance) {
      case "Major":
        return "red";
      case "Moderate":
        return "amber";
      case "Minor":
        return "neutral";
      default:
        return "neutral";
    }
  };

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 text-4xl">🌙</div>
          <div className="absolute top-4 right-4 text-4xl">✨</div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Transit Charts</h1>
          <p className="text-white/90 text-base">
            See how current planetary transits are affecting your natal chart
          </p>
        </div>
      </div>

      <Card>
        <CardHeader
          eyebrow="Birth Details"
          title="Calculate Transit Chart"
          subtitle="Enter your birth details and select a date to see planetary transits"
          icon="🌙"
        />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Name (Optional)</div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Date of Birth</div>
              <Input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Time of Birth</div>
              <Input
                type="time"
                value={tob}
                onChange={(e) => setTob(e.target.value)}
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Place of Birth</div>
              <AutocompleteInput
                value={place}
                onChange={setPlace}
                placeholder="Start typing city name..."
                prioritizeIndia={false}
              />
            </div>
            <div className="md:col-span-2">
              <div className="text-xs font-semibold text-slate-600 mb-2">Transit Date (Optional - defaults to today)</div>
              <Input
                type="date"
                value={transitDate}
                onChange={(e) => setTransitDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button onClick={onSubmit} disabled={!canSubmit || loading}>
              {loading ? "Calculating Transits..." : "Get Transit Chart"}
            </Button>
            {err ? <span className="text-sm text-rose-700">{err}</span> : null}
          </div>
        </CardContent>
      </Card>

      {data ? (
        <div className="grid gap-5">
          {/* Daily Forecast */}
          <Card>
            <CardHeader eyebrow="Daily Forecast" title={`Transits for ${data.transitDate}`} icon="📅" />
            <CardContent>
              <p className="text-sm text-slate-700 mb-4">{data.summary}</p>
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <div className="font-semibold text-slate-900 mb-2">Today's Focus</div>
                <p className="text-sm text-slate-700">{data.dailyForecast}</p>
              </div>
            </CardContent>
          </Card>

          {/* Major Transits */}
          {data.majorTransits.length > 0 && (
            <Card>
              <CardHeader eyebrow="Major Transits" title="Significant Planetary Influences" icon="⭐" />
              <CardContent>
                <div className="space-y-4">
                  {data.majorTransits.map((transit, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-bold text-slate-900">{transit.transit}</div>
                          <div className="text-xs text-slate-600 mt-1">{transit.dates}</div>
                        </div>
                        <Badge tone={getImportanceBadgeTone(transit.importance)}>
                          {transit.importance}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-700">{transit.effect}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Transits */}
          {data.transits.length > 0 && (
            <Card>
              <CardHeader eyebrow="Current Transits" title="Planetary Positions" icon="🪐" />
              <CardContent>
                <div className="space-y-4">
                  {data.transits.map((transit, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-bold text-slate-900">{transit.planet}</div>
                          <div className="text-sm text-slate-600">
                            {transit.sign} • House {transit.house} • {transit.degree.toFixed(2)}°
                          </div>
                        </div>
                      </div>

                      {transit.aspectsToNatal.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-semibold text-slate-600">Aspects to Natal Chart:</div>
                          {transit.aspectsToNatal.map((aspect, aIdx) => (
                            <div key={aIdx} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-sm font-semibold">
                                  {aspect.natalPlanet} {aspect.aspect}
                                </div>
                                <Badge tone={getQualityBadgeTone(aspect.quality)} className="text-xs">
                                  {aspect.quality}
                                </Badge>
                              </div>
                              <div className="text-xs text-slate-700">{aspect.effect}</div>
                              <div className="text-xs text-slate-600 mt-1">Duration: {aspect.duration}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}

