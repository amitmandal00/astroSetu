/**
 * Inauspicious Period Component
 * Placeholder in MVP (Prokerala removed)
 */

"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type InauspiciousPeriodProps = {
  date: string;
  latitude?: number;
  longitude?: number;
};

export function InauspiciousPeriod({ date, latitude, longitude }: InauspiciousPeriodProps) {
  return (
    <Card>
      <CardHeader
        eyebrow="Inauspicious Periods"
        title="Avoid These Times"
        subtitle="Rahu Kalam, Yamagandam, Gulika Kalam, and Durmuhurat"
        icon="⏰"
      />
      <CardContent>
        <div className="text-center py-8 text-slate-500">
          <div className="text-4xl mb-2">🧭</div>
          <div className="text-sm">Inauspicious period data is currently unavailable in this MVP build.</div>
          {!latitude || !longitude ? (
            <div className="mt-2 text-xs text-slate-400">Add coordinates to enable future calculations.</div>
          ) : null}
          <div className="mt-2 text-xs text-slate-400">Date: {date}</div>
        </div>
      </CardContent>
    </Card>
  );
}

