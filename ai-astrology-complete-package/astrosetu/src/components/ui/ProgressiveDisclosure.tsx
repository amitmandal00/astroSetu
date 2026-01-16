/**
 * Progressive Disclosure Component
 * Shows simple summary first, expands to show detailed explanation (P1 enhancement)
 * Helps non-expert users understand astrology terms
 */

"use client";

import { useState } from "react";
import { clsx } from "clsx";

interface TermDefinition {
  term: string;
  simpleExplanation: string;
  detailedExplanation: string;
  relatedTerms?: string[];
}

// Common astrology terms dictionary
export const ASTROLOGY_TERMS: Record<string, TermDefinition> = {
  "Ayanamsa": {
    term: "Ayanamsa",
    simpleExplanation: "The difference between sidereal (star-based) and tropical (season-based) zodiacs",
    detailedExplanation: "Ayanamsa is the angular difference between the sidereal and tropical zodiacs. Different calculation methods exist (Lahiri, Raman, KP), each using slightly different reference points. This affects where planets appear in your chart.",
    relatedTerms: ["Lahiri", "Raman", "Sidereal", "Tropical"]
  },
  "Nakshatra": {
    term: "Nakshatra",
    simpleExplanation: "One of 27 lunar mansions in Vedic astrology",
    detailedExplanation: "Nakshatras are 27 equal divisions of the ecliptic, each spanning 13°20'. The Moon's position at birth determines your birth Nakshatra, influencing personality traits, compatibility, and auspicious timings.",
    relatedTerms: ["Moon", "Lunar Mansions", "Rashi"]
  },
  "Rashi": {
    term: "Rashi",
    simpleExplanation: "Your Moon sign (the zodiac sign the Moon was in at birth)",
    detailedExplanation: "Rashi is the zodiac sign occupied by the Moon at the time of birth. It represents your emotional nature, mental disposition, and inner self. Different from the Sun sign in Western astrology.",
    relatedTerms: ["Moon Sign", "Zodiac Sign", "Nakshatra"]
  },
  "Lagna": {
    term: "Lagna",
    simpleExplanation: "Your Ascendant (the zodiac sign rising on the eastern horizon at birth)",
    detailedExplanation: "Lagna (Ascendant) is the zodiac sign that was rising on the eastern horizon at your exact time and place of birth. It represents your physical appearance, personality, and how you present yourself to the world. It's the first house in your birth chart.",
    relatedTerms: ["Ascendant", "First House", "Rising Sign"]
  },
  "Dasha": {
    term: "Dasha",
    simpleExplanation: "Planetary periods that influence different phases of your life",
    detailedExplanation: "Dasha systems divide your life into periods ruled by different planets. The most common is Vimshottari Dasha (120 years total). Each planet's period brings its specific influences, affecting career, relationships, health, and other life areas.",
    relatedTerms: ["Vimshottari", "Planetary Periods", "Transits"]
  },
  "Dosha": {
    term: "Dosha",
    simpleExplanation: "Planetary afflictions that may cause challenges in specific life areas",
    detailedExplanation: "Doshas are planetary combinations that can create challenges. Common doshas include Mangal Dosha (Mars-related), Kaal Sarp Dosha (Rahu-Ketu), and others. Remedies and rituals can help mitigate their effects.",
    relatedTerms: ["Mangal Dosha", "Kaal Sarp Dosha", "Remedies"]
  },
  "Tithi": {
    term: "Tithi",
    simpleExplanation: "Lunar day (1-30) based on the Moon's position relative to the Sun",
    detailedExplanation: "Tithi is the lunar day, calculated as the angular distance between the Moon and Sun. There are 30 tithis in a lunar month, each with specific characteristics. Different tithis are considered auspicious for different activities.",
    relatedTerms: ["Lunar Calendar", "Paksha", "Moon Phase"]
  }
};

interface ProgressiveDisclosureProps {
  term: string;
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

export function ProgressiveDisclosure({ 
  term, 
  children,
  className,
  showIcon = true 
}: ProgressiveDisclosureProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const definition = ASTROLOGY_TERMS[term] || null;

  // If no definition and no children, just return the term
  if (!definition && !children) {
    return <span className={className}>{term}</span>;
  }

  // If children provided, use them as the explanation
  const simpleExplanation = definition?.simpleExplanation || (children ? "Learn more" : "");
  const detailedExplanation = definition?.detailedExplanation || "";

  return (
    <span className={clsx("inline-flex items-center gap-1", className)}>
      <span className="font-semibold">{term}</span>
      {showIcon && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="inline-flex items-center justify-center w-4 h-4 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
          title={isExpanded ? "Hide explanation" : "What does this mean?"}
          aria-label={`${isExpanded ? "Hide" : "Show"} explanation for ${term}`}
        >
          {isExpanded ? "−" : "ℹ️"}
        </button>
      )}
      
      {isExpanded && (
        <div className="absolute z-10 mt-6 left-0 right-0 max-w-md bg-white border-2 border-indigo-200 rounded-xl shadow-lg p-4 text-sm">
          <div className="font-semibold text-slate-900 mb-2">{term}</div>
          {definition && (
            <>
              <p className="text-slate-700 mb-3 leading-relaxed">{simpleExplanation}</p>
              <details className="mt-2">
                <summary className="cursor-pointer text-indigo-600 hover:text-indigo-700 font-medium mb-2">
                  Know more
                </summary>
                <p className="text-slate-600 mt-2 leading-relaxed">{detailedExplanation}</p>
                {definition.relatedTerms && definition.relatedTerms.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="text-xs font-semibold text-slate-500 mb-1">Related:</div>
                    <div className="flex flex-wrap gap-1">
                      {definition.relatedTerms.map((related) => (
                        <span
                          key={related}
                          className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded"
                        >
                          {related}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </details>
            </>
          )}
          {children && (
            <div className="text-slate-700 leading-relaxed">{children}</div>
          )}
        </div>
      )}
    </span>
  );
}

/**
 * Simple tooltip version for inline use
 */
export function TermTooltip({ term, children }: { term: string; children: React.ReactNode }) {
  const definition = ASTROLOGY_TERMS[term];
  if (!definition) return <>{children}</>;

  return (
    <span className="group relative inline-block">
      <span className="underline decoration-dotted decoration-indigo-400 cursor-help">
        {children}
      </span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
        {definition.simpleExplanation}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></span>
      </span>
    </span>
  );
}

