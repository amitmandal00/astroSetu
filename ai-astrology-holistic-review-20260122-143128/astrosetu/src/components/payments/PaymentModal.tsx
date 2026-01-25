"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiPost, apiGet } from "@/lib/http";
import { session } from "@/lib/session";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
  minAmount?: number;
  maxAmount?: number;
};

export function PaymentModal({ isOpen, onClose, onSuccess, minAmount = 100, maxAmount = 100000 }: PaymentModalProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
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
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    // Check authentication first
    const user = session.getUser();
    if (!user) {
      setError("Please log in to add money to your wallet");
      setTimeout(() => {
        router.push("/login?redirect=/wallet");
      }, 2000);
      return;
    }

    const amountNum = parseFloat(amount);
    
    if (!amount || isNaN(amountNum) || amountNum < minAmount || amountNum > maxAmount) {
      setError(`Amount must be between ₹${minAmount} and ₹${maxAmount}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create order - include user info for session-based auth
      const user = session.getUser();
      const orderRes = await apiPost<{ ok: boolean; data?: any; mock?: boolean; error?: string }>("/api/payments/create-order", {
        amount: amountNum,
        currency: "INR",
        description: "Wallet Recharge",
        userId: user?.id,
        userEmail: user?.email,
      });

      if (!orderRes.ok || !orderRes.data) {
        throw new Error(orderRes.error || "Failed to create order");
      }

      const order = orderRes.data;

      // If mock order (development mode), skip Razorpay checkout
      if (orderRes.mock || !razorpayKeyId) {
        // Simulate payment success
        const verifyRes = await apiPost<{ ok: boolean; data?: any; error?: string }>("/api/payments/verify", {
          orderId: order.id,
          paymentId: `pay_mock_${Date.now()}`,
          signature: "mock_signature",
          amount: amountNum,
        });

        if (!verifyRes.ok) {
          throw new Error(verifyRes.error || "Payment verification failed");
        }

        onSuccess(amountNum);
        onClose();
        setAmount("");
        return;
      }

      // Real Razorpay payment
      const options = {
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: "AstroSetu",
        description: "Wallet Recharge",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyRes = await apiPost<{ ok: boolean; data?: any; error?: string }>("/api/payments/verify", {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              amount: amountNum,
            });

            if (!verifyRes.ok) {
              throw new Error(verifyRes.error || "Payment verification failed");
            }

            onSuccess(amountNum);
            onClose();
            setAmount("");
          } catch (err: any) {
            setError(err.message || "Payment verification failed");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          // Can be populated from user profile
        },
        theme: {
          color: "#9333ea", // Purple theme
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      rzp.on("payment.failed", function (response: any) {
        setError(`Payment failed: ${response.error.description || "Unknown error"}`);
        setLoading(false);
      });
    } catch (err: any) {
      setError(err.message || "Payment failed");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md relative">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="absolute -top-2 -right-2 z-[60] w-10 h-10 rounded-full bg-white hover:bg-rose-50 flex items-center justify-center text-slate-700 hover:text-rose-700 transition-all shadow-xl border-2 border-slate-300 hover:border-rose-300 cursor-pointer"
          aria-label="Close"
        >
          <span className="text-2xl font-bold leading-none">×</span>
        </button>
        <Card 
          className="w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader title="Add Money to Wallet" />
          <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Amount (₹)
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              placeholder={`Min: ₹${minAmount}, Max: ₹${maxAmount}`}
              min={minAmount}
              max={maxAmount}
              disabled={loading}
            />
            <div className="text-xs text-slate-500 mt-1">
              Enter amount between ₹{minAmount.toLocaleString()} and ₹{maxAmount.toLocaleString()}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={loading || !amount}
              className="flex-1"
            >
              {loading ? "Processing..." : "Pay Now"}
            </Button>
          </div>

          <div className="text-xs text-center text-slate-500">
            Secure payment powered by Razorpay
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}

