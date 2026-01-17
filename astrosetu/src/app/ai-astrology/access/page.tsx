/**
 * Private Beta Access Page
 * Users must enter birth details to verify against allowlist
 * On match, sets HttpOnly cookie and redirects to /ai-astrology or returnTo
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AutocompleteInput, type PlaceSuggestion } from "@/components/ui/AutocompleteInput";
import { resolvePlaceCoordinates } from "@/lib/indianCities";
import { apiPost } from "@/lib/http";
import { isSafeReturnTo } from "@/lib/ai-astrology/returnToValidation";

function AccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnTo = searchParams.get("returnTo");

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "">("");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsInitialized(true);
    }
  }, []);

  const handlePlaceChange = (newPlace: string) => {
    setPlace(newPlace);
  };

  const handlePlaceSelect = (placeSuggestion: PlaceSuggestion) => {
    if (placeSuggestion.latitude && placeSuggestion.longitude) {
      setLatitude(placeSuggestion.latitude);
      setLongitude(placeSuggestion.longitude);
    } else {
      try {
        const coords = resolvePlaceCoordinates(placeSuggestion.displayName || placeSuggestion.name);
        if (coords) {
          setLatitude(coords.latitude);
          setLongitude(coords.longitude);
        }
      } catch (e) {
        console.log("Could not resolve coordinates:", e);
      }
    }
  };

  const canSubmit =
    name.trim().length >= 2 &&
    dob.trim().length >= 3 &&
    time.trim().length >= 3 &&
    place.trim().length >= 2 &&
    gender !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setError(null);
    setLoading(true);

    try {
      // Resolve coordinates if not already set
      let lat = latitude;
      let lon = longitude;

      if (!lat || !lon) {
        const coords = resolvePlaceCoordinates(place);
        if (coords) {
          lat = coords.latitude;
          lon = coords.longitude;
        }
      }

      // Call verification API
      const response = await apiPost<{
        ok: boolean;
        accessGranted?: boolean;
        error?: string;
        message?: string;
      }>("/api/beta-access/verify", {
        name,
        dob,
        time,
        place,
        gender,
      });

      if (response.ok && response.accessGranted) {
        // Access granted: cookie is set by server (HttpOnly)
        // Redirect to returnTo or /ai-astrology
        const redirectUrl = returnTo && isSafeReturnTo(returnTo) 
          ? returnTo 
          : "/ai-astrology";
        
        window.location.assign(redirectUrl);
        return;
      } else {
        // Access denied: show generic error (no hints)
        setError("Access not granted. Please check your details and try again.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("[Beta Access] Verification error:", err);
      setError("Verification failed. Please try again.");
      setLoading(false);
    }
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Card className="cosmic-card border-2 border-amber-300 shadow-xl">
          <CardHeader
            icon="🔒"
            title="Private Beta Access"
            subtitle="Enter your birth details to verify access"
          />
          <CardContent className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                  className="w-full"
                />
              </div>

              {/* DOB */}
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-slate-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <Input
                  id="dob"
                  name="dob"
                  type="text"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  placeholder="e.g., 26 Nov 1984 or 1984-11-26"
                  required
                  disabled={loading}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Format: DD Mon YYYY (e.g., 26 Nov 1984) or YYYY-MM-DD (e.g., 1984-11-26)
                </p>
              </div>

              {/* Time */}
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-slate-700 mb-2">
                  Time of Birth <span className="text-red-500">*</span>
                </label>
                <Input
                  id="time"
                  name="time"
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g., 09:40 pm or 21:40"
                  required
                  disabled={loading}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Format: HH:MM AM/PM (e.g., 09:40 pm) or 24-hour (e.g., 21:40)
                </p>
              </div>

              {/* Place */}
              <div>
                <label htmlFor="place" className="block text-sm font-medium text-slate-700 mb-2">
                  Place of Birth <span className="text-red-500">*</span>
                </label>
                <AutocompleteInput
                  value={place}
                  onChange={handlePlaceChange}
                  onSelect={handlePlaceSelect}
                  placeholder="Enter city, state, country"
                  disabled={loading}
                />
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as "Male" | "Female")}
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-3 text-base min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">🌙</span>
                      Verifying...
                    </span>
                  ) : (
                    "Verify Access"
                  )}
                </Button>
              </div>
            </form>

            {/* Info Note */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                🔒 Your birth details are used only for access verification and are not stored.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" />}>
      <AccessContent />
    </Suspense>
  );
}

