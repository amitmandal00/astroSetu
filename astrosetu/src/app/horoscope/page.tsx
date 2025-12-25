"use client";

import { useMemo, useState } from "react";
import type { HoroscopeDaily, HoroscopeWeekly, HoroscopeMonthly, HoroscopeYearly } from "@/types/astrology";
import { apiGet } from "@/lib/http";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { AstroImage } from "@/components/ui/AstroImage";
import { ZodiacIcon } from "@/components/ui/ZodiacIcon";

const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function HoroscopePage() {
  const [mode, setMode] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  const [sign, setSign] = useState("Aries");
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [month, setMonth] = useState(new Date().toLocaleString("en-US", { month: "long" }));
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [daily, setDaily] = useState<HoroscopeDaily | null>(null);
  const [weekly, setWeekly] = useState<HoroscopeWeekly | null>(null);
  const [monthly, setMonthly] = useState<HoroscopeMonthly | null>(null);
  const [yearly, setYearly] = useState<HoroscopeYearly | null>(null);

  const canSubmit = useMemo(() => {
    if (mode === "yearly") return sign.length > 0;
    if (mode === "monthly") return sign.length > 0;
    return sign.length > 0 && date.length === 10;
  }, [sign, date, mode]);

  async function onSubmit(e?: React.MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    e?.stopPropagation();
    setErr(null); setLoading(true);
    try {
      let url = `/api/astrology/horoscope?mode=${mode}&sign=${encodeURIComponent(sign)}`;
      if (mode === "daily" || mode === "weekly") {
        url += `&date=${encodeURIComponent(date)}`;
      } else if (mode === "monthly") {
        url += `&month=${encodeURIComponent(month)}&year=${year}`;
      } else if (mode === "yearly") {
        url += `&year=${year}`;
      }
      const res = await apiGet<{ok:boolean; data?: any; error?:string}>(url);
      if (!res.ok) throw new Error(res.error || "Failed");
      setDaily(null); setWeekly(null); setMonthly(null); setYearly(null);
      if (mode === "daily") setDaily(res.data as HoroscopeDaily);
      else if (mode === "weekly") setWeekly(res.data as HoroscopeWeekly);
      else if (mode === "monthly") setMonthly(res.data as HoroscopeMonthly);
      else if (mode === "yearly") setYearly(res.data as HoroscopeYearly);
    } catch (e:any) {
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
          <div className="absolute top-4 left-4 text-4xl">ॐ</div>
          <div className="absolute top-4 right-4 text-4xl">🕉️</div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Daily Horoscope</h1>
          <p className="text-white/90 text-base">
            Get personalized horoscope predictions for your zodiac sign (राशि)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader eyebrow="Horoscope" title="Daily, Weekly, Monthly & Yearly" subtitle="Comprehensive horoscope predictions for all time periods." icon="⭐" />
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs
              value={mode}
              onChange={(v) => setMode(v as any)}
              items={[
                { value: "daily", label: "Daily", icon: "📅" },
                { value: "weekly", label: "Weekly", icon: "📆" },
                { value: "monthly", label: "Monthly", icon: "🗓️" },
                { value: "yearly", label: "Yearly", icon: "📊" }
              ]}
            />
            <div className="grid sm:grid-cols-3 gap-3 w-full sm:w-auto">
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Sign</div>
                <Select value={sign} onChange={(e) => setSign(e.target.value)}>
                  {SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
              {mode === "daily" || mode === "weekly" ? (
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">{mode === "daily" ? "Date" : "Week of"}</div>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              ) : mode === "monthly" ? (
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Month</div>
                  <Select value={month} onChange={(e) => setMonth(e.target.value)}>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </Select>
                </div>
              ) : null}
              {mode === "monthly" || mode === "yearly" ? (
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Year</div>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    min="2020"
                    max="2030"
                  />
                </div>
              ) : (
                <div className="flex items-end">
                  <Button onClick={onSubmit} disabled={!canSubmit || loading} className="w-full">
                    {loading ? "Loading..." : "Get"}
                  </Button>
                </div>
              )}
              {mode === "monthly" || mode === "yearly" ? (
                <div className="flex items-end">
                  <Button onClick={onSubmit} disabled={!canSubmit || loading} className="w-full">
                    {loading ? "Loading..." : "Get"}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
          {err ? <div className="text-sm text-rose-700 mt-4">{err}</div> : null}
        </CardContent>
      </Card>

      {daily ? (
        <Card>
          <CardHeader eyebrow="Daily" title={`${daily.sign} • ${daily.date}`} subtitle="Simple, shareable guidance." icon="📅" />
          <CardContent className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <ZodiacIcon sign={daily.sign} size="md" />
                  <div>
                    <div className="text-lg font-bold text-slate-900">{daily.sign}</div>
                    <div className="text-sm text-slate-600">{daily.date}</div>
                  </div>
                </div>
                <div className="text-slate-800 leading-relaxed mb-4">{daily.text}</div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="indigo">Lucky color: {daily.lucky.color}</Badge>
                  <Badge>Lucky number: {daily.lucky.number}</Badge>
                  <Badge tone="amber">Mood: {daily.lucky.mood}</Badge>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="relative rounded-2xl overflow-hidden h-full min-h-[200px]">
                  <AstroImage
                    src={`https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop&q=80&auto=format`}
                    alt={`${daily.sign} zodiac horoscope - Stars, constellations and astrological symbols`}
                    width={400}
                    height={300}
                    className="w-full h-full"
                    fallback="https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop&q=80&auto=format"
                  />
                  {/* Overlay with zodiac sign */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <div className="text-sm font-semibold text-white">{daily.sign}</div>
                    <div className="text-xs text-white/90">Zodiac Sign</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {weekly ? (
        <Card>
          <CardHeader eyebrow="Weekly" title={`${weekly.sign} • week of ${weekly.weekOf}`} subtitle="A short weekly summary + focus points." />
          <CardContent className="grid gap-4">
            <div className="text-slate-800">{weekly.summary}</div>
            <div className="grid sm:grid-cols-3 gap-3">
              {weekly.focus.map((f, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold">Focus</div>
                  <div className="text-sm text-slate-700 mt-2">{f}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {monthly ? (
        <Card>
          <CardHeader eyebrow="Monthly" title={`${monthly.sign} • ${monthly.month} ${monthly.year}`} subtitle="Comprehensive monthly predictions." />
          <CardContent className="grid gap-4">
            <div className="text-slate-800">{monthly.overview}</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold mb-2">Career</div>
                <div className="text-sm text-slate-700">{monthly.career}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold mb-2">Love</div>
                <div className="text-sm text-slate-700">{monthly.love}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold mb-2">Health</div>
                <div className="text-sm text-slate-700">{monthly.health}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold mb-2">Finance</div>
                <div className="text-sm text-slate-700">{monthly.finance}</div>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-2">Lucky Days</div>
              <div className="flex flex-wrap gap-2">
                {monthly.luckyDays.map((day, i) => (
                  <Badge key={i} tone="indigo">{day}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {yearly ? (
        <Card>
          <CardHeader eyebrow="Yearly" title={`${yearly.sign} • ${yearly.year}`} subtitle="Complete year ahead predictions." />
          <CardContent className="grid gap-4">
            <div className="text-slate-800">{yearly.overview}</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold mb-2">Career</div>
                <div className="text-sm text-slate-700">{yearly.predictions.career}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold mb-2">Love</div>
                <div className="text-sm text-slate-700">{yearly.predictions.love}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold mb-2">Health</div>
                <div className="text-sm text-slate-700">{yearly.predictions.health}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold mb-2">Finance</div>
                <div className="text-sm text-slate-700">{yearly.predictions.finance}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
                <div className="text-sm font-semibold mb-2">Family</div>
                <div className="text-sm text-slate-700">{yearly.predictions.family}</div>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-2">Important Months</div>
              <div className="grid sm:grid-cols-3 gap-3">
                {yearly.importantMonths.map((item, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold">{item.month}</div>
                    <div className="text-xs text-slate-600 mt-1">{item.event}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
