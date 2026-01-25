"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { apiPost } from "@/lib/http";
import type { KundliResult, MatchResult } from "@/types/astrology";

export default function TestComparisonPage() {
  const [testData, setTestData] = useState({
    name: "Amit Kumar Mandal",
    day: "26",
    month: "11",
    year: "1984",
    hours: "21",
    minutes: "40",
    seconds: "00",
    place: "Noamundi, Jharkhand, India",
  });

  const [astrosageResults, setAstrosageResults] = useState({
    ascendant: "",
    rashi: "",
    nakshatra: "",
    notes: "",
  });

  const [astrosetuResults, setAstrosetuResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateKundli() {
    setLoading(true);
    setError("");
    try {
      const res = await apiPost<{ ok: boolean; data?: KundliResult; error?: string }>("/api/astrology/kundli", {
        name: testData.name,
        gender: "Male",
        day: parseInt(testData.day),
        month: parseInt(testData.month),
        year: parseInt(testData.year),
        hours: parseInt(testData.hours),
        minutes: parseInt(testData.minutes),
        seconds: parseInt(testData.seconds),
        place: testData.place,
      });

      if (!res.ok) throw new Error(res.error || "Failed");
      setAstrosetuResults(res.data);
    } catch (e: any) {
      setError(e.message || "Failed to generate Kundli");
    } finally {
      setLoading(false);
    }
  }

  const matches = {
    ascendant: astrosageResults.ascendant && astrosetuResults?.ascendant
      ? astrosageResults.ascendant.toLowerCase() === astrosetuResults.ascendant.toLowerCase()
      : null,
    rashi: astrosageResults.rashi && astrosetuResults?.rashi
      ? astrosageResults.rashi.toLowerCase() === astrosetuResults.rashi.toLowerCase()
      : null,
    nakshatra: astrosageResults.nakshatra && astrosetuResults?.nakshatra
      ? astrosageResults.nakshatra.toLowerCase() === astrosetuResults.nakshatra.toLowerCase()
      : null,
  };

  return (
    <div className="grid gap-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader 
          title="🔍 AstroSage Comparison Testing" 
          subtitle="Compare AstroSetu calculations with AstroSage.com results"
        />
        <CardContent className="space-y-6">
          {/* Test Data Input */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Name</label>
              <Input
                value={testData.name}
                onChange={(e) => setTestData({ ...testData, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Place</label>
              <Input
                value={testData.place}
                onChange={(e) => setTestData({ ...testData, place: e.target.value })}
                placeholder="Enter place"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Day</label>
              <Input
                type="number"
                value={testData.day}
                onChange={(e) => setTestData({ ...testData, day: e.target.value })}
                placeholder="DD"
                min="1"
                max="31"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Month</label>
              <Input
                type="number"
                value={testData.month}
                onChange={(e) => setTestData({ ...testData, month: e.target.value })}
                placeholder="MM"
                min="1"
                max="12"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Year</label>
              <Input
                type="number"
                value={testData.year}
                onChange={(e) => setTestData({ ...testData, year: e.target.value })}
                placeholder="YYYY"
                min="1900"
                max="2100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Time (HH:MM:SS)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={testData.hours}
                  onChange={(e) => setTestData({ ...testData, hours: e.target.value })}
                  placeholder="HH"
                  min="0"
                  max="23"
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={testData.minutes}
                  onChange={(e) => setTestData({ ...testData, minutes: e.target.value })}
                  placeholder="MM"
                  min="0"
                  max="59"
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={testData.seconds}
                  onChange={(e) => setTestData({ ...testData, seconds: e.target.value })}
                  placeholder="SS"
                  min="0"
                  max="59"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <Button onClick={generateKundli} disabled={loading} className="w-full">
            {loading ? "Generating..." : "Generate Kundli (AstroSetu)"}
          </Button>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Results */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* AstroSage Results */}
        <Card>
          <CardHeader title="🌐 AstroSage.com Results" subtitle="Enter results from AstroSage.com" />
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Ascendant (Lagna)</label>
              <Input
                value={astrosageResults.ascendant}
                onChange={(e) => setAstrosageResults({ ...astrosageResults, ascendant: e.target.value })}
                placeholder="e.g., Scorpio"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Moon Sign (Rashi)</label>
              <Input
                value={astrosageResults.rashi}
                onChange={(e) => setAstrosageResults({ ...astrosageResults, rashi: e.target.value })}
                placeholder="e.g., Leo"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Nakshatra</label>
              <Input
                value={astrosageResults.nakshatra}
                onChange={(e) => setAstrosageResults({ ...astrosageResults, nakshatra: e.target.value })}
                placeholder="e.g., Magha"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Notes</label>
              <textarea
                value={astrosageResults.notes}
                onChange={(e) => setAstrosageResults({ ...astrosageResults, notes: e.target.value })}
                placeholder="Additional observations..."
                className="w-full rounded-xl border-2 border-slate-400 bg-white text-slate-900 px-4 py-3 text-sm outline-none transition-all focus:border-saffron-500 focus:ring-2 focus:ring-saffron-200"
                rows={4}
              />
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border-2 border-blue-200">
              <div className="text-xs font-semibold text-blue-700 mb-2">📝 Instructions:</div>
              <div className="text-xs text-blue-800">
                1. Go to <a href="https://www.astrosage.com/" target="_blank" rel="noopener noreferrer" className="underline">AstroSage.com</a>
                <br />
                2. Enter the same test data
                <br />
                3. Generate Kundli
                <br />
                4. Copy results here
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AstroSetu Results */}
        <Card>
          <CardHeader title="🔮 AstroSetu Results" subtitle="Generated by AstroSetu" />
          <CardContent className="space-y-4">
            {astrosetuResults ? (
              <>
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Ascendant (Lagna)</div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-slate-900">{astrosetuResults.ascendant || "N/A"}</div>
                    {matches.ascendant !== null && (
                      <Badge tone={matches.ascendant ? "green" : "red"}>
                        {matches.ascendant ? "✅ Match" : "❌ Mismatch"}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Moon Sign (Rashi)</div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-slate-900">{astrosetuResults.rashi || "N/A"}</div>
                    {matches.rashi !== null && (
                      <Badge tone={matches.rashi ? "green" : "red"}>
                        {matches.rashi ? "✅ Match" : "❌ Mismatch"}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Nakshatra</div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-slate-900">{astrosetuResults.nakshatra || "N/A"}</div>
                    {matches.nakshatra !== null && (
                      <Badge tone={matches.nakshatra ? "green" : "red"}>
                        {matches.nakshatra ? "✅ Match" : "❌ Mismatch"}
                      </Badge>
                    )}
                  </div>
                </div>
                {astrosetuResults.planets && (
                  <div>
                    <div className="text-xs font-semibold text-slate-600 mb-2">Planetary Positions</div>
                    <div className="space-y-1 text-sm">
                      {astrosetuResults.planets.slice(0, 5).map((planet: any, i: number) => (
                        <div key={i} className="flex justify-between">
                          <span className="font-semibold">{planet.name}:</span>
                          <span>{planet.sign} ({planet.degree.toFixed(2)}°)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-slate-500">
                Click &quot;Generate Kundli&quot; to see results
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparison Summary */}
      {(matches.ascendant !== null || matches.rashi !== null || matches.nakshatra !== null) && (
        <Card>
          <CardHeader title="📊 Comparison Summary" />
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border-2 ${matches.ascendant ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
                <div className="text-xs font-semibold mb-1">Ascendant</div>
                <div className={`text-lg font-bold ${matches.ascendant ? "text-emerald-700" : "text-rose-700"}`}>
                  {matches.ascendant ? "✅ Match" : "❌ Mismatch"}
                </div>
              </div>
              <div className={`p-4 rounded-xl border-2 ${matches.rashi ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
                <div className="text-xs font-semibold mb-1">Rashi</div>
                <div className={`text-lg font-bold ${matches.rashi ? "text-emerald-700" : "text-rose-700"}`}>
                  {matches.rashi ? "✅ Match" : "❌ Mismatch"}
                </div>
              </div>
              <div className={`p-4 rounded-xl border-2 ${matches.nakshatra ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
                <div className="text-xs font-semibold mb-1">Nakshatra</div>
                <div className={`text-lg font-bold ${matches.nakshatra ? "text-emerald-700" : "text-rose-700"}`}>
                  {matches.nakshatra ? "✅ Match" : "❌ Mismatch"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

