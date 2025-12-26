"use client";

import { useMemo, useState } from "react";
import type { WesternNatalChart, BirthDetails } from "@/types/astrology";
import { apiPost } from "@/lib/http";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";

export default function WesternNatalPage() {
  const [dob, setDob] = useState("1990-01-01");
  const [tob, setTob] = useState("10:30");
  const [place, setPlace] = useState("New York");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<WesternNatalChart | null>(null);

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

      const res = await apiPost<{ ok: boolean; data?: WesternNatalChart; error?: string }>(
        "/api/astrology/western-natal",
        birthDetails
      );
      if (!res.ok) throw new Error(res.error || "Failed");
      setData(res.data ?? null);
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 text-4xl">⭐</div>
          <div className="absolute top-4 right-4 text-4xl">✨</div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Western Natal Chart</h1>
          <p className="text-white/90 text-base">
            Your complete Western astrology birth chart with planets, houses, and aspects
          </p>
        </div>
      </div>

      <Card>
        <CardHeader
          eyebrow="Birth Details"
          title="Calculate Your Natal Chart"
          subtitle="Enter your birth information to generate your Western astrology chart"
          icon="⭐"
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
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button onClick={onSubmit} disabled={!canSubmit || loading}>
              {loading ? "Calculating..." : "Generate Natal Chart"}
            </Button>
            {err ? <span className="text-sm text-rose-700">{err}</span> : null}
          </div>
        </CardContent>
      </Card>

      {data ? (
        <div className="grid gap-5">
          {/* Summary */}
          <Card>
            <CardHeader eyebrow="Chart Summary" title="Your Natal Chart" icon="⭐" />
            <CardContent>
              <p className="text-sm text-slate-700 mb-4">{data.summary}</p>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                  <div className="text-xs font-semibold text-slate-600 mb-1">Sun Sign</div>
                  <div className="text-lg font-bold text-indigo-900">{data.sunSign}</div>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                  <div className="text-xs font-semibold text-slate-600 mb-1">Moon Sign</div>
                  <div className="text-lg font-bold text-purple-900">{data.moonSign}</div>
                </div>
                <div className="p-3 rounded-xl bg-pink-50 border border-pink-200">
                  <div className="text-xs font-semibold text-slate-600 mb-1">Rising Sign</div>
                  <div className="text-lg font-bold text-pink-900">{data.risingSign}</div>
                </div>
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
                  <div className="text-xs font-semibold text-slate-600 mb-1">Midheaven</div>
                  <div className="text-lg font-bold text-teal-900">{data.midheaven}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Planets */}
          <Card>
            <CardHeader eyebrow="Planetary Positions" title="Planets in Signs & Houses" icon="🪐" />
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {data.planets.map((planet, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-slate-900">{planet.name}</div>
                      {planet.retrograde && (
                        <Badge tone="amber" className="text-xs">Retrograde</Badge>
                      )}
                    </div>
                    <div className="text-sm text-slate-700">
                      <div>Sign: <strong>{planet.sign}</strong></div>
                      <div>House: <strong>{planet.house}</strong></div>
                      <div>Degree: <strong>{planet.degree.toFixed(2)}°</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Houses */}
          <Card>
            <CardHeader eyebrow="Houses" title="House Cusps" icon="🏠" />
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                {data.houses.map((house) => (
                  <div key={house.number} className="p-3 rounded-lg border border-slate-200 bg-white">
                    <div className="text-sm font-bold text-slate-900">
                      {house.number}st House: {house.sign}
                    </div>
                    <div className="text-xs text-slate-600">{house.cuspDegree.toFixed(2)}°</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dominant Elements */}
          {data.dominantElements.length > 0 && (
            <Card>
              <CardHeader eyebrow="Chart Analysis" title="Dominant Elements" icon="🔥" />
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  {data.dominantElements.map((elem, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                      <div className="text-lg font-bold text-slate-900">{elem.element}</div>
                      <div className="text-2xl font-bold text-indigo-600 mt-1">{elem.percentage}%</div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${elem.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dominant Modalities */}
          {data.dominantModalities.length > 0 && (
            <Card>
              <CardHeader eyebrow="Chart Analysis" title="Dominant Modalities" icon="⚡" />
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {data.dominantModalities.map((mod, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                      <div className="text-lg font-bold text-slate-900">{mod.modality}</div>
                      <div className="text-2xl font-bold text-purple-600 mt-1">{mod.percentage}%</div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${mod.percentage}%` }}
                        />
                      </div>
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

