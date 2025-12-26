"use client";

import { useState, useEffect, useRef } from "react";
import { i18n, type Language } from "@/lib/i18n";

export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentLang(i18n.getLanguage());
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        buttonRef.current &&
        dropdownRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    // Close on escape key
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "hi", label: "हिंदी", flag: "🇮🇳" }
  ];

  function handleLanguageChange(lang: Language) {
    if (lang === currentLang) {
      setIsOpen(false);
      return;
    }
    i18n.setLanguage(lang);
    setCurrentLang(lang);
    setIsOpen(false);
    // Reload page to apply translations (in production, use proper i18n library)
    window.location.reload();
  }

  const current = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <>
      <div ref={buttonRef} className="relative z-[60]">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center gap-1.5 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          <span className="text-sm">{current.flag}</span>
          <span className="hidden sm:inline">{current.label}</span>
          <span className={`text-xs transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[200]"
            onClick={() => setIsOpen(false)}
            onMouseDown={(e) => e.preventDefault()}
          />
          <div 
            ref={dropdownRef}
            className="fixed bg-white rounded-xl shadow-2xl border-2 border-slate-300 z-[201] min-w-[160px] overflow-hidden" 
            style={{
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`
            }}
            role="menu"
            aria-label="Language selection"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLanguageChange(lang.code);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleLanguageChange(lang.code);
                  }
                }}
                className={`w-full text-left px-4 py-3 hover:bg-saffron-50 transition-colors flex items-center gap-2 text-sm focus:outline-none focus:bg-saffron-50 ${
                  currentLang === lang.code ? "bg-saffron-50 font-semibold text-saffron-700" : "text-slate-700"
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="flex-1">{lang.label}</span>
                {currentLang === lang.code && <span className="text-saffron-600">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

