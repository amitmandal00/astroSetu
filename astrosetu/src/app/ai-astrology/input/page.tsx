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
import { apiPost } from "@/lib/http";
import { isSafeReturnTo } from "@/lib/ai-astrology/returnToValidation";

import type { ReportType } from "@/lib/ai-astrology/types";

function InputFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Support both "report" and "reportType" query parameters for compatibility
  const reportTypeParam = searchParams.get("reportType") || searchParams.get("report");
  const bundleParam = searchParams.get("bundle"); // "any-2" or "all-3"
  const reportsParam = searchParams.get("reports"); // Comma-separated report types for bundles
  const validReportTypes: ReportType[] = ["life-summary", "marriage-timing", "career-money", "full-life", "year-analysis", "major-life-phase", "decision-support"];
  const reportType = (reportTypeParam && validReportTypes.includes(reportTypeParam as ReportType)) 
    ? (reportTypeParam as ReportType) 
    : null;
  
  // Parse bundle reports if bundle is specified
  const bundleReports: ReportType[] = reportsParam 
    ? reportsParam.split(",").filter(r => validReportTypes.includes(r as ReportType)) as ReportType[]
    : [];

  // Optional: allow other journeys (e.g. subscription onboarding) to collect birth details and return.
  const flow = searchParams.get("flow"); // e.g. "subscription"
  const returnTo = searchParams.get("returnTo"); // absolute path within site (recommended)
  
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

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

      // Show confirmation modal instead of navigating immediately
      setShowConfirmation(true);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please check your inputs.");
    }
  };

  const handleConfirmation = async () => {
    if (!termsAccepted) return;

    setLoading(true);
    setError(null);
    setShowConfirmation(false);

    try {
      const inputData = {
        name: name.trim(),
        dob,
        tob: tob.length === 5 ? `${tob}:00` : tob,
        place: place.trim(),
        gender: gender || undefined,
        latitude: latitude!,
        longitude: longitude!,
        timezone: "Asia/Kolkata",
      };

      // CRITICAL FIX: Re-read reportType from URL params to ensure it's preserved
      // This prevents the issue where reportType becomes null and defaults to "life-summary"
      const currentReportTypeParam = searchParams.get("reportType") || searchParams.get("report");
      const currentReportType = (currentReportTypeParam && validReportTypes.includes(currentReportTypeParam as ReportType)) 
        ? (currentReportTypeParam as ReportType) 
        : reportType; // Fallback to state if URL param is missing
      
      // CRITICAL FIX: Use currentReportType (from URL) instead of reportType (from state)
      // This ensures we preserve the reportType even if state is stale
      const finalReportType = currentReportType || "life-summary";

      // CRITICAL FIX (ChatGPT): Store input in server-side Supabase, not just sessionStorage
      // This prevents redirect loops when sessionStorage is unavailable (incognito, Safari ITP, etc.)
      let inputToken: string | null = null;
      try {
        const tokenResponse = await apiPost<{
          ok: boolean;
          data?: { token: string };
          error?: string;
        }>("/api/ai-astrology/input-session", {
          input: inputData,
          reportType: finalReportType,
          bundleType: bundleParam || undefined,
          bundleReports: bundleReports.length > 0 ? bundleReports : undefined,
        });

        if (tokenResponse.ok && tokenResponse.data?.token) {
          inputToken = tokenResponse.data.token;
          console.log("[Input] Stored input session, token:", inputToken);
        } else {
          console.warn("[Input] Failed to store input session, falling back to sessionStorage:", tokenResponse.error);
        }
      } catch (tokenError) {
        console.warn("[Input] Input session API error, falling back to sessionStorage:", tokenError);
      }

      // Fallback: Store in sessionStorage for next page (if available)
      // This is now a "nice-to-have cache", not required
      try {
        sessionStorage.setItem("aiAstrologyInput", JSON.stringify(inputData));
        sessionStorage.setItem("aiAstrologyReportType", finalReportType);
        
        // Store bundle information if bundle is selected
        if (bundleParam) {
          sessionStorage.setItem("aiAstrologyBundle", bundleParam);
          sessionStorage.setItem("aiAstrologyBundleReports", JSON.stringify(bundleReports));
        } else {
          // Clear bundle info if not a bundle
          sessionStorage.removeItem("aiAstrologyBundle");
          sessionStorage.removeItem("aiAstrologyBundleReports");
        }
      } catch (storageError) {
        // Handle sessionStorage errors (e.g., private browsing mode)
        console.warn("[Input] sessionStorage not available (non-critical):", storageError);
        // Continue anyway - preview page will use input_token if available
      }

      // CRITICAL FIX (ChatGPT): Check flow=subscription first - redirect to subscription if present
      // This fixes "Monthly Outlook → input → never returns to subscription" issue
      // CRITICAL FIX (ChatGPT 22:45): Use window.location.assign for hard navigation (guarantees query params survive)
      if (flow === "subscription") {
        const subscriptionUrl = inputToken
          ? `/ai-astrology/subscription?input_token=${encodeURIComponent(inputToken)}`
          : "/ai-astrology/subscription";
        const fullUrl = typeof window !== "undefined" ? new URL(subscriptionUrl, window.location.origin).toString() : subscriptionUrl;
        console.info("[INPUT_REDIRECT]", fullUrl);
        console.log("[Input] flow=subscription, redirecting to subscription:", fullUrl);
        // CRITICAL FIX: Use window.location.assign for hard navigation (no soft routing that loses query params)
        window.location.assign(fullUrl);
        return;
      }

      // CRITICAL FIX (ChatGPT): Harden returnTo - only allow /ai-astrology/* paths
      // Block external URLs and dangerous paths (prevent open redirect)
      // Allow querystrings (e.g., ?session_id=...) but still block encoded protocol variants
      // CRITICAL FIX (ChatGPT 21:15): Prevent loops - if returnTo points to /input or has flow=subscription, override
      if (returnTo && isSafeReturnTo(returnTo)) {
        let sanitizedReturnTo = returnTo.trim();
        
        // CRITICAL FIX (ChatGPT): Loop prevention - if returnTo points to /input or has flow=subscription, override
        // This avoids "input → subscription → input → ..." loops in weird partial states
        if (sanitizedReturnTo.includes("/input") || sanitizedReturnTo.includes("flow=subscription")) {
          console.warn("[Input] returnTo points to /input or has flow=subscription - overriding to prevent loop:", sanitizedReturnTo);
          // Override to safe default based on flow
          if (flow === "subscription") {
            sanitizedReturnTo = "/ai-astrology/subscription";
          } else {
            // Report flow default
            const reportTypeForDefault = finalReportType || reportType || "life-summary";
            // CRITICAL FIX (2026-01-18): Include auto_generate=true for free reports when sanitizing returnTo
            const isFreeReportForDefault = reportTypeForDefault === "life-summary";
            const autoGenerateForDefault = isFreeReportForDefault ? "&auto_generate=true" : "";
            sanitizedReturnTo = `/ai-astrology/preview?reportType=${encodeURIComponent(reportTypeForDefault)}${autoGenerateForDefault}`;
          }
        }
        
        // Include input_token in returnTo if we have it
        // CRITICAL FIX (2026-01-18): Replace existing input_token instead of appending (prevent duplicates)
        // Use URLSearchParams.set() which automatically replaces if exists
        // CRITICAL FIX (2026-01-18): Also add auto_generate=true for free reports when modifying returnTo
        let returnUrl = sanitizedReturnTo;
        if (inputToken && typeof window !== "undefined") {
          try {
            const urlObj = new URL(sanitizedReturnTo, window.location.origin);
            urlObj.searchParams.set("input_token", inputToken); // set() replaces if exists
            // Check if it's a free report and add auto_generate=true if missing
            const reportTypeParam = urlObj.searchParams.get("reportType");
            if (reportTypeParam === "life-summary" && !urlObj.searchParams.has("auto_generate")) {
              urlObj.searchParams.set("auto_generate", "true");
            }
            returnUrl = urlObj.pathname + urlObj.search;
          } catch (urlError) {
            // Fallback to string concatenation if URL parsing fails
            console.warn("[Input] Failed to parse returnTo URL, using string concatenation:", urlError);
            const separator = sanitizedReturnTo.includes("?") ? "&" : "?";
            const isFreeReportInReturnTo = sanitizedReturnTo.includes("reportType=life-summary");
            const autoGenerateForReturnTo = isFreeReportInReturnTo && !sanitizedReturnTo.includes("auto_generate") ? "&auto_generate=true" : "";
            returnUrl = `${sanitizedReturnTo}${separator}input_token=${encodeURIComponent(inputToken)}${autoGenerateForReturnTo}`;
          }
        }
        const fullUrl = typeof window !== "undefined" ? new URL(returnUrl, window.location.origin).toString() : returnUrl;
        console.info("[INPUT_REDIRECT]", fullUrl);
        console.log("[Input] redirecting to returnTo:", fullUrl);
        // CRITICAL FIX: Use window.location.assign for hard navigation (no soft routing that loses query params)
        window.location.assign(fullUrl);
        return;
      } else if (returnTo) {
        // Log security violation attempt (not user-facing)
        console.warn("[Input] Invalid returnTo path rejected:", returnTo);
        // Fall through to default preview redirect (safe fallback)
      }

      // Default: redirect to preview page
      // CRITICAL: Always include reportType in URL to prevent redirect loops
      // CRITICAL FIX: Include input_token if available (server-side source of truth)
      // CRITICAL FIX (2026-01-18): Add auto_generate=true for free reports to trigger auto-generation
      // This ensures Free Life Summary auto-generates when reaching preview page
      const isFreeReport = finalReportType === "life-summary";
      const autoGenerateParam = isFreeReport ? "&auto_generate=true" : "";
      const previewUrl = inputToken
        ? `/ai-astrology/preview?reportType=${encodeURIComponent(finalReportType)}&input_token=${encodeURIComponent(inputToken)}${autoGenerateParam}`
        : `/ai-astrology/preview?reportType=${encodeURIComponent(finalReportType)}${autoGenerateParam}`;
      const fullUrl = typeof window !== "undefined" ? new URL(previewUrl, window.location.origin).toString() : previewUrl;
      
      console.info("[INPUT_REDIRECT]", fullUrl);
      console.log("[Input] Redirecting to preview with reportType:", finalReportType, {
        fromUrl: currentReportTypeParam,
        fromState: reportType,
        final: finalReportType,
        hasInputToken: !!inputToken,
        fullUrl,
      });
      
      // CRITICAL FIX: Use window.location.assign for hard navigation (no soft routing that loses query params)
      // This guarantees query params survive and avoids Next soft-navigation keeping stale state
      window.location.assign(fullUrl);
      // Note: window.location.assign is synchronous - component will unmount, so no need to return
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please check your inputs.");
      // Only reset loading state on error (when navigation doesn't happen)
      setLoading(false);
    }
  };

  const getReportNameForBundle = (type: ReportType): string => {
    switch (type) {
      case "marriage-timing":
        return "Marriage Timing Report";
      case "career-money":
        return "Career & Money Report";
      case "full-life":
        return "Full Life Report";
      case "year-analysis":
        return "Year Analysis Report (next 12 months)";
      case "major-life-phase":
        return "3-5 Year Strategic Life Phase Report";
      case "decision-support":
        return "Decision Support Report";
      default:
        return "";
    }
  };

  const getBundleSavingsPercentage = (): number => {
    if (bundleParam === "all-3") return 25;
    if (bundleParam === "any-2") return 15;
    if (bundleParam === "life-decision-pack") return 25;
    return 0;
  };

  const getReportBenefits = (): string[] => {
    if (bundleParam && bundleReports.length > 0) {
      const benefits: string[] = [];
      
      // Explicitly name each report in the bundle for clarity
      bundleReports.forEach(reportType => {
        const reportName = getReportNameForBundle(reportType);
        if (reportName) {
          benefits.push(reportName);
        }
      });
      
      // Add additional benefits
      benefits.push("Personalized insights from your birth chart");
      benefits.push("Complete downloadable PDF bundle");
      
      // Add savings percentage
      const savingsPercent = getBundleSavingsPercentage();
      if (savingsPercent > 0) {
        benefits.push(`Special bundle pricing — save ${savingsPercent}% vs individual reports`);
      }
      
      return benefits;
    }
    
    switch (reportType) {
      case "marriage-timing":
        return [
          "Optimal marriage timing windows (month-by-month)",
          "Planetary influence analysis for relationships",
          "Personalized, non-generic insights"
        ];
      case "career-money":
        return [
          "Career direction and growth opportunities",
          "Financial stability and money growth insights",
          "Personalized, non-generic guidance"
        ];
      case "full-life":
        return [
          "Comprehensive life overview (career, relationships, health)",
          "Long-term strategic insights (next 5-10 years)",
          "Personalized, non-generic analysis"
        ];
      case "year-analysis":
        return [
          "12-month strategic overview",
          "Career, money & relationship focus",
          "Personalized, non-generic insights"
        ];
      case "major-life-phase":
        return [
          "3-5 year strategic life phase overview",
          "Major transitions and opportunities",
          "Personalized, non-generic insights"
        ];
      case "decision-support":
        return [
          "Personalized decision guidance",
          "Timing and opportunity analysis",
          "Non-generic, contextual insights"
        ];
      default:
        return [
          "Personalized life summary",
          "Key insights from your birth chart",
          "Free comprehensive overview"
        ];
    }
  };

  const getReportTitle = () => {
    // Handle bundles first
    if (bundleParam === "any-2" && bundleReports.length === 2) {
      return "Any 2 Reports Bundle";
    }
    if (bundleParam === "all-3") {
      return "All 3 Reports Bundle";
    }
    if (bundleParam === "life-decision-pack") {
      return "Complete Life Decision Pack";
    }
    // Handle single report types
    switch (reportType) {
      case "marriage-timing":
        return "Marriage Timing Report";
      case "career-money":
        return "Career & Money Report";
      case "full-life":
        return "Full Life Report";
      case "year-analysis":
        return "Year Analysis Report";
      case "major-life-phase":
        return "3-5 Year Strategic Life Phase Report";
      case "decision-support":
        return "Decision Support Report";
      default:
        return "Free Life Summary";
    }
  };

  const getReportDescription = () => {
    if (bundleParam === "any-2" && bundleReports.length === 2) {
      const reportNames = bundleReports.map(rt => {
        switch (rt) {
          case "marriage-timing": return "Marriage Timing";
          case "career-money": return "Career & Money";
          case "full-life": return "Full Life";
          case "year-analysis": return "Year Analysis";
          case "major-life-phase": return "3-5 Year Strategic Life Phase";
          case "decision-support": return "Decision Support";
          default: return "";
        }
      }).filter(Boolean).join(" + ");
      return `Bundle of ${reportNames} Reports - Save 15% on your selected reports.`;
    }
    if (bundleParam === "all-3") {
      return "Bundle of Marriage Timing + Career & Money + Full Life Reports - Save 25% on all three reports.";
    }
    switch (reportType) {
      case "marriage-timing":
        return "Get detailed insights about your ideal marriage timing, compatibility, and remedies.";
      case "career-money":
        return "Discover your best career direction, job change timing, and financial phases.";
      case "full-life":
        return "Comprehensive analysis covering all aspects of your life and future.";
      case "year-analysis":
        return "12-month strategic guidance with quarterly breakdown, best periods, and year scorecard.";
      case "major-life-phase":
        return "3-5 year outlook with major transitions, long-term opportunities, and strategic navigation.";
      case "decision-support":
        return "Astrological guidance for major life decisions with timing and alignment analysis.";
      default:
        return "Get a free preview of your personality, strengths, and life themes. No payment required.";
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 py-6 sm:py-8 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl overflow-visible">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/ai-astrology" className="text-sm text-purple-600 hover:text-purple-700 mb-4 inline-block">
            ← Back to AI Astrology
          </Link>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
            {getReportTitle()}
          </h1>
          <p className="text-sm sm:text-base text-slate-600">{getReportDescription()}</p>
        </div>

        {/* Form Card */}
        <Card className="border-2 border-purple-200 bg-white shadow-lg">
          <CardHeader 
            icon="🔮"
            title="Enter Your Birth Details"
            subtitle="We need accurate information for precise astrological calculations"
          />
          <CardContent className="overflow-visible">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
                  autoComplete="name"
                  inputMode="text"
                  className="w-full cosmic-input min-h-[44px]"
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
                  className="w-full cosmic-input min-h-[44px]"
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
                  className="w-full min-h-[44px]"
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
                  className="w-full rounded-xl border border-slate-300 bg-white text-slate-900 px-4 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none appearance-none cursor-pointer pr-10 min-w-0 min-h-[44px]"
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
                <div className="p-3 sm:p-4 rounded-xl bg-red-50 border-2 border-red-200">
                  <div className="flex items-start gap-2 text-red-700 font-semibold text-sm sm:text-base">
                    <span className="text-lg">⚠️</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-4 sm:py-6 text-base sm:text-lg min-h-[44px]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">🌙</span>
                      Processing...
                    </span>
                  ) : bundleParam ? (
                    // Bundle selected - always show purchase action (bundles are always paid)
                    `Purchase ${getReportTitle()}`
                  ) : reportType ? (
                    // Single report selected - check if it's paid or free
                    reportType === "life-summary" 
                      ? `Get ${getReportTitle()}`
                      : `Purchase ${getReportTitle()}`
                  ) : (
                    // No selection - default to free summary
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
        <Card className="mt-4 sm:mt-6 bg-amber-50 border-amber-200">
          <CardContent className="p-4 sm:p-6">
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
        <Card className="mt-4 sm:mt-6 cosmic-card border-amber-200 bg-amber-50/50 max-w-4xl mx-auto">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-center mb-3">⚠️ Important Disclaimer</h3>
              <div className="text-sm text-slate-700 space-y-2">
                <p>
                  <strong>Educational Guidance Only:</strong> This report is generated by AI for educational and entertainment purposes only. 
                  It provides astrological guidance based on traditional calculations, not absolute predictions or certainties.
                </p>
                <p>
                  <strong>Not Professional Advice:</strong> Personalised astrological insights for educational and self-reflection purposes only. Not professional advice. Always consult qualified professionals for important life decisions.
                </p>
                <p>
                  <strong>No Guarantees:</strong> Results are based on astrological calculations and AI interpretation. 
                  Astrology is not a science and cannot predict future events with certainty.
                </p>
                <p>
                  <strong>Fully Automated Platform:</strong> This platform is 100% automated. No human astrologers review or modify reports. 
                  No live support is available. For questions, please see our <Link href="/ai-astrology/faq" className="text-amber-700 hover:text-amber-800 underline font-semibold">FAQ page</Link>.
                </p>
                <p className="pt-2 border-t border-amber-200">
                  <strong>Refund Policy:</strong> No change-of-mind refunds on digital reports. This does not limit your rights under Australian Consumer Law.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-300 shadow-2xl">
            <CardHeader 
              icon="🔮"
              title={getReportTitle()}
              subtitle={bundleParam && bundleReports.length > 0 
                ? "Confirm your personalized report generation"
                : "Confirm your report generation"}
            />
            <CardContent className="p-6">
              {/* What You Will Get Section */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">What You Will Get</h3>
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                  <ul className="space-y-3">
                    {getReportBenefits().map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-amber-600 font-bold text-lg mt-0.5">✓</span>
                        <span className="text-slate-700 text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Terms Acceptance Checkbox */}
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-5 h-5 text-purple-600 border-purple-300 rounded focus:ring-purple-500 focus:ring-2"
                    required
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-slate-900">
                      I accept the{" "}
                      <Link href="/terms" target="_blank" className="text-purple-600 hover:text-purple-700 underline font-semibold" onClick={(e) => e.stopPropagation()}>
                        terms and conditions
                      </Link>
                    </span>
                    <p className="text-xs text-slate-600 mt-1">
                      I understand this report is for educational guidance only, is fully automated, 
                      and provides no guarantees. I have read and accept the disclaimer above.
                    </p>
                  </div>
                </label>
              </div>

              {/* Trust Reassurance (for bundles) */}
              {bundleParam && bundleReports.length > 0 && (
                <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 text-center">
                    Your reports are generated securely and delivered instantly as PDFs.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleConfirmation}
                  disabled={!termsAccepted || loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-3 text-base min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">🌙</span>
                      Processing...
                    </span>
                  ) : bundleParam && bundleReports.length > 0 ? (
                    `Generate My ${bundleReports.length} Report${bundleReports.length > 1 ? 's' : ''}`
                  ) : (
                    "Continue to Generate Report"
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowConfirmation(false);
                    setTermsAccepted(false);
                  }}
                  disabled={loading}
                  variant="secondary"
                  className="sm:w-auto min-h-[44px] text-slate-600 border-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
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

