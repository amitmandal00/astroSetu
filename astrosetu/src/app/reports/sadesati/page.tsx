"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { apiPost } from "@/lib/http";
import { session } from "@/lib/session";
import type { KundliResult } from "@/types/astrology";
import { LoadingState } from "@/components/ui/LoadingState";

type SadeSatiReportData = {
  kundli: KundliResult;
  sadeSati: {
    isActive: boolean;
    phase: "First" | "Second" | "Third" | "Not Active";
    startDate: string;
    endDate: string;
    effects: string[];
    remedies: string[];
    predictions: Array<{ period: string; prediction: string }>;
  };
  userName: string;
  generatedAt: string;
};

function SadeSatiReportPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reportData, setReportData] = useState<SadeSatiReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const user = session.getUser();
    if (!user) {
      router.push("/login?redirect=/reports/sadesati");
      return;
    }

    const kundliDataParam = searchParams.get("kundliData");
    if (kundliDataParam) {
      try {
        const kundliData = JSON.parse(decodeURIComponent(kundliDataParam));
        generateReport(kundliData);
      } catch (e) {
        setErr("Invalid Kundli data");
      }
    } else {
      fetchFromAPI();
    }
  }, [router, searchParams]);

  async function fetchFromAPI() {
    setLoading(true);
    try {
      const res = await apiPost<{ ok: boolean; data?: SadeSatiReportData; error?: string }>("/api/reports/sadesati", {});
      if (res.ok && res.data) {
        setReportData(res.data);
      } else {
        setErr(res.error || "Please generate your Kundli first");
      }
    } catch (e: any) {
      setErr(e?.message ?? "Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  async function generateReport(kundliData: KundliResult) {
    setLoading(true);
    setErr(null);
    try {
      const res = await apiPost<{ ok: boolean; data?: SadeSatiReportData; error?: string }>("/api/reports/sadesati", {
        kundliData
      });
      if (!res.ok) throw new Error(res.error || "Failed");
      setReportData(res.data ?? null);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <LoadingState step="dasha" />
    );
  }

  if (!reportData) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader eyebrow="🪐 Sade Sati Report" title="Saturn's 7.5 Year Period" icon="🪐" />
          <CardContent>
            <p className="text-slate-700 mb-6">
              Sade Sati is a 7.5-year period when Saturn transits through the 12th, 1st, and 2nd houses from your Moon sign. 
              This report analyzes your Sade Sati period and its effects.
            </p>
            {err && (
              <div className="mb-4 p-4 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-sm">
                {err}
              </div>
            )}
            <Link href="/kundli">
              <Button className="w-full py-4">🔮 Generate Kundli First</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { kundli, sadeSati, userName, generatedAt } = reportData;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Cover Page */}
      <div className="hidden print:block page-break-after-always">
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-12">
          <div className="text-center">
            <div className="text-6xl mb-6">🪐</div>
            <h1 className="text-5xl font-bold text-slate-900 mb-4">Sade Sati Life Report</h1>
            <h2 className="text-3xl font-semibold text-slate-700 mb-8">Saturn&apos;s 7.5 Year Period (साढ़े साती)</h2>
            <div className="text-xl text-slate-600 mb-12">
              <div className="font-bold">{userName}</div>
              <div className="text-lg mt-2">Generated on {new Date(generatedAt).toLocaleDateString("en-IN")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sade Sati Status */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="🪐 Sade Sati Status" title="Current Phase" icon="🪐" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className={`p-5 rounded-xl border-2 ${sadeSati.isActive ? "border-red-200 bg-gradient-to-br from-red-50 to-rose-50" : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50"}`}>
              <div className="text-sm font-semibold mb-2">Status</div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {sadeSati.isActive ? "Active" : "Not Active"}
              </div>
              <Badge tone={sadeSati.isActive ? "red" : "green"} className="mt-2">
                {sadeSati.phase}
              </Badge>
            </div>
            <div className="p-5 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50">
              <div className="text-sm font-semibold mb-2">Period</div>
              <div className="text-sm text-slate-700 mb-1">
                <div className="font-bold">Start:</div>
                <div>{sadeSati.startDate}</div>
              </div>
              <div className="text-sm text-slate-700 mt-2">
                <div className="font-bold">End:</div>
                <div>{sadeSati.endDate}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Effects */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="📊 Effects" title="Sade Sati Effects" icon="📊" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {sadeSati.effects.map((effect, i) => (
              <div key={i} className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50">
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 font-bold">{i + 1}.</span>
                  <span className="text-sm text-slate-700">{effect}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictions */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="🔮 Predictions" title="Period-wise Predictions" icon="🔮" />
        <CardContent>
          <div className="space-y-4">
            {sadeSati.predictions.map((p, i) => (
              <div key={i} className="p-5 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span>⏳</span>
                  <span>{p.period}</span>
                </div>
                <div className="text-sm text-slate-700 leading-relaxed">{p.prediction}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Remedies */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="💎 Remedies" title="Sade Sati Remedies" icon="💎" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {sadeSati.remedies.map((remedy, i) => (
              <div key={i} className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50">
                <div className="flex items-center gap-2">
                  <span className="text-purple-600 font-bold">{i + 1}.</span>
                  <span className="text-sm text-slate-700">{remedy}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="print:hidden flex gap-4 justify-center pt-6">
        <Button onClick={() => window.print()} className="px-8 py-4">
          🖨️ Print Report
        </Button>
        <Link href="/kundli">
          <Button variant="secondary" className="px-8 py-4">
            🔮 Back to Kundli
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function SadeSatiReportPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-600 mx-auto mb-4"></div><div className="text-slate-600">Analyzing Sade Sati period...</div></div></div>}>
      <SadeSatiReportPageContent />
    </Suspense>
  );
}

