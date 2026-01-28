"use client";

import { useMemo, useState } from "react";
import type { Numerology } from "@/types/astrology";
import { apiPost } from "@/lib/http";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { AstroImage } from "@/components/ui/AstroImage";
import { ASTRO_IMAGES } from "@/lib/astroImages";

export default function NumerologyPage() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<Numerology | null>(null);

  const canSubmit = useMemo(() => name.trim().length >= 2, [name]);

  async function onSubmit(e?: React.MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    e?.stopPropagation();
    setErr(null);
    setLoading(true);
    try {
      const res = await apiPost<{ ok: boolean; data?: Numerology; error?: string }>(
        "/api/astrology/numerology",
        { name, dob: dob || undefined }
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
          <div className="absolute top-4 left-4 text-4xl">🔢</div>
          <div className="absolute top-4 right-4 text-4xl">ॐ</div>
        </div>
        <div className="relative z-10 flex items-center gap-6">
          <ServiceIcon service="Numerology" size="lg" className="!bg-white/20 !text-white" />
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Numerology (अंक ज्योतिष)</h1>
            <p className="text-white/90 text-base">
              Discover your Life Path, Destiny, Soul, and Personality numbers
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader
          eyebrow="Numerology"
          title="Calculate Your Numbers"
          subtitle="Discover your Life Path, Destiny, Soul, and Personality numbers."
          icon="🔢"
        />
        <CardContent>
          <div>
            <div className="text-xs font-semibold text-slate-600 mb-2">Full Name</div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold text-slate-600 mb-2">Date of Birth (Optional - for accurate Life Path Number)</div>
            <Input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              placeholder="DD/MM/YYYY"
            />
            <div className="text-xs text-slate-500 mt-1">
              Life Path Number is calculated from date of birth. If not provided, it will be calculated from name.
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button onClick={onSubmit} disabled={!canSubmit || loading}>
              {loading ? "Computing numerology values from name and date" : "Calculate"}
            </Button>
            {err ? <span className="text-sm text-rose-700">{err}</span> : null}
          </div>
        </CardContent>
      </Card>

      {data ? (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader eyebrow="Core Numbers" title="Your Numerology Profile" />
            <CardContent className="grid gap-4">
              <div className="relative h-32 rounded-xl overflow-hidden mb-3">
                <AstroImage
                  src="https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=200&fit=crop&q=80&auto=format"
                  alt="Indian numerology chart with numbers, calculations and mystical symbols"
                  width={400}
                  height={200}
                  className="w-full h-full"
                  fallback="https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=200&fit=crop&q=80&auto=format"
                />
                {/* Overlay text */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <div className="text-xs font-semibold text-white">Numerology Chart</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-5 text-center hover:shadow-lg transition-all">
                  <div className="text-xs font-semibold text-slate-600 mb-2">Life Path</div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">{data.lifePathNumber}</div>
                  <div className="text-xs text-slate-500">Your life&apos;s journey</div>
                </div>
                <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 text-center hover:shadow-lg transition-all">
                  <div className="text-xs font-semibold text-slate-600 mb-2">Destiny</div>
                  <div className="text-4xl font-bold text-amber-600 mb-2">{data.destinyNumber}</div>
                  <div className="text-xs text-slate-500">Your ultimate purpose</div>
                </div>
                <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5 text-center hover:shadow-lg transition-all">
                  <div className="text-xs font-semibold text-slate-600 mb-2">Soul</div>
                  <div className="text-4xl font-bold text-indigo-600 mb-2">{data.soulNumber}</div>
                  <div className="text-xs text-slate-500">Your inner desires</div>
                </div>
                <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-5 text-center hover:shadow-lg transition-all">
                  <div className="text-xs font-semibold text-slate-600 mb-2">Personality</div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">{data.personalityNumber}</div>
                  <div className="text-xs text-slate-500">How others see you</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader eyebrow="Analysis" title="What Your Numbers Mean" />
            <CardContent className="grid gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-600">Life Path</div>
                <div className="text-sm text-slate-700 mt-1">{data.analysis.lifePath}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600">Destiny</div>
                <div className="text-sm text-slate-700 mt-1">{data.analysis.destiny}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600">Soul</div>
                <div className="text-sm text-slate-700 mt-1">{data.analysis.soul}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600">Personality</div>
                <div className="text-sm text-slate-700 mt-1">{data.analysis.personality}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader eyebrow="Lucky Elements" title="Your Lucky Numbers" />
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.luckyNumbers.map((num, i) => (
                  <Badge key={i} tone="indigo">{num}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader eyebrow="Lucky Elements" title="Colors & Days" />
            <CardContent className="grid gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Lucky Colors</div>
                <div className="flex flex-wrap gap-2">
                  {data.luckyColors.map((color, i) => (
                    <Badge key={i} tone="amber">{color}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Lucky Days</div>
                <div className="flex flex-wrap gap-2">
                  {data.luckyDays.map((day, i) => (
                    <Badge key={i}>{day}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

