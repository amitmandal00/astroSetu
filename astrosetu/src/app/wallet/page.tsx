"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PaymentModal } from "@/components/payments/PaymentModal";
import { UPIPayment } from "@/components/payments/UPIPayment";
import { BankTransferPayment } from "@/components/payments/BankTransferPayment";
import type { Wallet } from "@/types/astrology";
import { apiGet } from "@/lib/http";
import { session } from "@/lib/session";
import { useRouter } from "next/navigation";

// Add ESC key handler for modals
function useEscapeKey(handler: () => void, isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handler();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isActive, handler]);
}

export default function WalletPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [showBankTransferModal, setShowBankTransferModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(100);

  // ESC key handlers
  useEscapeKey(() => setShowUPIModal(false), showUPIModal);
  useEscapeKey(() => setShowBankTransferModal(false), showBankTransferModal);

  // Check authentication
  useEffect(() => {
    const user = session.getUser();
    if (!user) {
      router.push("/login?redirect=/wallet");
      return;
    }
  }, [router]);

  useEffect(() => {
    async function fetchWallet() {
      try {
        const res = await apiGet<{ ok: boolean; data?: Wallet; error?: string }>("/api/wallet");
        if (!res.ok) throw new Error(res.error || "Failed to fetch wallet");
        setWallet(res.data ?? null);
      } catch (e: any) {
        console.error("Wallet fetch error:", e);
        // Fallback to mock data if API fails (for development)
        setWallet({
          balance: 0,
          currency: "INR",
          transactions: []
        });
      } finally {
        setLoading(false);
      }
    }
    fetchWallet();
  }, []);

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title="Loading..." />
        <CardContent>Loading wallet information...</CardContent>
      </Card>
    );
  }

  if (!wallet) {
    return (
      <Card>
        <CardHeader title="Wallet" />
        <CardContent>
          <div className="text-slate-600">No wallet found. Please create an account.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">My Wallet</h1>
        <p className="text-slate-600">Manage your wallet balance and view transaction history</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-0">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-2">Available Balance</div>
              <div className="text-5xl font-bold">₹{wallet.balance.toLocaleString()}</div>
              <div className="text-sm opacity-80 mt-2">Currency: {wallet.currency}</div>
            </div>
            <div className="text-6xl">💰</div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Button className="h-auto py-4" onClick={() => setShowPaymentModal(true)}>
          <div className="text-left w-full">
            <div className="text-lg font-semibold">➕ Add Money</div>
            <div className="text-sm opacity-80">Recharge your wallet</div>
          </div>
        </Button>
        <Button variant="secondary" className="h-auto py-4" disabled>
          <div className="text-left w-full">
            <div className="text-lg font-semibold">📤 Send Money</div>
            <div className="text-sm opacity-80">Transfer to another user (Coming soon)</div>
          </div>
        </Button>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={async (amount) => {
          // Refresh wallet balance
          try {
            const res = await apiGet<{ ok: boolean; data?: Wallet; error?: string }>("/api/wallet");
            if (res.ok && res.data) {
              setWallet(res.data);
            }
          } catch (e) {
            console.error("Failed to refresh wallet:", e);
          }
        }}
        minAmount={100}
        maxAmount={100000}
      />

      {/* UPI Payment Modal */}
      {showUPIModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUPIModal(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowUPIModal(false);
            }
          }}
          tabIndex={-1}
        >
          <div 
            className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border-2 border-slate-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Positioned above CardHeader */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowUPIModal(false);
              }}
              className="absolute top-2 right-2 z-[60] w-10 h-10 rounded-full bg-white hover:bg-rose-50 border-2 border-slate-300 hover:border-rose-300 flex items-center justify-center text-slate-700 hover:text-rose-700 transition-all text-2xl font-bold shadow-lg hover:shadow-xl"
              aria-label="Close"
              type="button"
            >
              ×
            </button>
            <UPIPayment
              amount={paymentAmount}
              onSuccess={async (amount) => {
                // Refresh wallet balance
                try {
                  const res = await apiGet<{ ok: boolean; data?: Wallet; error?: string }>("/api/wallet");
                  if (res.ok && res.data) {
                    setWallet(res.data);
                  }
                } catch (e) {
                  console.error("Failed to refresh wallet:", e);
                }
                setShowUPIModal(false);
              }}
              onClose={() => setShowUPIModal(false)}
            />
          </div>
        </div>
      )}

      {/* Bank Transfer Modal */}
      {showBankTransferModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowBankTransferModal(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowBankTransferModal(false);
            }
          }}
          tabIndex={-1}
        >
          <div 
            className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border-2 border-slate-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-t-2xl flex items-center justify-between z-10">
              <h3 className="text-lg font-bold">Generate Reference Number</h3>
              <button
                onClick={() => setShowBankTransferModal(false)}
                className="text-white hover:text-gray-200 text-3xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <BankTransferPayment
              amount={paymentAmount}
              onSuccess={async (amount) => {
                // Refresh wallet balance
                try {
                  const res = await apiGet<{ ok: boolean; data?: Wallet; error?: string }>("/api/wallet");
                  if (res.ok && res.data) {
                    setWallet(res.data);
                  }
                } catch (e) {
                  console.error("Failed to refresh wallet:", e);
                }
                setShowBankTransferModal(false);
              }}
              onClose={() => setShowBankTransferModal(false)}
            />
          </div>
        </div>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader eyebrow="Transaction History" title="Recent Transactions" />
        <CardContent>
          <div className="space-y-4">
            {wallet.transactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    txn.type === "credit" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  }`}>
                    {txn.type === "credit" ? "➕" : "➖"}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{txn.description}</div>
                    <div className="text-sm text-slate-600">{formatDate(txn.timestamp)}</div>
                  </div>
                </div>
                <div className={`text-lg font-bold ${
                  txn.type === "credit" ? "text-emerald-600" : "text-rose-600"
                }`}>
                  {txn.type === "credit" ? "+" : "-"}₹{txn.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader eyebrow="Payment Methods" title="Saved Payment Methods" />
        <CardContent>
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => {
                setPaymentAmount(100);
                setShowUPIModal(true);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  💳
                </div>
                <div>
                  <div className="font-semibold">UPI</div>
                  <div className="text-sm text-slate-600">Quick and secure payments</div>
                </div>
              </div>
              <Badge tone="green">Active</Badge>
            </div>
            <div 
              className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => {
                setPaymentAmount(100);
                setShowBankTransferModal(true);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  🏦
                </div>
                <div>
                  <div className="font-semibold">Bank Transfer</div>
                  <div className="text-sm text-slate-600">Direct bank transfer</div>
                </div>
              </div>
              <Button 
                variant="secondary" 
                className="text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setPaymentAmount(100);
                  setShowBankTransferModal(true);
                }}
              >
                Pay
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

