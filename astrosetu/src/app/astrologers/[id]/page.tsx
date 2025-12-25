"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Astrologer } from "@/types/astrology";
import { apiGet, apiPost } from "@/lib/http";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AstrologerProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [astro, setAstro] = useState<Astrologer | null>(null);
  const [userName, setUserName] = useState("Guest");
  const [consultationType, setConsultationType] = useState<"chat" | "call" | "video">("chat");
  const [err, setErr] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "gateway">("wallet");
  const canStart = useMemo(() => userName.trim().length > 0 && !!astro, [userName, astro]);

  useEffect(() => {
    apiGet<{ ok: boolean; data?: Astrologer; error?: string }>(`/api/astrologers/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.error || "Failed");
        setAstro(res.data ?? null);
      })
      .catch((e) => setErr(e?.message ?? "Something went wrong"));
  }, [id]);

  async function startConsultation() {
    setErr(null);
    try {
      // Payment processing (stubbed)
      const estimatedCost = consultationType === "chat" ? astro!.pricePerMin * 10 : 
                           consultationType === "call" ? astro!.pricePerMin * 15 : 
                           astro!.pricePerMin * 20;
      
      if (paymentMethod === "wallet") {
        // Check wallet balance (stubbed)
        console.log(`Checking wallet balance for ₹${estimatedCost}`);
      } else {
        // Gateway payment (stubbed)
        console.log(`Processing payment via gateway for ₹${estimatedCost}`);
      }

      if (consultationType === "chat") {
        const res = await apiPost<{ ok: boolean; data?: { id: string }; error?: string }>("/api/chat/sessions", {
          userName,
          astrologerId: id
        });
        if (!res.ok) throw new Error(res.error || "Failed");
        router.push(`/chat/${res.data!.id}`);
      } else {
        // For call/video, redirect to consultation page (stubbed)
        alert(`${consultationType === "call" ? "Call" : "Video"} consultation will be initiated. Payment processed.`);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
    }
  }

  if (!astro) {
    return (
      <Card>
        <CardHeader eyebrow="Profile" title="Loading..." />
        <CardContent>{err ? <div className="text-sm text-rose-700">{err}</div> : "Fetching astrologer profile..."}</CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      {/* Header with pattern and profile image - Indian spiritual theme */}
      <div className="rounded-3xl bg-gradient-to-r from-saffron-500 via-amber-500 to-orange-500 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 text-4xl">ॐ</div>
        </div>
        <div className="relative z-10 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">{astro.name}</h1>
            <p className="text-white/90 text-base mb-4">{astro.title}</p>
            <div className="flex flex-wrap gap-2">
              <Badge className="!bg-white/10 !text-white !border-white/20">
                {astro.isOnline ? "🟢 Online" : "⚫ Offline"}
              </Badge>
              <Badge className="!bg-amber-500/20 !text-amber-200 !border-amber-400/30">
                ⭐ {astro.ratingAvg} ({astro.ratingCount})
              </Badge>
              <Badge className="!bg-white/10 !text-white !border-white/20">
                {astro.experienceYears} yrs exp
              </Badge>
              <Badge className="!bg-white/10 !text-white !border-white/20">
                ₹{astro.pricePerMin}/min
              </Badge>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <Avatar name={astro.name} size="xl" online={astro.isOnline} />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader eyebrow="About" title="Profile Details" icon="👨‍🏫" />
        <CardContent className="grid gap-4">
          {/* Astrologer consultation visual */}
          <div className="relative h-56 rounded-xl overflow-hidden mb-4">
            <div className="w-full h-full bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
              <div className="text-center relative z-10">
                <div className="text-8xl mb-4">👨‍🏫</div>
                <div className="text-base font-bold text-slate-700 bg-white/90 px-6 py-2 rounded-full shadow-sm">
                  Expert Astrologer Consultation
                </div>
                <div className="text-sm text-slate-600 mt-2 bg-white/70 px-4 py-1 rounded-full inline-block">
                  {astro.skills[0] || "Vedic"} Astrology
                </div>
              </div>
              {/* Decorative consultation elements */}
              <div className="absolute inset-0 opacity-15">
                <div className="absolute top-4 left-4 text-4xl">🔮</div>
                <div className="absolute top-4 right-4 text-4xl">🕉️</div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-3xl">⭐</div>
                <div className="absolute top-1/2 left-6 text-3xl">💬</div>
                <div className="absolute top-1/2 right-6 text-3xl">📞</div>
              </div>
              {/* Consultation type indicators */}
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                <div className="flex-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/50 shadow-sm">
                  <div className="text-xs font-semibold text-slate-600 mb-0.5">💬 Chat</div>
                  <div className="text-xs text-slate-500">Instant</div>
                </div>
                <div className="flex-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/50 shadow-sm">
                  <div className="text-xs font-semibold text-slate-600 mb-0.5">📞 Call</div>
                  <div className="text-xs text-slate-500">Voice</div>
                </div>
                <div className="flex-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/50 shadow-sm">
                  <div className="text-xs font-semibold text-slate-600 mb-0.5">📹 Video</div>
                  <div className="text-xs text-slate-500">Face-to-face</div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-sm text-slate-700 leading-relaxed">{astro.bio}</div>
          
          <div>
            <div className="text-xs font-semibold text-slate-600 mb-2">Skills & Expertise</div>
            <div className="flex flex-wrap gap-2">
              {astro.skills.map(s => <Badge key={s} tone="indigo">{s}</Badge>)}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-600 mb-2">Languages</div>
            <div className="flex flex-wrap gap-2">
              {astro.languages.map(l => <Badge key={l}>{l}</Badge>)}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {astro.skills.map(s => <Badge key={s}>{s}</Badge>)}
          </div>

          <div className="mt-4 grid gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Your name</div>
              <Input value={userName} onChange={(e) => setUserName(e.target.value)} />
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-600 mb-3">Consultation Type</div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setConsultationType("chat")}
                  className={`px-4 py-4 rounded-2xl text-sm font-bold border-2 transition-all transform hover:scale-[1.02] ${
                    consultationType === "chat"
                      ? "bg-gradient-to-r from-saffron-500 via-amber-500 to-orange-500 border-saffron-600 text-white shadow-lg"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm"
                  }`}
                >
                  <div className="text-2xl mb-1">💬</div>
                  <div>Chat</div>
                  <div className="text-xs opacity-80 mt-0.5">Instant</div>
                </button>
                <button
                  type="button"
                  onClick={() => setConsultationType("call")}
                  className={`px-4 py-4 rounded-2xl text-sm font-bold border-2 transition-all transform hover:scale-[1.02] ${
                    consultationType === "call"
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-700 border-emerald-700 text-white shadow-lg"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm"
                  }`}
                >
                  <div className="text-2xl mb-1">📞</div>
                  <div>Call</div>
                  <div className="text-xs opacity-80 mt-0.5">Voice</div>
                </button>
                <button
                  type="button"
                  onClick={() => setConsultationType("video")}
                  className={`px-4 py-4 rounded-2xl text-sm font-bold border-2 transition-all transform hover:scale-[1.02] ${
                    consultationType === "video"
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 border-indigo-700 text-white shadow-lg"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm"
                  }`}
                >
                  <div className="text-2xl mb-1">📹</div>
                  <div>Video</div>
                  <div className="text-xs opacity-80 mt-0.5">Face-to-face</div>
                </button>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-600 mb-3">Payment Method</div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("wallet")}
                  className={`px-4 py-4 rounded-2xl text-sm font-bold border-2 transition-all transform hover:scale-[1.02] ${
                    paymentMethod === "wallet"
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-700 border-emerald-700 text-white shadow-lg"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm"
                  }`}
                >
                  <div className="text-2xl mb-1">💰</div>
                  <div>Wallet</div>
                  <div className="text-xs opacity-80 mt-0.5">E-Wallet</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("gateway")}
                  className={`px-4 py-4 rounded-2xl text-sm font-bold border-2 transition-all transform hover:scale-[1.02] ${
                    paymentMethod === "gateway"
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 border-indigo-700 text-white shadow-lg"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm"
                  }`}
                >
                  <div className="text-2xl mb-1">💳</div>
                  <div>Gateway</div>
                  <div className="text-xs opacity-80 mt-0.5">Razorpay</div>
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-600 mb-1">Estimated Cost</div>
              <div className="text-lg font-bold text-slate-900">
                ₹{consultationType === "chat" ? astro.pricePerMin * 10 : 
                  consultationType === "call" ? astro.pricePerMin * 15 : 
                  astro.pricePerMin * 20} 
                <span className="text-sm font-normal text-slate-600 ml-1">
                  ({consultationType === "chat" ? "10 min" : consultationType === "call" ? "15 min" : "20 min"} @ ₹{astro.pricePerMin}/min)
                </span>
              </div>
            </div>

            <Button onClick={startConsultation} disabled={!canStart} className="w-full">
              Start {consultationType === "chat" ? "Chat" : consultationType === "call" ? "Call" : "Video"} Consultation
            </Button>
          </div>

          <div className="text-xs text-slate-600">
            Payment integration ready. Connect with Razorpay/Stripe for production.
          </div>

          {err ? <div className="text-sm text-rose-700">{err}</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}
