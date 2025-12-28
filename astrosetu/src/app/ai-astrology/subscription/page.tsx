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
    // Check if sessionStorage is available
    if (typeof window === "undefined") return;
    
    try {
      // Get input from sessionStorage
      const savedInput = sessionStorage.getItem("aiAstrologyInput");
      const subscriptionStatus = sessionStorage.getItem("aiAstrologySubscription") === "active";

      if (!savedInput) {
        router.push("/ai-astrology/input");
        return;
      }

      const inputData = JSON.parse(savedInput);
      setInput(inputData);
      setIsSubscribed(subscriptionStatus);

      // Load today's guidance if subscribed
      if (subscriptionStatus) {
        loadDailyGuidance(inputData);
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
      // Note: API endpoint name remains "daily-guidance" for backward compatibility
      // but the content should be monthly-focused based on prompt updates
      const response = await apiPost<{
        ok: boolean;
        data?: DailyGuidance;
        error?: string;
      }>("/api/ai-astrology/daily-guidance", {
        input: inputData,
        date: new Date().toISOString().split("T")[0], // Current date - API can adapt to monthly view
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

      // Redirect to Stripe checkout (validate URL to prevent open redirects)
      if (response.data?.url) {
        const checkoutUrl = response.data.url;
        // Validate URL is from Stripe or is a relative path
        if (checkoutUrl.startsWith("https://checkout.stripe.com") || 
            checkoutUrl.startsWith("http://localhost") ||
            checkoutUrl.startsWith("/")) {
          window.location.href = checkoutUrl;
        } else {
          throw new Error("Invalid checkout URL");
        }
      }
    } catch (e: any) {
      setError(e.message || "Failed to initiate subscription");
      setLoading(false);
    }
  };

  if (!input) {
    // Should not happen as useEffect redirects, but handle gracefully
    return (
      <div className="cosmic-bg py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="cosmic-card">
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Loading...</h2>
              <p className="text-slate-600 mb-6">Please wait while we load your subscription information.</p>
              <Link href="/ai-astrology/input">
                <Button className="cosmic-button-secondary">Start Over</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="cosmic-bg py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/ai-astrology" className="text-sm text-purple-600 hover:text-purple-700 mb-4 inline-block">
            ← Back to AI Astrology
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-2">
            Monthly AI Astrology Outlook (Optional)
          </h1>
          <p className="text-slate-600 mb-3">
            Get a personalized monthly overview of focus areas, favorable themes, and guidance
          </p>
          <div className="inline-block p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              💡 Most users prefer one-time reports. This subscription is optional.
            </p>
          </div>
        </div>

        {/* Subscription Status */}
        <Card className="bg-white shadow-lg border-2 border-purple-200 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-slate-900">Monthly AI Astrology Outlook</h2>
                  {isSubscribed ? (
                    <Badge tone="green">Active</Badge>
                  ) : (
                    <Badge tone="neutral">Not Subscribed</Badge>
                  )}
                </div>
                <p className="text-slate-600">
                  {isSubscribed
                    ? "You have access to monthly personalized astrology outlooks"
                    : "Subscribe to receive monthly personalized astrology outlooks"}
                </p>
              </div>
              {!isSubscribed && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-700 mb-1">
                    AU${(SUBSCRIPTION_PRICE.amount / 100).toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-600">per month</div>
                  <div className="text-xs text-slate-500 mt-1">Cancel anytime</div>
                </div>
              )}
            </div>

            {!isSubscribed && (
              <Button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full mt-4 cosmic-button"
              >
                {loading ? "Processing..." : "Subscribe Now →"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Current Theme & Focus */}
        {isSubscribed && (
          <Card className="bg-white shadow-lg border-2 border-purple-200 mb-6">
            <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b-2 border-slate-200 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Current Theme & Focus</h2>
            </div>
            <CardContent>
              {/* Strong Boundary Text */}
              <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                <p className="text-sm font-semibold text-amber-900">
                  ⚠️ Important: This guidance is general and reflective, not advice or prediction.
                </p>
              </div>

              {loading && !guidance && (
                <div className="text-center py-8">
                  <div className="animate-spin text-4xl mb-4">🌙</div>
                  <p className="text-slate-600">Loading current theme...</p>
                </div>
              )}

              {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 mb-4">
                  {error}
                </div>
              )}

              {guidance && (
                <div className="space-y-6">
                  {/* Single Calm Theme Block */}
                  <div className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-blue-200 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span>📋</span> Guidance Theme (Educational)
                      </h3>
                    </div>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-800 leading-relaxed text-base whitespace-pre-wrap font-medium">
                        {guidance.guidance || "This period favors thoughtful action and steady progress. Avoid rushing decisions and maintain balance in daily routines."}
                      </p>
                    </div>
                  </div>

                  {/* Optional: Focus Areas (if provided, but don't make it prescriptive) */}
                  {guidance.actions && guidance.actions.length > 0 && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">Reflective Observations</h3>
                      <ul className="space-y-2">
                        {guidance.actions && guidance.actions.length > 0 && guidance.actions.slice(0, 3).map((action, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                            <span className="text-slate-400 mt-1">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Benefits */}
        <Card className="cosmic-card border-purple-500/30">
          <CardHeader title="What You Get" />
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-amber-700 text-xl">✓</span>
                <span className="text-slate-700">Monthly personalized astrology outlook based on your birth chart</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-700 text-xl">✓</span>
                <span className="text-slate-700">Key focus areas for the coming month</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-700 text-xl">✓</span>
                <span className="text-slate-700">Favorable and challenging themes explained</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-700 text-xl">✓</span>
                <span className="text-slate-700">Calm, non-predictive guidance</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-700 text-xl">✓</span>
                <span className="text-slate-700">Planetary influence explanations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-700 text-xl">✓</span>
                <span className="text-slate-700">Cancel anytime</span>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This subscription is optional. Most users prefer one-time reports (Marriage Timing, Career & Money, or Full Life Report) which provide complete insights without recurring commitments.
              </p>
            </div>
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

