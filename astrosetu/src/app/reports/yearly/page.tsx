"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { apiPost } from "@/lib/http";
import { session } from "@/lib/session";
import { checkSubscriptionStatus } from "@/lib/subscription";
import { logEvent, logError } from "@/lib/telemetry";
import { useSubscriptionPayment } from "@/components/payments/SubscriptionPayment";
import { getCurrentPricing } from "@/lib/pricing";

export default function YearlyReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [purchaseIntent, setPurchaseIntent] = useState(false);

  useEffect(() => {
    // Check subscription status
    checkSubscriptionStatus().then(setSubscription);
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setReportData(null);

    try {
      const savedKundli = session.getLatestKundli();
      if (!savedKundli) {
        setError("Please generate your Kundli first to get personalized yearly horoscope.");
        router.push("/kundli");
        return;
      }

      logEvent("yearly_report_request", { year, hasSubscription: subscription?.isActive });

      const res = await apiPost<{ ok: boolean; data?: any; error?: string; price?: number; message?: string }>(
        "/api/reports/yearly",
        {
          year,
          sign: savedKundli.rashi,
          rashi: savedKundli.rashi,
          kundliData: savedKundli,
          userId: session.getUser()?.id,
          purchaseIntent: purchaseIntent,
        }
      );

      if (!res.ok) {
        if (res.error === "subscription_required") {
          setError("This report requires AstroSetu Plus subscription or one-time purchase.");
          setPurchaseIntent(true);
          return;
        }
        throw new Error(res.error || "Failed to generate report");
      }

      setReportData(res.data);
      logEvent("yearly_report_generated", { year, hasSubscription: subscription?.isActive });
    } catch (e: any) {
      logError("yearly_report_error", e);
      setError(e?.message || "Failed to generate yearly horoscope report");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    // Redirect to premium page or handle one-time purchase
    router.push("/premium");
  };

  const handleDownloadPDF = () => {
    if (!reportData) return;
    // Use browser print for now (PDF generation can be enhanced later)
    window.print();
    logEvent("yearly_report_download", { year });
  };

  const savedKundli = session.getLatestKundli();
  const canGenerate = !!savedKundli;

  return (
    <div className="grid gap-6">
      <Card className="shadow-xl">
        <CardHeader
          eyebrow="Yearly Horoscope Report"
          title={`${year} Yearly Predictions`}
          subtitle="Comprehensive yearly horoscope with detailed predictions for all aspects of life"
          icon="📊"
        />
        <CardContent className="space-y-6">
          {!canGenerate && (
            <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-200">
              <p className="text-sm text-amber-800 mb-3">
                Please generate your Kundli first to get personalized yearly horoscope.
              </p>
              <Button onClick={() => router.push("/kundli")} className="bg-gradient-to-r from-amber-500 to-orange-500">
                Generate Kundli
              </Button>
            </div>
          )}

          {canGenerate && (
            <>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                    min={1900}
                    max={2100}
                    className="w-32 px-4 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  {loading ? "Generating..." : "Generate Report"}
                </Button>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-200">
                  <p className="text-sm text-rose-700 mb-3">{error}</p>
                  {purchaseIntent && (
                    <div className="flex gap-3">
                      <Button onClick={handlePurchase} className="bg-gradient-to-r from-amber-500 to-orange-500">
                        Subscribe to AstroSetu Plus
                      </Button>
                      <Button variant="secondary" onClick={() => setPurchaseIntent(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {reportData && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-emerald-900 text-lg">{reportData.title}</h3>
                        <p className="text-sm text-emerald-700">Generated for {savedKundli?.rashi || "Your Sign"}</p>
                      </div>
                      <Button onClick={handleDownloadPDF} variant="secondary">
                        📄 Download PDF
                      </Button>
                    </div>

                    {reportData.horoscope && (
                      <div className="space-y-3 text-sm text-slate-700">
                        {reportData.horoscope.overview && (
                          <div>
                            <div className="font-semibold text-slate-900 mb-1">Overview</div>
                            <p>{reportData.horoscope.overview}</p>
                          </div>
                        )}
                        {reportData.horoscope.predictions && reportData.horoscope.predictions.length > 0 && (
                          <div>
                            <div className="font-semibold text-slate-900 mb-2">Predictions</div>
                            <ul className="list-disc pl-5 space-y-1">
                              {reportData.horoscope.predictions.map((p: string, i: number) => (
                                <li key={i}>{p}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {!subscription?.isActive && (
                    <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-200">
                      <p className="text-sm text-amber-800 mb-3">
                        💎 Unlock unlimited reports with AstroSetu Plus subscription
                      </p>
                      <Button onClick={() => router.push("/premium")} variant="secondary">
                        View Plans
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
