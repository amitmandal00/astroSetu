"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type LifeAreaSectionProps = {
  title: string;
  icon: string;
  eyebrow?: string;
  overview: string;
  details?: string[];
  recommendations?: string[];
  tips?: string[];
  favorablePeriods?: string[];
  cautionPeriods?: string[];
  colorScheme?: "emerald" | "rose" | "blue" | "teal" | "amber" | "purple" | "indigo";
};

export function LifeAreaSection({
  title,
  icon,
  eyebrow,
  overview,
  details = [],
  recommendations = [],
  tips = [],
  favorablePeriods = [],
  cautionPeriods = [],
  colorScheme = "blue",
}: LifeAreaSectionProps) {
  const colorClasses = {
    emerald: {
      border: "border-emerald-200",
      bg: "bg-gradient-to-br from-emerald-50 to-green-50",
      text: "text-emerald-900",
      accent: "text-emerald-700",
    },
    rose: {
      border: "border-rose-200",
      bg: "bg-gradient-to-br from-rose-50 to-pink-50",
      text: "text-rose-900",
      accent: "text-rose-700",
    },
    blue: {
      border: "border-blue-200",
      bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
      text: "text-blue-900",
      accent: "text-blue-700",
    },
    teal: {
      border: "border-teal-200",
      bg: "bg-gradient-to-br from-teal-50 to-cyan-50",
      text: "text-teal-900",
      accent: "text-teal-700",
    },
    amber: {
      border: "border-amber-200",
      bg: "bg-gradient-to-br from-amber-50 to-orange-50",
      text: "text-amber-900",
      accent: "text-amber-700",
    },
    purple: {
      border: "border-purple-200",
      bg: "bg-gradient-to-br from-purple-50 to-indigo-50",
      text: "text-purple-900",
      accent: "text-purple-700",
    },
    indigo: {
      border: "border-indigo-200",
      bg: "bg-gradient-to-br from-indigo-50 to-purple-50",
      text: "text-indigo-900",
      accent: "text-indigo-700",
    },
  };

  const colors = colorClasses[colorScheme];

  return (
    <Card className="print:border-0 print:shadow-none">
      <CardHeader eyebrow={eyebrow} title={title} icon={icon} />
      <CardContent className="space-y-5">
        {/* Overview */}
        <div className={`p-5 rounded-xl border-2 ${colors.border} ${colors.bg}`}>
          <div className={`text-sm font-semibold ${colors.text} mb-2`}>Overview</div>
          <p className="text-sm text-slate-700 leading-relaxed">{overview}</p>
        </div>

        {/* Details */}
        {details.length > 0 && (
          <div>
            <div className={`text-sm font-semibold ${colors.accent} mb-3`}>Key Points</div>
            <div className="space-y-2">
              {details.map((detail, idx) => (
                <div key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className={`${colors.accent} font-bold mt-0.5`}>•</span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <div className={`text-sm font-semibold ${colors.accent} mb-3 flex items-center gap-2`}>
              <span>💡</span>
              <span>Recommendations</span>
            </div>
            <ul className="space-y-2">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tips */}
        {tips.length > 0 && (
          <div>
            <div className={`text-sm font-semibold ${colors.accent} mb-3 flex items-center gap-2`}>
              <span>✨</span>
              <span>Tips & Guidance</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tips.map((tip, idx) => (
                <Badge key={idx} tone="slate" className="text-xs">
                  {tip}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Favorable Periods */}
        {favorablePeriods.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
              <span>📈</span>
              <span>Favorable Periods</span>
            </div>
            <ul className="space-y-1">
              {favorablePeriods.map((period, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">•</span>
                  <span>{period}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Caution Periods */}
        {cautionPeriods.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
              <span>⚠️</span>
              <span>Caution Periods</span>
            </div>
            <ul className="space-y-1">
              {cautionPeriods.map((period, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>{period}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

