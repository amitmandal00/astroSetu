"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiPost } from "@/lib/http";

type BankTransferPaymentProps = {
  amount: number;
  onSuccess: (amount: number) => void;
  onClose: () => void;
};

export function BankTransferPayment({ amount: initialAmount = 100, onSuccess, onClose }: BankTransferPaymentProps) {
  const [amount, setAmount] = useState(initialAmount.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);

  const bankDetails = {
    accountName: "AstroSetu Technologies",
    accountNumber: "1234567890123",
    ifscCode: "HDFC0001234",
    bankName: "HDFC Bank",
    branch: "Mumbai Main Branch"
  };

  async function handleGenerateReference() {
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum < 100) {
      setError("Amount must be at least ₹100");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await apiPost<{ ok: boolean; data?: { referenceNumber: string }; error?: string }>("/api/payments/create-bank-transfer", {
        amount: amountNum * 100, // Convert to paise
        method: "bank_transfer"
      });

      if (res.ok && res.data) {
        setReferenceNumber(res.data.referenceNumber);
      } else {
        throw new Error(res.error || "Failed to generate reference number");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to generate reference number");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyPayment() {
    if (!referenceNumber) {
      setError("Please generate a reference number first");
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum < 100) {
      setError("Amount must be at least ₹100");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await apiPost<{ ok: boolean; data?: { verified: boolean; success?: boolean; message?: string }; error?: string }>("/api/payments/verify-bank-transfer", {
        referenceNumber,
        amount: amountNum * 100
      });

      if (res.ok && res.data && (res.data.verified || res.data.success)) {
        onSuccess(amountNum);
        onClose();
      } else {
        setError(res.data?.message || "Payment not verified yet. Please ensure you have completed the bank transfer and try again.");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to verify payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 p-6">
      <div className="mb-4">
        <div className="text-xs font-semibold text-slate-500 mb-1">🏦 Bank Transfer</div>
        <h2 className="text-xl font-bold text-slate-900">Pay via Bank Transfer</h2>
      </div>
      
      <div className="space-y-4">
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

        {/* Bank Details */}
        <div className="p-4 bg-gradient-to-r from-saffron-50 to-amber-50 rounded-xl border-2 border-saffron-200">
          <div className="text-sm font-bold text-slate-900 mb-3">Bank Account Details</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Account Name:</span>
              <span className="font-semibold text-slate-900">{bankDetails.accountName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Account Number:</span>
              <span className="font-semibold text-slate-900 font-mono">{bankDetails.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">IFSC Code:</span>
              <span className="font-semibold text-slate-900 font-mono">{bankDetails.ifscCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Bank Name:</span>
              <span className="font-semibold text-slate-900">{bankDetails.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Branch:</span>
              <span className="font-semibold text-slate-900">{bankDetails.branch}</span>
            </div>
          </div>
        </div>

        {/* Amount Display */}
        {amount && parseFloat(amount) >= 100 && (
          <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Amount to Transfer:</span>
              <span className="text-2xl font-bold text-slate-900">₹{parseFloat(amount || "0").toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Reference Number */}
        {referenceNumber ? (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
            <div className="text-sm font-semibold text-emerald-900 mb-2">Reference Number:</div>
            <div className="text-lg font-bold text-emerald-800 font-mono mb-2">{referenceNumber}</div>
            <div className="text-xs text-emerald-700">
              Please include this reference number in the transfer remarks/notes
            </div>
          </div>
        ) : (
          <Button
            onClick={handleGenerateReference}
            disabled={loading || !amount || parseFloat(amount) < 100}
            className="w-full bg-gradient-to-r from-saffron-500 to-amber-500 hover:from-saffron-600 hover:to-amber-600 text-white font-bold"
          >
            {loading ? "Generating..." : "Generate Reference Number"}
          </Button>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border-2 border-rose-200 rounded-xl text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        {referenceNumber && (
          <div className="flex gap-3">
            <Button
              onClick={handleVerifyPayment}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold"
            >
              {loading ? "Verifying..." : "Verify Payment"}
            </Button>
            <Button
              onClick={onClose}
              variant="secondary"
              className="px-6"
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
          <div className="font-semibold mb-1">How to pay:</div>
          <ol className="list-decimal list-inside space-y-1">
            <li>Generate a reference number</li>
            <li>Transfer ₹{parseFloat(amount || "0").toFixed(2)} to the bank account above</li>
            <li>Include the reference number in transfer remarks</li>
            <li>Click &quot;Verify Payment&quot; after completing the transfer</li>
            <li>Payment will be verified within 1-2 business days</li>
          </ol>
        </div>

        {/* Note */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <div className="font-semibold mb-1">Note:</div>
          <div>Bank transfers may take 1-2 business days to process. Your wallet will be credited once the payment is verified.</div>
        </div>
      </div>
    </div>
  );
}

