"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { apiGet, apiPost } from "@/lib/http";
import { session } from "@/lib/session";
import type { KundliResult, DoshaAnalysis, KundliChart } from "@/types/astrology";
import { KundliChartVisual } from "@/components/ui/KundliChartVisual";

type LifeReportData = {
  kundli: KundliResult & { dosha?: DoshaAnalysis; chart?: KundliChart };
  userName: string;
  generatedAt: string;
};

function LifeReportPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reportData, setReportData] = useState<LifeReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has generated Kundli
    const user = session.getUser();
    if (!user) {
      router.push("/login?redirect=/lifereport");
      return;
    }

    // Check if Kundli data is passed via URL params (from Kundli page)
    const kundliDataParam = searchParams.get("kundliData");
    if (kundliDataParam) {
      try {
        const kundliData = JSON.parse(decodeURIComponent(kundliDataParam));
        setReportData({
          kundli: kundliData,
          userName: kundliData.name || user.name || "User",
          generatedAt: new Date().toISOString(),
        });
        return;
      } catch (e) {
        console.error("Failed to parse Kundli data:", e);
      }
    }

    // Try to generate report from saved Kundli or prompt to generate
    generateReportFromKundli();
  }, [router, searchParams]);

  async function generateReportFromKundli() {
    setLoading(true);
    setErr(null);
    try {
      // First, try to get from API
      const res = await apiPost<{ ok: boolean; data?: LifeReportData; error?: string }>("/api/reports/life", {});
      if (res.ok && res.data) {
        setReportData(res.data);
        setLoading(false);
        return;
      }

      // If no saved Kundli, show prompt to generate
      setLoading(false);
    } catch (e: any) {
      setErr(e?.message ?? "Please generate your Kundli first");
      setLoading(false);
    }
  }

  async function generateReport() {
    setLoading(true);
    setErr(null);
    try {
      const res = await apiPost<{ ok: boolean; data?: LifeReportData; error?: string }>("/api/reports/life", {});
      if (!res.ok) throw new Error(res.error || "Failed");
      setReportData(res.data ?? null);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to generate report. Please generate your Kundli first.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadPDF() {
    if (!reportData) return;
    try {
      const res = await apiPost<{ ok: boolean; data?: { url?: string; blob?: string }; error?: string }>("/api/reports/pdf", {
        type: "life",
        data: reportData,
        title: "Life Report"
      });
      if (res.ok && res.data?.blob) {
        // Create download link
        const blob = new Blob([res.data.blob], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `LifeReport_${new Date().toISOString().split("T")[0]}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Fallback: Use browser print
        window.print();
      }
    } catch (e) {
      // Fallback: Use browser print
      window.print();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-600 mx-auto mb-4"></div>
          <div className="text-slate-600">Generating Life Report...</div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader eyebrow="📄 Life Report" title="Generate Your Life Report" />
          <CardContent>
            <p className="text-slate-700 mb-6">
              Generate a comprehensive life report based on your birth chart. This report includes detailed analysis of your planetary positions, house significations, dasha periods, predictions, and remedies.
            </p>
            <Button onClick={generateReport} className="w-full">
              Generate Life Report
            </Button>
            {err && <div className="mt-4 text-sm text-rose-700">{err}</div>}
          </CardContent>
        </Card>
      </div>
    );
  }

  const { kundli, userName, generatedAt } = reportData;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Cover Page - Print Only */}
      <div className="hidden print:block page-break-after-always">
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-saffron-50 via-amber-50 to-orange-50 p-12">
          <div className="text-center">
            <div className="text-6xl mb-6">🔮</div>
            <h1 className="text-5xl font-bold text-slate-900 mb-4">Life Report</h1>
            <h2 className="text-3xl font-semibold text-slate-700 mb-8">Complete Vedic Astrology Analysis</h2>
            <div className="text-xl text-slate-600 mb-12">
              <div className="font-bold">{userName}</div>
              <div className="text-lg mt-2">Generated on {new Date(generatedAt).toLocaleDateString("en-IN", { 
                year: "numeric", 
                month: "long", 
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}</div>
            </div>
            <div className="text-sm text-slate-500">AstroSetu - Bridging humans with cosmic guidance</div>
          </div>
        </div>
      </div>

      {/* Birth Chart Section - AstroSage Style (at top) */}
      {kundli.chart && (
        <Card className="print:border-0 print:shadow-none">
          <CardContent className="p-0">
            <KundliChartVisual chart={kundli.chart} title="Birth Chart & Analysis" />
          </CardContent>
        </Card>
      )}

      {/* Executive Summary */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="📋 Executive Summary" title="Report Overview" icon="📄" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-semibold text-slate-600 mb-2">Personal Details</div>
              <div className="space-y-2 text-sm">
                <div><span className="font-semibold">Name:</span> {userName}</div>
                <div><span className="font-semibold">Ascendant (Lagna):</span> {kundli.ascendant}</div>
                <div><span className="font-semibold">Rashi (Moon Sign):</span> {kundli.rashi}</div>
                <div><span className="font-semibold">Nakshatra:</span> {kundli.nakshatra}</div>
                <div><span className="font-semibold">Tithi:</span> {kundli.tithi}</div>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-600 mb-2">Key Highlights</div>
              <div className="space-y-2">
                {kundli.summary.slice(0, 3).map((s, i) => (
                  <div key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-saffron-600 font-bold">{i + 1}.</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Planetary Positions */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="🪐 Planetary Positions" title="Graha Sthiti (Planetary Positions)" icon="🪐" />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-saffron-600 to-amber-600 text-white">
                  <th className="py-3 px-4 text-left font-bold">Planet (ग्रह)</th>
                  <th className="py-3 px-4 text-left font-bold">Sign (राशि)</th>
                  <th className="py-3 px-4 text-left font-bold">Degree</th>
                  <th className="py-3 px-4 text-left font-bold">House</th>
                  <th className="py-3 px-4 text-left font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {kundli.planets.map((p, idx) => (
                  <tr key={p.name} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3 px-4 text-slate-700">{p.sign}</td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">{p.degree}°</td>
                    <td className="py-3 px-4">
                      <Badge tone="indigo">House {p.house}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      {p.retrograde ? (
                        <Badge tone="red">Retrograde</Badge>
                      ) : (
                        <Badge tone="green">Direct</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* House Analysis */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="🏠 House Analysis" title="Bhav Phal (House Analysis)" icon="🏠" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { num: 1, name: "Lagna (Self)", significance: "Personality, appearance, health" },
              { num: 2, name: "Dhana (Wealth)", significance: "Finances, family, speech" },
              { num: 3, name: "Sahaja (Siblings)", significance: "Siblings, courage, communication" },
              { num: 4, name: "Sukha (Happiness)", significance: "Mother, home, education" },
              { num: 5, name: "Putra (Children)", significance: "Children, creativity, intelligence" },
              { num: 6, name: "Ripu (Enemies)", significance: "Health, enemies, service" },
              { num: 7, name: "Kalatra (Spouse)", significance: "Marriage, partnerships, business" },
              { num: 8, name: "Ayush (Longevity)", significance: "Longevity, obstacles, transformation" },
              { num: 9, name: "Bhagya (Fortune)", significance: "Fortune, father, spirituality" },
              { num: 10, name: "Karma (Career)", significance: "Career, reputation, status" },
              { num: 11, name: "Labha (Gains)", significance: "Income, friends, desires" },
              { num: 12, name: "Vyaya (Expenses)", significance: "Expenses, losses, spirituality" }
            ].map((house) => {
              const housePlanets = kundli.planets.filter(p => p.house === house.num);
              return (
                <div key={house.num} className="p-4 rounded-xl border-2 border-slate-200 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge tone="amber">House {house.num}</Badge>
                    <div className="text-sm font-bold text-slate-900">{house.name}</div>
                  </div>
                  <div className="text-xs text-slate-600 mb-2">{house.significance}</div>
                  {housePlanets.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {housePlanets.map((p) => (
                        <Badge key={p.name} className="text-xs">{p.name}</Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">No planets</div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dasha Analysis */}
      {kundli.chart && (
        <Card className="print:border-0 print:shadow-none">
          <CardHeader eyebrow="⏳ Dasha Periods" title="Dasha Phal (Planetary Periods)" icon="⏳" />
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border-2 border-saffron-200 bg-gradient-to-br from-saffron-50 to-amber-50">
                <div className="text-sm font-semibold text-saffron-700 mb-2">Current Dasha</div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{kundli.chart?.dasha?.current || "N/A"}</div>
                <div className="text-xs text-slate-600">Started: {kundli.chart?.dasha?.startDate || "N/A"}</div>
              </div>
              <div className="p-5 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="text-sm font-semibold text-amber-700 mb-2">Next Dasha</div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{kundli.chart?.dasha?.next || "N/A"}</div>
                <div className="text-xs text-slate-600">Upcoming period</div>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-sm font-semibold text-slate-700 mb-2">Dasha Effects</div>
              <p className="text-sm text-slate-600 leading-relaxed">
                The current dasha period influences various aspects of your life. Each planetary period brings specific energies and opportunities. Consult with an expert astrologer for detailed dasha predictions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Life Predictions */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="🔮 Predictions" title="Life Predictions (जीवन भविष्यवाणी)" icon="🔮" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
              <div className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span>💼</span>
                <span>Career & Profession</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-3">
                Your 10th house placement indicates strong potential in {kundli.planets.find(p => p.house === 10)?.sign || "various"} fields. Focus on building expertise and maintaining professional relationships.
              </p>
              <div className="text-xs text-slate-600">
                <div className="font-semibold mb-1">Favorable Periods:</div>
                <div>Jupiter and Venus periods bring career growth</div>
              </div>
            </div>

            <div className="p-5 rounded-xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50">
              <div className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span>💑</span>
                <span>Relationships & Marriage</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-3">
                Your 7th house analysis suggests {kundli.planets.find(p => p.house === 7) ? "harmonious" : "balanced"} relationships. Venus placement indicates appreciation for beauty and harmony in partnerships.
              </p>
              <div className="text-xs text-slate-600">
                <div className="font-semibold mb-1">Marriage Timing:</div>
                <div>Consult expert for specific timing predictions</div>
              </div>
            </div>

            <div className="p-5 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span>💰</span>
                <span>Finance & Wealth</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-3">
                Your 2nd and 11th house placements indicate {kundli.planets.find(p => p.house === 2 || p.house === 11) ? "good" : "moderate"} earning potential. Focus on stable investments and avoid speculation.
              </p>
              <div className="text-xs text-slate-600">
                <div className="font-semibold mb-1">Wealth Periods:</div>
                <div>Jupiter and Mercury periods favor financial growth</div>
              </div>
            </div>

            <div className="p-5 rounded-xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
              <div className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span>🏥</span>
                <span>Health & Wellbeing</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-3">
                Your 6th house analysis suggests {kundli.planets.find(p => p.house === 6)?.name === "Mars" ? "good immunity" : "moderate"} health. Regular exercise and stress management are recommended.
              </p>
              <div className="text-xs text-slate-600">
                <div className="font-semibold mb-1">Health Tips:</div>
                <div>Maintain regular health check-ups and balanced diet</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dosha Analysis */}
      {kundli.dosha && (
        <Card className="print:border-0 print:shadow-none">
          <CardHeader eyebrow="💎 Dosha Analysis" title="Planetary Doshas & Remedies" icon="💎" />
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50">
                <div className="text-sm font-bold text-red-900 mb-2">Manglik Dosha</div>
                <Badge tone={kundli.dosha?.manglik?.status === "Manglik" ? "red" : "green"} className="mb-2">
                  {kundli.dosha?.manglik?.status} ({kundli.dosha?.manglik?.severity})
                </Badge>
                {kundli.dosha?.manglik?.remedies && kundli.dosha?.manglik?.remedies.length > 0 && (
                  <div className="text-xs text-red-800 mt-2">
                    <div className="font-semibold mb-1">Remedies:</div>
                    <ul className="list-disc pl-4 space-y-1">
                      {kundli.dosha?.manglik?.remedies?.slice(0, 2).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl border-2 border-orange-200 bg-orange-50">
                <div className="text-sm font-bold text-orange-900 mb-2">Kaal Sarp Dosha</div>
                <Badge tone={kundli.dosha?.kaalSarp?.present ? "red" : "green"} className="mb-2">
                  {kundli.dosha?.kaalSarp?.present ? `Present (${kundli.dosha.kaalSarp?.type || "Unknown"})` : "Not Present"}
                </Badge>
                {kundli.dosha?.kaalSarp?.remedies && kundli.dosha?.kaalSarp?.remedies.length > 0 && (
                  <div className="text-xs text-orange-800 mt-2">
                    <div className="font-semibold mb-1">Remedies:</div>
                    <ul className="list-disc pl-4 space-y-1">
                      {kundli.dosha?.kaalSarp?.remedies?.slice(0, 2).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50">
                <div className="text-sm font-bold text-slate-900 mb-2">Shani Effects</div>
                <div className="text-xs text-slate-700 space-y-1 mb-2">
                  {kundli.dosha?.shani?.effects?.slice(0, 2).map((e, i) => (
                    <div key={i}>• {e}</div>
                  )) || []}
                </div>
                <div className="text-xs font-semibold text-slate-600 mt-2">Remedies:</div>
                <div className="text-xs text-slate-700">
                  {kundli.dosha?.shani?.remedies?.slice(0, 2).map((r, i) => (
                    <div key={i}>• {r}</div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50">
                <div className="text-sm font-bold text-purple-900 mb-2">Rahu-Ketu Effects</div>
                <div className="text-xs text-purple-800 space-y-1 mb-2">
                  {kundli.dosha?.rahuKetu?.effects?.slice(0, 2).map((e, i) => (
                    <div key={i}>• {e}</div>
                  ))}
                </div>
                <div className="text-xs font-semibold text-purple-700 mt-2">Remedies:</div>
                <div className="text-xs text-purple-800">
                  {kundli.dosha?.rahuKetu?.remedies?.slice(0, 2).map((r, i) => (
                    <div key={i}>• {r}</div>
                  )) || []}
                </div>
              </div>
            </div>

            <div className="mt-6 p-5 rounded-xl border-2 border-saffron-200 bg-gradient-to-r from-saffron-50 to-amber-50">
              <div className="text-sm font-bold text-saffron-900 mb-2">Overall Assessment</div>
              <p className="text-sm text-slate-700 leading-relaxed">{kundli.dosha?.overall || "N/A"}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Remedies & Recommendations */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="💎 Remedies" title="Upay & Solutions (उपाय)" icon="💎" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50">
              <div className="text-sm font-bold text-amber-900 mb-2">Gemstones (रत्न)</div>
              <ul className="text-xs text-amber-800 space-y-1">
                <li>• Consult expert for personalized gemstone recommendations</li>
                <li>• Wear gemstones based on your planetary positions</li>
                <li>• Ensure proper quality and certification</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50">
              <div className="text-sm font-bold text-indigo-900 mb-2">Mantras (मंत्र)</div>
              <ul className="text-xs text-indigo-800 space-y-1">
                <li>• Chant planetary mantras daily</li>
                <li>• Perform regular puja and prayers</li>
                <li>• Follow spiritual practices</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50">
              <div className="text-sm font-bold text-emerald-900 mb-2">Rituals (कर्मकांड)</div>
              <ul className="text-xs text-emerald-800 space-y-1">
                <li>• Perform specific pujas on auspicious days</li>
                <li>• Follow traditional rituals</li>
                <li>• Seek guidance from learned priests</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl border-2 border-rose-200 bg-rose-50">
              <div className="text-sm font-bold text-rose-900 mb-2">Lifestyle (जीवनशैली)</div>
              <ul className="text-xs text-rose-800 space-y-1">
                <li>• Maintain positive attitude and thoughts</li>
                <li>• Practice meditation and yoga</li>
                <li>• Help others and perform charity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Yearly Predictions */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader eyebrow="📅 Yearly Analysis" title="Varshphal (वर्षफल)" icon="📅" />
        <CardContent>
          <div className="p-5 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <p className="text-sm text-slate-700 leading-relaxed mb-4">
              Based on your birth chart, the current year brings opportunities for growth in career and relationships. 
              Focus on maintaining balance in all aspects of life. Consult with an expert astrologer for detailed yearly predictions.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="font-semibold text-slate-700 mb-1">Favorable Months:</div>
                <div className="text-slate-600">Consult expert for specific timing</div>
              </div>
              <div>
                <div className="font-semibold text-slate-700 mb-1">Caution Periods:</div>
                <div className="text-slate-600">Be careful during planetary transits</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="print:border-0 print:shadow-none print:page-break-inside-avoid">
        <CardContent className="p-6 text-center">
          <div className="text-sm text-slate-600 mb-2">
            This report is generated based on Vedic Astrology principles
          </div>
          <div className="text-xs text-slate-500">
            For detailed consultations, please contact our expert astrologers
          </div>
          <div className="text-xs text-slate-400 mt-4">
            AstroSetu - Bridging humans with cosmic guidance
          </div>
          <div className="text-xs text-slate-400">
            Generated on {new Date(generatedAt).toLocaleString("en-IN")}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons - Hidden in Print */}
      <div className="print:hidden flex gap-4 justify-center pt-6">
        <Button onClick={downloadPDF} className="px-8 py-4">
          📄 Download PDF
        </Button>
        <Button variant="secondary" onClick={() => window.print()} className="px-8 py-4">
          🖨️ Print Report
        </Button>
      </div>
    </div>
  );
}

export default function LifeReportPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-600 mx-auto mb-4"></div><div className="text-slate-600">Loading...</div></div></div>}>
      <LifeReportPageContent />
    </Suspense>
  );
}

