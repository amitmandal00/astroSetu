/**
 * Subscription Success Page
 *
 * Contract:
 * - Reads `session_id` from query string (Stripe redirect)
 * - Verifies server-side via POST /api/billing/subscription/verify-session
 * - Sets HttpOnly cookie (done by server)
 * - Redirects back to /ai-astrology/subscription with a clean URL
 *
 * This avoids refresh loops and ensures DB/cookie is the source of truth (not sessionStorage).
 */

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiPost } from "@/lib/http";

function SubscriptionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Missing session_id. Please try subscribing again.");
      return;
    }

    const run = async () => {
      try {
        await apiPost<{ ok: boolean; error?: string }>(
          "/api/billing/subscription/verify-session",
          { session_id: sessionId }
        );
      } catch (e: any) {
        // Non-blocking: user can still land on subscription page and see status if cookie/DB is already updated by webhook.
        setError(e?.message || "Failed to verify subscription session. Please refresh or try again.");
      } finally {
        // Always return to dashboard (clean URL)
        router.replace("/ai-astrology/subscription");
      }
    };

    run();
  }, [sessionId, router]);

  return (
    <div className="cosmic-bg py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="cosmic-card">
          <CardContent className="p-8 text-center">
            <div className="animate-spin text-6xl mb-6">🌙</div>
            <h2 className="text-2xl font-bold mb-3 text-slate-800">Activating your subscription…</h2>
            <p className="text-slate-600">
              Please wait while we verify your checkout session.
            </p>

            {error && (
              <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                {error}
                <div className="mt-3 flex justify-center gap-3">
                  <Link href="/ai-astrology/subscription">
                    <Button className="cosmic-button-secondary">Go to Subscription Dashboard</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">🌙</div>
            <p className="text-slate-600">Loading…</p>
          </div>
        </div>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  );
}


