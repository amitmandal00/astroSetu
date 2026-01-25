"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { apiPost } from "@/lib/http";
import { session } from "@/lib/session";

type MangalDoshaResult = {
  status: "Manglik" | "Non-Manglik";
  severity: "High" | "Medium" | "Low" | "None";
  analysis: string;
  effects: string[];
  remedies: Array<{
    type: string;
    description: string;
    instructions: string[];
  }>;
  marriageCompatibility: {
    withManglik: string;
    withNonManglik: string;
  };
  importantNotes: string[];
};

export default function MangalDoshaPage() {
  const user = session.getUser();
  const savedBirthDetails = session.getBirthDetails();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MangalDoshaResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!savedBirthDetails) {
      setError("Please generate your Kundli first to check Mangal Dosha");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiPost<{ ok: boolean; data?: MangalDoshaResult; error?: string }>("/api/reports/mangal-dosha", {
        dob: savedBirthDetails.dob,
        tob: savedBirthDetails.tob,
        place: savedBirthDetails.place,
        latitude: savedBirthDetails.latitude,
        longitude: savedBirthDetails.longitude,
      });

      if (!res.ok) throw new Error(res.error || "Failed to analyze Mangal Dosha");
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 text-white p-8 lg:p-12 shadow-xl">
        <HeaderPattern />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">🔥</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">Mangal Dosha Analysis</h1>
              <p className="text-lg text-white/90">Comprehensive Mangal Dosha check and remedies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader 
          eyebrow="📖 About Mangal Dosha" 
          title="What is Mangal Dosha?" 
        />
        <CardContent>
          <p className="text-sm text-slate-700 leading-relaxed mb-4">
            Mangal Dosha (also known as Kuja Dosha or Mars Dosha) occurs when Mars is placed in certain houses (1st, 4th, 7th, 8th, or 12th) 
            in the birth chart. It is believed to affect marriage and marital life. However, Mangal Dosha can be nullified or reduced through 
            various remedies and by marrying another Manglik person.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-orange-50 border-2 border-orange-200">
              <div className="font-semibold text-slate-900 mb-2">🔍 Analysis Includes</div>
              <ul className="text-xs text-slate-700 space-y-1">
                <li>• Mangal Dosha status check</li>
                <li>• Severity assessment</li>
                <li>• Effects on marriage</li>
                <li>• Compatibility analysis</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
              <div className="font-semibold text-slate-900 mb-2">🛡️ Remedies Provided</div>
              <ul className="text-xs text-slate-700 space-y-1">
                <li>• Puja and rituals</li>
                <li>• Gemstone recommendations</li>
                <li>• Mantra chanting</li>
                <li>• Marriage compatibility tips</li>
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
                  We&apos;ll analyze your birth chart to check for Mangal Dosha.
                </p>
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  {loading ? "Analyzing..." : "🔥 Check Mangal Dosha"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 mb-4">
                  Please generate your Kundli first to check Mangal Dosha.
                </p>
                <Link href="/kundli">
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
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
          {/* Status Card */}
          <Card className={result.status === "Manglik" ? "border-2 border-orange-500" : "border-2 border-green-500"}>
            <CardHeader 
              eyebrow={result.status === "Manglik" ? "⚠️ Mangal Dosha Present" : "✅ No Mangal Dosha"} 
              title={`Status: ${result.status}`}
            />
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className={`text-4xl ${result.status === "Manglik" ? "text-orange-500" : "text-green-500"}`}>
                  {result.status === "Manglik" ? "🔥" : "✅"}
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 mb-1">
                    Severity: <Badge className={result.severity === "High" ? "bg-red-500" : result.severity === "Medium" ? "bg-orange-500" : "bg-yellow-500"}>{result.severity}</Badge>
                  </div>
                  <p className="text-sm text-slate-700">{result.analysis}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Effects */}
          {result.effects.length > 0 && (
            <Card>
              <CardHeader 
                eyebrow="📊 Effects" 
                title="Impact of Mangal Dosha"
              />
              <CardContent>
                <div className="space-y-3">
                  {result.effects.map((effect, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-orange-50 border-2 border-orange-200 flex items-start gap-3">
                      <span className="text-xl">•</span>
                      <p className="text-sm text-slate-700 flex-1">{effect}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Marriage Compatibility */}
          <Card>
            <CardHeader 
              eyebrow="💑 Marriage Compatibility" 
              title="Marriage Recommendations"
            />
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
                  <div className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    🔥 With Manglik Partner
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.marriageCompatibility.withManglik}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                  <div className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    ✅ With Non-Manglik Partner
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.marriageCompatibility.withNonManglik}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Remedies */}
          {result.remedies.length > 0 && (
            <Card>
              <CardHeader 
                eyebrow="🛡️ Remedies" 
                title="Recommended Remedies for Mangal Dosha"
              />
              <CardContent>
                <div className="space-y-4">
                  {result.remedies.map((remedy, idx) => (
                    <Card key={idx} className="border-2 border-orange-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-2">
                          <span className="text-2xl">✨</span>
                          <div className="flex-1">
                            <div className="font-bold text-slate-900 mb-1">{remedy.type}</div>
                            <p className="text-sm text-slate-700 mb-2">{remedy.description}</p>
                            {remedy.instructions.length > 0 && (
                              <ul className="text-xs text-slate-600 space-y-1 mt-2">
                                {remedy.instructions.map((instruction, i) => (
                                  <li key={i}>• {instruction}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Important Notes */}
          {result.importantNotes.length > 0 && (
            <Card>
              <CardHeader 
                eyebrow="ℹ️ Important Notes" 
                title="Additional Information"
              />
              <CardContent>
                <div className="space-y-2">
                  {result.importantNotes.map((note, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border-2 border-slate-200 flex items-start gap-3">
                      <span className="text-lg">💡</span>
                      <p className="text-sm text-slate-700 flex-1">{note}</p>
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
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                💑 Check Compatibility
              </Button>
            </Link>
            <Button
              onClick={() => setResult(null)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              🔄 Analyze Again
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

