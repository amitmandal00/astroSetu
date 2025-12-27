/**
 * Subscription Dashboard
 * Manage premium subscription and view daily guidance
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { apiPost, apiGet } from "@/lib/http";
import type { AIAstrologyInput, DailyGuidance } from "@/lib/ai-astrology/types";
import { SUBSCRIPTION_PRICE } from "@/lib/ai-astrology/payments";

function SubscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [input, setInput] = useState<AIAstrologyInput | null>(null);
  const [guidance, setGuidance] = useState<DailyGuidance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Get input from sessionStorage
    const savedInput = sessionStorage.getItem("aiAstrologyInput");
    const subscriptionStatus = sessionStorage.getItem("aiAstrologySubscription") === "active";

    if (!savedInput) {
      router.push("/ai-astrology/input");
      return;
    }

    try {
      setInput(JSON.parse(savedInput));
      setIsSubscribed(subscriptionStatus);

      // Load today's guidance if subscribed
      if (subscriptionStatus) {
        loadDailyGuidance(JSON.parse(savedInput));
      }
    } catch (e) {
      console.error("Error parsing saved input:", e);
      router.push("/ai-astrology/input");
    }
  }, [router]);

  const loadDailyGuidance = async (inputData: AIAstrologyInput) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiPost<{
        ok: boolean;
        data?: DailyGuidance;
        error?: string;
      }>("/api/ai-astrology/daily-guidance", {
        input: inputData,
        date: new Date().toISOString().split("T")[0],
      });

      if (!response.ok) {
        throw new Error(response.error || "Failed to load daily guidance");
      }

      setGuidance(response.data || null);
    } catch (e: any) {
      console.error("Daily guidance error:", e);
      setError(e.message || "Failed to load daily guidance");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!input) return;

    try {
      setLoading(true);
      const response = await apiPost<{
        ok: boolean;
        data?: { url: string; sessionId: string };
        error?: string;
      }>("/api/ai-astrology/create-checkout", {
        subscription: true,
        input,
      });

      if (!response.ok) {
        throw new Error(response.error || "Failed to create subscription");
      }

      // Redirect to Stripe checkout
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (e: any) {
      setError(e.message || "Failed to initiate subscription");
      setLoading(false);
    }
  };

  if (!input) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/ai-astrology" className="text-sm text-purple-600 hover:text-purple-700 mb-4 inline-block">
            ← Back to AI Astrology
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
            Premium Subscription
          </h1>
          <p className="text-slate-600">
            Get personalized daily guidance every day
          </p>
        </div>

        {/* Subscription Status */}
        <Card className="bg-white shadow-lg border-2 border-purple-200 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-slate-900">Premium Subscription</h2>
                  {isSubscribed ? (
                    <Badge tone="green">Active</Badge>
                  ) : (
                    <Badge tone="gray">Not Subscribed</Badge>
                  )}
                </div>
                <p className="text-slate-600">
                  {isSubscribed
                    ? "You have access to daily personalized guidance"
                    : "Subscribe to receive daily personalized guidance"}
                </p>
              </div>
              {!isSubscribed && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    ${(SUBSCRIPTION_PRICE.amount / 100).toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-600">per month</div>
                </div>
              )}
            </div>

            {!isSubscribed && (
              <Button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {loading ? "Processing..." : "Subscribe Now →"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Daily Guidance */}
        {isSubscribed && (
          <Card className="bg-white shadow-lg border-2 border-purple-200 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Today's Guidance</h2>
                <Button
                  onClick={() => input && loadDailyGuidance(input)}
                  disabled={loading}
                  variant="secondary"
                  className="text-sm"
                >
                  {loading ? "Loading..." : "Refresh"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading && !guidance && (
                <div className="text-center py-8">
                  <div className="animate-spin text-4xl mb-4">🌙</div>
                  <p className="text-slate-600">Loading today's guidance...</p>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 mb-4">
                  {error}
                </div>
              )}

              {guidance && (
                <div className="space-y-6">
                  {/* Today is Good For */}
                  <div>
                    <h3 className="text-lg font-bold text-emerald-900 mb-3 flex items-center gap-2">
                      <span>✨</span> Today is Good For
                    </h3>
                    <ul className="space-y-2">
                      {guidance.todayGoodFor.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <span className="text-emerald-600 mt-1">✓</span>
                          <span className="text-slate-800">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Avoid Today */}
                  <div>
                    <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
                      <span>⚠️</span> Avoid Today
                    </h3>
                    <ul className="space-y-2">
                      {guidance.avoidToday.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <span className="text-amber-600 mt-1">✗</span>
                          <span className="text-slate-800">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div>
                    <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
                      <span>🎯</span> Recommended Actions
                    </h3>
                    <ul className="space-y-2">
                      {guidance.actions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                          <span className="text-indigo-600 mt-1">•</span>
                          <span className="text-slate-800">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Planetary Influence */}
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                    <h3 className="text-lg font-bold text-purple-900 mb-2">Planetary Influence</h3>
                    <p className="text-slate-700">{guidance.planetaryInfluence}</p>
                  </div>

                  {/* General Guidance */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Guidance</h3>
                    <p className="text-slate-700 leading-relaxed">{guidance.guidance}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Benefits */}
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
          <CardHeader>
            <h2 className="text-xl font-bold">Premium Benefits</h2>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-purple-600 text-xl">✓</span>
                <span className="text-slate-700">Personalized daily guidance based on your birth chart</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 text-xl">✓</span>
                <span className="text-slate-700">"Today is good for..." recommendations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 text-xl">✓</span>
                <span className="text-slate-700">"Avoid today..." warnings</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 text-xl">✓</span>
                <span className="text-slate-700">Actionable insights updated daily</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 text-xl">✓</span>
                <span className="text-slate-700">Planetary influence explanations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 text-xl">✓</span>
                <span className="text-slate-700">Cancel anytime</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🌙</div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  );
}

