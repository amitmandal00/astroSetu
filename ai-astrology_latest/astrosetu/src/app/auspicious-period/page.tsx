"use client";

import { useMemo, useState } from "react";
import type { AuspiciousPeriodCalculator } from "@/types/astrology";
import { apiPost } from "@/lib/http";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";

const EVENT_TYPES: Array<{ value: AuspiciousPeriodCalculator["eventType"]; label: string; icon: string }> = [
  { value: "marriage", label: "Marriage", icon: "💑" },
  { value: "business", label: "Business Launch", icon: "💼" },
  { value: "travel", label: "Travel", icon: "✈️" },
  { value: "education", label: "Education", icon: "📚" },
  { value: "health", label: "Health", icon: "🏥" },
  { value: "housewarming", label: "Housewarming", icon: "🏠" },
  { value: "naming", label: "Naming Ceremony", icon: "👶" },
  { value: "other", label: "Other", icon: "📅" },
];

export default function AuspiciousPeriodPage() {
  const [eventType, setEventType] = useState<AuspiciousPeriodCalculator["eventType"]>("marriage");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default 30 days
    return date.toISOString().slice(0, 10);
  });
  const [place, setPlace] = useState("Delhi");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<AuspiciousPeriodCalculator | null>(null);

  const canSubmit = useMemo(
    () => startDate.length === 10 && endDate.length === 10 && place.trim().length >= 2 && new Date(startDate) <= new Date(endDate),
    [startDate, endDate, place]
  );

  async function onSubmit(e?: React.MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    e?.stopPropagation();
    setErr(null);
    setLoading(true);
    try {
      const res = await apiPost<{ ok: boolean; data?: AuspiciousPeriodCalculator; error?: string }>(
        "/api/astrology/auspicious-period",
        {
          eventType,
          startDate,
          endDate,
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

  const getQualityBadgeTone = (quality: string) => {
    switch (quality) {
      case "Excellent":
        return "green";
      case "Good":
        return "indigo";
      case "Moderate":
        return "amber";
      case "Avoid":
        return "red";
      default:
        return "neutral";
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "Excellent":
        return "bg-green-50 border-green-300 text-green-900";
      case "Good":
        return "bg-indigo-50 border-indigo-300 text-indigo-900";
      case "Moderate":
        return "bg-amber-50 border-amber-300 text-amber-900";
      case "Avoid":
        return "bg-red-50 border-red-300 text-red-900";
      default:
        return "bg-gray-50 border-gray-300 text-gray-900";
    }
  };

  const selectedEvent = EVENT_TYPES.find(e => e.value === eventType);

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 text-4xl">📅</div>
          <div className="absolute top-4 right-4 text-4xl">ॐ</div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Auspicious Period Calculator (शुभ समय)</h1>
          <p className="text-white/90 text-base">
            Find the best dates and times for your important events and ceremonies
          </p>
        </div>
      </div>

      <Card>
        <CardHeader
          eyebrow="Calculator"
          title="Find Auspicious Dates"
          subtitle="Select event type and date range to find the most auspicious periods"
          icon="📅"
        />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Event Type</div>
              <Select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as AuspiciousPeriodCalculator["eventType"])}
              >
                {EVENT_TYPES.map((event) => (
                  <option key={event.value} value={event.value}>
                    {event.icon} {event.label}
                  </option>
                ))}
              </Select>
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
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Start Date</div>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">End Date</div>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={(() => {
                  const maxDate = new Date(startDate);
                  maxDate.setDate(maxDate.getDate() + 90); // Max 90 days
                  return maxDate.toISOString().slice(0, 10);
                })()}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button onClick={onSubmit} disabled={!canSubmit || loading}>
              {loading ? "Finding Auspicious Periods..." : "Find Best Dates"}
            </Button>
            {err ? <span className="text-sm text-rose-700">{err}</span> : null}
          </div>
        </CardContent>
      </Card>

      {data ? (
        <div className="grid gap-5">
          {/* Summary */}
          <Card>
            <CardHeader eyebrow="Summary" title={`Best Dates for ${selectedEvent?.label}`} icon={selectedEvent?.icon} />
            <CardContent>
              <p className="text-sm text-slate-700 mb-4">{data.summary}</p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-semibold text-slate-900">Date Range</div>
                  <div className="text-slate-600 mt-1">{data.totalDays} days</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-semibold text-slate-900">Auspicious Periods</div>
                  <div className="text-slate-600 mt-1">{data.totalPeriods} found</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-semibold text-slate-900">Best Options</div>
                  <div className="text-slate-600 mt-1">{data.bestPeriods.length} top periods</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Periods */}
          {data.bestPeriods.length > 0 && (
            <Card>
              <CardHeader eyebrow="Recommended" title="Top Auspicious Periods" icon="⭐" />
              <CardContent>
                <div className="space-y-4">
                  {data.bestPeriods.map((period, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl border-2 p-4 ${getQualityColor(period.quality)}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge tone={getQualityBadgeTone(period.quality)}>{period.quality}</Badge>
                            <Badge tone="neutral">Score: {period.score}/100</Badge>
                          </div>
                          <div className="text-lg font-bold">{period.date}</div>
                          <div className="text-sm font-semibold mt-1">
                            {period.startTime} - {period.endTime}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm mb-2">{period.reason}</div>
                      {period.recommendations.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs font-semibold mb-1">✅ Recommendations:</div>
                          <ul className="text-xs space-y-1 list-disc list-inside">
                            {period.recommendations.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Periods */}
          {data.periods.length > 0 && (
            <Card>
              <CardHeader eyebrow="All Periods" title="Complete List" icon="📋" />
              <CardContent>
                <div className="space-y-3">
                  {data.periods.slice(0, 20).map((period, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg border p-3 ${getQualityColor(period.quality)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">{period.date} {period.startTime}-{period.endTime}</div>
                          <div className="text-xs mt-1">{period.reason}</div>
                        </div>
                        <Badge tone={getQualityBadgeTone(period.quality)}>{period.quality} ({period.score})</Badge>
                      </div>
                    </div>
                  ))}
                  {data.periods.length > 20 && (
                    <div className="text-center text-sm text-slate-600 pt-2">
                      Showing top 20 of {data.periods.length} periods
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          {data.suggestions.length > 0 && (
            <Card>
              <CardHeader eyebrow="Guidance" title="Important Suggestions" icon="💡" />
              <CardContent>
                <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
                  {data.suggestions.map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
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

