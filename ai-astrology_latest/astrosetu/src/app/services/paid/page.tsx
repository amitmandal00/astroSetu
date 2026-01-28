"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiGet, apiPost } from "@/lib/http";
import { session } from "@/lib/session";

type PaidService = {
  id: string;
  name: string;
  description?: string;
  image: string;
  price: number;
  href?: string;
  category: string;
  icon: string;
};

const PAID_SERVICES: PaidService[] = [
  {
    id: "lalkitab",
    name: "Lal Kitab Horoscope",
    description: "Lal Kitab remedies and predictions",
    image: "📚",
    price: 99,
    href: "/reports/lalkitab",
    category: "Reports",
    icon: "📚"
  },
  {
    id: "ascendant",
    name: "Ascendant Prediction",
    description: "Detailed analysis of your Lagna (Ascendant)",
    image: "📄",
    price: 99,
    href: "/reports/ascendant",
    category: "Reports",
    icon: "📄"
  },
  {
    id: "sadesati",
    name: "Sade Sati Life Report",
    description: "Analysis of Saturn's 7.5 year period",
    image: "🪐",
    price: 99,
    href: "/reports/sadesati",
    category: "Reports",
    icon: "🪐"
  },
  {
    id: "varshphal",
    name: "Year Analysis (Varshphal)",
    description: "Annual predictions based on your birth chart",
    image: "📊",
    price: 99,
    href: "/reports/varshphal",
    category: "Predictions",
    icon: "📊"
  },
  {
    id: "babyname",
    name: "Baby Name Suggestion",
    description: "Astrologically suitable names for your child",
    image: "👶",
    price: 99,
    href: "/reports/babyname",
    category: "Tools",
    icon: "👶"
  },
  {
    id: "gochar",
    name: "Gochar Phal (Transit Report)",
    description: "How current planetary positions affect you",
    image: "🔄",
    price: 99,
    href: "/reports/gochar",
    category: "Predictions",
    icon: "🔄"
  },
  {
    id: "general-prediction",
    name: "General Prediction",
    description: "General life predictions based on your chart",
    image: "🔮",
    price: 99,
    href: "/reports/general",
    category: "Predictions",
    icon: "🔮"
  },
  {
    id: "mangal-dosha",
    name: "Mangal Dosha",
    description: "Comprehensive Mangal Dosha analysis",
    image: "🔥",
    price: 99,
    href: "/reports/mangal-dosha",
    category: "Dosha",
    icon: "🔥"
  },
  {
    id: "dasha-phal",
    name: "Dasha Phal Analysis",
    description: "Comprehensive analysis of all Dasha periods",
    image: "⏳",
    price: 99,
    href: "/reports/dasha-phal",
    category: "Predictions",
    icon: "⏳"
  },
  {
    id: "love-horoscope",
    name: "Love Horoscope",
    description: "Love and relationship predictions",
    image: "💑",
    price: 99,
    href: "/reports/love-horoscope",
    category: "Predictions",
    icon: "💑"
  }
];

export default function PaidServicesPage() {
  const router = useRouter();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = session.getUser();
    if (!currentUser) {
      router.push("/login?redirect=/services/paid");
      return;
    }
    setUser(currentUser);

    // Fetch wallet balance
    apiGet<{ ok: boolean; data?: { balance: number } }>("/api/wallet")
      .then((res) => {
        if (res.ok && res.data) {
          setWalletBalance(res.data.balance);
        }
      })
      .catch(() => {
        // Ignore errors
      });
  }, [router]);

  async function handleOrder(service: PaidService) {
    setLoading(service.id);
    try {
      // Check if user has enough balance
      if (walletBalance !== null && walletBalance >= service.price) {
        // Use wallet balance
        const res = await apiPost<{ ok: boolean; data?: { success?: boolean; newBalance?: number }; error?: string }>("/api/services/purchase", {
          serviceId: service.id,
          serviceName: service.name,
          amount: service.price
        });

        if (res.ok && res.data?.success) {
          // Update wallet balance
          if (res.data.newBalance !== undefined) {
            setWalletBalance(res.data.newBalance);
          } else {
            // Refresh wallet balance
            const walletRes = await apiGet<{ ok: boolean; data?: { balance: number } }>("/api/wallet");
            if (walletRes.ok && walletRes.data) {
              setWalletBalance(walletRes.data.balance);
            }
          }
          alert(`✅ Service purchased successfully! You can now access ${service.name}.`);
          // Redirect to service page if available
          if (service.href) {
            router.push(service.href);
          }
        } else {
          throw new Error(res.error || "Failed to purchase service");
        }
        return;
      }

      // Insufficient balance - create payment order
      if (confirm(`Insufficient balance. You need ₹${service.price}. Proceed to payment?`)) {
        const res = await apiPost<{ ok: boolean; data?: { orderId?: string; paymentUrl?: string }; error?: string; mock?: boolean }>("/api/payments/create-order", {
          amount: service.price * 100, // Convert to paise
          serviceId: service.id,
          serviceName: service.name,
          description: `Purchase: ${service.name}`
        });

        if (res.ok && res.data) {
          // If payment URL, redirect to payment
          if (res.data.paymentUrl) {
            window.location.href = res.data.paymentUrl;
          } else if (res.mock) {
            // For mock orders, show message
            alert(`Order created (demo mode). In production, you would be redirected to payment gateway.`);
            router.push("/wallet");
          } else {
            // For other cases, redirect to wallet
            alert(`Order created. Please complete payment to access ${service.name}.`);
            router.push("/wallet");
          }
        } else {
          throw new Error(res.error || "Failed to create order");
        }
      }
    } catch (e: any) {
      alert(`Error: ${e?.message || "Failed to place order"}`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Toolbar - Matching AstroSage style */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 rounded-2xl p-4 shadow-lg border-2 border-amber-500">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <span className="text-xl">🏠</span>
            </Link>
            <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <span className="text-xl">📁</span>
            </button>
            <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <span className="text-xl">📄</span>
            </button>
            <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <span className="text-xl">🖨️</span>
            </button>
            <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <span className="text-xl">✏️</span>
            </button>
            <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <span className="text-xl">🗑️</span>
            </button>
            <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <span className="text-xl">🔗</span>
            </button>
            <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <span className="text-xl">⊞</span>
            </button>
            <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <span className="text-xl">🔍</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/wallet" className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center gap-2 font-semibold">
              <span className="text-xl">💰</span>
              <span>₹ {walletBalance !== null ? walletBalance.toFixed(1) : "0.0"}</span>
            </Link>
            <div className="flex items-center gap-1 bg-white/20 rounded-lg p-1">
              <button className="px-3 py-1 rounded bg-white text-amber-600 font-semibold text-sm">EN</button>
              <button className="px-3 py-1 rounded text-white hover:bg-white/20 font-semibold text-sm">हिं</button>
              <button className="px-3 py-1 rounded text-white hover:bg-white/20 font-semibold text-sm">த</button>
            </div>
          </div>
        </div>
      </div>

      {/* Paid Services Header */}
      <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-xl p-4 border-2 border-amber-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span>💎</span>
          <span>Paid Services</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">Premium astrology reports and services</p>
      </div>

      {/* Services Grid - Matching AstroSage layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {PAID_SERVICES.map((service) => (
          <Card key={service.id} className="border-2 border-slate-200 hover:shadow-xl transition-all overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col h-full">
                {/* Service Image/Icon */}
                <div className="bg-gradient-to-br from-saffron-100 to-amber-100 border-b-2 border-saffron-200 p-6 flex items-center justify-center">
                  <div className="text-6xl">{service.image}</div>
                </div>

                {/* Service Details */}
                <div className="flex-grow p-4 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 min-h-[3rem]">
                    {service.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="mt-auto pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-2xl font-bold text-slate-900">₹{service.price}</div>
                    </div>

                    {/* Order Button */}
                    <Button
                      onClick={() => handleOrder(service)}
                      disabled={loading === service.id}
                      className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      {loading === service.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin">⏳</span>
                          <span>Processing...</span>
                        </span>
                      ) : (
                        "ORDER NOW"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-saffron-50 to-amber-50 border-2 border-saffron-200">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-2">ℹ️ About Paid Services</h3>
            <p className="text-sm text-slate-700 leading-relaxed mb-4">
              Our paid services provide comprehensive, detailed astrology reports prepared by expert astrologers. 
              Each report includes in-depth analysis, predictions, and personalized remedies based on your birth chart.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center gap-2">
                <span className="text-saffron-600 font-bold">✓</span>
                <span>Expert Analysis</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-saffron-600 font-bold">✓</span>
                <span>PDF Download</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-saffron-600 font-bold">✓</span>
                <span>Lifetime Access</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
