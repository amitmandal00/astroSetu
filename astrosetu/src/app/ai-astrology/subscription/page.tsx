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
      setError(null); // Clear any previous errors
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
        // Validate URL is from Stripe, localhost, relative path, or same origin (for test users)
        try {
          const url = new URL(checkoutUrl, window.location.origin);
          const isStripe = url.hostname === "checkout.stripe.com";
          const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
          const isSameOrigin = url.origin === window.location.origin;
          const isRelative = checkoutUrl.startsWith("/");
          
          if (isStripe || isLocalhost || isSameOrigin || isRelative) {
            window.location.href = checkoutUrl;
          } else {
            throw new Error("Invalid checkout URL");
          }
        } catch (urlError) {
          // If URL parsing fails, check if it's a relative path
          if (checkoutUrl.startsWith("/")) {
            window.location.href = checkoutUrl;
          } else {
            throw new Error("Invalid checkout URL");
          }
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
          <p className="text-slate-600 mb-4">
            A calm, reflective monthly overview — not predictions.
          </p>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-2xl font-bold text-slate-800">
              AU${(SUBSCRIPTION_PRICE.amount / 100).toFixed(2)} / month
            </div>
            <div className="text-sm text-slate-600">Cancel anytime</div>
          </div>
        </div>

        {/* Preview Snippet */}
        {!isSubscribed && (
          <Card className="cosmic-card mb-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Preview: Monthly Theme Example</h3>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-slate-700 italic mb-2">
                  &quot;This month emphasizes balance between personal growth and professional commitments. 
                  Planetary influences suggest focusing on communication and relationship harmony. 
                  Consider reflecting on long-term goals while maintaining daily routines...&quot;
                </p>
                <p className="text-xs text-slate-500">Each month features a unique theme tailored to your birth chart</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Status */}
        {!isSubscribed && (
          <Card className="bg-white shadow-lg border-2 border-purple-200 mb-6">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="mb-4">
                  <p className="text-sm text-slate-600 mb-2">
                    <strong>A new monthly outlook is automatically generated on the 1st of each month and made available in your dashboard.</strong>
                  </p>
                  <p className="text-xs text-slate-500 mb-3">
                    No emails required. Access anytime. Cancel anytime.
                  </p>
                  <p className="text-xs text-slate-500 italic">
                    Complements Year Analysis & Life Phase reports with ongoing monthly themes.
                  </p>
                </div>
                <Button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="cosmic-button text-lg px-8 py-4"
                >
                  {loading ? "Processing..." : "Subscribe"}
                </Button>
                <p className="text-xs text-slate-500 italic mt-3">
                  This is not a prediction service. Cancel anytime.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Short Value Section */}
        {!isSubscribed && (
          <Card className="cosmic-card mb-6">
            <CardHeader title="What You Get" />
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="text-amber-700 text-lg">•</span>
                  <span className="text-slate-700">Monthly focus areas & themes generated automatically on the 1st</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-700 text-lg">•</span>
                  <span className="text-slate-700">Planetary influences (educational, not predictive)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-700 text-lg">•</span>
                  <span className="text-slate-700">Emotional & mindset guidance for reflection</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-700 text-lg">•</span>
                  <span className="text-slate-700">Complements Year Analysis & Life Phase reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-700 text-lg">•</span>
                  <span className="text-slate-700">Fully automated — no human involvement</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* How Monthly Delivery Works */}
        {!isSubscribed && (
          <Card className="cosmic-card mb-6 bg-slate-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-3">How Monthly Delivery Works</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="text-slate-500 mt-1">•</span>
                  <span>A new outlook is generated once per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-slate-500 mt-1">•</span>
                  <span>Available in your dashboard from the 1st onward</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Why This Exists */}
        {!isSubscribed && (
          <Card className="cosmic-card mb-6 bg-slate-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Best for Users Who Like Gentle Monthly Check-ins</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Monthly outlooks provide ongoing reflection and gentle guidance throughout the year, perfect for users who prefer regular check-ins.
                One-time reports like{" "}
                <Link href="/ai-astrology" className="text-purple-600 hover:underline">Year Analysis</Link> or{" "}
                <Link href="/ai-astrology" className="text-purple-600 hover:underline">Life Phase Reports</Link> are better for deep life questions and strategic planning.
                The monthly outlook complements these reports with ongoing themes and reflective insights.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Compliance Notice */}
        {!isSubscribed && (
          <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <p className="text-sm text-slate-600 font-semibold mb-1">
              Educational guidance only. This is not a prediction service.
            </p>
            <p className="text-xs text-slate-500">
              Monthly themes are for reflection and self-awareness, not advice or predictions.
            </p>
          </div>
        )}

        {/* Current Theme & Focus */}
        {isSubscribed && (
          <Card className="bg-white shadow-lg border-2 border-purple-200 mb-6">
            <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b-2 border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Current Theme & Focus</h2>
                <Badge tone="green">Active</Badge>
              </div>
            </div>
            <CardContent>
              {/* Softer Info Tone */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  This guidance is general and reflective, not advice or prediction.
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
                <div className="space-y-4">
                  {/* Monthly Title */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Theme: {guidance.guidance?.split(/[\.\n]/)[0]?.substring(0, 50).trim() || 'Balance & Communication'}
                    </h3>
                  </div>
                  
                  {/* Shortened Theme Block */}
                  <div className="p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200">
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                        {guidance.guidance ? 
                          guidance.guidance.length > 300 ? 
                            guidance.guidance.substring(0, 300) + '...' : 
                            guidance.guidance
                          : "This period favors thoughtful action and steady progress. Maintain balance in daily routines."}
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

