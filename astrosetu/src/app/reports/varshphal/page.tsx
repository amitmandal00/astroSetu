"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { apiPost } from "@/lib/http";
import { session } from "@/lib/session";
import type { KundliResult, KundliChart } from "@/types/astrology";
import { KundliChartVisual } from "@/components/ui/KundliChartVisual";

type VarshphalReportData = {
  kundli: KundliResult & { chart?: KundliChart };
  yearAnalysis: {
    year: number;
    predictions: Array<{ area: string; prediction: string; rating: "Excellent" | "Good" | "Average" | "Challenging" }>;
    favorableMonths: string[];
    cautionMonths: string[];
    remedies: string[];
  };
  userName: string;
  generatedAt: string;
};

function VarshphalReportPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reportData, setReportData] = useState<VarshphalReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const user = session.getUser();
    if (!user) {
      router.push("/login?redirect=/reports/varshphal");
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
      const res = await apiPost<{ ok: boolean; data?: VarshphalReportData; error?: string }>("/api/reports/varshphal", {});
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
      const res = await apiPost<{ ok: boolean; data?: VarshphalReportData; error?: string }>("/api/reports/varshphal", {
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-600 mx-auto mb-4"></div>
          <div className="text-slate-600">Generating Year Analysis...</div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader eyebrow="📊 Year Analysis" title="Varshphal Report" icon="📊" />
          <CardContent>
            <p className="text-slate-700 mb-6">
              Varshphal is an annual prediction system based on your birth chart. This report provides detailed predictions for the current year.
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

  const { kundli, yearAnalysis, userName, generatedAt } = reportData;

  const ratingColors: Record<"Excellent" | "Good" | "Average" | "Challenging", "neutral" | "green" | "red" | "amber" | "indigo"> = {
    "Excellent": "green",
    "Good": "green",
    "Average": "amber",
    "Challenging": "red"
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Varshphal Chart Section - AstroSage Style */}
      {kundli.chart && (
        <Card className="print:border-0 print:shadow-none">
          <CardContent className="p-0">
            <KundliChartVisual chart={kundli.chart} title="Varshphal Chart & Table" />
          </CardContent>
        </Card>
      )}

      {/* Cover Page */}
      <div className="hidden print:block page-break-after-always">
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-12">
          <div className="text-center">
            <div className="text-6xl mb-6">📊</div>
            <h1 className="text-5xl font-bold text-slate-900 mb-4">Year Analysis</h1>
            <h2 className="text-3xl font-semibold text-slate-700 mb-8">Varshphal (वर्षफल)</h2>
            <div className="text-xl text-slate-600 mb-12">
              <div className="font-bold">{userName}</div>
              <div className="text-lg mt-2">Year: {yearAnalysis.year}</div>
              <div className="text-lg mt-2">Generated on {new Date(generatedAt).toLocaleDateString("en-IN")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Varshphal Chart & Table – AstroSage-style section */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader
          eyebrow="Varshphal Chart & Table"
          title="Varshphal Chart (Solar Return Chart)"
          icon="📈"
        />
        <CardContent>
          {/* Main chart – reused Kundli visual but styled within a light panel
              to resemble AstroSage’s Varshphal chart block */}
          {kundli.chart ? (
            <div className="p-4 md:p-6 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50">
              <KundliChartVisual chart={kundli.chart} />
            </div>
          ) : (
            <div className="p-4 md:p-6 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 text-center text-slate-600">
              Chart data not available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Year Overview */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="📅 Year Overview" title={`Year ${yearAnalysis.year} Predictions`} icon="📅" />
        <CardContent>
          <div className="p-5 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <p className="text-slate-700 leading-relaxed">
              Based on your birth chart, the year {yearAnalysis.year} brings various opportunities and challenges. 
              This analysis is based on Varshphal calculations considering your planetary positions and transits.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Predictions by Area */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="🔮 Predictions" title="Area-wise Predictions" icon="🔮" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {yearAnalysis.predictions.map((p, i) => (
              <div key={i} className="p-5 rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-slate-900">{p.area}</div>
                  <Badge tone={ratingColors[p.rating]}>
                    {p.rating}
                  </Badge>
                </div>
                <div className="text-sm text-slate-700 leading-relaxed">{p.prediction}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Favorable & Caution Months */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="📅 Monthly Guidance" title="Favorable & Caution Months" icon="📅" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
              <div className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span>✅</span>
                <span>Favorable Months</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {yearAnalysis.favorableMonths.map((month, i) => (
                  <Badge key={i} tone="green">{month}</Badge>
                ))}
              </div>
            </div>
            <div className="p-5 rounded-xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50">
              <div className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span>⚠️</span>
                <span>Caution Months</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {yearAnalysis.cautionMonths.map((month, i) => (
                  <Badge key={i} tone="red">{month}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remedies */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="💎 Remedies" title="Yearly Remedies" icon="💎" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {yearAnalysis.remedies.map((remedy, i) => (
              <div key={i} className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50">
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 font-bold">{i + 1}.</span>
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

export default function VarshphalReportPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-600 mx-auto mb-4"></div><div className="text-slate-600">Loading...</div></div></div>}>
      <VarshphalReportPageContent />
    </Suspense>
  );
}

