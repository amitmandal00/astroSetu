"use client";

import { useMemo, useState } from "react";
import type { Remedy } from "@/types/astrology";
import { apiGet } from "@/lib/http";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { AstroImage } from "@/components/ui/AstroImage";
import { getRemedyImage } from "@/lib/astroImages";

const PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

export default function RemediesPage() {
  const [planet, setPlanet] = useState("Saturn");
  const [issue, setIssue] = useState("general");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<Remedy[]>([]);

  async function onSubmit(e?: React.MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    e?.stopPropagation();
    setErr(null);
    setLoading(true);
    try {
      const res = await apiGet<{ ok: boolean; data?: Remedy[]; error?: string }>(
        `/api/astrology/remedies?planet=${encodeURIComponent(planet)}&issue=${encodeURIComponent(issue)}`
      );
      if (!res.ok) throw new Error(res.error || "Failed");
      setData(res.data ?? []);
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
          <div className="absolute top-4 left-4 text-4xl">💎</div>
          <div className="absolute top-4 right-4 text-4xl">ॐ</div>
        </div>
        <div className="relative z-10 flex items-center gap-6">
          <ServiceIcon service="Remedies" size="lg" className="!bg-white/20 !text-white" />
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Reports & Remedies (उपाय)</h1>
            <p className="text-white/90 text-base">
              Find gemstones, mantras, rituals, and other remedies for planetary issues
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader
          eyebrow="Remedies"
          title="Planetary Remedies & Solutions"
          subtitle="Find gemstones, mantras, rituals, and other remedies for planetary issues."
          icon="💎"
        />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Planet</div>
              <Select value={planet} onChange={(e) => setPlanet(e.target.value)}>
                {PLANETS.map(p => <option key={p} value={p}>{p}</option>)}
              </Select>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Issue</div>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="e.g., career, health, finance"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button onClick={onSubmit} disabled={loading}>
              {loading ? "Finding..." : "Get Remedies"}
            </Button>
            {err ? <span className="text-sm text-rose-700">{err}</span> : null}
          </div>
        </CardContent>
      </Card>

      {data.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((remedy, i) => {
            // Use centralized remedy images for meaningful and relevant visuals
            const imageUrl = getRemedyImage(remedy.type);
            
            return (
              <Card key={i} className="hover:shadow-xl transition-all overflow-hidden">
                <div className="relative h-32 overflow-hidden">
                  <AstroImage
                    src={imageUrl}
                    alt={`${remedy.type} remedy - ${remedy.name} for ${remedy.planet}`}
                    width={400}
                    height={128}
                    className="w-full h-full"
                    fallback={remedyImages["Gemstone"]}
                  />
                  {/* Overlay with remedy type */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <div className="text-xs font-semibold text-white">{remedy.type}</div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <ServiceIcon service={remedy.type} size="sm" className="!bg-white/90 backdrop-blur-sm" />
                  </div>
                </div>
                <CardHeader
                  eyebrow={remedy.type}
                  title={remedy.name}
                  subtitle={`For ${remedy.planet}`}
                />
                <CardContent className="grid gap-3">
                  <p className="text-sm text-slate-700 line-clamp-2">{remedy.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {remedy.benefits.slice(0, 2).map((benefit, j) => (
                      <Badge key={j} tone="green" className="text-xs">{benefit}</Badge>
                    ))}
                    {remedy.benefits.length > 2 && (
                      <Badge className="text-xs">+{remedy.benefits.length - 2} more</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

