"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { LuckyElements } from "@/lib/lifeReportAnalysis";

type LuckyElementsSectionProps = {
  elements: LuckyElements;
};

export function LuckyElementsSection({ elements }: LuckyElementsSectionProps) {
  return (
    <Card className="print:border-0 print:shadow-none">
      <CardHeader eyebrow="Lucky Elements" title="Your Lucky Elements & Favorable Factors" icon="🍀" />
      <CardContent>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {/* Lucky Colors */}
          <div className="p-4 rounded-xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50">
            <div className="text-sm font-bold text-rose-900 mb-3 flex items-center gap-2">
              <span>🎨</span>
              <span>Lucky Colors</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {elements.colors.map((color, idx) => (
                <Badge key={idx} tone="red" className="text-xs">
                  {color}
                </Badge>
              ))}
            </div>
          </div>

          {/* Lucky Numbers */}
          <div className="p-4 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
              <span>🔢</span>
              <span>Lucky Numbers</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {elements.numbers.map((num, idx) => (
                <Badge key={idx} tone="blue" className="text-xs">
                  {num}
                </Badge>
              ))}
            </div>
          </div>

          {/* Favorable Directions */}
          <div className="p-4 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
            <div className="text-sm font-bold text-emerald-900 mb-3 flex items-center gap-2">
              <span>🧭</span>
              <span>Directions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {elements.directions.map((dir, idx) => (
                <Badge key={idx} tone="emerald" className="text-xs">
                  {dir}
                </Badge>
              ))}
            </div>
          </div>

          {/* Lucky Gemstones */}
          <div className="p-4 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <div className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
              <span>💎</span>
              <span>Gemstones</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {elements.gemstones.map((stone, idx) => (
                <Badge key={idx} tone="indigo" className="text-xs">
                  {stone}
                </Badge>
              ))}
            </div>
            <div className="text-xs text-slate-600 mt-2">
              Consult expert before wearing
            </div>
          </div>

          {/* Lucky Metals */}
          <div className="p-4 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
              <span>⚙️</span>
              <span>Metals</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {elements.metals.map((metal, idx) => (
                <Badge key={idx} tone="amber" className="text-xs">
                  {metal}
                </Badge>
              ))}
            </div>
          </div>

          {/* Lucky Days */}
          <div className="p-4 rounded-xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
            <div className="text-sm font-bold text-teal-900 mb-3 flex items-center gap-2">
              <span>📅</span>
              <span>Favorable Days</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {elements.days.map((day, idx) => (
                <Badge key={idx} tone="teal" className="text-xs">
                  {day}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

