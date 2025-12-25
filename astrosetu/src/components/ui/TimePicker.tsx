"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "./Input";
import { clsx } from "clsx";

type TimePickerProps = {
  value: string; // Format: "HH:mm" or "HH:mm:ss"
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  showSeconds?: boolean;
};

export function TimePicker({
  value,
  onChange,
  className,
  placeholder = "HH:mm",
  disabled,
  required,
  showSeconds = false,
}: TimePickerProps) {
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Parse value on mount or when value changes
  useEffect(() => {
    if (value) {
      const parts = value.split(":");
      if (parts.length >= 2) {
        setHours(parts[0].padStart(2, "0"));
        setMinutes(parts[1].padStart(2, "0"));
        if (parts.length >= 3 && showSeconds) {
          setSeconds(parts[2].padStart(2, "0"));
        }
      }
    } else {
      setHours("00");
      setMinutes("00");
      setSeconds("00");
    }
  }, [value, showSeconds]);

  // Update parent when time changes
  useEffect(() => {
    const timeString = showSeconds 
      ? `${hours}:${minutes}:${seconds}`
      : `${hours}:${minutes}`;
    if (timeString !== value && (hours !== "00" || minutes !== "00" || seconds !== "00")) {
      onChange(timeString);
    }
  }, [hours, minutes, seconds, showSeconds, onChange, value]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPicker]);

  const generateNumbers = (max: number, current: string) => {
    return Array.from({ length: max + 1 }, (_, i) => {
      const num = i.toString().padStart(2, "0");
      return num;
    });
  };

  const handleHourChange = (hour: string) => {
    setHours(hour);
  };

  const handleMinuteChange = (minute: string) => {
    setMinutes(minute);
  };

  const handleSecondChange = (second: string) => {
    setSeconds(second);
  };

  const displayValue = showSeconds 
    ? `${hours}:${minutes}:${seconds}`
    : `${hours}:${minutes}`;

  return (
    <div className={clsx("relative", className)} ref={pickerRef}>
      <Input
        type="text"
        value={displayValue}
        onChange={(e) => {
          // Allow manual input
          const input = e.target.value;
          const timeRegex = showSeconds 
            ? /^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/
            : /^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
          
          if (timeRegex.test(input) || input === "") {
            onChange(input);
          }
        }}
        onFocus={() => setShowPicker(true)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        readOnly={false}
      />
      
      {/* Clock Icon Button */}
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-saffron-600 transition-colors"
        aria-label="Open time picker"
      >
        <span className="text-xl">🕐</span>
      </button>

      {/* Time Picker Dropdown */}
      {showPicker && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-slate-300 rounded-xl shadow-xl p-4 max-w-md">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {/* Hours */}
            <div className="flex flex-col items-center flex-1">
              <div className="text-xs font-semibold text-slate-600 mb-2">Hours</div>
              <div className="h-40 overflow-y-auto scrollbar-hide border-2 border-slate-200 rounded-lg w-full">
                {generateNumbers(23, hours).map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleHourChange(hour)}
                    className={clsx(
                      "w-full px-3 py-2 text-center transition-colors text-sm",
                      hours === hour
                        ? "bg-saffron-600 text-white font-bold"
                        : "hover:bg-saffron-50 text-slate-700"
                    )}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-slate-400 mt-6">:</div>

            {/* Minutes */}
            <div className="flex flex-col items-center flex-1">
              <div className="text-xs font-semibold text-slate-600 mb-2">Minutes</div>
              <div className="h-40 overflow-y-auto scrollbar-hide border-2 border-slate-200 rounded-lg w-full">
                {generateNumbers(59, minutes).map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleMinuteChange(minute)}
                    className={clsx(
                      "w-full px-3 py-2 text-center transition-colors text-sm",
                      minutes === minute
                        ? "bg-saffron-600 text-white font-bold"
                        : "hover:bg-saffron-50 text-slate-700"
                    )}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>

            {/* Seconds (if enabled) */}
            {showSeconds && (
              <>
                <div className="text-xl sm:text-2xl font-bold text-slate-400 mt-6">:</div>
                <div className="flex flex-col items-center flex-1">
                  <div className="text-xs font-semibold text-slate-600 mb-2">Seconds</div>
                  <div className="h-40 overflow-y-auto scrollbar-hide border-2 border-slate-200 rounded-lg w-full">
                    {generateNumbers(59, seconds).map((second) => (
                      <button
                        key={second}
                        type="button"
                        onClick={() => handleSecondChange(second)}
                        className={clsx(
                          "w-full px-3 py-2 text-center transition-colors text-sm",
                          seconds === second
                            ? "bg-saffron-600 text-white font-bold"
                            : "hover:bg-saffron-50 text-slate-700"
                        )}
                      >
                        {second}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setHours(now.getHours().toString().padStart(2, "0"));
                setMinutes(now.getMinutes().toString().padStart(2, "0"));
                if (showSeconds) {
                  setSeconds(now.getSeconds().toString().padStart(2, "0"));
                }
              }}
              className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold text-slate-700 transition-colors"
            >
              ⏰ Current Time
            </button>
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="flex-1 px-4 py-2 bg-saffron-600 hover:bg-saffron-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              ✓ Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

