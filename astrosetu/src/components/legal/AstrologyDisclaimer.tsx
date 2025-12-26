"use client";

import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";

interface AstrologyDisclaimerProps {
  variant?: "compact" | "full";
  className?: string;
}

export function AstrologyDisclaimer({ variant = "compact", className = "" }: AstrologyDisclaimerProps) {
  if (variant === "compact") {
    return (
      <Card className={`border-amber-200 bg-amber-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1 text-sm text-amber-900">
              <div className="font-semibold mb-1">Astrology Disclaimer</div>
              <p className="text-amber-800 leading-relaxed">
                Astrology is a belief-based system and not a science. Interpretations are for informational purposes only and should not be treated as deterministic facts. This service does not provide professional medical, legal, financial, or psychological advice. Please consult qualified experts for matters requiring licensed expertise.{" "}
                <Link href="/disclaimer" className="text-amber-700 underline font-medium hover:text-amber-900">
                  Read full disclaimer
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-amber-200 bg-amber-50 ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4 text-sm text-amber-900">
          <div className="flex items-center gap-2">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-lg font-bold">Important Astrology Disclaimer</h3>
          </div>
          <div className="space-y-2 text-amber-800">
            <p>
              <strong>Astrology is a belief-based system and NOT a science.</strong> The interpretations, predictions, and guidance provided through AstroSetu are for informational, entertainment, and guidance purposes only.
            </p>
            <p>
              <strong>We do not guarantee</strong> the accuracy, completeness, or reliability of any astrological predictions or interpretations. Astrological insights should not be treated as deterministic facts or absolute truths.
            </p>
            <p>
              <strong>This service does NOT provide:</strong> Professional medical, legal, financial, or psychological advice. Please consult qualified experts for matters requiring licensed expertise.
            </p>
            <p>
              <strong>Your Responsibility:</strong> Any decisions made based on astrological information are solely your responsibility. AstroSetu and its partners are not liable for any outcomes, consequences, or damages resulting from your use of astrological services.
            </p>
            <p>
              For critical life decisions (marriage, career, finance, health, legal matters), please consult appropriate licensed professionals in addition to or instead of relying solely on astrological guidance.
            </p>
            <p className="pt-2 border-t border-amber-300">
              <Link href="/disclaimer" className="text-amber-700 underline font-medium hover:text-amber-900">
                Read the complete disclaimer →
              </Link>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

