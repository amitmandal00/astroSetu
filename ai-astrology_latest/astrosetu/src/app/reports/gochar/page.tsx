"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { apiPost } from "@/lib/http";
import { session } from "@/lib/session";

type TransitResult = {
  currentTransits: Array<{
    planet: string;
    currentSign: string;
    currentHouse: number;
    effect: string;
    duration: string;
    remedies: string[];
  }>;
  predictions: {
    career: string;
    health: string;
    relationships: string;
    finance: string;
    education: string;
  };
  summary: string;
};

export default function GocharPhalPage() {
  const user = session.getUser();
  const savedBirthDetails = session.getBirthDetails();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TransitResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!savedBirthDetails) {
      setError("Please generate your Kundli first to get transit predictions");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiPost<{ ok: boolean; data?: TransitResult; error?: string }>("/api/reports/gochar", {
        dob: savedBirthDetails.dob,
        tob: savedBirthDetails.tob,
        place: savedBirthDetails.place,
        latitude: savedBirthDetails.latitude,
        longitude: savedBirthDetails.longitude,
      });

      if (!res.ok) throw new Error(res.error || "Failed to generate transit report");
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 text-white p-8 lg:p-12 shadow-xl">
        <HeaderPattern />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">🔄</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">Gochar Phal (Transit Report)</h1>
              <p className="text-lg text-white/90">How current planetary positions affect your life</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader 
          eyebrow="📖 About Transit Report" 
          title="What is Gochar Phal?" 
        />
        <CardContent>
          <p className="text-sm text-slate-700 leading-relaxed mb-4">
            Gochar Phal (Transit Report) analyzes how the current positions of planets (transits) affect your birth chart. 
            Planetary transits create different influences on various aspects of your life including career, health, relationships, 
            finance, and education. This report helps you understand the timing of events and make informed decisions.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-cyan-50 border-2 border-cyan-200">
              <div className="font-semibold text-slate-900 mb-2">✨ Key Features</div>
              <ul className="text-xs text-slate-700 space-y-1">
                <li>• Current planetary transits</li>
                <li>• House-wise effects</li>
                <li>• Area-wise predictions</li>
                <li>• Timing of events</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
              <div className="font-semibold text-slate-900 mb-2">📊 What You&apos;ll Get</div>
              <ul className="text-xs text-slate-700 space-y-1">
                <li>• Career opportunities</li>
                <li>• Health predictions</li>
                <li>• Relationship insights</li>
                <li>• Financial guidance</li>
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
                  We&apos;ll use your saved birth details to generate your transit report.
                </p>
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                >
                  {loading ? "Generating Report..." : "🔄 Generate Transit Report"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 mb-4">
                  Please generate your Kundli first to get personalized transit predictions.
                </p>
                <Link href="/kundli">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white">
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
          {/* Summary */}
          <Card>
            <CardHeader 
              eyebrow="📊 Summary" 
              title="Transit Overview"
            />
            <CardContent>
              <p className="text-sm text-slate-700 leading-relaxed">{result.summary}</p>
            </CardContent>
          </Card>

          {/* Current Transits */}
          <Card>
            <CardHeader 
              eyebrow="🪐 Current Planetary Transits" 
              title="Planetary Positions & Effects"
            />
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {result.currentTransits.map((transit, idx) => (
                  <Card key={idx} className="border-2 border-cyan-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-1">{transit.planet}</h3>
                          <div className="flex items-center gap-2">
                            <Badge className="text-xs">{transit.currentSign}</Badge>
                            <span className="text-xs text-slate-600">House {transit.currentHouse}</span>
                          </div>
                        </div>
                        <span className="text-2xl">🪐</span>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{transit.effect}</p>
                      <div className="text-xs text-slate-600 mb-2">
                        <span className="font-semibold">Duration:</span> {transit.duration}
                      </div>
                      {transit.remedies.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="text-xs font-semibold text-slate-700 mb-1">Remedies:</div>
                          <ul className="text-xs text-slate-600 space-y-1">
                            {transit.remedies.map((remedy, i) => (
                              <li key={i}>• {remedy}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Predictions */}
          <Card>
            <CardHeader 
              eyebrow="🔮 Predictions" 
              title="Area-wise Predictions"
            />
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200">
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
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/services">
              <Button variant="ghost" className="text-slate-600">
                ← Back to Services
              </Button>
            </Link>
            <Button
              onClick={() => setResult(null)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              🔄 Generate Again
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

