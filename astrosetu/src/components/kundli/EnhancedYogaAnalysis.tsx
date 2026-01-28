/**
 * Enhanced Yoga Analysis Component
 * Placeholder in MVP (Prokerala removed)
 */

"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { BirthDetails } from "@/types/astrology";

type EnhancedYogaAnalysisProps = {
  birthDetails: BirthDetails;
};

export function EnhancedYogaAnalysis({ birthDetails }: EnhancedYogaAnalysisProps) {
  return (
    <Card>
      <CardHeader
        eyebrow="Yogas"
        title="Planetary Combinations (Yogas)"
        subtitle="Important planetary combinations in your chart"
        icon="✨"
      />
      <CardContent>
        <div className="text-center py-8 text-slate-500">
          <div className="text-4xl mb-2">🧭</div>
          <div className="text-sm">Detailed yoga analysis is currently unavailable in this MVP build.</div>
          {!birthDetails.latitude || !birthDetails.longitude ? (
            <div className="mt-2 text-xs text-slate-400">Add birth coordinates to enable future analysis.</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

