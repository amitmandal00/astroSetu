"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPost, apiGet } from "@/lib/http";
import { session } from "@/lib/session";
import { logEvent, logError } from "@/lib/telemetry";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type UseSubscriptionPaymentProps = {
  plan: "weekly" | "yearly";
  price: number;
  currency: string;
  currencySymbol: string;
  countryCode?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function useSubscriptionPayment({
  plan,
  price,
  currency,
  currencySymbol,
  countryCode,
  onSuccess,
  onCancel,
}: UseSubscriptionPaymentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [razorpayKeyId, setRazorpayKeyId] = useState("");

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    // Get Razorpay key ID from API
    apiGet<{ ok: boolean; data?: { keyId: string } }>("/api/payments/config")
      .then((res) => {
        if (res.ok && res.data?.keyId) {
          setRazorpayKeyId(res.data.keyId);
        }
      })
      .catch(() => {
        // Ignore errors, will use mock mode
      });

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleSubscribe = async () => {
    // Check authentication
    const user = session.getUser();
    if (!user) {
      setError("Please log in to subscribe to AstroSetu Plus");
      setTimeout(() => {
        router.push("/login?redirect=/premium");
      }, 2000);
      return;
    }

    setLoading(true);
    setError("");

    try {
      logEvent("subscription_payment_start", { plan, price, currency });

      // Create subscription order
      const orderRes = await apiPost<{ ok: boolean; data?: any; mock?: boolean; error?: string }>(
        "/api/subscriptions/create",
        {
          plan,
          countryCode: countryCode || "IN",
          userId: user.id,
          userEmail: user.email,
        }
      );

      if (!orderRes.ok || !orderRes.data) {
        throw new Error(orderRes.error || "Failed to create subscription order");
      }

      const order = orderRes.data;

      // If mock order (development mode), simulate success
      if (orderRes.mock || !razorpayKeyId) {
        // Simulate payment success
        const verifyRes = await apiPost<{ ok: boolean; data?: any; error?: string }>(
          "/api/subscriptions/verify",
          {
            orderId: order.id,
            paymentId: `pay_mock_${Date.now()}`,
            signature: "mock_signature",
            plan,
            userId: user.id,
          }
        );

        if (!verifyRes.ok) {
          throw new Error(verifyRes.error || "Subscription verification failed");
        }

        logEvent("subscription_payment_success", { plan, mock: true });
        if (onSuccess) onSuccess();
        router.push("/premium?success=true");
        setLoading(false);
        return;
      }

      // Real Razorpay payment
      const options = {
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: "AstroSetu",
        description: `AstroSetu Plus – ${order.plan} subscription`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            setLoading(true);
            // Verify payment
            const verifyRes = await apiPost<{ ok: boolean; data?: any; error?: string }>(
              "/api/subscriptions/verify",
              {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                plan,
                userId: user.id,
              }
            );

            if (!verifyRes.ok) {
              throw new Error(verifyRes.error || "Subscription verification failed");
            }

            logEvent("subscription_payment_success", { plan, mock: false });
            if (onSuccess) onSuccess();
            router.push("/premium?success=true");
          } catch (err: any) {
            logError("subscription_payment_verify", err);
            setError(err.message || "Subscription verification failed");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          email: user.email || "",
          name: user.name || "",
        },
        theme: {
          color: "#f59e0b", // Amber theme
        },
        modal: {
          ondismiss: () => {
            if (onCancel) onCancel();
            logEvent("subscription_payment_cancelled", { plan });
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);
    } catch (err: any) {
      logError("subscription_payment_error", err);
      setError(err.message || "Failed to start subscription payment");
      setLoading(false);
    }
  };

  return { handleSubscribe, loading, error };
}
