/**
 * AI Astrology Input Form Page
 * Collects birth details for AI report generation
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AutocompleteInput, type PlaceSuggestion } from "@/components/ui/AutocompleteInput";
import { resolvePlaceCoordinates } from "@/lib/indianCities";

import type { ReportType } from "@/lib/ai-astrology/types";

function InputFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Support both "report" and "reportType" query parameters for compatibility
  const reportTypeParam = searchParams.get("reportType") || searchParams.get("report");
  const validReportTypes: ReportType[] = ["life-summary", "marriage-timing", "career-money", "full-life", "year-analysis"];
  const reportType = (reportTypeParam && validReportTypes.includes(reportTypeParam as ReportType)) 
    ? (reportTypeParam as ReportType) 
    : null;
  
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
  const [place, setPlace] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "">("");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved form data from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      const savedFormData = localStorage.getItem("aiAstrologyFormData");
      if (savedFormData) {
        const formData = JSON.parse(savedFormData);
        if (formData.name) setName(formData.name);
        if (formData.dob) setDob(formData.dob);
        if (formData.tob) setTob(formData.tob);
        if (formData.place) setPlace(formData.place);
        if (formData.gender) setGender(formData.gender);
        if (formData.latitude !== undefined) setLatitude(formData.latitude);
        if (formData.longitude !== undefined) setLongitude(formData.longitude);
      }
    } catch (e) {
      console.error("Failed to load saved form data:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save form data to localStorage whenever fields change
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    
    try {
      const formData = {
        name,
        dob,
        tob,
        place,
        gender,
        latitude,
        longitude,
      };
      localStorage.setItem("aiAstrologyFormData", JSON.stringify(formData));
    } catch (e) {
      console.error("Failed to save form data:", e);
    }
  }, [name, dob, tob, place, gender, latitude, longitude, isInitialized]);

  const handlePlaceChange = (newPlace: string) => {
    setPlace(newPlace);
  };

  const handlePlaceSelect = (placeSuggestion: PlaceSuggestion) => {
    // When user selects from autocomplete, use the coordinates from the suggestion
    if (placeSuggestion.latitude && placeSuggestion.longitude) {
      setLatitude(placeSuggestion.latitude);
      setLongitude(placeSuggestion.longitude);
    } else {
      // Fallback: try to resolve coordinates from the place name
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

  const canSubmit = name.trim().length >= 2 && 
                   dob.length === 10 && 
                   tob.length >= 5 && 
                   place.trim().length >= 2 &&
                   latitude !== undefined && 
                   longitude !== undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      // Resolve coordinates if not already set
      let lat = latitude;
      let lon = longitude;
      
      if (!lat || !lon) {
        // Try to resolve coordinates from place name
        const coords = resolvePlaceCoordinates(place);
        if (coords) {
          lat = coords.latitude;
          lon = coords.longitude;
          // Update state so UI shows coordinates are resolved
          setLatitude(lat);
          setLongitude(lon);
        } else {
          throw new Error("Please select a place from the dropdown, or enter a valid city name (e.g., 'Noamundi', 'Delhi', 'Mumbai')");
        }
      }

      const inputData = {
        name: name.trim(),
        dob,
        tob: tob.length === 5 ? `${tob}:00` : tob,
        place: place.trim(),
        gender: gender || undefined,
        latitude: lat,
        longitude: lon,
        timezone: "Asia/Kolkata",
      };

      // Store in sessionStorage for next page (if available)
      try {
        sessionStorage.setItem("aiAstrologyInput", JSON.stringify(inputData));
        sessionStorage.setItem("aiAstrologyReportType", reportType || "life-summary");
      } catch (storageError) {
        // Handle sessionStorage errors (e.g., private browsing mode)
        console.error("sessionStorage not available:", storageError);
        // Continue anyway - preview page will handle missing data
      }

      // Redirect to preview page
      router.push("/ai-astrology/preview");
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const getReportTitle = () => {
    switch (reportType) {
      case "marriage-timing":
        return "Marriage Timing Report";
      case "career-money":
        return "Career & Money Report";
      case "full-life":
        return "Full Life Report";
      default:
        return "Free Life Summary";
    }
  };

  const getReportDescription = () => {
    switch (reportType) {
      case "marriage-timing":
        return "Get detailed insights about your ideal marriage timing, compatibility, and remedies.";
      case "career-money":
        return "Discover your best career direction, job change timing, and financial phases.";
      case "full-life":
        return "Comprehensive analysis covering all aspects of your life and future.";
      default:
        return "Get a free preview of your personality, strengths, and life themes. No payment required.";
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 py-8 min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl overflow-visible">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/ai-astrology" className="text-sm text-purple-600 hover:text-purple-700 mb-4 inline-block">
            ← Back to AI Astrology
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
            {getReportTitle()}
          </h1>
          <p className="text-slate-600">{getReportDescription()}</p>
        </div>

        {/* Form Card */}
        <Card className="border-2 border-purple-200 bg-white shadow-lg">
          <CardHeader 
            icon="🔮"
            title="Enter Your Birth Details"
            subtitle="We need accurate information for precise astrological calculations"
          />
          <CardContent className="overflow-visible">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full cosmic-input"
                />
              </div>

              {/* Date of Birth */}
              <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full cosmic-input"
                />
              </div>

              {/* Time of Birth */}
              <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Time of Birth <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  value={tob}
                  onChange={(e) => setTob(e.target.value)}
                  required
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1">Use 24-hour format (e.g., 14:30 for 2:30 PM)</p>
              </div>

              {/* Place of Birth */}
              <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Place of Birth <span className="text-red-500">*</span>
                </label>
                <AutocompleteInput
                  value={place}
                  onChange={handlePlaceChange}
                  onSelect={handlePlaceSelect}
                  placeholder="Enter city name (e.g., Delhi, Mumbai, New York)"
                  prioritizeIndia={true}
                />
                {latitude !== undefined && longitude !== undefined ? (
                  <p className="text-xs text-emerald-600 mt-1">
                    ✓ Coordinates resolved: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">Select a city from the dropdown for accurate coordinates</p>
                )}
              </div>

              {/* Gender (Optional) */}
              <div className="relative z-10">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Gender <span className="text-slate-400 text-xs">(Optional)</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as "Male" | "Female" | "")}
                  className="w-full rounded-xl border border-slate-300 bg-white text-slate-900 px-4 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none appearance-none cursor-pointer pr-10 min-w-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23334155'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.25em 1.25em',
                  }}
                >
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
                  <div className="flex items-center gap-2 text-red-700 font-semibold">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-6 text-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">🌙</span>
                      Processing...
                    </span>
                  ) : reportType ? (
                    `Generate ${getReportTitle()}`
                  ) : (
                    "Get Free Life Summary"
                  )}
                </Button>
              </div>

              {/* Privacy Note */}
              <div className="text-center pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  🔒 Your data is kept private and secure. We don&apos;t share your information with anyone.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-amber-50 border-amber-200">
          <CardContent className="p-6">
            <h3 className="font-bold mb-3 text-amber-900">Why We Need This Information</h3>
            <ul className="space-y-2 text-sm text-amber-800">
              <li>• <strong>Date & Time:</strong> Essential for calculating your exact birth chart and planetary positions</li>
              <li>• <strong>Place:</strong> Required for accurate timezone and geographic coordinates</li>
              <li>• <strong>Name:</strong> Used to personalize your report</li>
              <li>• <strong>Gender:</strong> Optional, but helps provide more relevant guidance</li>
            </ul>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="mt-6 cosmic-card border-amber-200 bg-amber-50/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 mb-3">⚠️ Important Disclaimer</h3>
              <div className="text-sm text-slate-700 space-y-2">
                <p>
                  <strong>Educational Guidance Only:</strong> Reports are generated by AI for educational and entertainment purposes only. 
                  They provide astrological insights, not absolute predictions or certainties.
                </p>
                <p>
                  <strong>Not Professional Advice:</strong> Do not use reports as a substitute for professional medical, legal, 
                  financial, or psychological advice.
                </p>
                <p>
                  <strong>Fully Automated:</strong> This platform is 100% automated. No human support available. 
                  For questions, see our <Link href="/ai-astrology/faq" className="text-amber-700 hover:text-amber-800 underline font-semibold">FAQ page</Link>.
                </p>
                <p>
                  <strong>Refund Policy:</strong> No change-of-mind refunds on digital reports. This does not limit your rights under Australian Consumer Law.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function InputPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🌙</div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <InputFormContent />
    </Suspense>
  );
}

