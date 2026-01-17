/**
 * Subscription Dashboard
 * Manage premium subscription and view daily guidance
 */

"use client";

import { useState, useEffect, useRef, Suspense } from "react";
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
  
  // CRITICAL FIX (ChatGPT 23:57): Build ID for deployment verification (fetch from /build.json)
  const [buildId, setBuildId] = useState<string>("...");
  
  // CRITICAL FIX (ChatGPT 23:57): Fetch build ID from /build.json on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/build.json", {
          cache: "no-store",
          headers: { "cache-control": "no-cache" },
        });

        if (!res.ok) {
          throw new Error(`build.json ${res.status}`);
        }

        const data = await res.json();
        if (!cancelled) {
          setBuildId(data?.buildId || "unknown");
          console.info("[BUILD]", data?.buildId || "unknown");
        }
      } catch (error) {
        console.warn("[Subscription] Failed to fetch build.json:", error);
        if (!cancelled) {
          setBuildId("unknown");
          console.info("[BUILD]", "unknown");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // CRITICAL FIX (ChatGPT 22:45): Log token in URL on mount to verify navigation preserved it
  useEffect(() => {
    const inputToken = searchParams?.get("input_token");
    console.info("[TOKEN_IN_URL]", inputToken || "none");
  }, [searchParams]);
  
  const [input, setInput] = useState<AIAstrologyInput | null>(null);
  // CRITICAL FIX (Step 1): Track token loading state to prevent redirect while fetching
  const [tokenLoading, setTokenLoading] = useState(false);
  const [guidance, setGuidance] = useState<DailyGuidance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [billingStatus, setBillingStatus] = useState<{
    status: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string | null;
    planInterval: string;
  } | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [billingActionLoading, setBillingActionLoading] = useState(false);

  useEffect(() => {
    // Check if sessionStorage is available
    if (typeof window === "undefined") return;
    
    // CRITICAL FIX (ChatGPT): Check input_token first (server-side source of truth)
    // Stop sessionStorage dependency - this fixes "Subscribe does nothing" issue
    const inputToken = searchParams?.get("input_token");
    
    const loadInputFromToken = async () => {
      if (inputToken) {
        // CRITICAL FIX (Step 1): Set tokenLoading=true to prevent redirect while fetching
        setTokenLoading(true);
        // CRITICAL FIX (ChatGPT 22:45): Log token fetch start for visibility
        const tokenSuffix = inputToken.slice(-6);
        console.info("[TOKEN_GET] start", `...${tokenSuffix}`);
        try {
          const tokenResponse = await apiGet<{
            ok: boolean;
            data?: {
              input: AIAstrologyInput;
              reportType?: string;
            };
            error?: string;
          }>(`/api/ai-astrology/input-session?token=${encodeURIComponent(inputToken)}`);

          // CRITICAL FIX (ChatGPT 22:45): Log token fetch response for visibility
          if (tokenResponse.ok) {
            console.info("[TOKEN_GET] ok status=200");
          } else {
            console.info("[TOKEN_GET] fail status=400", tokenResponse.error || "invalid_token");
          }

          if (tokenResponse.ok && tokenResponse.data?.input) {
            // Load input from token
            const inputData = tokenResponse.data.input;
            setInput(inputData);
            // CRITICAL FIX (Step 1): Set tokenLoading=false after successfully setting input
            setTokenLoading(false);
            
            // CRITICAL FIX (2026-01-18): Don't navigate if we're already on subscription page
            // This prevents redirect loops when input_token is loaded
            // The input is now loaded and set in state, so we can stay on the current page
            const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
            if (currentPath.includes("/ai-astrology/subscription")) {
              // Already on subscription page - input is loaded, stay here
              // Clean URL by removing input_token and returnTo params (optional, but cleaner)
              // Use router.replace to update URL without navigation
              const cleanUrl = "/ai-astrology/subscription";
              console.info("[SUBSCRIPTION] Input loaded from token, cleaning URL and staying on page");
              router.replace(cleanUrl);
            } else {
              // Not on subscription page - navigate to it
              const returnToParam = searchParams?.get("returnTo");
              if (returnToParam && returnToParam.startsWith("/ai-astrology/subscription")) {
                // Navigate to returnTo (subscription page)
                const fullUrl = typeof window !== "undefined" ? new URL(returnToParam, window.location.origin).toString() : returnToParam;
                console.info("[SUBSCRIPTION_RETURNTO]", fullUrl);
                window.location.assign(fullUrl);
              } else {
                // No returnTo - navigate to subscription
                router.replace("/ai-astrology/subscription");
              }
            }
            
            // Cache in sessionStorage for future use (nice-to-have)
            try {
              sessionStorage.setItem("aiAstrologyInput", JSON.stringify(inputData));
            } catch (storageError) {
              console.warn("[Subscription] Failed to cache input_token data in sessionStorage:", storageError);
            }
            
            console.log("[Subscription] Loaded input from input_token:", inputToken.slice(-6));
            return true; // Successfully loaded
          } else {
            console.warn("[Subscription] Invalid or expired input_token:", tokenResponse.error);
            setTokenLoading(false); // CRITICAL FIX (Step 1): Clear tokenLoading on error
            // Fall through to sessionStorage check
          }
        } catch (tokenError) {
          console.warn("[Subscription] Failed to fetch input_token, falling back to sessionStorage:", tokenError);
          setTokenLoading(false); // CRITICAL FIX (Step 1): Clear tokenLoading on error
          // Fall through to sessionStorage check
        }
      }
      return false; // Not loaded from token
    };
    
    (async () => {
      const loadedFromToken = await loadInputFromToken();
      if (loadedFromToken) {
        // Input loaded from token - continue with billing hydration
        // Don't check sessionStorage again
        // Continue to billing hydration (code below)
      } else {
        // Fallback: Get input from sessionStorage (if input_token not available or failed)
        // CRITICAL FIX (Step 1): Prevent redirect while tokenLoading=true (token fetch authoritative)
        if (!tokenLoading) {
          try {
            const savedInput = sessionStorage.getItem("aiAstrologyInput");

            if (!savedInput) {
              // Subscription is its own journey; collect birth details but return to subscription dashboard,
              // not into the free-report preview flow.
              console.info("[REDIRECT_TO_INPUT] reason=missing_input_no_token");
              const returnTo = "/ai-astrology/subscription";
              const redirectUrl = `/ai-astrology/input?reportType=life-summary&flow=subscription&returnTo=${encodeURIComponent(returnTo)}`;
              // CRITICAL FIX (2026-01-18): Use hard navigation to prevent redirect loops
              const fullUrl = typeof window !== "undefined" ? new URL(redirectUrl, window.location.origin).toString() : redirectUrl;
              console.info("[SUBSCRIPTION_REDIRECT_TO_INPUT]", fullUrl);
              window.location.assign(fullUrl);
              return;
            }

              const inputData = JSON.parse(savedInput);
              setInput(inputData);
            } catch (e) {
              console.error("[Subscription] Error parsing saved input:", e);
              router.push(`/ai-astrology/input?reportType=life-summary&flow=subscription&returnTo=${encodeURIComponent("/ai-astrology/subscription")}`);
              return;
            }
          }
        }
      
      // Continue with billing hydration (moved outside the token/sessionStorage check)
      // Best-practice: use session_id from query string only once (Stripe redirect), verify server-side,
      // then rely on DB via cookie-backed /api/billing/subscription (no query/sessionStorage required).
      const urlSessionId = searchParams?.get("session_id");
      const hydrateBilling = async () => {
        try {
          // 1) Try DB source-of-truth first (cookie-backed)
          try {
            const res = await apiGet<{ ok: boolean; data?: any }>("/api/billing/subscription");
            if (res.ok && res.data) {
              setBillingStatus(res.data);
              const isActive =
                res.data.status === "active" ||
                res.data.status === "trialing" ||
                (res.data.status === "active" && !!res.data.cancelAtPeriodEnd);
              setIsSubscribed(isActive);
              return;
            }
          } catch (e: any) {
            const msg = String(e?.message || "");
            // Even if the error isn't "session_id is required", we can still attempt one-time verification
            // when we have a candidate session_id from URL/sessionStorage (best-effort, non-blocking).
            // Do not early-return here; continue to step (2).
          }

          // 2) One-time verification path (best-effort; must not block UI)
          // CRITICAL FIX (2026-01-18): Only verify session_id from URL (not sessionStorage) to prevent premature verification
          // SessionStorage sessionId might be from a checkout session that hasn't completed yet
          // Only verify session_id that comes from URL (success page redirect) - those are already completed
          const candidate = urlSessionId; // Only use URL session_id, not sessionStorage
          if (!candidate) return;
          try {
            await apiPost<{ ok: boolean; error?: string }>(
              "/api/billing/subscription/verify-session",
              { session_id: candidate }
            );
            if (urlSessionId) {
              router.replace("/ai-astrology/subscription"); // clean URL
            }
          } catch {
            // If Stripe isn't configured (local/dev/E2E), verification may fail — still proceed to load mocked API state.
          }

          // 3) Retry DB source-of-truth
          const res2 = await apiGet<{ ok: boolean; data?: any }>("/api/billing/subscription");
          if (res2.ok && res2.data) {
            setBillingStatus(res2.data);
            const isActive =
              res2.data.status === "active" ||
              res2.data.status === "trialing" ||
              (res2.data.status === "active" && !!res2.data.cancelAtPeriodEnd);
            setIsSubscribed(isActive);
          }
        } catch {
          // Non-blocking: subscription UI can still render; user may need to complete checkout/verification.
        }
      };
      hydrateBilling();
    })(); // Close async IIFE
  }, [router, searchParams]);

  // Load current monthly guidance only when subscription is active (DB/API is source of truth).
  useEffect(() => {
    if (!input) return;
    if (!isSubscribed) return;
    if (guidance) return;
    loadDailyGuidance(input);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, isSubscribed]);

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

  // CRITICAL FIX (ChatGPT): Single-flight guard for subscribe handler
  const isSubmittingRef = useRef(false);
  
  const handleSubscribe = async () => {
    // CRITICAL FIX (ChatGPT): Single-flight guard - prevent double-clicks from causing duplicate API calls
    if (isSubmittingRef.current) {
      console.warn("[Subscribe] Already submitting, ignoring duplicate click");
      return;
    }
    
    // CRITICAL FIX (2026-01-18): Check tokenLoading before checking input
    // If token is still loading, wait for it to complete before making decisions
    if (tokenLoading) {
      console.warn("[Subscribe] Token is loading, please wait");
      setError("Please wait while your birth details are loading.");
      return;
    }
    
    // CRITICAL FIX (ChatGPT): NO SILENT RETURNS - redirect to input if input missing
    // This fixes "Subscribe redirects to same page and nothing happens" issue
    if (!input) {
      console.log("[Subscribe] No input found, redirecting to input page");
      const redirectUrl = "/ai-astrology/input?reportType=life-summary&flow=subscription&returnTo=/ai-astrology/subscription";
      const fullUrl = typeof window !== "undefined" ? new URL(redirectUrl, window.location.origin).toString() : redirectUrl;
      console.info("[SUBSCRIBE_REDIRECT]", fullUrl);
      window.location.assign(fullUrl);
      return;
    }

    // CRITICAL FIX (ChatGPT): Generate checkout attempt ID for server-side tracing
    const checkoutAttemptId = typeof window !== "undefined" && window.crypto?.randomUUID
      ? window.crypto.randomUUID().slice(0, 8)
      : `client_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

    // CRITICAL FIX (ChatGPT): Add timeout to prevent infinite hanging
    const TIMEOUT_MS = 15000; // 15 seconds
    let timeoutId: NodeJS.Timeout | null = null;
    let isResolved = false;
    let navigationOccurred = false; // Track if navigation happened

    // CRITICAL FIX (ChatGPT): Client-side watchdog for fail-fast UI
    const watchdogTimeoutId = setTimeout(() => {
      if (!navigationOccurred && !isResolved) {
        console.error(`[Subscribe] Watchdog timeout - no navigation after ${TIMEOUT_MS}ms`, {
          checkoutAttemptId,
        });
        setError(`Subscription is taking longer than expected. Ref: ${checkoutAttemptId}. Include this reference if you retry later.`);
        setLoading(false);
        isResolved = true;
      }
    }, TIMEOUT_MS);

    try {
      isSubmittingRef.current = true; // Set single-flight guard immediately
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // CRITICAL FIX (ChatGPT): Always create a fresh checkout session
      // Don't reuse existing sessions - each subscribe click should create new session
      const successUrl =
        typeof window !== "undefined" ? `${window.location.origin}/ai-astrology/subscription/success?session_id={CHECKOUT_SESSION_ID}` : undefined;
      const cancelUrl =
        typeof window !== "undefined" ? `${window.location.origin}/ai-astrology/subscription?canceled=1` : undefined;

      // Set timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            reject(new Error("Subscription request timed out. Please try again."));
          }
        }, TIMEOUT_MS);
      });

      // Race between API call and timeout
      // CRITICAL FIX (ChatGPT): Include checkout attempt ID for server-side tracing
      const response = await Promise.race([
        apiPost<{
          ok: boolean;
          data?: { url: string; sessionId: string };
          error?: string;
        }>("/api/ai-astrology/create-checkout", {
          subscription: true,
          input,
          successUrl,
          cancelUrl,
          checkoutAttemptId, // Include for server-side correlation
        }),
        timeoutPromise,
      ]);

      // Clear timeout if API call succeeded
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      isResolved = true;

      if (!response.ok) {
        throw new Error(response.error || "Failed to create subscription");
      }

      if (!response.data?.url) {
        throw new Error("Subscription checkout did not return a redirect URL. Please try again.");
      }

      // CRITICAL FIX (2026-01-18): Don't store sessionId in sessionStorage before redirecting
      // This prevents hydrateBilling from trying to verify the session prematurely
      // The sessionId will be stored/verified by the success page after checkout completes
      // For now, we'll just redirect - the success page will handle session verification

      // Redirect to Stripe checkout (validate URL to prevent open redirects)
      const checkoutUrl = response.data.url;
      // Validate URL is from Stripe, localhost, relative path, or same origin (for test users)
      try {
        const url = new URL(checkoutUrl, window.location.origin);
        const isStripe = url.hostname === "checkout.stripe.com";
        const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
        const isSameOrigin = url.origin === window.location.origin;
        const isRelative = checkoutUrl.startsWith("/");
        
        if (isStripe || isLocalhost || isSameOrigin || isRelative) {
          navigationOccurred = true;
          clearTimeout(watchdogTimeoutId);
          window.location.href = checkoutUrl;
          // Don't set loading to false here - we're redirecting
          return;
        } else {
          throw new Error("Invalid checkout URL");
        }
      } catch (urlError) {
        // If URL parsing fails, check if it's a relative path
        if (checkoutUrl.startsWith("/")) {
          navigationOccurred = true;
          clearTimeout(watchdogTimeoutId);
          window.location.href = checkoutUrl;
          // Don't set loading to false here - we're redirecting
          return;
        } else {
          throw new Error("Invalid checkout URL");
        }
      }
    } catch (e: any) {
      // CRITICAL FIX (ChatGPT): Always stop loading and show error with attempt ID
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      clearTimeout(watchdogTimeoutId);
      isResolved = true;
      
      const errorMessage = e.message || "Failed to initiate subscription";
      // CRITICAL FIX (ChatGPT): Include checkout attempt ID in error UI for server correlation
      // UX Improvement: Include instruction to use reference when retrying
      const errorWithRef = `${errorMessage}. Ref: ${checkoutAttemptId}. Include this reference if you retry later.`;
      setError(errorWithRef);
      setLoading(false);
      
      console.error(`[Subscribe] Subscription checkout failed (attempt: ${checkoutAttemptId}):`, errorMessage, {
        checkoutAttemptId,
        errorMessage,
      });
    } finally {
      // CRITICAL FIX (ChatGPT): Clear single-flight guard on completion/error
      isSubmittingRef.current = false;
    }
  };

  const handleCancelSubscription = async () => {
    setBillingActionLoading(true);
    setError(null);
    try {
      const res = await apiPost<{ ok: boolean; data?: any; error?: string }>(
        "/api/billing/subscription/cancel",
        {}
      );
      if (!res.ok) {
        throw new Error(res.error || "Failed to cancel subscription");
      }
      if (res.data) {
        setBillingStatus(res.data);
      }
      setShowCancelConfirm(false);
    } catch (e: any) {
      setError(e.message || "Failed to cancel subscription");
    } finally {
      setBillingActionLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    setBillingActionLoading(true);
    setError(null);
    try {
      const res = await apiPost<{ ok: boolean; data?: any; error?: string }>(
        "/api/billing/subscription/resume",
        {}
      );
      if (!res.ok) {
        throw new Error(res.error || "Failed to resume subscription");
      }
      if (res.data) {
        setBillingStatus(res.data);
      }
    } catch (e: any) {
      setError(e.message || "Failed to resume subscription");
    } finally {
      setBillingActionLoading(false);
    }
  };

  if (!input) {
    // CRITICAL FIX (Step 1): Show "Loading your details..." while token is loading (token fetch authoritative)
    if (tokenLoading) {
      return (
        <div className="cosmic-bg py-8">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="cosmic-card">
              <CardContent className="p-8 text-center">
                <div className="animate-spin text-5xl mb-4">🌙</div>
                <h2 className="text-2xl font-bold mb-4 text-slate-800">Loading your details...</h2>
                <p className="text-slate-600 mb-6">Please wait while we load your information.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    
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
                  disabled={loading || tokenLoading}
                  className="cosmic-button text-lg px-8 py-4"
                >
                  {loading ? "Processing..." : tokenLoading ? "Loading..." : "Subscribe"}
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

        {/* Manage Subscription (server/DB source of truth) */}
        {(isSubscribed || !!billingStatus) && (
          <Card className="cosmic-card mb-6">
            <CardHeader title="Manage Subscription" />
            <CardContent className="p-6 space-y-3">
              <div className="text-sm text-slate-700" data-testid="billing-subscription-status">
                {billingStatus?.cancelAtPeriodEnd ? (
                  <>
                    <strong>Canceled</strong> — active until{" "}
                    {billingStatus.currentPeriodEnd
                      ? new Date(billingStatus.currentPeriodEnd).toLocaleDateString()
                      : "your period end"}
                    . You can resume anytime before that date.
                  </>
                ) : (
                  <>
                    <strong>Active</strong>
                    {billingStatus?.currentPeriodEnd
                      ? ` — renews on ${new Date(billingStatus.currentPeriodEnd).toLocaleDateString()}`
                      : ""}
                    .
                  </>
                )}
              </div>

              <div className="flex gap-3">
                {!billingStatus?.cancelAtPeriodEnd && billingStatus?.planInterval !== "year" ? (
                  <Button
                    className="cosmic-button-secondary"
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={billingActionLoading}
                    data-testid="billing-subscription-cancel"
                  >
                    Cancel monthly subscription
                  </Button>
                ) : (
                  <Button
                    className="cosmic-button"
                    onClick={handleResumeSubscription}
                    disabled={billingActionLoading}
                    data-testid="billing-subscription-resume"
                  >
                    Resume subscription
                  </Button>
                )}
              </div>

              {showCancelConfirm && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                  data-testid="billing-subscription-confirm-modal"
                >
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      Cancel monthly subscription
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Canceling stops future renewals. Your access continues until your current period end date.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <Button
                        className="cosmic-button-secondary"
                        onClick={() => setShowCancelConfirm(false)}
                        disabled={billingActionLoading}
                        data-testid="billing-subscription-keep"
                      >
                        Keep subscription
                      </Button>
                      <Button
                        className="cosmic-button"
                        onClick={handleCancelSubscription}
                        disabled={billingActionLoading}
                        data-testid="billing-subscription-confirm-cancel"
                      >
                        Confirm cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Current Theme & Focus */}
        {isSubscribed && (
          <Card className="bg-white shadow-lg border-2 border-purple-200 mb-6">
            <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b-2 border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Current Theme & Focus</h2>
                <Badge tone={billingStatus?.cancelAtPeriodEnd ? "amber" : "green"}>
                  {billingStatus?.cancelAtPeriodEnd ? "Canceled" : "Active"}
                </Badge>
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
                <div className="space-y-5">
                  {/* Section 1: Monthly Theme */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Theme
                    </h3>
                    <div className="p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200">
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                          {guidance.guidance || "This period favors thoughtful action and steady progress. Maintain balance in daily routines."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Focus Areas */}
                  {guidance.focusAreas && (
                    <div>
                      <h3 className="text-base font-semibold text-slate-800 mb-3">This Month&apos;s Focus Areas</h3>
                      <div className="grid gap-3">
                        <div className="p-3 bg-white rounded-lg border border-slate-200">
                          <div className="flex items-start gap-2 mb-1">
                            <span className="text-base">🧠</span>
                            <span className="text-sm font-semibold text-slate-700">Mindset & thinking style</span>
                          </div>
                          <p className="text-sm text-slate-600 ml-7">{guidance.focusAreas.mindset}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-200">
                          <div className="flex items-start gap-2 mb-1">
                            <span className="text-base">💼</span>
                            <span className="text-sm font-semibold text-slate-700">Work & productivity</span>
                          </div>
                          <p className="text-sm text-slate-600 ml-7">{guidance.focusAreas.work}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-200">
                          <div className="flex items-start gap-2 mb-1">
                            <span className="text-base">🤝</span>
                            <span className="text-sm font-semibold text-slate-700">Relationships & communication</span>
                          </div>
                          <p className="text-sm text-slate-600 ml-7">{guidance.focusAreas.relationships}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-200">
                          <div className="flex items-start gap-2 mb-1">
                            <span className="text-base">🧘</span>
                            <span className="text-sm font-semibold text-slate-700">Energy & balance</span>
                          </div>
                          <p className="text-sm text-slate-600 ml-7">{guidance.focusAreas.energy}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 3: Helpful This Month */}
                  {guidance.helpfulThisMonth && guidance.helpfulThisMonth.length > 0 && (
                    <div>
                      <h3 className="text-base font-semibold text-slate-800 mb-3">Helpful This Month</h3>
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <ul className="space-y-2">
                          {guidance.helpfulThisMonth.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                              <span className="text-green-600 mt-1">•</span>
                              <span>Do: {item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Section 4: Be Mindful Of */}
                  {guidance.beMindfulOf && guidance.beMindfulOf.length > 0 && (
                    <div>
                      <h3 className="text-base font-semibold text-slate-800 mb-3">Be Mindful Of</h3>
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <ul className="space-y-2">
                          {guidance.beMindfulOf.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                              <span className="text-amber-600 mt-1">•</span>
                              <span>Avoid: {item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Section 5: Reflection Prompt */}
                  {guidance.reflectionPrompt && (
                    <div>
                      <h3 className="text-base font-semibold text-slate-800 mb-3">Reflection</h3>
                      <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <p className="text-sm text-slate-700 italic">
                          {guidance.reflectionPrompt}
                        </p>
                      </div>
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

