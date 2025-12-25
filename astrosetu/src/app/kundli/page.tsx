"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { MouseEvent } from "react";
import Link from "next/link";
import type { KundliResult, DoshaAnalysis, KundliChart, BirthDetails } from "@/types/astrology";
import { apiPost } from "@/lib/http";
import { session } from "@/lib/session";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { AIInsights } from "@/components/ai/AIInsights";
import { KundliChartVisual } from "@/components/ui/KundliChartVisual";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { DecorativePattern } from "@/components/ui/DecorativePattern";
import { AstroImage } from "@/components/ui/AstroImage";
import { KundliDashboard } from "@/components/kundli/KundliDashboard";
import { CalculationTrustPanel } from "@/components/kundli/CalculationTrustPanel";
import { logEvent, logError } from "@/lib/telemetry";
import { resolvePlaceCoordinates } from "@/lib/indianCities";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" }
];

function KundliPageContent() {
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [place, setPlace] = useState("");
  const [placeData, setPlaceData] = useState<{ latitude?: number; longitude?: number; timezone?: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [ayanamsa, setAyanamsa] = useState<number>(1); // 1 = Lahiri (default, matches AstroSage)
  const [timezone, setTimezone] = useState<string>("Asia/Kolkata");
  const [manualLat, setManualLat] = useState<string>("");
  const [manualLon, setManualLon] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<(KundliResult & { dosha?: DoshaAnalysis; chart?: KundliChart }) | null>(null);
  const [isAPIConfigured, setIsAPIConfigured] = useState<boolean | null>(null);
  const [savedBirthDetails, setSavedBirthDetails] = useState<BirthDetails | null>(null);

  // Initialize form fields from URL + session on client to avoid SSR/CSR mismatch
  useEffect(() => {
    const bd = session.getBirthDetails();
    const user = session.getUser();

    const urlName = searchParams.get("name") || "";
    const urlDay = searchParams.get("day") || "";
    const urlMonth = searchParams.get("month") || "";
    const urlYear = searchParams.get("year") || "";
    const urlHours = searchParams.get("hours") || "";
    const urlMinutes = searchParams.get("minutes") || "";
    const urlPlace = searchParams.get("place") || "";

    setName(urlName || bd?.name || user?.name || "");
    setGender((bd?.gender as "Male" | "Female") || "Male");
    setDay(urlDay || (bd?.day != null ? String(bd.day) : ""));
    setMonth(urlMonth || (bd?.month != null ? String(bd.month) : ""));
    setYear(urlYear || (bd?.year != null ? String(bd.year) : ""));
    setHours(urlHours || (bd?.hours != null ? String(bd.hours).padStart(2, "0") : ""));
    setMinutes(urlMinutes || (bd?.minutes != null ? String(bd.minutes).padStart(2, "0") : ""));
    setSeconds(bd?.seconds != null ? String(bd.seconds).padStart(2, "0") : "");
    setPlace(urlPlace || bd?.place || "");
    setPlaceData(
      bd?.latitude != null && bd?.longitude != null
        ? { latitude: bd.latitude, longitude: bd.longitude, timezone: bd.timezone }
        : null
    );
    setSavedBirthDetails(bd || null);
  }, [searchParams]);

  // Check if Prokerala API is configured
  useEffect(() => {
    async function checkAPIConfig() {
      try {
        const res = await fetch('/api/astrology/config');
        const json = await res.json();
        setIsAPIConfigured(json.data?.configured ?? false);
      } catch {
        setIsAPIConfigured(false);
      }
    }
    checkAPIConfig();
  }, []);
  
  // Load latest Kundli if available and no data yet, based on saved birth details
  useEffect(() => {
    if (!data && savedBirthDetails) {
      const latestKundli = session.getLatestKundli();
      if (latestKundli && latestKundli.birthDetails) {
        const bd = latestKundli.birthDetails;
        if (
          bd.place === savedBirthDetails.place &&
          bd.day === savedBirthDetails.day &&
          bd.month === savedBirthDetails.month &&
          bd.year === savedBirthDetails.year
        ) {
          setData(latestKundli);
        }
      }
    }
  }, [data, savedBirthDetails]);

  const canSubmit = useMemo(() => {
    // Helper to safely parse and validate number
    const parseNumber = (val: string, min: number, max: number): boolean => {
      if (!val || typeof val !== 'string') return false;
      const trimmed = val.trim();
      if (trimmed === '') return false;
      const num = Number(trimmed);
      return !isNaN(num) && num >= min && num <= max;
    };
    
    // Validate day: must be a number between 1-31
    const dayValid = parseNumber(day, 1, 31);
    
    // Validate month: must be selected (not empty, 1-12)
    // Handle both string and number values from select
    const monthStr = String(month || '').trim();
    const monthValid = monthStr !== '' && parseNumber(monthStr, 1, 12);
    
    // Validate year: must be a reasonable year (1900-2100)
    const yearValid = parseNumber(year, 1900, 2100);
    
    // Validate hours: must be 0-23
    const hoursValid = parseNumber(hours, 0, 23);
    
    // Validate minutes: must be 0-59
    const minutesValid = parseNumber(minutes, 0, 59);
    
    // Validate place: must have at least 2 characters (after trimming)
    const placeTrimmed = (place || '').trim();
    const placeValid = placeTrimmed.length >= 2;
    
    const isValid = dayValid && monthValid && yearValid && hoursValid && minutesValid && placeValid;
    
    // Debug log to help diagnose issues (only in dev, and only log when invalid to reduce noise)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      if (!isValid) {
        console.log('[canSubmit] Validation failed:', {
          dayValid, monthValid, yearValid, hoursValid, minutesValid, placeValid,
          raw: { day, month, year, hours, minutes, place: placeTrimmed.substring(0, 30) }
        });
      }
    }
    
    return isValid;
  }, [day, month, year, hours, minutes, place]);

  async function handleCurrentLocation(e?: MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!navigator.geolocation) {
      setErr("Geolocation is not supported by your browser. Please enter location manually.");
      return;
    }

    setLocationLoading(true);
    setErr(null);

    try {
      // Request location with better options
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          reject, 
          {
            timeout: 15000,
            enableHighAccuracy: false, // Changed to false for faster response
            maximumAge: 60000 // Use cached location if available (1 minute)
          }
        );
      });

      const { latitude, longitude } = position.coords;
      console.log("Got location:", latitude, longitude);
      
      // Reverse geocode to get place name
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`,
          {
            headers: {
              'User-Agent': 'AstroSetu/1.0',
              'Accept': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Reverse geocoding failed: ${response.status}`);
        }

        const data = await response.json();
        console.log("Reverse geocode data:", data);
        
        const address = data.address || {};
        // Try multiple address fields for better accuracy
        const cityName = address.city || 
                        address.town || 
                        address.village || 
                        address.county || 
                        address.municipality ||
                        address.district ||
                        "Unknown";
        const state = address.state || address.region || address.state_district || "";
        const country = address.country || "";
        
        let placeName = cityName;
        if (state && state !== cityName) {
          placeName = `${cityName}, ${state}`;
        }
        if (country && country !== state && country !== cityName) {
          placeName = `${placeName}, ${country}`;
        }
        
        console.log("Setting place to:", placeName);
        setPlace(placeName);
        setLocationLoading(false);
      } catch (geocodeError: any) {
        console.error("Reverse geocoding error:", geocodeError);
        // Fallback: use coordinates formatted nicely
        const coordPlace = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setPlace(coordPlace);
        setLocationLoading(false);
        setErr("Could not get city name, but coordinates are set. You can edit manually.");
      }
    } catch (error: any) {
      console.error("Geolocation error:", error);
      setLocationLoading(false);
      
      let errorMessage = "Unable to get your location. Please enter manually.";
      
      if (error.code === 1) {
        errorMessage = "Location access denied. Please enable location permissions in your browser settings and try again.";
      } else if (error.code === 2) {
        errorMessage = "Location unavailable. Your device may not have GPS or location services disabled.";
      } else if (error.code === 3) {
        errorMessage = "Location request timed out. Please check your internet connection and try again.";
      }
      
      setErr(errorMessage);
    }
  }

  function handleNow(e?: MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    e?.stopPropagation();
    console.log("handleNow called");
    const now = new Date();
    setDay(now.getDate().toString());
    setMonth((now.getMonth() + 1).toString());
    setYear(now.getFullYear().toString());
    setHours(now.getHours().toString().padStart(2, "0"));
    setMinutes(now.getMinutes().toString().padStart(2, "0"));
    setSeconds(now.getSeconds().toString().padStart(2, "0"));
    console.log("Time fields filled with current time");
  }

  async function onSubmit(e?: MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    e?.stopPropagation();
    console.log("onSubmit called", { day, month, year, hours, minutes, place, canSubmit });
    
    if (!canSubmit) {
      console.log("Cannot submit - validation failed");
      setErr("Please fill in all required fields");
      return;
    }

    setErr(null);
    setLoading(true);
    try {
      // Convert to dob and tob format
      const dob = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      const tob = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
      
      // Determine coordinates to use
      let finalLat: number | undefined;
      let finalLon: number | undefined;
      let finalTimezone = timezone;
      
      // Priority: Manual coordinates > Place data > Try to resolve from local DB > None (will use place string)
      if (manualLat && manualLon) {
        finalLat = parseFloat(manualLat);
        finalLon = parseFloat(manualLon);
      } else if (placeData?.latitude && placeData?.longitude) {
        finalLat = placeData.latitude;
        finalLon = placeData.longitude;
        if (placeData.timezone) {
          finalTimezone = placeData.timezone;
        }
      } else if (place && place.trim().length > 0) {
        // Try to resolve coordinates from local database for manual entries
        const resolved = resolvePlaceCoordinates(place);
        if (resolved) {
          finalLat = resolved.latitude;
          finalLon = resolved.longitude;
          // Update placeData for future reference
          setPlaceData({
            latitude: resolved.latitude,
            longitude: resolved.longitude,
            timezone: "Asia/Kolkata",
          });
          console.log(`Resolved coordinates for "${place}": ${finalLat}, ${finalLon}`);
        }
      }
      
      console.log("Submitting Kundli request", { dob, tob, place, latitude: finalLat, longitude: finalLon, ayanamsa, timezone: finalTimezone });
      const res = await apiPost<{ ok: boolean; data?: KundliResult; error?: string }>("/api/astrology/kundli", {
        name: name || undefined,
        gender,
        dob,
        tob,
        place,
        latitude: finalLat,
        longitude: finalLon,
        timezone: finalTimezone,
        ayanamsa,
        day: parseInt(day),
        month: parseInt(month),
        year: parseInt(year),
        hours: parseInt(hours),
        minutes: parseInt(minutes),
        seconds: parseInt(seconds) || 0
      });
      console.log("Kundli response received", res);
      if (!res.ok) {
        // Try to use last saved chart as fallback
        const lastKundli = session.getLatestKundli();
        if (lastKundli && lastKundli.birthDetails) {
          const bd = lastKundli.birthDetails;
          // Check if it matches current input
          if (
            bd.place === place &&
            bd.day?.toString() === day &&
            bd.month?.toString() === month &&
            bd.year?.toString() === year
          ) {
            console.log("Using last saved chart as fallback");
            setData(lastKundli);
            setErr("Network error: Showing your last saved chart. Please check your connection and try again for updated results.");
            setLoading(false);
            return;
          }
        }
        throw new Error(res.error || "Failed");
      }
      
      const kundliData = res.data ?? null;
      setData(kundliData);
      
      // Save Kundli result and birth details
      if (kundliData) {
        // Save birth details for future use
        const birthDetails: BirthDetails = {
          name: name || undefined,
          gender,
          day: parseInt(day),
          month: parseInt(month),
          year: parseInt(year),
          hours: parseInt(hours),
          minutes: parseInt(minutes),
          seconds: parseInt(seconds) || 0,
          dob,
          tob,
          place,
          latitude: finalLat,
          longitude: finalLon,
          timezone: finalTimezone,
        };
        session.saveBirthDetails(birthDetails);
        
        // Save Kundli result
        const currentUser = session.getUser();
        session.saveKundli({
          ...kundliData,
          birthDetails,
          name: name || currentUser?.name || "My Kundli",
        });

        // Analytics: successful kundli generation
        logEvent("kundli_generated", {
          hasCoordinates: !!(finalLat && finalLon),
          ayanamsa,
        });
      }
    } catch (e: any) {
      console.error("Kundli generation error:", e);
      logError("kundli_generate", e);
      
      // Try to use last saved chart as fallback on network errors
      if (e?.message?.includes("Network error") || e?.message?.includes("fetch failed") || e?.message?.includes("timeout")) {
        const lastKundli = session.getLatestKundli();
        if (lastKundli && lastKundli.birthDetails) {
          const bd = lastKundli.birthDetails;
          // Check if it matches current input
          if (
            bd.place === place &&
            bd.day?.toString() === day &&
            bd.month?.toString() === month &&
            bd.year?.toString() === year
          ) {
            console.log("Using last saved chart as fallback due to network error");
            setData(lastKundli);
            setErr("Network error: Showing your last saved chart. Please check your connection and try again for updated results.");
            setLoading(false);
            return;
          }
        }
      }
      
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      {/* Hero Section - Indian spiritual theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-saffron-500 via-amber-500 to-orange-500 text-white p-8 lg:p-12 mb-6 shadow-xl">
        <HeaderPattern />
        {/* Spiritual symbols overlay */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-6 left-6 text-5xl">ॐ</div>
          <div className="absolute top-6 right-6 text-5xl">🕉️</div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-4xl">🪷</div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
              🔮
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-2 text-white">Generate Your Kundli (कुंडली)</h1>
              <p className="text-white/90 text-lg">
                Complete birth chart analysis with AI-powered insights
              </p>
            </div>
          </div>
          <p className="text-white/90 max-w-3xl text-base leading-relaxed">
            Kundli is the term used for Birth Chart in Vedic Astrology. Twelve houses of Kundli show ascendant and planet position in various zodiac signs at the time of birth as seen from the place of birth.
          </p>
        </div>
      </div>

      <Card className="shadow-xl">
        <CardHeader
          eyebrow="Get Your Kundli by Date of Birth"
          title="Birth Details"
          subtitle="Enter your complete birth information for accurate Kundli generation"
          icon="🔮"
        />
        <CardContent className="p-8">
          <div className="grid gap-6">
            {/* Name Field */}
            <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm">
              <label className="block text-sm font-bold text-slate-900 mb-3">
                <span className="text-purple-600 mr-2">1.</span> Full Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full text-base"
              />
              <p className="text-xs text-slate-500 mt-2">Optional: Used for personalized reports</p>
            </div>

            {/* Gender Selection */}
            <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm">
              <label className="block text-sm font-bold text-slate-900 mb-3">
                <span className="text-purple-600 mr-2">2.</span> Gender
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Gender set to Male");
                    setGender("Male");
                  }}
                  className={`flex-1 px-6 py-4 rounded-2xl font-bold text-base transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                    gender === "Male"
                      ? "bg-gradient-to-r from-purple-600 via-purple-700 to-orange-500 text-white shadow-lg scale-[1.02]"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 shadow-sm"
                  }`}
                >
                  👨 Male
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Gender set to Female");
                    setGender("Female");
                  }}
                  className={`flex-1 px-6 py-4 rounded-2xl font-bold text-base transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                    gender === "Female"
                      ? "bg-gradient-to-r from-purple-600 via-purple-700 to-orange-500 text-white shadow-lg scale-[1.02]"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 shadow-sm"
                  }`}
                >
                  👩 Female
                </button>
              </div>
            </div>

            {/* Date Fields */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <label className="block text-sm font-bold text-slate-900 mb-3">
                <span className="text-purple-600">3.</span> Date of Birth
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Day</label>
                  <Input
                    type="number"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    placeholder="DD"
                    min="1"
                    max="31"
                    className="text-center text-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Month</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white text-slate-900 px-4 py-3 text-base font-semibold outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200 hover:border-slate-400"
                  >
                    <option value="">Select</option>
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Year</label>
                  <Input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="YYYY"
                    min="1900"
                    max="2100"
                    className="text-center text-lg font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Time Fields */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <label className="block text-sm font-bold text-slate-900 mb-3">
                <span className="text-purple-600">4.</span> Time of Birth
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Hrs</label>
                  <Input
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="21"
                    min="0"
                    max="23"
                    className="text-center text-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Min</label>
                  <Input
                    type="number"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    placeholder="40"
                    min="0"
                    max="59"
                    className="text-center text-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Sec</label>
                  <Input
                    type="number"
                    value={seconds}
                    onChange={(e) => setSeconds(e.target.value)}
                    placeholder="00"
                    min="0"
                    max="59"
                    className="text-center text-lg font-semibold"
                  />
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                <span>💡</span>
                <span>Enter time in 24-hour format (e.g., 21:40:00)</span>
              </div>
            </div>

            {/* Place of Birth */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <label className="block text-sm font-bold text-slate-900 mb-3">
                <span className="text-purple-600">5.</span> Place of Birth
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <AutocompleteInput
                    value={place}
                    onChange={setPlace}
                    onSelect={(selectedPlace) => {
                      console.log("Selected place:", selectedPlace);
                      setPlace(selectedPlace.displayName || `${selectedPlace.name}${selectedPlace.state ? `, ${selectedPlace.state}` : ""}${selectedPlace.country ? `, ${selectedPlace.country}` : ""}`);
                      // Store coordinates for Prokerala API
                      if (selectedPlace.latitude && selectedPlace.longitude) {
                        setPlaceData({
                          latitude: selectedPlace.latitude,
                          longitude: selectedPlace.longitude,
                          timezone: "Asia/Kolkata", // Default, can be overridden in advanced settings
                        });
                        // Clear manual coordinates if place is selected
                        setManualLat("");
                        setManualLon("");
                      }
                    }}
                    placeholder="Start typing city name (e.g., Delhi, Mumbai)..."
                    className="w-full"
                  />
                </div>
                <Button 
                  type="button"
                  variant="secondary" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCurrentLocation(e);
                  }}
                  disabled={locationLoading}
                  className="whitespace-nowrap px-6"
                >
                  {locationLoading ? (
                    <>
                      <span className="animate-spin inline-block mr-2">⏳</span>
                      Getting Location...
                    </>
                  ) : (
                    <>
                      📍 Use Current Location
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Autocomplete will suggest cities as you type</p>
              <div className="text-xs text-slate-600 mt-2 font-semibold">Standard time</div>
              {err && (
                <div className="mt-2 p-3 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-sm">
                  <div className="flex items-start gap-2">
                    <span>⚠️</span>
                    <span>{err}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons - AstroSage Style */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Settings toggle clicked");
                  setShowSettings(!showSettings);
                }}
                className="px-4 py-2 rounded-lg text-sm font-bold text-red-600 bg-white hover:bg-slate-50 border-2 border-slate-300 transition-all shadow-sm"
              >
                {showSettings ? "[-]" : "[+]"} SETTINGS
              </button>
              <Button 
                type="button"
                variant="secondary" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCurrentLocation(e);
                }}
                disabled={locationLoading}
                className="px-4 py-2 text-sm font-bold text-red-600 bg-white hover:bg-slate-50 border-2 border-slate-300 shadow-sm whitespace-nowrap"
              >
                {locationLoading ? (
                  <>
                    <span className="animate-spin inline-block mr-2">⏳</span>
                    Getting...
                  </>
                ) : (
                  "CURRENT LOCATION"
                )}
              </Button>
              <Button 
                type="button"
                variant="secondary" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNow(e);
                }}
                className="px-4 py-2 text-sm font-bold text-red-600 bg-white hover:bg-slate-50 border-2 border-slate-300 shadow-sm"
              >
                NOW
              </Button>
            </div>
            
            {/* DONE Buttons - AstroSage Style */}
            <div className="flex gap-4 pt-6 border-t border-slate-200">
              {/* Debug info in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-slate-500 mb-2 w-full">
                  Validation: Day={day || 'empty'} Month={month || 'empty'} Year={year || 'empty'} Hours={hours || 'empty'} Minutes={minutes || 'empty'} Place={place ? place.substring(0, 20) : 'empty'} | Can Submit: {canSubmit ? 'YES' : 'NO'}
                </div>
              )}
              <Button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSubmit(e);
                }}
                disabled={!canSubmit || loading} 
                className={`flex-1 px-8 py-4 text-base font-bold shadow-lg transition-all ${
                  canSubmit && !loading
                    ? 'bg-gradient-to-r from-orange-500 to-saffron-500 hover:from-orange-600 hover:to-saffron-600 text-white cursor-pointer'
                    : 'bg-gradient-to-r from-orange-300 to-saffron-300 text-white/70 cursor-not-allowed opacity-60'
                }`}
                title={!canSubmit ? `Please fill in all required fields. Day: ${day || 'missing'}, Month: ${month || 'missing'}, Year: ${year || 'missing'}, Hours: ${hours || 'missing'}, Minutes: ${minutes || 'missing'}, Place: ${place ? place.substring(0, 30) : 'missing'}` : "Generate your Kundli"}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Generating...
                  </span>
                ) : (
                  "DONE"
                )}
              </Button>
              <Button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSubmit(e);
                }}
                disabled={!canSubmit || loading} 
                className={`flex-1 px-8 py-4 text-base font-bold shadow-lg transition-all ${
                  canSubmit && !loading
                    ? 'bg-gradient-to-r from-orange-500 to-saffron-500 hover:from-orange-600 hover:to-saffron-600 text-white cursor-pointer'
                    : 'bg-gradient-to-r from-orange-300 to-saffron-300 text-white/70 cursor-not-allowed opacity-60'
                }`}
                title={!canSubmit ? `Please fill in all required fields. Day: ${day || 'missing'}, Month: ${month || 'missing'}, Year: ${year || 'missing'}, Hours: ${hours || 'missing'}, Minutes: ${minutes || 'missing'}, Place: ${place ? place.substring(0, 30) : 'missing'}` : "Generate Kundli and save your details"}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Saving...
                  </span>
                ) : (
                  "DONE AND SAVE"
                )}
              </Button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="mt-4 p-6 rounded-2xl border border-slate-200 bg-slate-50 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">⚙️</span>
                  <div className="text-base font-bold text-slate-900">Advanced Settings (Match AstroSage)</div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Ayanamsa <span className="text-xs text-slate-500">(Default: Lahiri - matches AstroSage)</span>
                    </label>
                    <select 
                      value={ayanamsa}
                      onChange={(e) => setAyanamsa(parseInt(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-white text-slate-900 px-4 py-3 text-sm font-semibold focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    >
                      <option value={1}>Lahiri (Default - matches AstroSage)</option>
                      <option value={3}>Raman</option>
                      <option value={5}>KP (Krishnamurti)</option>
                      <option value={6}>Krishnamurti</option>
                      <option value={14}>True Chitra</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Timezone</label>
                    <select 
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white text-slate-900 px-4 py-3 text-sm font-semibold focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST - Default)</option>
                      <option value="Asia/Delhi">Asia/Delhi</option>
                      <option value="Asia/Mumbai">Asia/Mumbai</option>
                      <option value="Asia/Kolkata">Asia/Calcutta</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Manual Coordinates <span className="text-xs text-slate-400">(Optional - override place coordinates)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Latitude</label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={manualLat}
                        onChange={(e) => {
                          setManualLat(e.target.value);
                          if (e.target.value) {
                            setPlaceData(null); // Clear place data when manual coords are used
                          }
                        }}
                        placeholder="e.g., 22.1234"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Longitude</label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={manualLon}
                        onChange={(e) => {
                          setManualLon(e.target.value);
                          if (e.target.value) {
                            setPlaceData(null); // Clear place data when manual coords are used
                          }
                        }}
                        placeholder="e.g., 85.5678"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  {placeData && (
                    <div className="mt-2 text-xs text-slate-600">
                      📍 Current coordinates: {placeData.latitude?.toFixed(4)}, {placeData.longitude?.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {err && (
              <div className="mt-4 p-4 rounded-xl bg-rose-50 border-2 border-rose-200">
                <div className="flex items-center gap-2 text-rose-700 font-semibold">
                  <span>⚠️</span>
                  <span>{err}</span>
                </div>
              </div>
            )}
          </div>
          {/* Trust & accuracy panel – surfaced near form so users
              immediately see how calculations are configured. */}
          <CalculationTrustPanel
            ayanamsa={ayanamsa}
            place={place}
            latitude={placeData?.latitude}
            longitude={placeData?.longitude}
            timezone={timezone}
            isAPIConfigured={isAPIConfigured}
          />
        </CardContent>
      </Card>

      {/* Results Section */}
      {data ? (
        <>
          {/* Dashboard View - Similar to AstroSage */}
          <KundliDashboard kundliData={data} userName={name || "User"} />
          
          {/* Quick Link to Services Page */}
          <div className="mt-6 text-center">
            <Link href="/services">
              <Button className="px-8 py-4 text-base">
                📊 View All Services & Reports →
              </Button>
            </Link>
          </div>
          
          {/* Detailed Results Section - Collapsible */}
          <div className="space-y-6 mt-8" id="chart">
          {/* Success Message with Birth Chart Image */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border-2 border-emerald-300 shadow-lg relative overflow-hidden">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `radial-gradient(circle, #10b981 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }} />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-3xl shadow-lg border-2 border-white">
                ✅
              </div>
              <div>
                <div className="font-bold text-emerald-900 text-xl mb-1">Kundli Generated Successfully!</div>
                <div className="text-sm text-emerald-700">Your complete birth chart analysis is ready</div>
              </div>
            </div>
            <div className="mt-6 relative h-56 rounded-xl overflow-hidden bg-gradient-to-br from-saffron-50 via-amber-50 to-orange-50 border-2 border-saffron-200 flex items-center justify-center shadow-lg">
              {/* Spiritual pattern overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4 text-4xl">☉</div>
                <div className="absolute top-4 right-4 text-4xl">☽</div>
                <div className="absolute bottom-4 left-4 text-4xl">♄</div>
                <div className="absolute bottom-4 right-4 text-4xl">♂</div>
              </div>
              {/* Orbital ring pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-saffron-400 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-saffron-300 rounded-full"></div>
              </div>
              <div className="text-center relative z-10">
                {/* Central Om symbol with Kundli icon */}
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl opacity-20 text-saffron-600">ॐ</div>
                  </div>
                  <div className="relative text-8xl mb-2 drop-shadow-lg">🔮</div>
                </div>
                <div className="text-lg font-bold text-slate-900 mb-2 drop-shadow-sm bg-white/80 px-4 py-2 rounded-full inline-block">
                  Birth Chart (कुंडली)
                </div>
                <div className="text-xs text-slate-700 font-semibold mt-1">
                  Planetary positions & houses • Vedic Astrology
                </div>
              </div>
              {/* Circular chart representation */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="w-32 h-32 rounded-full border-4 border-saffron-400 border-dashed flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-2 border-purple-300/50 border-dashed flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center text-2xl">
                      ॐ
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-purple-50/30 to-white">
              <CardHeader eyebrow="Highlights" title="At a Glance" icon="✨" />
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-white border-2 border-purple-100">
                    <div className="text-xs font-semibold text-slate-600 mb-1">Ascendant</div>
                    <div className="text-xl font-bold text-purple-700">{data.ascendant || "Calculating..."}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white border-2 border-slate-100">
                    <div className="text-xs font-semibold text-slate-600 mb-1">Rashi</div>
                    <div className="text-xl font-bold text-slate-900">{data.rashi || "Calculating..."}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white border-2 border-slate-100">
                    <div className="text-xs font-semibold text-slate-600 mb-1">Nakshatra</div>
                    <div className="text-xl font-bold text-slate-900">{data.nakshatra || "Calculating..."}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white border-2 border-amber-100">
                    <div className="text-xs font-semibold text-slate-600 mb-1">Tithi</div>
                    <div className="text-xl font-bold text-amber-700">{data.tithi || "Calculating..."}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-saffron-50/30 to-white">
              <CardHeader eyebrow="Summary" title="Interpretation" icon="📖" />
              <CardContent>
                <ul className="space-y-3">
                  {data.summary.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-purple-200 transition-colors">
                      <span className="text-purple-600 font-bold mt-0.5">{i + 1}.</span>
                      <span className="text-sm text-slate-700 leading-relaxed flex-1">{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader eyebrow="Planets" title="Planetary Positions" subtitle="Detailed planetary positions in your birth chart." icon="🪐" />
              <CardContent>
                <div className="overflow-x-auto rounded-xl border-2 border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                      <tr>
                        <th className="py-4 px-6 text-left font-bold">Planet</th>
                        <th className="py-4 px-6 text-left font-bold">Sign</th>
                        <th className="py-4 px-6 text-left font-bold">Degree</th>
                        <th className="py-4 px-6 text-left font-bold">House</th>
                        <th className="py-4 px-6 text-left font-bold">Retrograde</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {data.planets.map((p, idx) => (
                        <tr key={p.name} className={`hover:bg-purple-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                          <td className="py-4 px-6 font-bold text-slate-900">{p.name}</td>
                          <td className="py-4 px-6 text-slate-700">{p.sign}</td>
                          <td className="py-4 px-6 text-slate-700 font-semibold">{p.degree}°</td>
                          <td className="py-4 px-6">
                            <Badge tone="indigo">House {p.house}</Badge>
                          </td>
                          <td className="py-4 px-6">
                            {p.retrograde ? (
                              <Badge tone="red">Yes</Badge>
                            ) : (
                              <Badge tone="green">No</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          {data.chart ? (
            <Card className="lg:col-span-2">
              <CardHeader eyebrow="Chart" title="Kundli Chart (कुंडली)" subtitle="Traditional 12-house Vedic astrological chart visualization." icon="🔮" />
              <CardContent>
                <DecorativePattern variant="mandala" className="mb-6">
                  <KundliChartVisual chart={data.chart} title="Birth Chart & Analysis" />
                </DecorativePattern>
                <div className="mt-6 p-4 rounded-2xl border-2 border-saffron-200 bg-gradient-to-r from-saffron-50 via-amber-50 to-orange-50 shadow-md">
                  <div className="text-xs font-semibold text-saffron-700 mb-2 flex items-center gap-2">
                    <span>⏳</span>
                    <span>Current Dasha (दशा)</span>
                  </div>
                  <div className="text-sm text-slate-900 font-semibold">
                    {data.chart?.dasha?.current} → Next: {data.chart?.dasha?.next} (Started: {data.chart?.dasha?.startDate})
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {data.dosha ? (
            <Card className="lg:col-span-2">
              <CardHeader eyebrow="Dosha Analysis" title="Planetary Doshas & Remedies" subtitle="Detailed analysis of doshas and recommended remedies." icon="💎" />
              <CardContent className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold mb-2">Manglik Dosha</div>
                    <Badge tone={data.dosha?.manglik?.status === "Manglik" ? "red" : "green"} className="mb-2">
                      {data.dosha?.manglik?.status} ({data.dosha?.manglik?.severity})
                    </Badge>
                    {data.dosha?.manglik?.remedies && data.dosha?.manglik?.remedies.length > 0 && (
                      <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1 mt-2">
                        {data.dosha?.manglik?.remedies?.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold mb-2">Kaal Sarp Dosha</div>
                    <Badge tone={data.dosha?.kaalSarp?.present ? "red" : "green"} className="mb-2">
                      {data.dosha?.kaalSarp?.present ? `Present (${data.dosha.kaalSarp?.type || "Unknown"})` : "Not Present"}
                    </Badge>
                    {data.dosha?.kaalSarp?.remedies && data.dosha?.kaalSarp?.remedies.length > 0 && (
                      <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1 mt-2">
                        {data.dosha?.kaalSarp?.remedies?.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold mb-2">Shani Effects</div>
                    <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1 mb-2">
                      {data.dosha?.shani?.effects?.map((e, i) => <li key={i}>{e}</li>) || []}
                    </ul>
                    <div className="text-xs font-semibold text-slate-600 mt-2">Remedies:</div>
                    <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
                      {data.dosha?.shani?.remedies?.slice(0, 2).map((r, i) => <li key={i}>{r}</li>) || []}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold mb-2">Rahu-Ketu Effects</div>
                    <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1 mb-2">
                      {data.dosha?.rahuKetu?.effects?.map((e, i) => <li key={i}>{e}</li>) || []}
                    </ul>
                    <div className="text-xs font-semibold text-slate-600 mt-2">Remedies:</div>
                    <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
                      {data.dosha?.rahuKetu?.remedies?.slice(0, 2).map((r, i) => <li key={i}>{r}</li>) || []}
                    </ul>
                  </div>
                </div>

                <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4">
                  <div className="text-sm font-semibold text-purple-900 mb-1">Overall Assessment</div>
                  <div className="text-sm text-purple-800">{data.dosha?.overall || "No assessment available"}</div>
                </div>
              </CardContent>
            </Card>
          ) : null}
          </div>
          </div>

          {/* AI Insights */}
          <AIInsights kundliData={data} />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-end">
            <Link 
              href={`/lifereport?kundliData=${encodeURIComponent(JSON.stringify(data))}`}
            >
              <Button
                type="button"
                variant="secondary"
                className="px-8"
              >
                📖 Generate Life Report
              </Button>
            </Link>
            <Button
              type="button"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.print();
              }}
              className="px-8"
            >
              📄 Download PDF Report
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function KundliPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-600 mx-auto mb-4"></div><div className="text-slate-600">Loading...</div></div></div>}>
      <KundliPageContent />
    </Suspense>
  );
}
