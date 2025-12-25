"use client";

import { useState, useEffect, forwardRef } from "react";
import { Input } from "./Input";
import { clsx } from "clsx";

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
};

const COUNTRY_CODES = [
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+1", name: "US/Canada", flag: "🇺🇸" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+44", name: "UK", flag: "🇬🇧" },
  { code: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "+86", name: "China", flag: "🇨🇳" },
  { code: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "+82", name: "South Korea", flag: "🇰🇷" },
  { code: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+974", name: "Qatar", flag: "🇶🇦" },
  { code: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "+33", name: "France", flag: "🇫🇷" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "+31", name: "Netherlands", flag: "🇳🇱" },
  { code: "+32", name: "Belgium", flag: "🇧🇪" },
  { code: "+41", name: "Switzerland", flag: "🇨🇭" },
  { code: "+46", name: "Sweden", flag: "🇸🇪" },
  { code: "+47", name: "Norway", flag: "🇳🇴" },
  { code: "+45", name: "Denmark", flag: "🇩🇰" },
  { code: "+358", name: "Finland", flag: "🇫🇮" },
  { code: "+7", name: "Russia", flag: "🇷🇺" },
  { code: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "+52", name: "Mexico", flag: "🇲🇽" },
  { code: "+54", name: "Argentina", flag: "🇦🇷" },
  { code: "+64", name: "New Zealand", flag: "🇳🇿" },
];

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, className, placeholder, disabled, required }, ref) => {
    const [countryCode, setCountryCode] = useState("+91");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    // Parse existing value
    useEffect(() => {
      if (value) {
        // Check if value already has country code
        const matchedCode = COUNTRY_CODES.find((cc) => value.startsWith(cc.code));
        if (matchedCode) {
          setCountryCode(matchedCode.code);
          setPhoneNumber(value.replace(matchedCode.code, "").trim());
        } else if (value.startsWith("+")) {
          // Has + but unknown code, extract first part
          const parts = value.split(" ");
          if (parts[0].match(/^\+\d{1,4}$/)) {
            setCountryCode(parts[0]);
            setPhoneNumber(parts.slice(1).join(" "));
          } else {
            setPhoneNumber(value);
          }
        } else {
          // No country code, assume Indian number
          setPhoneNumber(value);
        }
      }
    }, [value]);

    // Update parent when phone changes
    useEffect(() => {
      const fullNumber = phoneNumber.trim()
        ? `${countryCode} ${phoneNumber.trim()}`
        : "";
      if (fullNumber !== value) {
        onChange(fullNumber);
      }
    }, [countryCode, phoneNumber, onChange, value]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      // Allow only digits, spaces, hyphens, and parentheses
      const cleaned = input.replace(/[^\d\s\-()]/g, "");
      setPhoneNumber(cleaned);
    };

    const selectedCountry = COUNTRY_CODES.find((cc) => cc.code === countryCode);

    return (
      <div className={clsx("relative", className)}>
        <div className="flex gap-2">
          {/* Country Code Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={disabled}
              className={clsx(
                "flex items-center gap-1 px-3 py-3 rounded-xl border-2 border-slate-400 bg-white text-slate-900 text-sm font-semibold transition-all",
                "focus:border-saffron-500 focus:ring-2 focus:ring-saffron-200 focus:outline-none",
                "hover:border-slate-500 hover:bg-white hover:shadow-sm",
                "disabled:bg-slate-100 disabled:border-slate-300 disabled:cursor-not-allowed",
                showDropdown && "border-saffron-500 ring-2 ring-saffron-200"
              )}
              aria-label="Select country code"
              aria-expanded={showDropdown}
            >
              <span>{selectedCountry?.flag || "🌍"}</span>
              <span className="hidden sm:inline">{countryCode}</span>
              <span className="text-xs">▼</span>
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute top-full left-0 mt-1 z-20 bg-white border-2 border-slate-300 rounded-xl shadow-xl max-h-64 overflow-y-auto min-w-[200px]">
                  {COUNTRY_CODES.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        setCountryCode(country.code);
                        setShowDropdown(false);
                      }}
                      className={clsx(
                        "w-full px-4 py-2 text-left hover:bg-saffron-50 transition-colors flex items-center gap-2",
                        country.code === countryCode && "bg-saffron-100 font-semibold"
                      )}
                    >
                      <span>{country.flag}</span>
                      <span className="flex-1">{country.name}</span>
                      <span className="text-slate-600">{country.code}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Phone Number Input */}
          <Input
            ref={ref}
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder={placeholder || (countryCode === "+91" ? "9876543210" : "Enter phone number")}
            disabled={disabled}
            required={required}
            className="flex-1"
            maxLength={countryCode === "+91" ? 10 : 15}
          />
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Format: {countryCode === "+91" ? "10 digits" : "International format"}
        </div>
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

