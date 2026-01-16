"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";

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

type BirthDetailsFormData = {
  name: string;
  gender: "Male" | "Female";
  day: string;
  month: string;
  year: string;
  hours: string;
  minutes: string;
  seconds: string;
  place: string;
};

type BirthDetailsFormProps = {
  title?: string;
  data: BirthDetailsFormData;
  onChange: (data: BirthDetailsFormData) => void;
  showQuickActions?: boolean;
  compact?: boolean;
};

export function BirthDetailsForm({ title, data, onChange, showQuickActions = true, compact = false }: BirthDetailsFormProps) {
  const [locationLoading, setLocationLoading] = useState(false);
  const updateField = (field: keyof BirthDetailsFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  async function handleCurrentLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Please enter location manually.");
      return;
    }

    setLocationLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          reject, 
          {
            timeout: 15000,
            enableHighAccuracy: false,
            maximumAge: 60000
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
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

        if (response.ok) {
          const data = await response.json();
          const address = data.address || {};
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
          
          updateField("place", placeName);
        } else {
          updateField("place", `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
        updateField("place", `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (error: any) {
      let errorMessage = "Unable to get your location. Please enter manually.";
      
      if (error.code === 1) {
        errorMessage = "Location access denied. Please enable location permissions in your browser settings.";
      } else if (error.code === 2) {
        errorMessage = "Location unavailable. Your device may not have GPS or location services disabled.";
      } else if (error.code === 3) {
        errorMessage = "Location request timed out. Please check your internet connection and try again.";
      }
      
      alert(errorMessage);
    } finally {
      setLocationLoading(false);
    }
  }

  function handleNow() {
    const now = new Date();
    // IMPORTANT: Update all fields in a single onChange call.
    // If we call updateField multiple times in the same tick, we spread stale `data`
    // and each call overwrites previous fields (parent can't re-render between calls).
    onChange({
      ...data,
      day: now.getDate().toString(),
      month: (now.getMonth() + 1).toString(),
      year: now.getFullYear().toString(),
      hours: now.getHours().toString().padStart(2, "0"),
      minutes: now.getMinutes().toString().padStart(2, "0"),
      seconds: now.getSeconds().toString().padStart(2, "0"),
    });
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {title && <div className="text-lg font-semibold text-slate-900 mb-3">{title}</div>}
      
      {/* Name */}
      <div>
        <div className="text-sm font-semibold text-slate-700 mb-2">Name</div>
        <Input
          value={data.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Enter name"
        />
      </div>

      {/* Gender */}
      <div>
        <div className="text-sm font-semibold text-slate-700 mb-2">Gender</div>
        <div className="flex gap-4">
          <button
            onClick={() => updateField("gender", "Male")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              data.gender === "Male"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Male
          </button>
          <button
            onClick={() => updateField("gender", "Female")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              data.gender === "Female"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Female
          </button>
        </div>
      </div>

      {/* Date */}
      <div>
        <div className="text-sm font-semibold text-slate-700 mb-2">Date of Birth</div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-xs text-slate-600 mb-1">Day</div>
            <Input
              type="number"
              value={data.day}
              onChange={(e) => updateField("day", e.target.value)}
              placeholder="DD"
              min="1"
              max="31"
            />
          </div>
          <div>
            <div className="text-xs text-slate-600 mb-1">Month</div>
            <select
              value={data.month}
              onChange={(e) => updateField("month", e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200/50"
            >
              <option value="">Select Month</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-xs text-slate-600 mb-1">Year</div>
            <Input
              type="number"
              value={data.year}
              onChange={(e) => updateField("year", e.target.value)}
              placeholder="YYYY"
              min="1900"
              max="2100"
            />
          </div>
        </div>
      </div>

      {/* Time */}
      <div>
        <div className="text-sm font-semibold text-slate-700 mb-2">Time of Birth</div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-xs text-slate-600 mb-1">Hours</div>
            <Input
              type="number"
              value={data.hours}
              onChange={(e) => updateField("hours", e.target.value)}
              placeholder="HH"
              min="0"
              max="23"
            />
          </div>
          <div>
            <div className="text-xs text-slate-600 mb-1">Minutes</div>
            <Input
              type="number"
              value={data.minutes}
              onChange={(e) => updateField("minutes", e.target.value)}
              placeholder="MM"
              min="0"
              max="59"
            />
          </div>
          <div>
            <div className="text-xs text-slate-600 mb-1">Seconds</div>
            <Input
              type="number"
              value={data.seconds}
              onChange={(e) => updateField("seconds", e.target.value)}
              placeholder="SS"
              min="0"
              max="59"
            />
          </div>
        </div>
      </div>

      {/* Place */}
      <div>
        <div className="text-sm font-semibold text-slate-700 mb-2">Place of Birth</div>
        <div className="flex gap-3">
          <div className="flex-1">
            <AutocompleteInput
              value={data.place}
              onChange={(value) => updateField("place", value)}
              placeholder="Start typing city name (e.g., Delhi, Mumbai)..."
              className="w-full"
              prioritizeIndia={true}
            />
          </div>
          {showQuickActions && (
            <Button variant="secondary" onClick={handleCurrentLocation}>
              📍 Location
            </Button>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-2">Autocomplete will suggest cities as you type</p>
      </div>

      {/* Quick Actions */}
      {showQuickActions && (
        <div className="flex items-center gap-3 pt-2">
          <Button variant="secondary" onClick={handleNow} className="text-sm">
            ⏰ NOW
          </Button>
        </div>
      )}
    </div>
  );
}

