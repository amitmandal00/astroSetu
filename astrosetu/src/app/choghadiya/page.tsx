"use client";

import { useMemo, useState } from "react";
import type { Choghadiya } from "@/types/astrology";
import { apiPost } from "@/lib/http";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";

export default function ChoghadiyaPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [place, setPlace] = useState("Delhi");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<Choghadiya | null>(null);

  const canSubmit = useMemo(() => date.length === 10 && place.trim().length >= 2, [date, place]);

  async function onSubmit(e?: React.MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    e?.stopPropagation();
    setErr(null);
    setLoading(true);
    try {
      // Get coordinates from place (simplified - in production use geocoding)
      const res = await apiPost<{ ok: boolean; data?: Choghadiya; error?: string }>(
        "/api/astrology/choghadiya",
        {
          date,
          place,
          latitude: 28.6139, // Default to Delhi - should be geocoded
          longitude: 77.2090,
        }
      );
      if (!res.ok) throw new Error(res.error || "Failed");
      setData(res.data ?? null);
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const getPeriodColor = (quality: string) => {
    switch (quality) {
      case "Auspicious":
        return "bg-green-100 border-green-300 text-green-900";
      case "Moderate":
        return "bg-yellow-100 border-yellow-300 text-yellow-900";
      case "Inauspicious":
        return "bg-red-100 border-red-300 text-red-900";
      default:
        return "bg-gray-100 border-gray-300 text-gray-900";
    }
  };

  const getTypeBadgeTone = (type: string) => {
    if (["Shubh", "Labh", "Amrit"].includes(type)) return "green";
    if (["Kaal", "Rog", "Udveg"].includes(type)) return "red";
    return "amber";
  };

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 text-4xl">⏰</div>
          <div className="absolute top-4 right-4 text-4xl">ॐ</div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Choghadiya (चोगाड़िया)</h1>
          <p className="text-white/90 text-base">
            Auspicious and inauspicious timings throughout the day for better decision making
          </p>
        </div>
      </div>

      <Card>
        <CardHeader
          eyebrow="Choghadiya Calculator"
          title="Daily Auspicious Timings"
          subtitle="Find the best times for your activities based on Choghadiya Muhurat"
          icon="⏰"
        />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Date</div>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Place</div>
              <AutocompleteInput
                value={place}
                onChange={setPlace}
                placeholder="Start typing city name..."
                prioritizeIndia={true}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button onClick={onSubmit} disabled={!canSubmit || loading}>
              {loading ? "Calculating..." : "Get Choghadiya"}
            </Button>
            {err ? <span className="text-sm text-rose-700">{err}</span> : null}
          </div>
        </CardContent>
      </Card>

      {data ? (
        <div className="grid gap-5">
          {/* Day Periods */}
          <Card>
            <CardHeader eyebrow="Day Periods" title="Choghadiya - Day Time" icon="☀️" />
            <CardContent>
              <div className="space-y-3">
                {data.dayPeriods.map((period, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border-2 p-4 ${getPeriodColor(period.quality)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge tone={getTypeBadgeTone(period.type)}>{period.name}</Badge>
                        <div className="text-sm font-semibold">
                          {period.start} - {period.end}
                        </div>
                      </div>
                      <Badge tone={period.quality === "Auspicious" ? "green" : period.quality === "Inauspicious" ? "red" : "amber"}>
                        {period.quality}
                      </Badge>
                    </div>
                    {period.activities.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold mb-1">✅ Recommended:</div>
                        <div className="text-xs space-y-1">
                          {period.activities.map((act, i) => (
                            <div key={i}>• {act}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {period.avoidActivities.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold mb-1">❌ Avoid:</div>
                        <div className="text-xs space-y-1">
                          {period.avoidActivities.map((act, i) => (
                            <div key={i}>• {act}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Night Periods */}
          <Card>
            <CardHeader eyebrow="Night Periods" title="Choghadiya - Night Time" icon="🌙" />
            <CardContent>
              <div className="space-y-3">
                {data.nightPeriods.map((period, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border-2 p-4 ${getPeriodColor(period.quality)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge tone={getTypeBadgeTone(period.type)}>{period.name}</Badge>
                        <div className="text-sm font-semibold">
                          {period.start} - {period.end}
                        </div>
                      </div>
                      <Badge tone={period.quality === "Auspicious" ? "green" : period.quality === "Inauspicious" ? "red" : "amber"}>
                        {period.quality}
                      </Badge>
                    </div>
                    {period.activities.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold mb-1">✅ Recommended:</div>
                        <div className="text-xs space-y-1">
                          {period.activities.map((act, i) => (
                            <div key={i}>• {act}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {period.avoidActivities.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold mb-1">❌ Avoid:</div>
                        <div className="text-xs space-y-1">
                          {period.avoidActivities.map((act, i) => (
                            <div key={i}>• {act}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader eyebrow="Guide" title="Understanding Choghadiya" />
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold mb-2 text-green-700">Auspicious Periods</div>
                  <div className="space-y-1">
                    <div><strong>Shubh:</strong> Best for starting new ventures and important meetings</div>
                    <div><strong>Labh:</strong> Ideal for financial transactions and business</div>
                    <div><strong>Amrit:</strong> Perfect for religious activities and health treatments</div>
                  </div>
                </div>
                <div>
                  <div className="font-semibold mb-2 text-yellow-700">Moderate Periods</div>
                  <div className="space-y-1">
                    <div><strong>Chal:</strong> Good for travel and movement activities</div>
                  </div>
                  <div className="font-semibold mb-2 mt-4 text-red-700">Inauspicious Periods</div>
                  <div className="space-y-1">
                    <div><strong>Kaal:</strong> Avoid all important activities</div>
                    <div><strong>Rog:</strong> Avoid health-related activities</div>
                    <div><strong>Udveg:</strong> Avoid important meetings and decisions</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

