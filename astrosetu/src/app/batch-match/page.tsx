"use client";

import { useMemo, useState } from "react";
import type { BatchMatchResponse, BirthDetails } from "@/types/astrology";
import { apiPost } from "@/lib/http";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";

interface ProfileInput {
  id: string;
  name: string;
  dob: string;
  tob: string;
  place: string;
}

export default function BatchMatchPage() {
  // Primary profile
  const [primaryName, setPrimaryName] = useState("");
  const [primaryDob, setPrimaryDob] = useState("1990-01-01");
  const [primaryTob, setPrimaryTob] = useState("10:30");
  const [primaryPlace, setPrimaryPlace] = useState("Delhi");

  // Batch profiles
  const [profiles, setProfiles] = useState<ProfileInput[]>([
    { id: "1", name: "", dob: "", tob: "", place: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<BatchMatchResponse | null>(null);

  const canSubmit = useMemo(() => {
    const primaryValid = primaryDob.length === 10 && primaryTob.length >= 5 && primaryPlace.trim().length >= 2;
    const profilesValid = profiles.some(p => p.dob.length === 10 && p.tob.length >= 5 && p.place.trim().length >= 2);
    return primaryValid && profilesValid && profiles.length <= 500;
  }, [primaryDob, primaryTob, primaryPlace, profiles]);

  function addProfile() {
    if (profiles.length >= 500) {
      alert("Maximum 500 profiles allowed");
      return;
    }
    setProfiles([...profiles, { id: String(profiles.length + 1), name: "", dob: "", tob: "", place: "" }]);
  }

  function removeProfile(index: number) {
    setProfiles(profiles.filter((_, i) => i !== index));
  }

  function updateProfile(index: number, field: keyof ProfileInput, value: string) {
    const updated = [...profiles];
    updated[index] = { ...updated[index], [field]: value };
    setProfiles(updated);
  }

  async function onSubmit(e?: React.MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    e?.stopPropagation();
    setErr(null);
    setLoading(true);
    try {
      const primaryProfile: BirthDetails = {
        dob: primaryDob,
        tob: primaryTob,
        place: primaryPlace,
        name: primaryName || undefined,
        latitude: 28.6139, // Default - should be geocoded
        longitude: 77.2090,
      };

      // Filter out empty profiles
      const validProfiles = profiles.filter(
        p => p.dob.length === 10 && p.tob.length >= 5 && p.place.trim().length >= 2
      );

      if (validProfiles.length === 0) {
        throw new Error("Please add at least one profile to match");
      }

      const profilesData = validProfiles.map((p, idx) => ({
        id: p.id || String(idx + 1),
        name: p.name || `Profile ${idx + 1}`,
        birthDetails: {
          dob: p.dob,
          tob: p.tob,
          place: p.place,
          name: p.name || undefined,
          latitude: 28.6139, // Default - should be geocoded
          longitude: 77.2090,
        } as BirthDetails,
      }));

      const res = await apiPost<{ ok: boolean; data?: BatchMatchResponse; error?: string }>(
        "/api/astrology/batch-match",
        {
          primaryProfile,
          profiles: profilesData,
          maxResults: 500,
        }
      );
      if (!res.ok) throw new Error(res.error || "Failed");
      setData(res.data ?? null);
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const getVerdictBadgeTone = (verdict: string) => {
    switch (verdict) {
      case "Excellent":
        return "green";
      case "Good":
        return "indigo";
      case "Average":
        return "amber";
      case "Challenging":
        return "red";
      default:
        return "neutral";
    }
  };

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 text-4xl">👥</div>
          <div className="absolute top-4 right-4 text-4xl">💑</div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Batch Kundli Matching</h1>
          <p className="text-white/90 text-base">
            Match one profile against up to 500 profiles for marriage compatibility
          </p>
        </div>
      </div>

      <Card>
        <CardHeader
          eyebrow="Primary Profile"
          title="Your Profile"
          subtitle="Enter your birth details (this profile will be matched against others)"
          icon="👤"
        />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Name (Optional)</div>
              <Input
                value={primaryName}
                onChange={(e) => setPrimaryName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Date of Birth</div>
              <Input
                type="date"
                value={primaryDob}
                onChange={(e) => setPrimaryDob(e.target.value)}
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Time of Birth</div>
              <Input
                type="time"
                value={primaryTob}
                onChange={(e) => setPrimaryTob(e.target.value)}
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Place of Birth</div>
              <AutocompleteInput
                value={primaryPlace}
                onChange={setPrimaryPlace}
                placeholder="Start typing city name..."
                prioritizeIndia={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          eyebrow="Match Profiles"
          title={`Profiles to Match (${profiles.length}/500)`}
          subtitle="Add profiles to match against your primary profile"
          icon="👥"
        />
        <CardContent>
          <div className="space-y-4">
            {profiles.map((profile, index) => (
              <div key={index} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-semibold text-slate-900">Profile {index + 1}</div>
                  {profiles.length > 1 && (
                    <Button
                      variant="secondary"
                      onClick={() => removeProfile(index)}
                      className="text-xs"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-600 mb-2">Name (Optional)</div>
                    <Input
                      value={profile.name}
                      onChange={(e) => updateProfile(index, "name", e.target.value)}
                      placeholder={`Profile ${index + 1} name`}
                    />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-600 mb-2">Date of Birth</div>
                    <Input
                      type="date"
                      value={profile.dob}
                      onChange={(e) => updateProfile(index, "dob", e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-600 mb-2">Time of Birth</div>
                    <Input
                      type="time"
                      value={profile.tob}
                      onChange={(e) => updateProfile(index, "tob", e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-600 mb-2">Place of Birth</div>
                    <AutocompleteInput
                      value={profile.place}
                      onChange={(value) => updateProfile(index, "place", value)}
                      placeholder="Start typing city name..."
                      prioritizeIndia={true}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={addProfile}
              disabled={profiles.length >= 500}
            >
              + Add Profile
            </Button>
            <span className="text-xs text-slate-600">
              {profiles.length} / 500 profiles
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button onClick={onSubmit} disabled={!canSubmit || loading}>
              {loading ? `Matching ${profiles.length} profiles...` : "Start Batch Match"}
            </Button>
            {err ? <span className="text-sm text-rose-700">{err}</span> : null}
          </div>
        </CardContent>
      </Card>

      {data ? (
        <div className="grid gap-5">
          {/* Summary */}
          <Card>
            <CardHeader eyebrow="Results Summary" title="Batch Match Results" icon="📊" />
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{data.summary.excellent}</div>
                  <div className="text-sm text-green-700">Excellent</div>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                  <div className="text-2xl font-bold text-indigo-700">{data.summary.good}</div>
                  <div className="text-sm text-indigo-700">Good</div>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="text-2xl font-bold text-amber-700">{data.summary.average}</div>
                  <div className="text-sm text-amber-700">Average</div>
                </div>
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <div className="text-2xl font-bold text-red-700">{data.summary.challenging}</div>
                  <div className="text-sm text-red-700">Challenging</div>
                </div>
              </div>
              <div className="text-sm text-slate-600">
                Total profiles processed: {data.totalProcessed}
              </div>
            </CardContent>
          </Card>

          {/* Best Matches */}
          {data.bestMatches.length > 0 && (
            <Card>
              <CardHeader eyebrow="Top Matches" title="Best Compatibility Scores" icon="⭐" />
              <CardContent>
                <div className="space-y-3">
                  {data.bestMatches.map((match, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-bold text-slate-900">{match.name}</div>
                          <div className="text-sm text-slate-600">Score: {match.matchScore}/36</div>
                        </div>
                        <Badge tone={getVerdictBadgeTone(match.verdict)}>{match.verdict}</Badge>
                      </div>
                      <div className="text-sm text-slate-700 mb-2">{match.summary}</div>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge tone={match.manglik.compatible ? "green" : "amber"}>
                          Manglik: {match.manglik.status} {match.manglik.compatible ? "✓" : "⚠"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Results */}
          <Card>
            <CardHeader eyebrow="All Results" title="Complete Match List" icon="📋" />
            <CardContent>
              <div className="space-y-2">
                {data.results.slice(0, 50).map((match, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{match.name}</div>
                      <div className="text-xs text-slate-600">{match.summary}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold text-slate-900">{match.matchScore}/36</div>
                      <Badge tone={getVerdictBadgeTone(match.verdict)} className="text-xs">
                        {match.verdict}
                      </Badge>
                    </div>
                  </div>
                ))}
                {data.results.length > 50 && (
                  <div className="text-center text-sm text-slate-600 pt-2">
                    Showing top 50 of {data.results.length} results
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

