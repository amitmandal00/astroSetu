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
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { KundliChartVisual } from "@/components/ui/KundliChartVisual";
import { LoadingState } from "@/components/ui/LoadingState";

type LalKitabReportData = {
  kundli: KundliResult & { chart?: KundliChart };
  lalkitab: {
    introduction: string;
    planetaryAnalysis: Array<{
      planet: string;
      house: number;
      sign: string;
      prediction: string;
      remedy: string;
      item: string;
      timing: string;
    }>;
    houseAnalysis: Array<{
      house: number;
      planets: string[];
      prediction: string;
      remedies: string[];
    }>;
    predictions: Array<{
      area: string;
      prediction: string;
      period: string;
      remedies: string[];
    }>;
    remedies: Array<{
      type: string;
      description: string;
      item: string;
      method: string;
      timing: string;
      duration: string;
    }>;
    specialRemedies: Array<{
      issue: string;
      remedy: string;
      item: string;
      method: string;
    }>;
    predictionsByPeriod: Array<{
      period: string;
      predictions: Array<{ area: string; prediction: string }>;
    }>;
  };
  userName: string;
  generatedAt: string;
};

function LalKitabReportPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reportData, setReportData] = useState<LalKitabReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const user = session.getUser();
    if (!user) {
      router.push("/login?redirect=/reports/lalkitab");
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
      const res = await apiPost<{ ok: boolean; data?: LalKitabReportData; error?: string }>("/api/reports/lalkitab", {});
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
      const res = await apiPost<{ ok: boolean; data?: LalKitabReportData; error?: string }>("/api/reports/lalkitab", {
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
    return <LoadingState step="general" />;
  }

  if (!reportData) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader eyebrow="📚 Lal Kitab Horoscope" title="Lal Kitab Remedies & Predictions" icon="📚" />
          <CardContent>
            <p className="text-slate-700 mb-6">
              Generate Lal Kitab remedies and predictions based on your planetary positions. Lal Kitab provides unique remedies for planetary issues.
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

  const { kundli, lalkitab, userName, generatedAt } = reportData;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Lal Kitab Chart Section - AstroSage Style */}
      {kundli.chart && (
        <Card className="print:border-0 print:shadow-none">
          <CardContent className="p-0">
            <KundliChartVisual chart={kundli.chart} title="Lal Kitab Chart & Analysis" />
          </CardContent>
        </Card>
      )}

      {/* Cover Page */}
      <div className="hidden print:block page-break-after-always">
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 p-12">
          <div className="text-center">
            <div className="text-6xl mb-6">📚</div>
            <h1 className="text-5xl font-bold text-slate-900 mb-4">Lal Kitab Horoscope</h1>
            <h2 className="text-3xl font-semibold text-slate-700 mb-8">Remedies & Predictions (लाल किताब)</h2>
            <div className="text-xl text-slate-600 mb-12">
              <div className="font-bold">{userName}</div>
              <div className="text-lg mt-2">Generated on {new Date(generatedAt).toLocaleDateString("en-IN")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 rounded-2xl p-6 shadow-xl border-2 border-red-700 relative overflow-hidden">
        <HeaderPattern className="absolute inset-0 opacity-10" />
        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <span>📚</span>
                <span>Lal Kitab Horoscope</span>
              </h1>
              <p className="text-rose-100 text-sm">Complete Remedies & Predictions</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">लाल किताब</div>
              <div className="text-sm text-rose-100">Unique Remedies System</div>
            </div>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="📚 About Lal Kitab" title="Lal Kitab System" icon="📚" />
        <CardContent>
          <p className="text-slate-700 leading-relaxed mb-4">
            {lalkitab.introduction}
          </p>
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <div className="text-sm font-semibold text-red-900 mb-2">Key Features of Lal Kitab:</div>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Simple and practical remedies using everyday items</li>
              <li>• No need for expensive gemstones or complex rituals</li>
              <li>• Effective solutions for planetary problems</li>
              <li>• Based on house positions of planets</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Planetary Analysis */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="🪐 Planetary Analysis" title="Planet-wise Predictions & Remedies" icon="🪐" />
        <CardContent>
          <div className="space-y-4">
            {lalkitab.planetaryAnalysis.map((analysis, i) => (
              <div key={i} className="p-5 rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
                <div className="flex items-center gap-3 mb-3">
                  <Badge tone="red" className="text-sm font-bold">{analysis.planet}</Badge>
                  <span className="text-sm text-slate-600">House {analysis.house} • {analysis.sign}</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-3">{analysis.prediction}</p>
                <div className="p-3 bg-white rounded-lg border border-red-200">
                  <div className="text-xs font-semibold text-red-900 mb-1">Lal Kitab Remedy:</div>
                  <div className="text-sm text-slate-700 mb-1">{analysis.remedy}</div>
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold">Item:</span> {analysis.item} • <span className="font-semibold">Timing:</span> {analysis.timing}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* House Analysis */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="🏠 House Analysis" title="House-wise Predictions" icon="🏠" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {lalkitab.houseAnalysis.map((house, i) => (
              <div key={i} className="p-5 rounded-xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge tone="red">House {house.house}</Badge>
                  {house.planets.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {house.planets.map((p, j) => (
                        <Badge key={j} tone="amber" className="text-xs">{p}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-2">{house.prediction}</p>
                {house.remedies.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-rose-200">
                    <div className="text-xs font-semibold text-rose-900 mb-1">Remedies:</div>
                    <ul className="text-xs text-rose-800 space-y-1">
                      {house.remedies.map((r, j) => (
                        <li key={j}>• {r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Area-wise Predictions */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="🔮 Predictions" title="Life Area Predictions" icon="🔮" />
        <CardContent>
          <div className="space-y-4">
            {lalkitab.predictions.map((pred, i) => (
              <div key={i} className="p-5 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>📊</span>
                    <span>{pred.area}</span>
                  </div>
                  <Badge tone="amber" className="text-xs">{pred.period}</Badge>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-3">{pred.prediction}</p>
                {pred.remedies.length > 0 && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-amber-200">
                    <div className="text-xs font-semibold text-amber-900 mb-1">Lal Kitab Remedies:</div>
                    <ul className="text-xs text-amber-800 space-y-1">
                      {pred.remedies.map((r, j) => (
                        <li key={j}>• {r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Remedies */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="💎 Detailed Remedies" title="Lal Kitab Remedies" icon="💎" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {lalkitab.remedies.map((remedy, i) => (
              <div key={i} className="p-5 rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge tone="red">{remedy.type}</Badge>
                </div>
                <div className="text-sm text-slate-700 mb-2">{remedy.description}</div>
                <div className="p-3 bg-white rounded-lg border border-red-200 space-y-1 text-xs">
                  <div><span className="font-semibold text-red-900">Item:</span> <span className="text-slate-700">{remedy.item}</span></div>
                  <div><span className="font-semibold text-red-900">Method:</span> <span className="text-slate-700">{remedy.method}</span></div>
                  <div><span className="font-semibold text-red-900">Timing:</span> <span className="text-slate-700">{remedy.timing}</span></div>
                  <div><span className="font-semibold text-red-900">Duration:</span> <span className="text-slate-700">{remedy.duration}</span></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Special Remedies */}
      {lalkitab.specialRemedies.length > 0 && (
        <Card className="print:border-0 print:shadow-none">
          <CardHeader eyebrow="⭐ Special Remedies" title="Specific Issue Remedies" icon="⭐" />
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {lalkitab.specialRemedies.map((remedy, i) => (
                <div key={i} className="p-5 rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
                  <div className="text-sm font-bold text-slate-900 mb-2">{remedy.issue}</div>
                  <div className="text-sm text-slate-700 mb-2">{remedy.remedy}</div>
                  <div className="p-3 bg-white rounded-lg border border-orange-200 text-xs">
                    <div><span className="font-semibold text-orange-900">Item:</span> <span className="text-slate-700">{remedy.item}</span></div>
                    <div><span className="font-semibold text-orange-900">Method:</span> <span className="text-slate-700">{remedy.method}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Period-wise Predictions */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="📅 Period-wise Predictions" title="Future Predictions" icon="📅" />
        <CardContent>
          <div className="space-y-4">
            {lalkitab.predictionsByPeriod.map((period, i) => (
              <div key={i} className="p-5 rounded-xl border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
                <div className="flex items-center gap-2 mb-3">
                  <Badge tone="red">{period.period}</Badge>
                </div>
                <div className="space-y-3">
                  {period.predictions.map((pred, j) => (
                    <div key={j} className="p-3 bg-white rounded-lg border border-pink-200">
                      <div className="text-xs font-semibold text-pink-900 mb-1">{pred.area}</div>
                      <div className="text-sm text-slate-700">{pred.prediction}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="print:border-0 print:shadow-none bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
        <CardHeader eyebrow="ℹ️ Important Notes" title="Lal Kitab Guidelines" />
        <CardContent>
          <div className="space-y-2 text-sm text-slate-700">
            <p className="font-semibold mb-2">Important Guidelines for Lal Kitab Remedies:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Follow remedies exactly as prescribed</li>
              <li>Use fresh items for remedies</li>
              <li>Perform remedies with faith and devotion</li>
              <li>Maintain cleanliness during remedy performance</li>
              <li>Consult expert for complex issues</li>
              <li>Remedies should be performed at specified times</li>
              <li>Complete the full duration of remedies</li>
            </ul>
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

export default function LalKitabReportPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-600 mx-auto mb-4"></div><div className="text-slate-600">Loading...</div></div></div>}>
      <LalKitabReportPageContent />
    </Suspense>
  );
}
