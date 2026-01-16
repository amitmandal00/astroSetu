"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "./Input";
import { clsx } from "clsx";
import { searchLocalCities, resolvePlaceCoordinates, type CityData } from "@/lib/indianCities";

export type PlaceSuggestion = {
  name: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  displayName?: string;
};

type AutocompleteInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (place: PlaceSuggestion) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  prioritizeIndia?: boolean;
};

export function AutocompleteInput({
  value,
  onChange,
  onSelect,
  placeholder = "Enter city name",
  className,
  debounceMs = 300,
  prioritizeIndia = true
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [apiFailed, setApiFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setError(null);
      setApiFailed(false); // Reset API failure flag when user clears input
      return;
    }

    // Don't fetch suggestions if input is not focused
    if (!isFocused) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    setError(null);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        // STEP 1: Always check local database first (fast, reliable, no API needed)
        const localMatches = searchLocalCities(value, 8);
        
        if (localMatches.length > 0) {
          const localSuggestions: PlaceSuggestion[] = localMatches.map(city => ({
            name: city.name,
            state: city.state,
            country: city.country,
            latitude: city.latitude,
            longitude: city.longitude,
            displayName: city.displayName
          }));
          
          setSuggestions(localSuggestions);
          setShowSuggestions(localSuggestions.length > 0 && isFocused);
          setLoading(false);
          setApiFailed(false);
          setError(null);
          
          // If we have good local matches, don't call API (saves rate limits)
          if (localMatches.length >= 3 || localMatches.some(c => c.name.toLowerCase().startsWith(value.toLowerCase()))) {
            return;
          }
        }

        // STEP 2: Try API as supplement (only if local didn't give enough results)
        // Only try API if we haven't failed recently
        if (!apiFailed) {
          try {
            const countryCode = prioritizeIndia ? "&countrycodes=in" : "";
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
            
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}${countryCode}&limit=8&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'AstroSetu/1.0 (https://astrosage.com)'
                },
                signal: controller.signal
              }
            );
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
              throw new Error(`API returned ${response.status}`);
            }

            const data = await response.json();
            
            if (Array.isArray(data) && data.length > 0) {
              const apiPlaces: PlaceSuggestion[] = data.map((item: any) => {
                const address = item.address || {};
                const cityName = address.city || address.town || address.village || address.county || item.display_name.split(',')[0];
                const state = address.state || address.region || address.state_district;
                const country = address.country || "India";
                
                return {
                  name: cityName,
                  state: state,
                  country: country,
                  latitude: parseFloat(item.lat),
                  longitude: parseFloat(item.lon),
                  displayName: item.display_name
                };
              });

              // Merge local and API results, removing duplicates
              const allSuggestions: PlaceSuggestion[] = [...localMatches.map(c => ({
                name: c.name,
                state: c.state,
                country: c.country,
                latitude: c.latitude,
                longitude: c.longitude,
                displayName: c.displayName
              } as PlaceSuggestion))];
              
              // Add API results that aren't already in local
              for (const apiPlace of apiPlaces) {
                const isDuplicate = allSuggestions.some(
                  s => s.name.toLowerCase() === apiPlace.name.toLowerCase() && 
                       s.state?.toLowerCase() === apiPlace.state?.toLowerCase()
                );
                if (!isDuplicate) {
                  allSuggestions.push(apiPlace);
                }
              }

              // Sort: Indian cities first if prioritizeIndia is true
              if (prioritizeIndia) {
                allSuggestions.sort((a, b) => {
                  const aIsIndia = a.country?.toLowerCase() === "india";
                  const bIsIndia = b.country?.toLowerCase() === "india";
                  if (aIsIndia && !bIsIndia) return -1;
                  if (!aIsIndia && bIsIndia) return 1;
                  return 0;
                });
              }

              setSuggestions(allSuggestions.slice(0, 10));
              setShowSuggestions(allSuggestions.length > 0 && isFocused);
              setError(null);
              setApiFailed(false);
            } else {
              // API returned empty, but we might have local results
              if (localMatches.length > 0) {
                setSuggestions(localMatches.map(c => ({
                  name: c.name,
                  state: c.state,
                  country: c.country,
                  latitude: c.latitude,
                  longitude: c.longitude,
                  displayName: c.displayName
                })));
                setShowSuggestions(true);
                setError(null);
              } else {
                setSuggestions([]);
                setShowSuggestions(false);
                // Don't show error - user can still type manually
              }
            }
          } catch (apiError: any) {
            console.warn("Nominatim API failed (this is OK, using local database):", apiError.message);
            // Mark API as failed to avoid repeated calls
            setApiFailed(true);
            
            // Use local results if available
            if (localMatches.length > 0) {
              setSuggestions(localMatches.map(c => ({
                name: c.name,
                state: c.state,
                country: c.country,
                latitude: c.latitude,
                longitude: c.longitude,
                displayName: c.displayName
              })));
              setShowSuggestions(true);
              setError(null);
            } else {
              setSuggestions([]);
              setShowSuggestions(false);
              // Don't show persistent error - user can still proceed
            }
          }
        } else {
          // API already failed, just use local
          if (localMatches.length > 0) {
            setSuggestions(localMatches.map(c => ({
              name: c.name,
              state: c.state,
              country: c.country,
              latitude: c.latitude,
              longitude: c.longitude,
              displayName: c.displayName
            })));
            setShowSuggestions(true);
            setError(null);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      } catch (error: any) {
        console.error("Unexpected error in autocomplete:", error);
        setSuggestions([]);
        setShowSuggestions(false);
        // Don't show error - allow manual entry
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, debounceMs, prioritizeIndia, isFocused, apiFailed]);

  const handleSelect = (place: PlaceSuggestion) => {
    // Use displayName if available, otherwise construct it
    const displayName = place.displayName || 
      (place.state 
        ? `${place.name}, ${place.state}${place.country && place.country !== place.state ? `, ${place.country}` : ''}`
        : place.name);
    onChange(displayName);
    if (onSelect) {
      onSelect(place);
    }
    // Immediately hide dropdown
    setShowSuggestions(false);
    setIsFocused(false);
    setSelectedIndex(-1);
    // Clear suggestions to prevent them from showing again
    setSuggestions([]);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setIsFocused(true);
          // Show existing suggestions if available
          // New suggestions will be fetched by useEffect when focused
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        onBlur={(e) => {
          // Check if blur is due to clicking on a suggestion
          const relatedTarget = e.relatedTarget as HTMLElement;
          const clickedOnSuggestion = suggestionsRef.current?.contains(relatedTarget);
          
          if (!clickedOnSuggestion) {
            // Delay hiding to allow click on suggestion
            setTimeout(() => {
              setIsFocused(false);
              setShowSuggestions(false);
            }, 150);
          }
        }}
        placeholder={placeholder}
        className={className}
      />
      
      {/* Error message - only show if it's a real blocking error, not just API failure */}
      {error && !loading && error.includes("No places found") && (
        <div className="absolute z-50 w-full mt-1 bg-amber-50 border-2 border-amber-200 rounded-xl shadow-lg p-3">
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <span>💡</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border-2 border-slate-300 rounded-xl shadow-xl max-h-64 overflow-y-auto scrollbar-hide"
        >
          {loading && (
            <div className="px-4 py-3 text-sm text-slate-600 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-saffron-600"></div>
              <span>Searching places...</span>
            </div>
          )}
          {!loading && suggestions.map((place, index) => {
            const displayName = place.displayName || 
              (place.state 
                ? `${place.name}, ${place.state}${place.country && place.country !== place.state ? `, ${place.country}` : ''}`
                : place.name);
            const isIndia = place.country?.toLowerCase() === "india";
            
            return (
              <button
                key={index}
                type="button"
                onMouseDown={(e) => {
                  // Prevent input blur when clicking suggestion
                  e.preventDefault();
                  handleSelect(place);
                }}
                onClick={() => handleSelect(place)}
                className={clsx(
                  "w-full text-left px-4 py-3 hover:bg-saffron-50 transition-colors border-b border-slate-100 last:border-0",
                  selectedIndex === index && "bg-saffron-50 border-saffron-200"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{isIndia ? "🇮🇳" : "📍"}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{place.name}</div>
                    {(place.state || place.country) && (
                      <div className="text-xs text-slate-600 mt-0.5">
                        {[place.state, place.country].filter(Boolean).join(", ")}
                      </div>
                    )}
                  </div>
                  {place.latitude && place.longitude && (
                    <div className="text-xs text-slate-400">
                      {place.latitude.toFixed(2)}, {place.longitude.toFixed(2)}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

