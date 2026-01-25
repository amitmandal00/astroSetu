/**
 * Inauspicious Period Component
 * Displays Rahu Kalam, Yamagandam, Gulika Kalam, Durmuhurat
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { apiGet } from "@/lib/http";

type InauspiciousPeriodProps = {
  date: string;
  latitude?: number;
  longitude?: number;
};

type InauspiciousPeriodData = {
  periods: Array<{
    name: string;
    start: string;
    end: string;
    description?: string;
  }>;
  rahuKalam?: {
    start: string;
    end: string;
  };
  yamagandam?: {
    start: string;
    end: string;
  };
  gulikaKalam?: {
    start: string;
    end: string;
  };
  durmuhurat?: {
    start: string;
    end: string;
  };
  recommendations?: string[];
};

export function InauspiciousPeriod({ date, latitude, longitude }: InauspiciousPeriodProps) {
  const [data, setData] = useState<InauspiciousPeriodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInauspiciousPeriod() {
      if (!latitude || !longitude) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams({
          date,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        });

        const res = await apiGet<{ ok: boolean; data?: InauspiciousPeriodData; error?: string }>(
          `/api/astrology/inauspicious-period?${params.toString()}`
        );

        if (!res.ok) throw new Error(res.error || "Failed to fetch inauspicious periods");
        setData(res.data || null);
      } catch (e: any) {
        console.log("[InauspiciousPeriod] Could not fetch data:", e);
        setError(e?.message || "Inauspicious period data not available");
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchInauspiciousPeriod();
  }, [date, latitude, longitude]);

  if (loading) {
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
            <div className="animate-spin text-4xl mb-2">🌙</div>
            <div className="text-sm">Loading inauspicious periods...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
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
            <div className="text-4xl mb-2">⏰</div>
            <div className="text-sm">{error || "Inauspicious period data not available"}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const periods = [
    data.rahuKalam ? { name: "Rahu Kalam", start: data.rahuKalam.start, end: data.rahuKalam.end, description: "Avoid starting new ventures" } : null,
    data.yamagandam ? { name: "Yamagandam", start: data.yamagandam.start, end: data.yamagandam.end, description: "Avoid important activities" } : null,
    data.gulikaKalam ? { name: "Gulika Kalam", start: data.gulikaKalam.start, end: data.gulikaKalam.end, description: "Avoid beginning new tasks" } : null,
    data.durmuhurat ? { name: "Durmuhurat", start: data.durmuhurat.start, end: data.durmuhurat.end, description: "Avoid auspicious activities" } : null,
    ...(data.periods || []),
  ].filter(Boolean) as Array<{ name: string; start: string; end: string; description?: string }>;

  return (
    <Card>
      <CardHeader 
        eyebrow="Inauspicious Periods" 
        title="Avoid These Times" 
        subtitle="Rahu Kalam, Yamagandam, Gulika Kalam, and Durmuhurat"
        icon="⏰"
      />
      <CardContent>
        <div className="space-y-4">
          {periods.length > 0 ? (
            periods.map((period, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-lg text-red-900">{period.name}</div>
                    {period.description && (
                      <div className="text-sm text-red-700 mt-1">{period.description}</div>
                    )}
                  </div>
                  <Badge tone="red" className="text-xs">
                    Avoid
                  </Badge>
                </div>
                <div className="mt-3 pt-3 border-t border-red-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs font-semibold text-red-600 mb-1">Start Time</div>
                      <div className="text-red-900 font-bold">{period.start}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-red-600 mb-1">End Time</div>
                      <div className="text-red-900 font-bold">{period.end}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-sm">No inauspicious periods detected for this date</div>
            </div>
          )}

          {data.recommendations && data.recommendations.length > 0 && (
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="text-sm font-semibold text-amber-900 mb-2">Recommendations:</div>
              <ul className="text-sm text-amber-800 space-y-1">
                {data.recommendations.map((rec, idx) => (
                  <li key={idx}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

