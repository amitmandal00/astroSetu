"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { apiGet } from "@/lib/http";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet<{ ok: boolean; data?: any; error?: string }>("/api/analytics/dashboard?days=7");
      if (!res.ok) throw new Error(res.error || "Failed to load analytics");
      setData(res.data);
    } catch (e: any) {
      setError(e?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-600 mx-auto mb-4"></div>
          <div className="text-slate-600">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-rose-700">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <Card className="shadow-xl">
        <CardHeader
          eyebrow="Analytics Dashboard"
          title="Telemetry & Events"
          subtitle={`Last ${data?.period || "7 days"}`}
          icon="📊"
        />
        <CardContent className="space-y-6">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-purple-50 border-2 border-purple-200">
              <div className="text-2xl font-bold text-purple-700 mb-1">{data?.summary?.kundliGenerated || 0}</div>
              <div className="text-sm text-purple-600">Kundli Generated</div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-200">
              <div className="text-2xl font-bold text-amber-700 mb-1">{data?.summary?.subscriptionEvents || 0}</div>
              <div className="text-sm text-amber-600">Subscription Events</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-200">
              <div className="text-2xl font-bold text-emerald-700 mb-1">{data?.summary?.authEvents || 0}</div>
              <div className="text-sm text-emerald-600">Auth Events</div>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
              <div className="text-2xl font-bold text-blue-700 mb-1">{data?.summary?.paymentEvents || 0}</div>
              <div className="text-sm text-blue-600">Payment Events</div>
            </div>
          </div>

          {/* Event Types */}
          {data?.eventTypes && Object.keys(data.eventTypes).length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 mb-3">Event Types</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(data.eventTypes).map(([type, count]) => (
                  <Badge key={type} tone="indigo">
                    {type}: {count as number}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recent Events */}
          {data?.recentEvents && data.recentEvents.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 mb-3">Recent Events</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {data.recentEvents.map((event: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900">{event.event_type}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {event.payload && Object.keys(event.payload).length > 0 && (
                      <div className="text-xs text-slate-600 mt-1">
                        {JSON.stringify(event.payload, null, 2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data?.message && (
            <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-200 text-sm text-amber-800">
              {data.message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
