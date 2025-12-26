"use client";

import { useMemo, useState } from "react";
import type { Panchang } from "@/types/astrology";
import { apiGet } from "@/lib/http";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { AstroImage } from "@/components/ui/AstroImage";
import { InauspiciousPeriod } from "@/components/panchang/InauspiciousPeriod";

export default function PanchangPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [place, setPlace] = useState("Delhi");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<Panchang | null>(null);

  const canSubmit = useMemo(() => date.length === 10 && place.trim().length >= 2, [date, place]);

  async function onSubmit(e?: React.MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    e?.stopPropagation();
    setErr(null);
    setLoading(true);
    try {
      // Try to get coordinates from place name
      let lat = latitude;
      let lon = longitude;
      
      try {
        const { resolvePlaceCoordinates } = await import("@/lib/indianCities");
        const coords = await resolvePlaceCoordinates(place);
        if (coords) {
          lat = coords.latitude;
          lon = coords.longitude;
          setLatitude(coords.latitude);
          setLongitude(coords.longitude);
        }
      } catch {
        // Keep default coordinates if resolution fails
      }

      const res = await apiGet<{ ok: boolean; data?: Panchang; error?: string }>(
        `/api/astrology/panchang?date=${encodeURIComponent(date)}&place=${encodeURIComponent(place)}${lat ? `&latitude=${lat}` : ""}${lon ? `&longitude=${lon}` : ""}`
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
          <div className="absolute top-4 left-4 text-4xl">📿</div>
          <div className="absolute top-4 right-4 text-4xl">ॐ</div>
        </div>
        <div className="relative z-10 flex items-center gap-6">
          <ServiceIcon service="Panchang" size="lg" className="!bg-white/20 !text-white" />
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Today&apos;s Panchang (पंचांग)</h1>
            <p className="text-white/90 text-base">
              Hindu calendar with Tithi, Nakshatra, Yoga, Karana, and Muhurat timings
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader
          eyebrow="Panchang"
          title="Hindu Calendar & Auspicious Timings"
          subtitle="Daily Panchang with Tithi, Nakshatra, Yoga, Karana, and Muhurat timings."
          icon="📿"
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
              <Input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="City" />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button onClick={onSubmit} disabled={!canSubmit || loading}>
              {loading ? "Fetching panchang data for selected date" : "Get Panchang"}
            </Button>
            {err ? <span className="text-sm text-rose-700">{err}</span> : null}
          </div>
        </CardContent>
      </Card>

      {data ? (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader eyebrow="Basic Details" title="Tithi & Nakshatra" icon="📿" />
            <CardContent className="grid gap-3">
              <div className="relative h-32 rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-saffron-100 via-amber-50 to-orange-50 flex items-center justify-center">
                <div className="text-center z-10">
                  <div className="text-6xl mb-2">📿</div>
                  <div className="text-xs font-semibold text-slate-700 bg-white/80 px-3 py-1 rounded-full">
                    Hindu Calendar
                  </div>
                </div>
                {/* Decorative Panchang elements */}
                <div className="absolute inset-0 opacity-15">
                  <div className="absolute top-2 left-2 text-2xl">🕉️</div>
                  <div className="absolute top-2 right-2 text-2xl">ॐ</div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xl">⏰</div>
                </div>
                {/* Calendar grid pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="grid grid-cols-7 gap-1 p-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="h-3 rounded bg-slate-400"></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="indigo">Tithi: {data.tithi}</Badge>
                <Badge>Nakshatra: {data.nakshatra}</Badge>
                <Badge tone="amber">Yoga: {data.yoga}</Badge>
                <Badge>Karana: {data.karana}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader eyebrow="Sun & Moon" title="Rise & Set Times" icon="☀️" />
            <CardContent className="grid gap-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-slate-600">Sunrise</div>
                  <div className="font-semibold">{data.sunrise}</div>
                </div>
                <div>
                  <div className="text-slate-600">Sunset</div>
                  <div className="font-semibold">{data.sunset}</div>
                </div>
                <div>
                  <div className="text-slate-600">Moonrise</div>
                  <div className="font-semibold">{data.moonrise}</div>
                </div>
                <div>
                  <div className="text-slate-600">Moonset</div>
                  <div className="font-semibold">{data.moonset}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader eyebrow="Avoid" title="Rahu Kaal" icon="⚠️" />
            <CardContent>
              <div className="text-sm text-slate-700">
                <Badge tone="red">{data.rahuKaal.start} - {data.rahuKaal.end}</Badge>
                <div className="mt-2 text-xs">Avoid starting new ventures during this time.</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader eyebrow="Auspicious" title="Abhijit Muhurat" icon="✅" />
            <CardContent>
              <div className="text-sm text-slate-700">
                <Badge tone="green">{data.abhijitMuhurat.start} - {data.abhijitMuhurat.end}</Badge>
                <div className="mt-2 text-xs">Most auspicious time for important activities.</div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader eyebrow="Auspicious Timings" title="Muhurat for Today" icon="⏰" />
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {data.auspiciousTimings.map((timing, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="font-semibold text-sm">{timing.name}</div>
                    <div className="text-sm text-slate-700 mt-1">
                      {timing.start} - {timing.end}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Calendar Systems */}
          {data.calendar ? (
            <Card className="lg:col-span-2">
              <CardHeader eyebrow="Hindu Calendar Systems" title="Amanta, Purnimanta & Vikram Samvat" icon="📅" />
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                    <div className="text-xs font-semibold text-indigo-700 mb-2">AMANTA CALENDAR</div>
                    <div className="text-lg font-bold text-indigo-900 mb-1">{data.calendar.amanta.fullDate}</div>
                    <div className="text-xs text-indigo-600">
                      {data.calendar.amanta.month} {data.calendar.amanta.paksha} Paksha
                    </div>
                    <div className="text-xs text-indigo-600 mt-1">Month ends on Amavasya</div>
                  </div>
                  
                  <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                    <div className="text-xs font-semibold text-purple-700 mb-2">PURNIMANTA CALENDAR</div>
                    <div className="text-lg font-bold text-purple-900 mb-1">{data.calendar.purnimanta.fullDate}</div>
                    <div className="text-xs text-purple-600">
                      {data.calendar.purnimanta.month} {data.calendar.purnimanta.paksha} Paksha
                    </div>
                    <div className="text-xs text-purple-600 mt-1">Month ends on Purnima</div>
                  </div>
                  
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="text-xs font-semibold text-amber-700 mb-2">VIKRAM SAMVAT</div>
                    <div className="text-lg font-bold text-amber-900 mb-1">{data.calendar.vikramSamvat.fullDate}</div>
                    <div className="text-xs text-amber-600">
                      {data.calendar.vikramSamvat.month} {data.calendar.vikramSamvat.date}
                    </div>
                    <div className="text-xs text-amber-600 mt-1">Traditional Hindu Calendar Year</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Inauspicious Periods */}
          {data && latitude && longitude && (
            <InauspiciousPeriod 
              date={date}
              latitude={latitude}
              longitude={longitude}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}

