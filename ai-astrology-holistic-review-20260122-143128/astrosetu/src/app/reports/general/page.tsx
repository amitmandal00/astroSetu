"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { apiPost } from "@/lib/http";
import { session } from "@/lib/session";

type GeneralPredictionResult = {
  overview: string;
  predictions: {
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
  };
  areas: {
    career: string;
    health: string;
    relationships: string;
    finance: string;
    family: string;
    education: string;
  };
  importantPeriods: Array<{
    period: string;
    event: string;
    significance: string;
  }>;
  remedies: string[];
};

export default function GeneralPredictionPage() {
  const user = session.getUser();
  const savedBirthDetails = session.getBirthDetails();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneralPredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!savedBirthDetails) {
      setError("Please generate your Kundli first to get personalized predictions");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiPost<{ ok: boolean; data?: GeneralPredictionResult; error?: string }>("/api/reports/general", {
        dob: savedBirthDetails.dob,
        tob: savedBirthDetails.tob,
        place: savedBirthDetails.place,
        latitude: savedBirthDetails.latitude,
        longitude: savedBirthDetails.longitude,
      });

      if (!res.ok) throw new Error(res.error || "Failed to generate predictions");
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-white p-8 lg:p-12 shadow-xl">
        <HeaderPattern />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">🔮</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">General Prediction</h1>
              <p className="text-lg text-white/90">Overall life predictions based on your birth chart</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader 
          eyebrow="📖 About General Prediction" 
          title="What is General Prediction?" 
        />
        <CardContent>
          <p className="text-sm text-slate-700 leading-relaxed mb-4">
            General Prediction provides comprehensive insights into various aspects of your life based on your birth chart. 
            This report analyzes planetary positions, dasha periods, and transits to give you a complete overview of what lies ahead 
            in different areas including career, health, relationships, finance, family, and education.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-200">
              <div className="font-semibold text-slate-900 mb-2">⏱️ Time Periods</div>
              <p className="text-xs text-slate-700">Short, medium, and long-term predictions</p>
            </div>
            <div className="p-4 rounded-xl bg-yellow-50 border-2 border-yellow-200">
              <div className="font-semibold text-slate-900 mb-2">📊 Life Areas</div>
              <p className="text-xs text-slate-700">Detailed analysis of 6 key life areas</p>
            </div>
            <div className="p-4 rounded-xl bg-orange-50 border-2 border-orange-200">
              <div className="font-semibold text-slate-900 mb-2">📅 Important Dates</div>
              <p className="text-xs text-slate-700">Key periods and significant events</p>
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
                  We&apos;ll use your saved birth details to generate your personalized predictions.
                </p>
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                >
                  {loading ? "Generating Predictions..." : "🔮 Generate General Predictions"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 mb-4">
                  Please generate your Kundli first to get personalized predictions.
                </p>
                <Link href="/kundli">
                  <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white">
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
          {/* Overview */}
          <Card>
            <CardHeader 
              eyebrow="📊 Overview" 
              title="Life Prediction Summary"
            />
            <CardContent>
              <p className="text-sm text-slate-700 leading-relaxed">{result.overview}</p>
            </CardContent>
          </Card>

          {/* Time Period Predictions */}
          <Card>
            <CardHeader 
              eyebrow="⏱️ Time Periods" 
              title="Short, Medium & Long-term Predictions"
            />
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
                  <div className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    📅 Short-term (3-6 months)
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.predictions.shortTerm}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
                  <div className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    📆 Medium-term (6-12 months)
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.predictions.mediumTerm}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200">
                  <div className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    📅 Long-term (1-2 years)
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.predictions.longTerm}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Area-wise Predictions */}
          <Card>
            <CardHeader 
              eyebrow="🔮 Detailed Predictions" 
              title="Area-wise Life Predictions"
            />
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                  <div className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    💼 Career
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.areas.career}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                  <div className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    ❤️ Relationships
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.areas.relationships}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
                  <div className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    💰 Finance
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.areas.finance}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200">
                  <div className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    🏥 Health
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.areas.health}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
                  <div className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    👨‍👩‍👧‍👦 Family
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.areas.family}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200">
                  <div className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    📚 Education
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.areas.education}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Periods */}
          {result.importantPeriods.length > 0 && (
            <Card>
              <CardHeader 
                eyebrow="📅 Important Periods" 
                title="Key Dates & Events"
              />
              <CardContent>
                <div className="space-y-4">
                  {result.importantPeriods.map((period, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-bold text-slate-900">{period.period}</div>
                        <Badge className="text-xs">Important</Badge>
                      </div>
                      <div className="text-sm font-semibold text-slate-700 mb-1">{period.event}</div>
                      <p className="text-sm text-slate-600">{period.significance}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
                    <div key={idx} className="p-3 rounded-xl bg-amber-50 border-2 border-amber-200 flex items-start gap-3">
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
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
            >
              🔄 Generate Again
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

