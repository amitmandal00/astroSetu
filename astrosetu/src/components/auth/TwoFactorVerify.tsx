"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiPost } from "@/lib/http";

type TwoFactorVerifyProps = {
  userId?: string;
  email?: string;
  onVerify: () => void;
  onCancel: () => void;
};

export function TwoFactorVerify({ userId, email, onVerify, onCancel }: TwoFactorVerifyProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleVerify() {
    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await apiPost<{ ok: boolean; data?: { verified: boolean }; error?: string }>("/api/auth/verify-2fa-login", {
        userId,
        email,
        code,
      });
      
      if (!res.ok || !res.data?.verified) {
        throw new Error(res.error || "Invalid code");
      }
      
      onVerify();
    } catch (e: any) {
      setError(e.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader 
        title="Two-Factor Authentication" 
        subtitle="Enter the 6-digit code from your authenticator app"
        icon="🔐"
      />
      <CardContent className="space-y-4">
        <div>
          <div className="text-xs font-semibold text-slate-600 mb-2">Verification Code</div>
          <Input
            type="text"
            value={code}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(value);
              setError("");
            }}
            placeholder="000000"
            maxLength={6}
            className="text-center text-2xl font-bold tracking-widest"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && code.length === 6) {
                handleVerify();
              }
            }}
          />
          <div className="text-xs text-slate-500 mt-2 text-center">
            Open your authenticator app and enter the code
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-sm">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} className="flex-1" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="flex-1"
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </div>

        <div className="text-xs text-slate-500 text-center">
          Having trouble? Contact support
        </div>
      </CardContent>
    </Card>
  );
}

