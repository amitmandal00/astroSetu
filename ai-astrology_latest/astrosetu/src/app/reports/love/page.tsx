"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { apiPost } from "@/lib/http";
import { session } from "@/lib/session";

type LoveHoroscopeResult = {
  overview: string;
  currentStatus: string;
  predictions: {
    single: string;
    relationship: string;
    marriage: string;
  };
  compatibility: {
    bestMatches: string[];
    challengingMatches: string[];
  };
  timing: {
    favorablePeriods: Array<{
      period: string;
      event: string;
    }>;
    importantDates: string[];
  };
  advice: string[];
  remedies: string[];
};

export default function LoveHoroscopePage() {
  const user = session.getUser();
  const savedBirthDetails = session.getBirthDetails();
  const [relationshipStatus, setRelationshipStatus] = useState<"single" | "relationship" | "marriage">("single");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LoveHoroscopeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!savedBirthDetails) {
      setError("Please generate your Kundli first to get love horoscope");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiPost<{ ok: boolean; data?: LoveHoroscopeResult; error?: string }>("/api/reports/love", {
        dob: savedBirthDetails.dob,
        tob: savedBirthDetails.tob,
        place: savedBirthDetails.place,
        relationshipStatus,
        latitude: savedBirthDetails.latitude,
        longitude: savedBirthDetails.longitude,
      });

      if (!res.ok) throw new Error(res.error || "Failed to generate love horoscope");
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 text-white p-8 lg:p-12 shadow-xl">
        <HeaderPattern />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">💖</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">Love Horoscope</h1>
              <p className="text-lg text-white/90">Love and relationship predictions based on your birth chart</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader 
          eyebrow="📖 About Love Horoscope" 
          title="What is Love Horoscope?" 
        />
        <CardContent>
          <p className="text-sm text-slate-700 leading-relaxed mb-4">
            Love Horoscope analyzes the planetary positions in your birth chart related to love, relationships, and marriage. 
            This report provides insights into your romantic life, compatibility with partners, favorable periods for relationships, 
            and guidance for a harmonious love life.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-200">
              <div className="font-semibold text-slate-900 mb-2">💑 Relationship Status</div>
              <p className="text-xs text-slate-700">Personalized predictions based on your current relationship status</p>
            </div>
            <div className="p-4 rounded-xl bg-pink-50 border-2 border-pink-200">
              <div className="font-semibold text-slate-900 mb-2">✨ Compatibility</div>
              <p className="text-xs text-slate-700">Best and challenging zodiac matches for you</p>
            </div>
            <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
              <div className="font-semibold text-slate-900 mb-2">📅 Timing</div>
              <p className="text-xs text-slate-700">Favorable periods for love and relationships</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relationship Status Selection */}
      {!result && (
        <Card>
          <CardHeader 
            eyebrow="💑 Your Status" 
            title="Select Your Relationship Status"
          />
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              {(["single", "relationship", "marriage"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setRelationshipStatus(status)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    relationshipStatus === status
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white border-rose-500"
                      : "bg-white border-slate-300 text-slate-700 hover:border-rose-300"
                  }`}
                >
                  <div className="text-3xl mb-2">
                    {status === "single" ? "💚" : status === "relationship" ? "💑" : "💍"}
                  </div>
                  <div className="font-bold text-lg mb-1 capitalize">{status}</div>
                  <div className="text-xs opacity-80">
                    {status === "single" && "Looking for love"}
                    {status === "relationship" && "In a relationship"}
                    {status === "marriage" && "Married"}
                  </div>
                </button>
              ))}
            </div>

            {savedBirthDetails ? (
              <div className="space-y-4">
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                >
                  {loading ? "Generating Love Horoscope..." : "💖 Generate Love Horoscope"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 text-center">
                  Please generate your Kundli first to get personalized love horoscope.
                </p>
                <Link href="/kundli" className="block">
                  <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white">
                    🔮 Generate Kundli First
                  </Button>
                </Link>
              </div>
            )}
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-sm">
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
              eyebrow="💖 Overview" 
              title="Love & Relationship Summary"
            />
            <CardContent>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">{result.overview}</p>
              <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-200">
                <div className="text-sm font-semibold text-slate-900 mb-2">Current Status:</div>
                <p className="text-sm text-slate-700">{result.currentStatus}</p>
              </div>
            </CardContent>
          </Card>

          {/* Predictions */}
          <Card>
            <CardHeader 
              eyebrow="🔮 Predictions" 
              title="Relationship Predictions"
            />
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200">
                  <div className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    💚 Single Life
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.predictions.single}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-red-50 border-2 border-pink-200">
                  <div className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    💑 Relationship
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.predictions.relationship}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200">
                  <div className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    💍 Marriage
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.predictions.marriage}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compatibility */}
          <Card>
            <CardHeader 
              eyebrow="✨ Compatibility" 
              title="Zodiac Compatibility"
            />
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                  <div className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    ✅ Best Matches
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.compatibility.bestMatches.map((match, idx) => (
                      <Badge key={idx} className="bg-green-500 text-white">{match}</Badge>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200">
                  <div className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    ⚠️ Challenging Matches
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.compatibility.challengingMatches.map((match, idx) => (
                      <Badge key={idx} className="bg-orange-500 text-white">{match}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timing */}
          <Card>
            <CardHeader 
              eyebrow="📅 Timing" 
              title="Favorable Periods & Important Dates"
            />
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900 mb-3">Favorable Periods:</div>
                  <div className="space-y-2">
                    {result.timing.favorablePeriods.map((period, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-rose-50 border-2 border-rose-200">
                        <div className="font-bold text-slate-900 text-sm">{period.period}</div>
                        <div className="text-xs text-slate-600 mt-1">{period.event}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 mb-3">Important Dates:</div>
                  <div className="space-y-2">
                    {result.timing.importantDates.map((date, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-pink-50 border-2 border-pink-200">
                        <div className="text-sm text-slate-700">📅 {date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advice */}
          {result.advice.length > 0 && (
            <Card>
              <CardHeader 
                eyebrow="💡 Advice" 
                title="Relationship Guidance"
              />
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {result.advice.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-rose-50 border-2 border-rose-200 flex items-start gap-3">
                      <span className="text-xl">💖</span>
                      <p className="text-sm text-slate-700 flex-1">{item}</p>
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
                title="Love & Relationship Remedies"
              />
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {result.remedies.map((remedy, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-pink-50 border-2 border-pink-200 flex items-start gap-3">
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
            <Link href="/match">
              <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white">
                💑 Check Compatibility
              </Button>
            </Link>
            <Button
              onClick={() => setResult(null)}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
            >
              🔄 Generate Again
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

