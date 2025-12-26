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

type AscendantReportData = {
  kundli: KundliResult & { chart?: KundliChart };
  ascendantAnalysis: {
    lagna: string;
    lagnaLord: string;
    lagnaLordHouse: number;
    lagnaLordSign: string;
    lagnaLordDegree: number;
    characteristics: string[];
    strengths: string[];
    challenges: string[];
    career: {
      prediction: string;
      suitableFields: string[];
      favorablePeriods: string[];
      challenges: string[];
    };
    health: {
      prediction: string;
      areas: string[];
      precautions: string[];
      remedies: string[];
    };
    relationships: {
      prediction: string;
      marriageTiming: string;
      partnerCharacteristics: string[];
      compatibility: string[];
    };
    finance: {
      prediction: string;
      earningPotential: string;
      favorablePeriods: string[];
      investments: string[];
    };
    education: {
      prediction: string;
      suitableFields: string[];
      favorablePeriods: string[];
    };
    remedies: Array<{ type: string; description: string; timing: string }>;
    predictions: Array<{ period: string; prediction: string; areas: string[] }>;
  };
  userName: string;
  generatedAt: string;
};

function AscendantReportPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reportData, setReportData] = useState<AscendantReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const user = session.getUser();
    if (!user) {
      router.push("/login?redirect=/reports/ascendant");
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
      const res = await apiPost<{ ok: boolean; data?: AscendantReportData; error?: string }>("/api/reports/ascendant", {});
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
      const res = await apiPost<{ ok: boolean; data?: AscendantReportData; error?: string }>("/api/reports/ascendant", {
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
          <div className="text-slate-600">Generating Ascendant Report...</div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader eyebrow="📄 Ascendant Report" title="Lagna Analysis Report" icon="📄" />
          <CardContent>
            <p className="text-slate-700 mb-6">
              Generate a detailed analysis of your Ascendant (Lagna) and its influence on your personality, career, health, and relationships.
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

  const { kundli, ascendantAnalysis, userName, generatedAt } = reportData;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Ascendant Chart Section - AstroSage Style */}
      {kundli.chart && (
        <Card className="print:border-0 print:shadow-none">
          <CardContent className="p-0">
            <KundliChartVisual chart={kundli.chart} title="Ascendant Chart & Analysis" />
          </CardContent>
        </Card>
      )}

      {/* Cover Page */}
      <div className="hidden print:block page-break-after-always">
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-saffron-50 via-amber-50 to-orange-50 p-12">
          <div className="text-center">
            <div className="text-6xl mb-6">📄</div>
            <h1 className="text-5xl font-bold text-slate-900 mb-4">Ascendant Report</h1>
            <h2 className="text-3xl font-semibold text-slate-700 mb-8">Lagna Analysis & Predictions (लग्न विश्लेषण)</h2>
            <div className="text-xl text-slate-600 mb-12">
              <div className="font-bold">{userName}</div>
              <div className="text-lg mt-2">Generated on {new Date(generatedAt).toLocaleDateString("en-IN")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-saffron-600 via-amber-600 to-orange-600 rounded-2xl p-6 shadow-xl border-2 border-saffron-700 relative overflow-hidden">
        <HeaderPattern className="absolute inset-0 opacity-10" />
        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <span>🔮</span>
                <span>Ascendant Report</span>
              </h1>
              <p className="text-amber-100 text-sm">Complete Lagna Analysis & Predictions</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{ascendantAnalysis.lagna}</div>
              <div className="text-sm text-amber-100">Your Ascendant</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ascendant Overview */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="🔮 Ascendant Details" title={`Lagna: ${ascendantAnalysis.lagna}`} icon="🔮" />
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border-2 border-saffron-200 bg-gradient-to-br from-saffron-50 to-amber-50">
              <div className="text-sm font-semibold text-saffron-700 mb-2">Lagna Lord (लग्नेश)</div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{ascendantAnalysis.lagnaLord}</div>
              <div className="text-sm text-slate-600">In {ascendantAnalysis.lagnaLordSign}</div>
            </div>
            <div className="p-5 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="text-sm font-semibold text-amber-700 mb-2">House Position</div>
              <div className="text-2xl font-bold text-slate-900 mb-1">House {ascendantAnalysis.lagnaLordHouse}</div>
              <div className="text-sm text-slate-600">Lagna Lord&apos;s position</div>
            </div>
            <div className="p-5 rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
              <div className="text-sm font-semibold text-orange-700 mb-2">Degree</div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{ascendantAnalysis.lagnaLordDegree}°</div>
              <div className="text-sm text-slate-600">Planetary degree</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Characteristics */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="✨ Characteristics" title="Personality Traits" icon="✨" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {ascendantAnalysis.characteristics.map((trait, i) => (
              <div key={i} className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold">{i + 1}.</span>
                  <span className="text-sm text-slate-700">{trait}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Challenges */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="💪 Strengths & Challenges" title="Your Potential" icon="💪" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
              <div className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span>✅</span>
                <span>Strengths</span>
              </div>
              <ul className="space-y-2">
                {ascendantAnalysis.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-5 rounded-xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50">
              <div className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span>⚠️</span>
                <span>Challenges</span>
              </div>
              <ul className="space-y-2">
                {ascendantAnalysis.challenges.map((c, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Career Predictions */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="💼 Career & Profession" title="Career Predictions" icon="💼" />
        <CardContent>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <p className="text-sm text-slate-700 leading-relaxed mb-4">{ascendantAnalysis.career.prediction}</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Suitable Fields:</div>
                  <div className="flex flex-wrap gap-2">
                    {ascendantAnalysis.career.suitableFields.map((field, i) => (
                      <Badge key={i} tone="indigo">{field}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Favorable Periods:</div>
                  <div className="text-sm text-slate-700 space-y-1">
                    {ascendantAnalysis.career.favorablePeriods.map((period, i) => (
                      <div key={i}>• {period}</div>
                    ))}
                  </div>
                </div>
              </div>
              {ascendantAnalysis.career.challenges.length > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="text-xs font-semibold text-amber-800 mb-1">Challenges:</div>
                  <ul className="text-xs text-amber-700 space-y-1">
                    {ascendantAnalysis.career.challenges.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Predictions */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="🏥 Health & Wellbeing" title="Health Predictions" icon="🏥" />
        <CardContent>
          <div className="p-5 rounded-xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
            <p className="text-sm text-slate-700 leading-relaxed mb-4">{ascendantAnalysis.health.prediction}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Areas to Focus:</div>
                <ul className="text-sm text-slate-700 space-y-1">
                  {ascendantAnalysis.health.areas.map((area, i) => (
                    <li key={i}>• {area}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Precautions:</div>
                <ul className="text-sm text-slate-700 space-y-1">
                  {ascendantAnalysis.health.precautions.map((prec, i) => (
                    <li key={i}>• {prec}</li>
                  ))}
                </ul>
              </div>
            </div>
            {ascendantAnalysis.health.remedies.length > 0 && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="text-xs font-semibold text-emerald-800 mb-1">Remedies:</div>
                <ul className="text-xs text-emerald-700 space-y-1">
                  {ascendantAnalysis.health.remedies.map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Relationship Predictions */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="💑 Relationships & Marriage" title="Relationship Predictions" icon="💑" />
        <CardContent>
          <div className="p-5 rounded-xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50">
            <p className="text-sm text-slate-700 leading-relaxed mb-4">{ascendantAnalysis.relationships.prediction}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Marriage Timing:</div>
                <div className="text-sm text-slate-700 mb-3">{ascendantAnalysis.relationships.marriageTiming}</div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Partner Characteristics:</div>
                <ul className="text-sm text-slate-700 space-y-1">
                  {ascendantAnalysis.relationships.partnerCharacteristics.map((char, i) => (
                    <li key={i}>• {char}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Compatibility:</div>
                <ul className="text-sm text-slate-700 space-y-1">
                  {ascendantAnalysis.relationships.compatibility.map((comp, i) => (
                    <li key={i}>• {comp}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Finance Predictions */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="💰 Finance & Wealth" title="Financial Predictions" icon="💰" />
        <CardContent>
          <div className="p-5 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
            <p className="text-sm text-slate-700 leading-relaxed mb-4">{ascendantAnalysis.finance.prediction}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Earning Potential:</div>
                <div className="text-sm text-slate-700 mb-3">{ascendantAnalysis.finance.earningPotential}</div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Favorable Periods:</div>
                <ul className="text-sm text-slate-700 space-y-1">
                  {ascendantAnalysis.finance.favorablePeriods.map((period, i) => (
                    <li key={i}>• {period}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Investment Suggestions:</div>
                <ul className="text-sm text-slate-700 space-y-1">
                  {ascendantAnalysis.finance.investments.map((inv, i) => (
                    <li key={i}>• {inv}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education Predictions */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="📚 Education & Learning" title="Educational Predictions" icon="📚" />
        <CardContent>
          <div className="p-5 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <p className="text-sm text-slate-700 leading-relaxed mb-4">{ascendantAnalysis.education.prediction}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Suitable Fields:</div>
                <div className="flex flex-wrap gap-2">
                  {ascendantAnalysis.education.suitableFields.map((field, i) => (
                    <Badge key={i} tone="indigo">{field}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Favorable Periods:</div>
                <ul className="text-sm text-slate-700 space-y-1">
                  {ascendantAnalysis.education.favorablePeriods.map((period, i) => (
                    <li key={i}>• {period}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Period-wise Predictions */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="🔮 Period-wise Predictions" title="Future Predictions" icon="🔮" />
        <CardContent>
          <div className="space-y-4">
            {ascendantAnalysis.predictions.map((pred, i) => (
              <div key={i} className="p-5 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge tone="amber">{pred.period}</Badge>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-2">{pred.prediction}</p>
                {pred.areas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {pred.areas.map((area, j) => (
                      <Badge key={j} tone="indigo" className="text-xs">{area}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Remedies */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="💎 Remedies" title="Recommended Remedies" icon="💎" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {ascendantAnalysis.remedies.map((remedy, i) => (
              <div key={i} className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge tone="indigo">{remedy.type}</Badge>
                </div>
                <div className="text-sm text-slate-700 mb-1">{remedy.description}</div>
                <div className="text-xs text-slate-600">Timing: {remedy.timing}</div>
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

export default function AscendantReportPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-600 mx-auto mb-4"></div><div className="text-slate-600">Calculating ascendant analysis...</div></div></div>}>
      <AscendantReportPageContent />
    </Suspense>
  );
}
