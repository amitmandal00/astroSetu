"use client";

import { useMemo, useState } from "react";
import type { Muhurat } from "@/types/astrology";
import { apiGet } from "@/lib/http";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AstroImage } from "@/components/ui/AstroImage";
import { HeaderPattern } from "@/components/ui/HeaderPattern";

const MUHURAT_TYPES: Muhurat["type"][] = ["Marriage", "GrihaPravesh", "Vehicle", "Business", "Education", "Travel"];

export default function MuhuratPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<Muhurat["type"]>("Marriage");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<Muhurat | null>(null);

  const canSubmit = useMemo(() => date.length === 10, [date]);

  async function onSubmit() {
    setErr(null);
    setLoading(true);
    try {
      const res = await apiGet<{ ok: boolean; data?: Muhurat; error?: string }>(
        `/api/astrology/muhurat?date=${encodeURIComponent(date)}&type=${encodeURIComponent(type)}`
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
      {/* Header with pattern - Indian spiritual theme */}
      <div className="rounded-3xl bg-gradient-to-r from-saffron-500 via-amber-500 to-orange-500 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 text-4xl">⏰</div>
          <div className="absolute top-4 right-4 text-4xl">ॐ</div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Auspicious Muhurat (शुभ मुहूर्त)</h1>
          <p className="text-white/90 text-base">
            Find the most auspicious timings for important events and ceremonies
          </p>
        </div>
      </div>

      <Card>
        <CardHeader
          eyebrow="Muhurat"
          title="Find Auspicious Timings"
          subtitle="Get the best timings for important events and ceremonies."
          icon="⏰"
        />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Event Type</div>
              <Select value={type} onChange={(e) => setType(e.target.value as Muhurat["type"])}>
                {MUHURAT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Date</div>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button onClick={onSubmit} disabled={!canSubmit || loading}>
              {loading ? "Finding..." : "Find Muhurat"}
            </Button>
            {err ? <span className="text-sm text-rose-700">{err}</span> : null}
          </div>
        </CardContent>
      </Card>

      {data ? (
        <div className="grid gap-5">
          <Card>
            <CardHeader eyebrow="Auspicious Timings" title={`Best times for ${data.type}`} icon="✅" />
            <CardContent>
              {/* Event-type-specific visual */}
              <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                {(() => {
                  const eventVisuals: Record<string, { icon: string; gradient: string }> = {
                    "Marriage": { icon: "💑", gradient: "from-rose-100 via-pink-50 to-amber-50" },
                    "GrihaPravesh": { icon: "🏠", gradient: "from-green-100 via-emerald-50 to-teal-50" },
                    "Vehicle": { icon: "🚗", gradient: "from-blue-100 via-indigo-50 to-purple-50" },
                    "Business": { icon: "💼", gradient: "from-amber-100 via-yellow-50 to-orange-50" },
                    "Education": { icon: "📚", gradient: "from-indigo-100 via-purple-50 to-blue-50" },
                    "Travel": { icon: "✈️", gradient: "from-sky-100 via-cyan-50 to-blue-50" }
                  };
                  const visual = eventVisuals[data.type] || { icon: "⏰", gradient: "from-saffron-100 via-amber-50 to-orange-50" };
                  
                  return (
                    <div className={`w-full h-full bg-gradient-to-br ${visual.gradient} flex items-center justify-center relative overflow-hidden`}>
                      <div className="text-center z-10">
                        <div className="text-7xl mb-2">{visual.icon}</div>
                        <div className="text-sm font-semibold text-slate-700 bg-white/80 px-3 py-1 rounded-full">
                          {data.type} Muhurat
                        </div>
                      </div>
                      {/* Decorative elements */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-3 left-3 text-3xl">⏰</div>
                        <div className="absolute top-3 right-3 text-3xl">🕉️</div>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-2xl">ॐ</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {data.auspiciousTimings.map((timing, i) => (
                  <div key={i} className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50 p-4 hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">✅</span>
                      <Badge tone="green">{timing.quality}</Badge>
                    </div>
                    <div className="font-bold text-base text-emerald-700">{timing.start} - {timing.end}</div>
                    <div className="text-xs text-emerald-600 mt-1">Auspicious time</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader eyebrow="Avoid These Times" title="Inauspicious Periods" icon="⚠️" />
            <CardContent>
              {/* Inauspicious visual */}
              <div className="relative h-32 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-rose-100 via-red-50 to-pink-50 flex items-center justify-center">
                <div className="text-center z-10">
                  <div className="text-6xl mb-2">⚠️</div>
                  <div className="text-xs font-semibold text-rose-700 bg-white/80 px-3 py-1 rounded-full">
                    Avoid These Timings
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-2 left-2 text-2xl">🚫</div>
                  <div className="absolute top-2 right-2 text-2xl">⛔</div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {data.avoidTimings.map((timing, i) => (
                  <div key={i} className="rounded-2xl border-2 border-rose-300 bg-gradient-to-br from-rose-50 to-red-50 p-4 hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">⚠️</span>
                      <div className="font-semibold text-sm text-rose-700">{timing.start} - {timing.end}</div>
                    </div>
                    <div className="text-xs text-rose-600 mt-1">Reason: {timing.reason}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

