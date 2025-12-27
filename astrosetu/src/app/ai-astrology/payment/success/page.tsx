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
import { apiGet } from "@/lib/http";
import type { ReportType } from "@/lib/ai-astrology/types";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    // Verify payment
    verifyPayment(sessionId);
  }, [sessionId]);

  const verifyPayment = async (sid: string) => {
    try {
      const response = await apiGet<{
        ok: boolean;
        data?: {
          paid: boolean;
          paymentStatus: string;
          reportType?: string;
          subscription?: boolean;
        };
        error?: string;
      }>(`/api/ai-astrology/verify-payment?session_id=${sid}`);

      if (!response.ok) {
        throw new Error(response.error || "Failed to verify payment");
      }

      if (response.data?.paid) {
        setVerified(true);
        setReportType((response.data.reportType as ReportType) || null);
        
        // Store payment info in sessionStorage for report generation
        sessionStorage.setItem("aiAstrologyPaymentVerified", "true");
        sessionStorage.setItem("aiAstrologyPaymentSessionId", sid);
        if (response.data.reportType) {
          sessionStorage.setItem("aiAstrologyReportType", response.data.reportType);
          
          // If subscription, mark as active
          if (response.data.reportType === "subscription") {
            sessionStorage.setItem("aiAstrologySubscription", "active");
          }
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

  const getReportName = (type: string | null) => {
    switch (type) {
      case "marriage-timing":
        return "Marriage Timing Report";
      case "career-money":
        return "Career & Money Report";
      case "full-life":
        return "Full Life Report";
      case "subscription":
        return "Premium Subscription";
      default:
        return "Report";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
        <Card className="cosmic-card border-red-500/30">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4 text-red-700">Payment Verification Failed</h2>
            <p className="text-slate-600 mb-6">{error || "We couldn't verify your payment. If you were charged, please check your Stripe dashboard or email receipt for details."}</p>
              <div className="flex gap-4 justify-center">
                <Link href="/ai-astrology">
                  <Button>Back to AI Astrology</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cosmic-bg py-8">
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
              {getReportName(reportType)}
            </Badge>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="cosmic-card mb-6">
          <CardHeader>
            <h2 className="text-xl font-bold text-white">What's Next?</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {reportType === "subscription" ? (
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
                <p className="text-slate-700">
                  Your {getReportName(reportType)} is now unlocked. Generate your report using the same birth details you used during checkout.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/ai-astrology/input" className="flex-1">
                    <Button className="w-full cosmic-button">
                      Generate {getReportName(reportType)} →
                    </Button>
                  </Link>
                  <Link href="/ai-astrology" className="flex-1">
                    <Button className="w-full cosmic-button-secondary">
                      Browse More Reports
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Receipt Info */}
        <Card className="cosmic-card border-slate-200">
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 text-center">
              A receipt has been sent to your email. For questions about your report, please see our <Link href="/ai-astrology/faq" className="text-amber-700 hover:text-amber-800 underline">FAQ page</Link>.
            </p>
          </CardContent>
        </Card>
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

