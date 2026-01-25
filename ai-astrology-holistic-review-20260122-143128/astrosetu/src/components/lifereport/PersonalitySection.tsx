"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { PersonalityAnalysis } from "@/lib/lifeReportAnalysis";

type PersonalitySectionProps = {
  analysis: PersonalityAnalysis;
};

export function PersonalitySection({ analysis }: PersonalitySectionProps) {
  return (
    <Card className="print:border-0 print:shadow-none">
      <CardHeader eyebrow="Personality Analysis" title="Your Personality & Characteristics" icon="👤" />
      <CardContent className="space-y-6">
        {/* Nature & Behavior */}
        <div className="p-5 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
          <div className="text-sm font-semibold text-purple-900 mb-2">Nature & Behavior</div>
          <div className="text-sm text-slate-800 mb-1">
            <span className="font-semibold">Nature:</span> {analysis.nature}
          </div>
          <div className="text-sm text-slate-800">
            <span className="font-semibold">Behavior:</span> {analysis.behavior}
          </div>
        </div>

        {/* Traits */}
        {analysis.traits.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-slate-700 mb-3">Key Traits</div>
            <div className="flex flex-wrap gap-2">
              {analysis.traits.map((trait, idx) => (
                <Badge key={idx} tone="indigo" className="text-xs">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Strengths */}
        {analysis.strengths.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
              <span>✅</span>
              <span>Strengths</span>
            </div>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {analysis.weaknesses.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
              <span>⚠️</span>
              <span>Areas for Improvement</span>
            </div>
            <ul className="space-y-2">
              {analysis.weaknesses.map((weakness, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-amber-600 font-bold mt-0.5">•</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Characteristics */}
        {analysis.characteristics.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-slate-700 mb-3">Additional Characteristics</div>
            <ul className="space-y-1">
              {analysis.characteristics.map((char, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-slate-500 mt-0.5">•</span>
                  <span>{char}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

