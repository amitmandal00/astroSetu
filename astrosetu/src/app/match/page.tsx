"use client";

import { useMemo, useState } from "react";
import type { MatchResult, DoshaAnalysis } from "@/types/astrology";
import { apiPost } from "@/lib/http";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { AstroImage } from "@/components/ui/AstroImage";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { ASTRO_IMAGES } from "@/lib/astroImages";

function VerdictBadge({ v }: { v: MatchResult["verdict"] }) {
  const tone = v === "Excellent" ? "green" : v === "Good" ? "indigo" : v === "Average" ? "amber" : "red";
  return <Badge tone={tone}>{v}</Badge>;
}

export default function MatchPage() {
  const [aDob, setADob] = useState("1990-01-01");
  const [aTob, setATob] = useState("10:30");
  const [aPlace, setAPlace] = useState("Melbourne");

  const [bDob, setBDob] = useState("1992-02-02");
  const [bTob, setBTob] = useState("12:15");
  const [bPlace, setBPlace] = useState("Sydney");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<(MatchResult & { doshaA?: DoshaAnalysis; doshaB?: DoshaAnalysis }) | null>(null);

  const canSubmit = useMemo(
    () =>
      aDob.length === 10 && aTob.length === 5 && aPlace.trim().length >= 2 &&
      bDob.length === 10 && bTob.length === 5 && bPlace.trim().length >= 2,
    [aDob, aTob, aPlace, bDob, bTob, bPlace]
  );

  async function onSubmit(e?: React.MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    e?.stopPropagation();
    setErr(null);
    setLoading(true);
    try {
      const res = await apiPost<{ ok: boolean; data?: MatchResult & { doshaA?: DoshaAnalysis; doshaB?: DoshaAnalysis }; error?: string }>("/api/astrology/match", {
        a: { dob: aDob, tob: aTob, place: aPlace },
        b: { dob: bDob, tob: bTob, place: bPlace }
      });
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
      {/* Header - Indian spiritual theme */}
      <div className="rounded-3xl bg-gradient-to-r from-saffron-500 via-amber-500 to-orange-500 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 text-4xl">💑</div>
          <div className="absolute top-4 right-4 text-4xl">ॐ</div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Kundli Match (कुंडली मिलान)</h1>
          <p className="text-white/90 text-base">
            Guna Milan + Manglik Dosha analysis for marriage compatibility
          </p>
        </div>
      </div>

            <Card>
              <CardHeader
                eyebrow="Marriage Matching"
                title="Kundli match (Guna Milan + Manglik)"
                subtitle="Industry-standard structure: score, verdict, breakdown, and a calm guidance note."
                icon="💑"
              />
        <CardContent>
          <div className="grid gap-6">
            {/* Boy's Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-sm font-bold text-slate-900 mb-4">Boy Name</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Date of Birth</div>
                  <Input value={aDob} onChange={(e) => setADob(e.target.value)} type="date" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Time of Birth</div>
                  <Input value={aTob} onChange={(e) => setATob(e.target.value)} type="time" />
                </div>
                <div className="col-span-2">
                  <div className="text-xs font-semibold text-slate-600 mb-2">Place of Birth</div>
                  <AutocompleteInput
                    value={aPlace}
                    onChange={setAPlace}
                    placeholder="Start typing city name (e.g., Delhi, Mumbai)..."
                    prioritizeIndia={true}
                  />
                </div>
              </div>
            </div>

            {/* Girl's Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-sm font-bold text-slate-900 mb-4">Girl Name</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Date of Birth</div>
                  <Input value={bDob} onChange={(e) => setBDob(e.target.value)} type="date" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Time of Birth</div>
                  <Input value={bTob} onChange={(e) => setBTob(e.target.value)} type="time" />
                </div>
                <div className="col-span-2">
                  <div className="text-xs font-semibold text-slate-600 mb-2">Place of Birth</div>
                  <AutocompleteInput
                    value={bPlace}
                    onChange={setBPlace}
                    placeholder="Start typing city name (e.g., Delhi, Mumbai)..."
                    prioritizeIndia={true}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Button onClick={onSubmit} disabled={!canSubmit || loading}>
              {loading ? "Matching..." : "Match Now"}
            </Button>
            {data && (
              <Button
                variant="secondary"
                onClick={() => {
                  window.print();
                }}
              >
                📄 Download PDF
              </Button>
            )}
            {err ? <span className="text-sm text-rose-700">{err}</span> : null}
          </div>
        </CardContent>
      </Card>

      {data ? (
        <div className="grid gap-5">
          <Card>
            <CardHeader eyebrow="Result" title="Compatibility overview" />
            <CardContent>
              {/* Kundli Chart Compatibility Visualization */}
              <div className="relative h-40 rounded-xl overflow-hidden mb-6 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600">
                {/* Astrological symbols background */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4 text-6xl text-white">☯</div>
                  <div className="absolute top-8 right-8 text-5xl text-white">✨</div>
                  <div className="absolute bottom-6 left-1/4 text-4xl text-white">🔮</div>
                  <div className="absolute bottom-8 right-12 text-5xl text-white">🌟</div>
                </div>
                {/* Zodiac wheel visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-32 h-32 border-4 border-white/30 rounded-full">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 border-2 border-white/40 rounded-full flex items-center justify-center">
                        <div className="text-white text-2xl font-bold">36</div>
                      </div>
                    </div>
                    {/* Decorative dots representing planets */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-300 rounded-full"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-red-300 rounded-full"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-blue-300 rounded-full"></div>
                  </div>
                </div>
                {/* Overlay text */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    Kundli Matching Analysis
                  </div>
                  <div className="text-xs text-white/90 mt-1">Guna Milan • Ashta Kuta • Dosha Analysis</div>
                </div>
              </div>
              {/* Orange/Gold Compatibility Circle matching reference */}
              <div className="flex flex-col items-center justify-center py-8">
                <div className="relative w-48 h-48 mb-4">
                  {/* Outer orange ring */}
                  <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="8"
                      strokeDasharray={`${(data.totalGuna / data.maxGuna) * 565} 565`}
                      className="transition-all duration-500"
                    />
                  </svg>
                  {/* Inner content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-xs font-semibold text-slate-600 mb-1">COMPATIBILITY</div>
                    <div className="text-5xl font-bold text-amber-600 mb-1">{data.totalGuna}</div>
                    <div className="text-sm text-slate-600">out of {data.maxGuna}</div>
                    <div className="text-base font-semibold text-slate-900 mt-2">{data.verdict} Match</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <VerdictBadge v={data.verdict} />
                <Badge tone={data.manglik.a === "Manglik" || data.manglik.b === "Manglik" ? "amber" : "green"}>
                  Manglik: A={data.manglik.a}, B={data.manglik.b}
                </Badge>
              </div>
              <div className="w-full text-sm text-slate-700 mt-3 text-center">{data.manglik.note}</div>
              
              {/* Compatibility Details Cards matching reference */}
              <div className="grid gap-3 mt-6">
                {data.breakdown.slice(0, 3).map((item, idx) => {
                  const icons = ["🔴", "👤", "🏠"];
                  const colors = ["red", "green", "amber"];
                  return (
                    <div key={item.category} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between hover:shadow-md transition">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{icons[idx] || "📊"}</div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{item.category} {item.score}/{item.max}</div>
                          <div className="text-xs text-slate-600 mt-0.5">{item.note}</div>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${colors[idx] === "red" ? "bg-red-500" : colors[idx] === "green" ? "bg-green-500" : "bg-amber-500"}`} />
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6">
                <Button className="w-full">
                  Get Detailed Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader eyebrow="Breakdown" title="Guna Milan table" subtitle="Category-wise scores for transparency." />
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-slate-600">
                    <tr className="border-b">
                      <th className="py-2 text-left">Category</th>
                      <th className="py-2 text-left">Score</th>
                      <th className="py-2 text-left">Max</th>
                      <th className="py-2 text-left">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.breakdown.map((x) => (
                      <tr key={x.category} className="border-b last:border-0">
                        <td className="py-3 font-semibold">{x.category}</td>
                        <td className="py-3">{x.score}</td>
                        <td className="py-3">{x.max}</td>
                        <td className="py-3 text-slate-700">{x.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader eyebrow="Guidance" title="Practical next steps" />
            <CardContent>
              <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
                {data.guidance.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </CardContent>
          </Card>

          {/* Nakshatra Porutham Section */}
          {data.nakshatraPorutham ? (
            <Card>
              <CardHeader eyebrow="Nakshatra Compatibility" title="Nakshatra Porutham (27 Points)" subtitle="Detailed nakshatra compatibility analysis for marriage matching." />
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-indigo-600">{data.nakshatraPorutham.totalScore}</div>
                      <div className="text-sm text-slate-600">out of {data.nakshatraPorutham.maxScore} points</div>
                      <div className="mt-2">
                        <Badge tone={data.nakshatraPorutham.compatibility === "Excellent" ? "green" : data.nakshatraPorutham.compatibility === "Good" ? "indigo" : data.nakshatraPorutham.compatibility === "Average" ? "amber" : "red"}>
                          {data.nakshatraPorutham.compatibility} Compatibility
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-600">Percentage</div>
                      <div className="text-xl font-bold">
                        {Math.round((data.nakshatraPorutham.totalScore / data.nakshatraPorutham.maxScore) * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-700 mt-3 p-3 bg-indigo-50 rounded-lg">
                    {data.nakshatraPorutham.summary}
                  </div>
                </div>

                {data.nakshatraPorutham.points && data.nakshatraPorutham.points.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-slate-700 mb-2">Nakshatra Compatibility Points:</div>
                    {data.nakshatraPorutham.points.map((point, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-semibold text-slate-900">{point.nakshatra}</div>
                          <Badge tone={point.compatibility === "Excellent" ? "green" : point.compatibility === "Good" ? "indigo" : point.compatibility === "Average" ? "amber" : "red"}>
                            {point.score}/{point.maxScore}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-600">{point.note}</div>
                      </div>
                    ))}
                  </div>
                )}

                {data.nakshatraPorutham.remedies && data.nakshatraPorutham.remedies.length > 0 && (
                  <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="text-sm font-semibold text-amber-900 mb-2">Recommended Remedies:</div>
                    <ul className="text-sm text-amber-800 space-y-1">
                      {data.nakshatraPorutham.remedies.map((remedy, idx) => (
                        <li key={idx}>• {remedy}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {data.doshaA && data.doshaB ? (
            <Card>
              <CardHeader eyebrow="Dosha Analysis" title="Individual Dosha Analysis" subtitle="Detailed dosha analysis for both persons." />
              <CardContent className="grid lg:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold mb-3">Person A - Doshas</div>
                  <div className="space-y-2">
                    <div>
                      <Badge tone={data.doshaA.manglik.status === "Manglik" ? "red" : "green"}>
                        Manglik: {data.doshaA.manglik.status} ({data.doshaA.manglik.severity})
                      </Badge>
                    </div>
                    <div>
                      <Badge tone={data.doshaA.kaalSarp.present ? "red" : "green"}>
                        Kaal Sarp: {data.doshaA.kaalSarp.present ? `Present (${data.doshaA.kaalSarp.type})` : "Not Present"}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-600 mt-2">{data.doshaA.overall}</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold mb-3">Person B - Doshas</div>
                  <div className="space-y-2">
                    <div>
                      <Badge tone={data.doshaB.manglik.status === "Manglik" ? "red" : "green"}>
                        Manglik: {data.doshaB.manglik.status} ({data.doshaB.manglik.severity})
                      </Badge>
                    </div>
                    <div>
                      <Badge tone={data.doshaB.kaalSarp.present ? "red" : "green"}>
                        Kaal Sarp: {data.doshaB.kaalSarp.present ? `Present (${data.doshaB.kaalSarp.type})` : "Not Present"}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-600 mt-2">{data.doshaB.overall}</div>
                  </div>
                </div>
                <div className="lg:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="text-sm font-semibold text-amber-900 mb-2">Combined Dosha Assessment</div>
                  <div className="text-sm text-amber-800">
                    {data.doshaA.manglik.status === "Manglik" && data.doshaB.manglik.status === "Manglik" 
                      ? "Both are Manglik - This is favorable. Remedies may still be recommended."
                      : data.doshaA.manglik.status === "Manglik" || data.doshaB.manglik.status === "Manglik"
                      ? "One person is Manglik - Remedies and consultation recommended."
                      : "Both are Non-Manglik - No Manglik dosha concerns."}
                  </div>
                  {(data.doshaA.kaalSarp.present || data.doshaB.kaalSarp.present) && (
                    <div className="text-sm text-amber-800 mt-2">
                      Kaal Sarp dosha present in one or both charts. Specific remedies recommended.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
