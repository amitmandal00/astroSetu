"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { apiPost } from "@/lib/http";

type UPIPaymentProps = {
  amount?: number;
  onSuccess: (amount: number) => void;
  onClose: () => void;
};

export function UPIPayment({ amount: initialAmount = 100, onSuccess, onClose }: UPIPaymentProps) {
  const [amount, setAmount] = useState(initialAmount.toString());
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Order will be created when user clicks "Pay via UPI"

  async function handleUPIPayment() {
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum < 100) {
      setError("Amount must be at least ₹100");
      return;
    }

    if (!upiId.trim()) {
      setError("Please enter your UPI ID");
      return;
    }

    // Validate UPI ID format (basic validation)
    const upiPattern = /^[\w.-]+@[\w]+$/;
    if (!upiPattern.test(upiId.trim())) {
      setError("Invalid UPI ID format. Example: yourname@paytm");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const currentOrderId = orderId; // Store current order ID for polling
      const res = await apiPost<{ ok: boolean; data?: { paymentUrl?: string; success?: boolean }; error?: string }>("/api/payments/initiate-upi", {
        orderId: currentOrderId,
        upiId: upiId.trim(),
        amount: amountNum * 100
      });

      if (res.ok && res.data) {
        if (res.data.paymentUrl) {
          // Open UPI app or redirect
          window.location.href = res.data.paymentUrl;
          // Start polling for payment status
          const pollInterval = setInterval(async () => {
            try {
              const statusRes = await apiPost<{ ok: boolean; data?: { status: string; success?: boolean }; error?: string }>("/api/payments/check-upi-status", {
                orderId: currentOrderId
              });
              if (statusRes.ok && statusRes.data && (statusRes.data.status === "paid" || statusRes.data.success)) {
                clearInterval(pollInterval);
                onSuccess(amountNum);
                onClose();
              }
            } catch (e) {
              // Ignore polling errors
            }
          }, 3000);
          // Stop polling after 5 minutes
          setTimeout(() => clearInterval(pollInterval), 300000);
        } else if (res.data.success) {
          // Payment successful
          onSuccess(amountNum);
          onClose();
        } else {
          setError("Payment initiation failed. Please try again.");
        }
      } else {
        throw new Error(res.error || "Failed to initiate UPI payment");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to process UPI payment");
    } finally {
      setLoading(false);
    }
  }

  const checkPaymentStatus = useCallback(async () => {
    if (!orderId) return;

    try {
      const res = await apiPost<{ ok: boolean; data?: { status: string; success?: boolean }; error?: string }>("/api/payments/check-upi-status", {
        orderId
      });

      if (res.ok && res.data) {
        if (res.data.status === "paid" || res.data.success) {
          onSuccess(parseFloat(amount));
          onClose();
        }
      }
    } catch (e) {
      // Ignore errors in polling
    }
  }, [orderId, amount, onSuccess, onClose]);

  // Poll for payment status if QR code is shown
  useEffect(() => {
    if (qrCode && orderId) {
      const interval = setInterval(checkPaymentStatus, 3000); // Check every 3 seconds
      return () => clearInterval(interval);
    }
  }, [qrCode, orderId, checkPaymentStatus]);

  return (
    <div className="space-y-4 relative">
      <CardHeader eyebrow="💳 UPI Payment" title="Pay via UPI" />
      
      <CardContent className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Enter Amount (₹)
          </label>
          <Input
            type="number"
            placeholder="100"
            value={amount}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || (parseFloat(val) >= 100 && parseFloat(val) <= 100000)) {
                setAmount(val);
                setError("");
              }
            }}
            className="w-full"
            min="100"
            max="100000"
          />
          <div className="text-xs text-slate-500 mt-1">
            Minimum: ₹100, Maximum: ₹100,000
          </div>
        </div>

        {/* QR Code (if available) */}
        {qrCode && (
          <div className="text-center p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
            <div className="text-sm font-semibold text-slate-700 mb-2">Scan QR Code</div>
            <div className="bg-white p-4 rounded-lg inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="UPI QR Code" className="w-48 h-48" />
            </div>
            <div className="text-xs text-slate-600 mt-2">
              Scan with any UPI app (PhonePe, Google Pay, Paytm, etc.)
            </div>
          </div>
        )}

        {/* UPI ID Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Enter UPI ID
          </label>
          <Input
            type="text"
            placeholder="yourname@paytm"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="w-full"
          />
          <div className="text-xs text-slate-500 mt-1">
            Examples: yourname@paytm, yourname@ybl, yourname@phonepe
          </div>
        </div>

        {/* Amount Display */}
        {amount && parseFloat(amount) >= 100 && (
          <div className="p-4 bg-gradient-to-r from-saffron-50 to-amber-50 rounded-xl border-2 border-saffron-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Amount to Pay:</span>
              <span className="text-2xl font-bold text-slate-900">₹{parseFloat(amount || "0").toFixed(2)}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border-2 border-rose-200 rounded-xl text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleUPIPayment}
            disabled={loading || !upiId.trim() || !amount || parseFloat(amount) < 100}
            className="flex-1 bg-gradient-to-r from-saffron-500 to-amber-500 hover:from-saffron-600 hover:to-amber-600 text-white font-bold"
          >
            {loading ? "Processing..." : "Pay via UPI"}
          </Button>
          <Button
            onClick={onClose}
            variant="secondary"
            className="px-6"
          >
            Cancel
          </Button>
        </div>

        {/* Payment Instructions */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
          <div className="font-semibold mb-1">How to pay:</div>
          <ol className="list-decimal list-inside space-y-1">
            <li>Enter your UPI ID or scan the QR code</li>
            <li>Click &quot;Pay via UPI&quot; to open your UPI app</li>
            <li>Complete the payment in your UPI app</li>
            <li>Payment will be verified automatically</li>
          </ol>
        </div>
      </CardContent>
    </div>
  );
}

