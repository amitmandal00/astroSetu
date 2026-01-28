"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiPost, apiGet } from "@/lib/http";
import { Badge } from "@/components/ui/Badge";

type TwoFactorSetupProps = {
  onComplete: () => void;
  onCancel: () => void;
};

export function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState<"setup" | "verify">("setup");
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [manualEntryKey, setManualEntryKey] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (step === "setup") {
      setup2FA();
    }
  }, [step]);

  async function setup2FA() {
    setLoading(true);
    setError("");
    try {
      const res = await apiPost<{ ok: boolean; data?: { secret: string; qrCode: string; manualEntryKey: string }; error?: string }>("/api/auth/setup-2fa", {});
      if (!res.ok) throw new Error(res.error || "Failed to setup 2FA");
      
      setSecret(res.data!.secret);
      setQrCode(res.data!.qrCode);
      setManualEntryKey(res.data!.manualEntryKey);
    } catch (e: any) {
      setError(e.message || "Failed to setup 2FA");
    } finally {
      setLoading(false);
    }
  }

  async function verifySetup() {
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await apiPost<{ ok: boolean; data?: { enabled: boolean }; error?: string }>("/api/auth/verify-2fa-setup", {
        secret,
        code: verificationCode,
      });
      
      if (!res.ok) throw new Error(res.error || "Invalid code");
      
      onComplete();
    } catch (e: any) {
      setError(e.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  if (step === "setup") {
    return (
      <Card>
        <CardHeader title="Setup Two-Factor Authentication" subtitle="Scan QR code with your authenticator app" />
        <CardContent className="space-y-4">
          {loading && !qrCode ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-600 mx-auto mb-4"></div>
              <div className="text-slate-600">Generating QR code...</div>
            </div>
          ) : qrCode ? (
            <>
              <div className="text-center">
                <div className="text-sm text-slate-600 mb-4">
                  Scan this QR code with an authenticator app like:
                </div>
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  <Badge>Google Authenticator</Badge>
                  <Badge>Microsoft Authenticator</Badge>
                  <Badge>Authy</Badge>
                </div>
                <div className="inline-block p-4 bg-white rounded-xl border-2 border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="text-xs font-semibold text-slate-600 mb-2">Or enter manually:</div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <code className="text-xs font-mono break-all">{manualEntryKey}</code>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(manualEntryKey);
                  }}
                  className="text-xs text-saffron-600 hover:text-saffron-700 mt-2"
                >
                  Copy to clipboard
                </button>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setStep("verify")} className="flex-1">
                  I&apos;ve Scanned the Code
                </Button>
              </div>
            </>
          ) : error ? (
            <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Verify Setup" subtitle="Enter the 6-digit code from your authenticator app" />
      <CardContent className="space-y-4">
        <div>
          <div className="text-xs font-semibold text-slate-600 mb-2">Verification Code</div>
          <Input
            type="text"
            value={verificationCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setVerificationCode(value);
              setError("");
            }}
            placeholder="000000"
            maxLength={6}
            className="text-center text-2xl font-bold tracking-widest"
            autoFocus
          />
          <div className="text-xs text-slate-500 mt-2 text-center">
            Enter the 6-digit code from your authenticator app
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setStep("setup")} className="flex-1">
            Back
          </Button>
          <Button
            onClick={verifySetup}
            disabled={loading || verificationCode.length !== 6}
            className="flex-1"
          >
            {loading ? "Verifying..." : "Verify & Enable"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

