"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { apiPost } from "@/lib/http";
import { session } from "@/lib/session";

type BabyNameResult = {
  suggestedNames: Array<{
    name: string;
    meaning: string;
    numerology: number;
    rashi: string;
    nakshatra: string;
    deity: string;
    gender: "Male" | "Female" | "Unisex";
  }>;
  analysis: string;
};

export default function BabyNamePage() {
  const router = useRouter();
  const user = session.getUser();
  const [gender, setGender] = useState<"Male" | "Female" | "Unisex">("Unisex");
  const [rashi, setRashi] = useState("");
  const [nakshatra, setNakshatra] = useState("");
  const [startingLetter, setStartingLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BabyNameResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!rashi && !nakshatra) {
      setError("Please select Rashi or Nakshatra");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiPost<{ ok: boolean; data?: BabyNameResult; error?: string }>("/api/reports/babyname", {
        gender,
        rashi: rashi || undefined,
        nakshatra: nakshatra || undefined,
        startingLetter: startingLetter || undefined,
      });

      if (!res.ok) throw new Error(res.error || "Failed to generate names");
      setResult(res.data || null);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const RASHIS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const NAKSHATRAS = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];

  return (
    <div className="grid gap-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 text-white p-8 lg:p-12 shadow-xl">
        <HeaderPattern />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">👶</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">Baby Name Suggestion</h1>
              <p className="text-lg text-white/90">Astrologically suitable names for your child</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <Card>
        <CardHeader 
          eyebrow="📝 Enter Details" 
          title="Generate Baby Names" 
          subtitle="Get personalized name suggestions based on astrology"
        />
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
              <div className="flex gap-2">
                {(["Male", "Female", "Unisex"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                      gender === g
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-500"
                        : "bg-white border-slate-300 text-slate-700 hover:border-pink-300"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Starting Letter (Optional)</label>
              <Input
                value={startingLetter}
                onChange={(e) => setStartingLetter(e.target.value.toUpperCase().slice(0, 1))}
                placeholder="e.g., A, K, S"
                maxLength={1}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Rashi (Moon Sign)</label>
              <select
                value={rashi}
                onChange={(e) => setRashi(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-400 bg-white text-slate-900 px-4 py-3 text-sm outline-none transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
              >
                <option value="">Select Rashi</option>
                {RASHIS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nakshatra (Optional)</label>
              <select
                value={nakshatra}
                onChange={(e) => setNakshatra(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-400 bg-white text-slate-900 px-4 py-3 text-sm outline-none transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
              >
                <option value="">Select Nakshatra</option>
                {NAKSHATRAS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-700">
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading || (!rashi && !nakshatra)}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
          >
            {loading ? "Generating Names..." : "✨ Generate Baby Names"}
          </Button>

          <div className="text-xs text-slate-500 text-center">
            💡 Tip: You can select either Rashi or Nakshatra. Both will give accurate results.
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader 
            eyebrow="✨ Suggested Names" 
            title={`${result.suggestedNames.length} Names Found`}
          />
          <CardContent>
            {result.analysis && (
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200">
                <p className="text-sm text-slate-700 leading-relaxed">{result.analysis}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.suggestedNames.map((name, idx) => (
                <Card key={idx} className="border-2 border-pink-200 hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{name.name}</h3>
                        <Badge className="text-xs">{name.gender}</Badge>
                      </div>
                      <div className="text-2xl">✨</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold text-slate-700">Meaning:</span>
                        <p className="text-slate-600">{name.meaning}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="font-semibold text-slate-700">Numerology:</span>
                          <span className="ml-2 text-pink-600 font-bold">{name.numerology}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Rashi:</span>
                          <span className="ml-2 text-slate-600">{name.rashi}</span>
                        </div>
                      </div>
                      {name.nakshatra && (
                        <div>
                          <span className="font-semibold text-slate-700">Nakshatra:</span>
                          <span className="ml-2 text-slate-600">{name.nakshatra}</span>
                        </div>
                      )}
                      {name.deity && (
                        <div>
                          <span className="font-semibold text-slate-700">Ruling Deity:</span>
                          <span className="ml-2 text-slate-600">{name.deity}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-slate-50 border-2 border-slate-200">
              <p className="text-xs text-slate-600 text-center">
                💡 These names are suggested based on astrological calculations. Choose a name that resonates with you and your family.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Back to Services */}
      <div className="text-center">
        <Link href="/services">
          <Button variant="ghost" className="text-slate-600">
            ← Back to Services
          </Button>
        </Link>
      </div>
    </div>
  );
}

