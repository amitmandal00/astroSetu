"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { apiPost } from "@/lib/http";
import { session } from "@/lib/session";

type DashaPhalResult = {
  currentDasha: {
    planet: string;
    period: string;
    startDate: string;
    endDate: string;
    description: string;
  };
  antardashas: Array<{
    planet: string;
    period: string;
    startDate: string;
    endDate: string;
    effects: string;
  }>;
  predictions: {
    career: string;
    health: string;
    relationships: string;
    finance: string;
    education: string;
  };
  remedies: string[];
  nextDasha: {
    planet: string;
    startDate: string;
    preview: string;
  };
};

export default function DashaPhalPage() {
  const user = session.getUser();
  const savedBirthDetails = session.getBirthDetails();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DashaPhalResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!savedBirthDetails) {
      setError("Please generate your Kundli first to get Dasha Phal analysis");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiPost<{ ok: boolean; data?: DashaPhalResult; error?: string }>("/api/reports/dasha-phal", {
        dob: savedBirthDetails.dob,
        tob: savedBirthDetails.tob,
        place: savedBirthDetails.place,
        latitude: savedBirthDetails.latitude,
        longitude: savedBirthDetails.longitude,
      });

      if (!res.ok) throw new Error(res.error || "Failed to generate Dasha Phal");
      setResult(res.data || null);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 text-white p-8 lg:p-12 shadow-xl">
        <HeaderPattern />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">⏳</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">Dasha Phal Analysis</h1>
              <p className="text-lg text-white/90">Detailed analysis of planetary periods (Vimshottari Dasha)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader 
          eyebrow="📖 About Dasha Phal" 
          title="What is Dasha Phal?" 
        />
        <CardContent>
          <p className="text-sm text-slate-700 leading-relaxed mb-4">
            Dasha Phal (Planetary Period Analysis) is based on Vimshottari Dasha system, which divides human life into periods 
            ruled by different planets. Each planet has a specific duration, and its placement in your birth chart determines 
            the effects during that period. This analysis helps you understand the timing of events and make informed decisions.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-200">
              <div className="font-semibold text-slate-900 mb-2">🪐 Dasha System</div>
              <p className="text-xs text-slate-700">Vimshottari Dasha divides life into 9 planetary periods, each with sub-periods (Antardasha)</p>
            </div>
            <div className="p-4 rounded-xl bg-green-50 border-2 border-green-200">
              <div className="font-semibold text-slate-900 mb-2">📊 Analysis Includes</div>
              <ul className="text-xs text-slate-700 space-y-1">
                <li>• Current Dasha period</li>
                <li>• Antardasha (sub-periods)</li>
                <li>• Area-wise predictions</li>
                <li>• Next Dasha preview</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      {!result && (
        <Card>
          <CardContent className="p-6 text-center">
            {savedBirthDetails ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  We&apos;ll analyze your birth chart to determine your current Dasha period and predictions.
                </p>
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                >
                  {loading ? "Analyzing Dasha..." : "⏳ Generate Dasha Phal Analysis"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 mb-4">
                  Please generate your Kundli first to get Dasha Phal analysis.
                </p>
                <Link href="/kundli">
                  <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white">
                    🔮 Generate Kundli First
                  </Button>
                </Link>
              </div>
            )}
            {error && (
              <div className="mt-4 p-4 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {result && (
        <>
          {/* Current Dasha */}
          <Card className="border-2 border-emerald-500">
            <CardHeader 
              eyebrow="🪐 Current Dasha" 
              title={`${result.currentDasha.planet} Dasha`}
            />
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1">Period</div>
                      <div className="text-lg font-bold text-slate-900">{result.currentDasha.period}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1">Start Date</div>
                      <div className="text-sm text-slate-700">{result.currentDasha.startDate}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1">End Date</div>
                      <div className="text-sm text-slate-700">{result.currentDasha.endDate}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Description</div>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.currentDasha.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Antardashas */}
          {result.antardashas.length > 0 && (
            <Card>
              <CardHeader 
                eyebrow="📅 Antardashas" 
                title="Sub-Periods (Antardasha)"
              />
              <CardContent>
                <div className="space-y-4">
                  {result.antardashas.map((antardasha, idx) => (
                    <Card key={idx} className="border-2 border-emerald-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">{antardasha.planet} Antardasha</h3>
                            <div className="flex items-center gap-4 text-xs text-slate-600">
                              <span>{antardasha.period}</span>
                              <span>•</span>
                              <span>{antardasha.startDate} - {antardasha.endDate}</span>
                            </div>
                          </div>
                          <Badge className="text-xs">Sub-Period</Badge>
                        </div>
                        <p className="text-sm text-slate-700">{antardasha.effects}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Predictions */}
          <Card>
            <CardHeader 
              eyebrow="🔮 Predictions" 
              title="Area-wise Predictions During Current Dasha"
            />
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                  <div className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    💼 Career
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.predictions.career}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                  <div className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    ❤️ Relationships
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.predictions.relationships}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
                  <div className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    💰 Finance
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.predictions.finance}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200">
                  <div className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    🏥 Health
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.predictions.health}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 md:col-span-2">
                  <div className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    📚 Education
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.predictions.education}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Dasha */}
          <Card>
            <CardHeader 
              eyebrow="🔮 Next Dasha" 
              title={`Upcoming: ${result.nextDasha.planet} Dasha`}
            />
            <CardContent>
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⏭️</span>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 mb-2">
                      Starts: {result.nextDasha.startDate}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{result.nextDasha.preview}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Remedies */}
          {result.remedies.length > 0 && (
            <Card>
              <CardHeader 
                eyebrow="🛡️ Remedies" 
                title="Recommended Remedies"
              />
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {result.remedies.map((remedy, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-200 flex items-start gap-3">
                      <span className="text-xl">✨</span>
                      <p className="text-sm text-slate-700 flex-1">{remedy}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/services">
              <Button variant="ghost" className="text-slate-600">
                ← Back to Services
              </Button>
            </Link>
            <Button
              onClick={() => setResult(null)}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
            >
              🔄 Analyze Again
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

