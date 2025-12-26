"use client";

import { useMemo, useState } from "react";
import type { SynastryChart, BirthDetails } from "@/types/astrology";
import { apiPost } from "@/lib/http";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";

export default function SynastryPage() {
  // Person A
  const [aName, setAName] = useState("");
  const [aDob, setADob] = useState("1990-01-01");
  const [aTob, setATob] = useState("10:30");
  const [aPlace, setAPlace] = useState("New York");

  // Person B
  const [bName, setBName] = useState("");
  const [bDob, setBDob] = useState("1992-02-02");
  const [bTob, setBTob] = useState("12:15");
  const [bPlace, setBPlace] = useState("Los Angeles");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<SynastryChart | null>(null);

  const canSubmit = useMemo(
    () =>
      aDob.length === 10 && aTob.length >= 5 && aPlace.trim().length >= 2 &&
      bDob.length === 10 && bTob.length >= 5 && bPlace.trim().length >= 2,
    [aDob, aTob, aPlace, bDob, bTob, bPlace]
  );

  async function onSubmit(e?: React.MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    e?.stopPropagation();
    setErr(null);
    setLoading(true);
    try {
      const personA: BirthDetails = {
        dob: aDob,
        tob: aTob,
        place: aPlace,
        name: aName || undefined,
        latitude: 40.7128, // Default - should be geocoded
        longitude: -74.0060,
      };

      const personB: BirthDetails = {
        dob: bDob,
        tob: bTob,
        place: bPlace,
        name: bName || undefined,
        latitude: 34.0522, // Default - should be geocoded
        longitude: -118.2437,
      };

      const res = await apiPost<{ ok: boolean; data?: SynastryChart; error?: string }>(
        "/api/astrology/synastry",
        { personA, personB }
      );
      if (!res.ok) throw new Error(res.error || "Failed");
      setData(res.data ?? null);
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const getCompatibilityBadgeTone = (category: string) => {
    switch (category) {
      case "Excellent":
        return "green";
      case "Good":
        return "indigo";
      case "Moderate":
        return "amber";
      case "Challenging":
        return "red";
      default:
        return "neutral";
    }
  };

  const getAspectBadgeTone = (quality: string) => {
    switch (quality) {
      case "Harmonious":
        return "green";
      case "Challenging":
        return "red";
      case "Neutral":
        return "neutral";
      default:
        return "neutral";
    }
  };

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 text-4xl">💑</div>
          <div className="absolute top-4 right-4 text-4xl">✨</div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Synastry Chart</h1>
          <p className="text-white/90 text-base">
            Western astrology compatibility analysis between two birth charts
          </p>
        </div>
      </div>

      <Card>
        <CardHeader
          eyebrow="Birth Details"
          title="Synastry Compatibility"
          subtitle="Enter birth details for both people to analyze their astrological compatibility"
          icon="💑"
        />
        <CardContent>
          <div className="grid gap-6">
            {/* Person A */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
              <div className="text-sm font-bold text-slate-900 mb-4">Person A</div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Name (Optional)</div>
                  <Input
                    value={aName}
                    onChange={(e) => setAName(e.target.value)}
                    placeholder="Person A name"
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Date of Birth</div>
                  <Input
                    type="date"
                    value={aDob}
                    onChange={(e) => setADob(e.target.value)}
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Time of Birth</div>
                  <Input
                    type="time"
                    value={aTob}
                    onChange={(e) => setATob(e.target.value)}
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Place of Birth</div>
                  <AutocompleteInput
                    value={aPlace}
                    onChange={setAPlace}
                    placeholder="Start typing city name..."
                    prioritizeIndia={false}
                  />
                </div>
              </div>
            </div>

            {/* Person B */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-pink-50 to-rose-50 p-5">
              <div className="text-sm font-bold text-slate-900 mb-4">Person B</div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Name (Optional)</div>
                  <Input
                    value={bName}
                    onChange={(e) => setBName(e.target.value)}
                    placeholder="Person B name"
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Date of Birth</div>
                  <Input
                    type="date"
                    value={bDob}
                    onChange={(e) => setBDob(e.target.value)}
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Time of Birth</div>
                  <Input
                    type="time"
                    value={bTob}
                    onChange={(e) => setBTob(e.target.value)}
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Place of Birth</div>
                  <AutocompleteInput
                    value={bPlace}
                    onChange={setBPlace}
                    placeholder="Start typing city name..."
                    prioritizeIndia={false}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button onClick={onSubmit} disabled={!canSubmit || loading}>
              {loading ? "Analyzing compatibility between two charts" : "Calculate Synastry"}
            </Button>
            {err ? <span className="text-sm text-rose-700">{err}</span> : null}
          </div>
        </CardContent>
      </Card>

      {data ? (
        <div className="grid gap-5">
          {/* Compatibility Score */}
          <Card>
            <CardHeader eyebrow="Compatibility" title="Synastry Analysis" icon="💑" />
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-indigo-600 mb-2">
                  {data.compatibility.overall}
                </div>
                <div className="text-sm text-slate-600 mb-4">Compatibility Score</div>
                <Badge tone={getCompatibilityBadgeTone(data.compatibility.category)} className="text-lg px-4 py-2">
                  {data.compatibility.category} Match
                </Badge>
              </div>
              <p className="text-sm text-slate-700 text-center">{data.compatibility.summary}</p>
            </CardContent>
          </Card>

          {/* Chart Details */}
          <div className="grid md:grid-cols-2 gap-5">
            <Card>
              <CardHeader eyebrow="Person A" title={`${data.personA.birthDetails.name || "Person A"}'s Chart`} icon="👤" />
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Sun:</strong> {data.personA.sunSign}</div>
                  <div><strong>Moon:</strong> {data.personA.moonSign}</div>
                  <div><strong>Rising:</strong> {data.personA.risingSign}</div>
                  <div><strong>Midheaven:</strong> {data.personA.midheaven}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader eyebrow="Person B" title={`${data.personB.birthDetails.name || "Person B"}'s Chart`} icon="👤" />
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Sun:</strong> {data.personB.sunSign}</div>
                  <div><strong>Moon:</strong> {data.personB.moonSign}</div>
                  <div><strong>Rising:</strong> {data.personB.risingSign}</div>
                  <div><strong>Midheaven:</strong> {data.personB.midheaven}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aspects */}
          {data.compatibility.aspects.length > 0 && (
            <Card>
              <CardHeader eyebrow="Aspects" title="Planetary Aspects" icon="⭐" />
              <CardContent>
                <div className="space-y-3">
                  {data.compatibility.aspects.slice(0, 20).map((aspect, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-slate-900">
                          {aspect.planetA} {aspect.aspect} {aspect.planetB}
                        </div>
                        <Badge tone={getAspectBadgeTone(aspect.quality)}>{aspect.quality}</Badge>
                      </div>
                      <div className="text-sm text-slate-700">{aspect.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strengths & Challenges */}
          <div className="grid md:grid-cols-2 gap-5">
            {data.compatibility.strengths.length > 0 && (
              <Card>
                <CardHeader eyebrow="Strengths" title="Relationship Strengths" icon="✅" />
                <CardContent>
                  <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
                    {data.compatibility.strengths.map((strength, idx) => (
                      <li key={idx}>{strength}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {data.compatibility.challenges.length > 0 && (
              <Card>
                <CardHeader eyebrow="Challenges" title="Areas to Work On" icon="⚠️" />
                <CardContent>
                  <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
                    {data.compatibility.challenges.map((challenge, idx) => (
                      <li key={idx}>{challenge}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recommendations */}
          {data.compatibility.recommendations.length > 0 && (
            <Card>
              <CardHeader eyebrow="Guidance" title="Recommendations" icon="💡" />
              <CardContent>
                <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
                  {data.compatibility.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}

