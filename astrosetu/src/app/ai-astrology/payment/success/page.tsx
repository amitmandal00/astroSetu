/**
 * Payment Success Page
 * Shown after successful Stripe checkout
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { apiGet, apiPost } from "@/lib/http";
import type { ReportType } from "@/lib/ai-astrology/types";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [isSubscription, setIsSubscription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTestSession, setIsTestSession] = useState(false);
  // Removed redirectCountdown - now redirecting immediately for smoother UX

  useEffect(() => {
    // Validate session_id parameter
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }
    
    // Validate session_id format (basic sanitization)
    if (sessionId.length > 200 || /[<>"']/.test(sessionId)) {
      setError("Invalid session ID format");
      setLoading(false);
      return;
    }

    const verifyPayment = async (sid: string) => {
      try {
        const response = await apiGet<{
          ok: boolean;
          data?: {
            paid: boolean;
            paymentStatus: string;
            reportType?: string;
            subscription?: boolean;
            paymentToken?: string; // Payment verification token
            paymentIntentId?: string; // CRITICAL: For manual capture after report generation
            metadata?: {
              testMode?: boolean;
            };
          };
          error?: string;
        }>(`/api/ai-astrology/verify-payment?session_id=${sid}`);

        if (!response.ok) {
          throw new Error(response.error || "Failed to verify payment");
        }

        if (response.data?.paid) {
          setVerified(true);
          const subscription = response.data.subscription || false;
          setIsSubscription(subscription);
          
          // Check if this is a test session (mock payment)
          const isTest = response.data.metadata?.testMode || sid.startsWith("test_session_");
          setIsTestSession(isTest);
          
        // Only set reportType if it's a valid ReportType (not "subscription")
        const paymentReportType = response.data.reportType;
        if (paymentReportType && paymentReportType !== "subscription") {
          const validReportType = paymentReportType as ReportType;
          setReportType(validReportType);
          try {
            sessionStorage.setItem("aiAstrologyReportType", paymentReportType);
          } catch (e) {
            console.error("Failed to save reportType to sessionStorage:", e);
          }
        }
        
        // Store payment info in sessionStorage for report generation (if available)
        try {
          sessionStorage.setItem("aiAstrologyPaymentVerified", "true");
          sessionStorage.setItem("aiAstrologyPaymentSessionId", sid);
          
          // Store payment token for API verification
          if (response.data.paymentToken) {
            sessionStorage.setItem("aiAstrologyPaymentToken", response.data.paymentToken);
          }
          
          // CRITICAL: Store payment intent ID for manual capture after report generation
          if (response.data.paymentIntentId) {
            sessionStorage.setItem("aiAstrologyPaymentIntentId", response.data.paymentIntentId);
          }
          
          // NOTE: Subscription state must not be sourced from sessionStorage (DB is source of truth).
        } catch (storageError) {
          // Handle sessionStorage errors (e.g., private browsing mode)
          console.error("sessionStorage not available:", storageError);
          // Continue - user can still view success message, but will need to re-enter data
        }

          // For subscriptions: verify session once server-side, set HttpOnly cookie, then redirect to clean URL
          if (subscription) {
            try {
              await apiPost<{ ok: boolean; error?: string }>(
                "/api/billing/subscription/verify-session",
                { session_id: sid }
              );
            } catch (e) {
              // Non-blocking: user can still navigate to subscription page manually,
              // but cookie-based persistence might not be set.
              console.error("Failed to verify subscription session:", e);
            }
            router.replace("/ai-astrology/subscription");
            return;
          }

          // P1 IMPROVEMENT: Streamline flow - redirect immediately to preview page
          // ChatGPT feedback: Remove redundant "unlock" screen, go directly to "Preparing your report..."
          // Pass session_id as URL param so it can be used to regenerate token if sessionStorage fails
          // Pass reportType in URL so preview page knows what report to generate even if sessionStorage is lost
          // Pass auto_generate=true to trigger automatic report generation
          if (!subscription && paymentReportType && paymentReportType !== "subscription") {
            // Redirect immediately (no countdown) for smoother UX
            router.replace(`/ai-astrology/preview?session_id=${encodeURIComponent(sid)}&reportType=${encodeURIComponent(paymentReportType)}&auto_generate=true`);
          }
        } else {
          setError("Payment not completed");
        }
      } catch (e: any) {
        console.error("Payment verification error:", e);
        setError(e.message || "Failed to verify payment");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment(sessionId);
  }, [sessionId, router]);

  const getReportName = (type: ReportType | null, isSub: boolean) => {
    if (isSub) {
      return "Premium Subscription";
    }
    switch (type) {
      case "marriage-timing":
        return "Marriage Timing Report";
      case "career-money":
        return "Career & Money Report";
      case "full-life":
        return "Full Life Report";
      case "year-analysis":
        return "Year Analysis Report";
      case "major-life-phase":
        return "3-5 Year Strategic Life Phase Report";
      case "decision-support":
        return "Decision Support Report";
      default:
        return "Report";
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-2xl w-full mx-4">
          <CardContent className="p-12 text-center">
            <div className="animate-spin text-6xl mb-6">🌙</div>
            <h2 className="text-2xl font-bold mb-4">Verifying Payment...</h2>
            <p className="text-slate-600">Please wait while we confirm your payment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !verified) {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
        <Card className="cosmic-card border-red-500/30">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4 text-red-700">Payment Verification Failed</h2>
            
            {/* Transparent refund information */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-800 mb-2">
                    Automatic Refund Protection
                  </p>
                  <p className="text-sm text-green-700 mb-2">
                    If payment was processed, it will be <strong>automatically refunded</strong>.
                  </p>
                  <div className="mt-3 space-y-1 text-xs text-green-600">
                    <p>• <strong>Full Refund:</strong> Any payment made will be fully refunded</p>
                    <p>• <strong>Timeline:</strong> Refund will be processed within 1-3 business days</p>
                    <p>• <strong>Payment Method:</strong> Refund will go back to your original payment method</p>
                    <p>• <strong>No Action Required:</strong> The refund process is automatic</p>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-slate-600 mb-6">{error || "We couldn't verify your payment. If you were charged, your payment will be automatically refunded."}</p>
              <div className="flex gap-4 justify-center">
                <Link href="/ai-astrology">
                  <Button className="cosmic-button">Back to AI Astrology</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="cosmic-bg py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Message */}
        <Card className="cosmic-card border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 mb-6">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold mb-4 text-emerald-700">Payment Successful!</h1>
            <p className="text-lg text-emerald-800 mb-2">
              Your payment has been confirmed.
            </p>
                <Badge tone="green" className="text-sm px-4 py-2">
                  {getReportName(reportType, isSubscription)}
                </Badge>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="cosmic-card mb-6">
          <CardHeader title="What's Next?" />
              <CardContent className="space-y-4">
                {isSubscription ? (
              <>
                <p className="text-slate-700">
                  Your premium subscription is now active! You can access daily guidance and all premium features.
                </p>
                  <Link href="/ai-astrology/subscription">
                    <Button className="w-full cosmic-button">
                      Go to Subscription Dashboard →
                    </Button>
                  </Link>
              </>
            ) : (
              <>
                {/* P1 IMPROVEMENT: Simplified messaging - redirect happens immediately */}
                <p className="text-slate-700 mb-4">
                  Your {getReportName(reportType, isSubscription)} is being generated now. You&apos;ll be redirected automatically...
                </p>
                
                {/* Loading indicator while redirecting */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin text-xl">🌙</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-800 mb-1">
                        Preparing Your Report...
                      </p>
                      <p className="text-xs text-blue-700">
                        Your report will start generating automatically - please wait, this may take 30-60 seconds.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Receipt Info - Only show for real payments, not test sessions */}
        {!isTestSession && (
          <Card className="cosmic-card border-slate-200">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 text-center">
                A receipt has been sent to your email. For questions about your report, please see our <Link href="/ai-astrology/faq" className="text-amber-700 hover:text-amber-800 underline">FAQ page</Link>.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🌙</div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

