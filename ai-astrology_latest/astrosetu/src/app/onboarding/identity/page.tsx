"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { KundliResult } from "@/types/astrology";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { session } from "@/lib/session";
import { apiPost } from "@/lib/http";

type KundliResponse = { ok: boolean; data?: KundliResult; error?: string };

export default function OnboardingIdentityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kundli, setKundli] = useState<KundliResult | null>(null);

  useEffect(() => {
    const bd = session.getBirthDetails();
    if (!bd) {
      router.replace("/onboarding/birth");
      return;
    }
    async function fetchIdentity() {
      if (!bd) {
        router.replace("/onboarding/birth");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Try to resolve coordinates if not present
        let latitude = bd.latitude;
        let longitude = bd.longitude;
        
        if (!latitude || !longitude) {
          // Try to resolve from place name using local database
          const { resolvePlaceCoordinates } = await import("@/lib/indianCities");
          const resolved = resolvePlaceCoordinates(bd.place || "");
          if (resolved) {
            latitude = resolved.latitude;
            longitude = resolved.longitude;
          }
        }
        
        const res = await apiPost<KundliResponse>("/api/astrology/kundli", {
          dob: bd.dob,
          tob: bd.tob,
          place: bd.place,
          latitude,
          longitude,
          ayanamsa: 1,
          day: bd.day,
          month: bd.month,
          year: bd.year,
          hours: bd.hours,
          minutes: bd.minutes,
          seconds: bd.seconds || 0,
        });
        if (!res.ok || !res.data) {
          throw new Error(res.error || "Failed to generate Kundli");
        }
        setKundli(res.data);
        session.saveKundli({ ...res.data, birthDetails: bd, name: bd.name || "My Kundli" });
      } catch (e: any) {
        console.error("Kundli generation error in onboarding:", e);
        const errorMsg = e?.message || "Something went wrong";
        // Provide helpful error message
        if (errorMsg.includes("Network error") || errorMsg.includes("fetch failed")) {
          setError("Unable to connect to server. Please check your internet connection and try again.");
        } else {
          setError(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    }
    void fetchIdentity();
  }, [router]);

  const hasData = !!kundli && !loading && !error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-saffron-50 via-amber-50 to-orange-50 p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-saffron-200">
        <CardHeader
          eyebrow="Step 2"
          title="Here’s what defines you"
          subtitle="Core Vedic identity, similar to what expert astrologers check first."
          icon="✨"
        />
        <CardContent className="space-y-6">
          {loading && (
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-4 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-4 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-4 bg-slate-200 rounded-lg animate-pulse" />
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-200 text-sm text-rose-700 space-y-3">
              <div className="font-semibold">⚠️ Unable to generate Kundli</div>
              <div>{error}</div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  className="text-sm px-4 py-2"
                  onClick={() => router.push("/onboarding/birth")}
                >
                  Edit birth details
                </Button>
                <Button
                  className="text-sm px-4 py-2"
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    // Retry by re-running the effect
                    const bd = session.getBirthDetails();
                    if (bd) {
                      // Trigger retry
                      void (async () => {
                        try {
                          const res = await apiPost<KundliResponse>("/api/astrology/kundli", {
                            dob: bd.dob,
                            tob: bd.tob,
                            place: bd.place,
                            ayanamsa: 1,
                            day: bd.day,
                            month: bd.month,
                            year: bd.year,
                            hours: bd.hours,
                            minutes: bd.minutes,
                            seconds: bd.seconds || 0,
                          });
                          if (res.ok && res.data) {
                            setKundli(res.data);
                            session.saveKundli({ ...res.data, birthDetails: bd, name: bd.name || "My Kundli" });
                            setError(null);
                          } else {
                            setError(res.error || "Failed to generate Kundli");
                          }
                        } catch (e: any) {
                          setError(e?.message || "Something went wrong");
                        } finally {
                          setLoading(false);
                        }
                      })();
                    }
                  }}
                >
                  Try again
                </Button>
              </div>
            </div>
          )}

          {hasData && kundli && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white border-2 border-purple-100">
                  <div className="text-xs font-semibold text-slate-600 mb-1">Ascendant</div>
                  <div className="text-lg font-bold text-purple-700">{kundli.ascendant}</div>
                </div>
                <div className="p-4 rounded-xl bg-white border-2 border-slate-100">
                  <div className="text-xs font-semibold text-slate-600 mb-1">Moon Sign</div>
                  <div className="text-lg font-bold text-slate-900">{kundli.rashi}</div>
                </div>
                <div className="p-4 rounded-xl bg-white border-2 border-slate-100">
                  <div className="text-xs font-semibold text-slate-600 mb-1">Nakshatra</div>
                  <div className="text-lg font-bold text-slate-900">{kundli.nakshatra}</div>
                </div>
                <div className="p-4 rounded-xl bg-white border-2 border-amber-100">
                  <div className="text-xs font-semibold text-slate-600 mb-1">Current Mahadasha</div>
                  <div className="text-lg font-bold text-amber-700">
                    Available in full chart
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-600">
                These are the same core factors professional apps like AstroTalk/AstroSage use before
                suggesting anything.
              </div>
            </>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => router.push("/onboarding/birth")}
            >
              Edit birth details
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-saffron-500 to-orange-500 hover:from-saffron-600 hover:to-orange-600"
              disabled={!hasData}
              onClick={() => router.push("/onboarding/goals")}
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

