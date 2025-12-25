"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { logEvent } from "@/lib/telemetry";
import { getCurrentPricing, type CountryCode } from "@/lib/pricing";
import { useSubscriptionPayment } from "@/components/payments/SubscriptionPayment";

const PREMIUM_FEATURES = [
  {
    icon: "🔮",
    title: "Unlimited Kundli Generation",
    description: "Generate unlimited birth charts with detailed analysis",
    free: "5 per month",
    premium: "Unlimited"
  },
  {
    icon: "💑",
    title: "Advanced Match Analysis",
    description: "Deep compatibility analysis with detailed reports",
    free: "Basic matching",
    premium: "Advanced + Remedies"
  },
  {
    icon: "⭐",
    title: "Yearly Horoscope",
    description: "Complete yearly predictions for all aspects of life",
    free: "Daily only",
    premium: "Daily, Weekly, Monthly, Yearly"
  },
  {
    icon: "📿",
    title: "Personalized Panchang",
    description: "Location-specific Panchang with detailed timings",
    free: "Basic",
    premium: "Advanced + Custom Location"
  },
  {
    icon: "💎",
    title: "Premium Remedies",
    description: "Personalized remedies with detailed instructions",
    free: "Basic remedies",
    premium: "Personalized + Expert Guidance"
  },
  {
    icon: "📄",
    title: "PDF Reports",
    description: "Download detailed PDF reports of all analyses",
    free: "View only",
    premium: "Download + Email"
  },
  {
    icon: "👨‍🏫",
    title: "Priority Astrologer Access",
    description: "Get priority booking with top-rated astrologers",
    free: "Standard queue",
    premium: "Priority + 20% discount"
  },
  {
    icon: "🤖",
    title: "AI-Powered Insights",
    description: "Advanced AI analysis and personalized recommendations",
    free: "Basic insights",
    premium: "Advanced AI + Predictions"
  }
];

function PremiumPageContent() {
  const searchParams = useSearchParams();
  const [pricing, setPricing] = useState(getCurrentPricing());
  const [countryCode, setCountryCode] = useState<CountryCode>("IN");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check for success parameter
    if (searchParams.get("success") === "true") {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  const { handleSubscribe: handleWeekly, loading: loadingWeekly, error: errorWeekly } = useSubscriptionPayment({
    plan: "weekly",
    price: pricing.plans.weekly.price,
    currency: pricing.plans.weekly.currency,
    currencySymbol: pricing.currencySymbol,
    countryCode,
    onSuccess: () => {
      logEvent("subscription_completed", { plan: "weekly" });
    },
  });

  const { handleSubscribe: handleYearly, loading: loadingYearly, error: errorYearly } = useSubscriptionPayment({
    plan: "yearly",
    price: pricing.plans.yearly.price,
    currency: pricing.plans.yearly.currency,
    currencySymbol: pricing.currencySymbol,
    countryCode,
    onSuccess: () => {
      logEvent("subscription_completed", { plan: "yearly" });
    },
  });

  const PRICING_PLANS = [
    {
      name: "Weekly",
      plan: "weekly" as const,
      price: pricing.plans.weekly.price,
      currencySymbol: pricing.currencySymbol,
      period: "week",
      popular: false,
      features: [
        "All Premium Features",
        "Perfect for trying AstroSetu Plus",
        "Cancel Anytime"
      ],
      handleCta: handleWeekly,
      loading: loadingWeekly,
      error: errorWeekly,
    },
    {
      name: "Yearly",
      plan: "yearly" as const,
      price: pricing.plans.yearly.price,
      currencySymbol: pricing.currencySymbol,
      period: "year",
      popular: true,
      savings: "Best value for regular guidance",
      features: [
        "All Premium Features",
        "Unlimited Reports",
        "Priority Support",
        "Designed for serious seekers"
      ],
      handleCta: handleYearly,
      loading: loadingYearly,
      error: errorYearly,
    }
  ];

  return (
    <div className="grid gap-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white shadow-2xl p-8 lg:p-12">
        <HeaderPattern />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-6 left-6 text-6xl">👑</div>
          <div className="absolute top-6 right-6 text-6xl">✨</div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-5xl">💎</div>
        </div>
        <div className="relative z-10 text-center">
          <Badge className="!text-xs !font-bold !px-4 !py-1.5 bg-white/20 text-white border-white/30 mb-4">
            ✨ Premium Membership
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Unlock the Full Power of AstroSetu
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Get unlimited access to all premium features, advanced reports, and priority support from expert astrologers.
          </p>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="grid md:grid-cols-2 gap-6">
        {PRICING_PLANS.map((plan) => (
          <Card key={plan.name} className={plan.popular ? "border-2 border-amber-500 shadow-xl" : ""}>
            {plan.popular && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-2 text-xs font-bold">
                ⭐ MOST POPULAR
              </div>
            )}
            <CardHeader
              eyebrow={plan.name}
              title={`${plan.currencySymbol}${plan.price}/${plan.period}`}
              subtitle={plan.savings}
            />
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-amber-600">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full py-4 text-base bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                onClick={plan.handleCta}
                disabled={plan.loading}
              >
                {plan.loading ? "Processing..." : `Subscribe for ${plan.currencySymbol}${plan.price}/${plan.period}`}
              </Button>
              {plan.error && (
                <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">
                  {plan.error}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison */}
      <Card>
        <CardHeader eyebrow="✨ Premium Features" title="What You Get" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {PREMIUM_FEATURES.map((feature, idx) => (
              <div key={idx} className="p-4 rounded-xl border-2 border-slate-200 hover:border-amber-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{feature.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-slate-600 mb-3">{feature.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="font-semibold text-slate-500 mb-1">Free:</div>
                        <div className="text-slate-700">{feature.free}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-amber-600 mb-1">Premium:</div>
                        <div className="text-slate-900 font-semibold">{feature.premium}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader eyebrow="🎁 Exclusive Benefits" title="Premium Member Perks" />
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="text-4xl mb-2">🚀</div>
              <div className="font-bold text-slate-900 mb-1">Priority Support</div>
              <div className="text-sm text-slate-600">24/7 dedicated support</div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl mb-2">📧</div>
              <div className="font-bold text-slate-900 mb-1">Email Reports</div>
              <div className="text-sm text-slate-600">Get reports via email</div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl mb-2">🎯</div>
              <div className="font-bold text-slate-900 mb-1">Expert Guidance</div>
              <div className="text-sm text-slate-600">Access to top astrologers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {showSuccess && (
        <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-xl font-bold text-emerald-900 mb-2">Subscription Activated!</h3>
            <p className="text-emerald-700">
              Welcome to AstroSetu Plus! You now have access to all premium features.
            </p>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <div className="text-center">
        <Link href="/kundli">
          <Button variant="secondary" className="px-8 py-4 text-base">
            Try free Kundli first
          </Button>
        </Link>
        <p className="text-sm text-slate-600 mt-4">
          Start with free features. Upgrade anytime to unlock premium.
        </p>
      </div>
    </div>
  );
}

export default function PremiumPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-600 mx-auto mb-4"></div><div className="text-slate-600">Loading...</div></div></div>}>
      <PremiumPageContent />
    </Suspense>
  );
}

