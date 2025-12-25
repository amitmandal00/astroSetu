"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiPost, apiGet } from "@/lib/http";
import { session } from "@/lib/session";
import { logEvent, logError } from "@/lib/telemetry";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { TwoFactorVerify } from "@/components/auth/TwoFactorVerify";
import { PhoneInput } from "@/components/ui/PhoneInput";

type LoginStep = "credentials" | "2fa" | "success";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRegister, setIsRegister] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone" | "otp">("email");
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    password: "", 
    otp: "",
    rememberMe: false,
    authorized: false,
    privacyConsent: false
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loginStep, setLoginStep] = useState<LoginStep>("credentials");
  const [userData, setUserData] = useState<any>(null);
  const [requires2FA, setRequires2FA] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Check if user is already logged in
  useEffect(() => {
    const user = session.getUser();
    if (user) {
      const redirect = searchParams.get("redirect") || "/kundli";
      router.push(redirect);
    }
  }, [router, searchParams]);

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  async function check2FAStatus(email: string) {
    try {
      const res = await apiGet<{ ok: boolean; data?: { enabled: boolean } }>(`/api/auth/check-2fa-status?email=${encodeURIComponent(email)}`);
      return res.data?.enabled || false;
    } catch {
      return false;
    }
  }

  async function handleSubmit() {
    // Validate privacy consent
    if (!formData.privacyConsent) {
      setErr("Please confirm that you understand how your data is used.");
      return;
    }
    
    setErr(null);
    setLoading(true);
    try {
      let res;
      if (isRegister) {
        res = await apiPost<{ ok: boolean; data?: any; error?: string }>("/api/auth/register", {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password || undefined
        });
      } else {
        if (loginMethod === "otp" && !otpSent) {
          // Send OTP first
          res = await apiPost<{ ok: boolean; data?: any; error?: string }>("/api/auth/send-otp", {
            phone: formData.phone
          });
          if (res.ok) {
            setOtpSent(true);
            setOtpCountdown(300); // 5 minutes
            setLoading(false);
            return;
          }
        } else if (loginMethod === "otp" && otpSent) {
          // Verify OTP
          res = await apiPost<{ ok: boolean; data?: any; error?: string }>("/api/auth/verify-otp", {
            phone: formData.phone,
            otp: formData.otp
          });
        } else {
          // Email login
          res = await apiPost<{ ok: boolean; data?: any; error?: string }>("/api/auth/login", {
            email: formData.email,
            password: formData.password || undefined
          });
        }
      }

      if (!res.ok) throw new Error(res.error || "Failed");
      
      // Check if 2FA is required
      if (!isRegister && res.data) {
        const has2FA = await check2FAStatus(res.data.email || formData.email);
        if (has2FA) {
          setUserData(res.data);
          setRequires2FA(true);
          setLoginStep("2fa");
          setLoading(false);
          return;
        }
      }
      
      // Save session with "Remember me" preference
      if (res.data) {
        session.save(res.data, formData.rememberMe);
        logEvent(isRegister ? "auth_register_success" : "auth_login_success", {
          method: isRegister ? "register" : loginMethod,
        });
      }

      // Redirect to intended page or default
      const redirect = searchParams.get("redirect") || "/kundli";
      router.push(redirect);
    } catch (e: any) {
      const errorMsg = e?.message || "Something went wrong";
      logError(isRegister ? "auth_register" : "auth_login", e, {
        method: isRegister ? "register" : loginMethod,
      });
      
      // Parse error message - handle both JSON and plain text
      let displayError = errorMsg;
      try {
        const parsed = JSON.parse(errorMsg);
        displayError = parsed.error || parsed.message || errorMsg;
      } catch {
        // Not JSON, use message as-is but clean it up
        if (errorMsg.includes("Please log in to continue")) {
          // For login page, show more helpful message
          displayError = "Invalid email or password. Please try again or use demo mode (leave password empty).";
        } else {
          displayError = errorMsg;
        }
      }
      
      setErr(displayError);
    } finally {
      setLoading(false);
    }
  }

  async function handle2FAVerify() {
    // 2FA verified, complete login
    if (userData) {
      session.save(userData);
      const redirect = searchParams.get("redirect") || "/kundli";
      router.push(redirect);
    }
  }

  function handle2FACancel() {
    setLoginStep("credentials");
    setRequires2FA(false);
    setUserData(null);
    setFormData({ ...formData, password: "" });
  }

  function resendOTP() {
    if (otpCountdown > 0) return;
    setOtpSent(false);
    setFormData({ ...formData, otp: "" });
    handleSubmit();
  }

  const canSubmit = isRegister
    ? formData.name && (formData.email || formData.phone)
    : loginMethod === "otp"
      ? otpSent
        ? formData.otp.length === 6
        : formData.phone.length >= 10 && formData.authorized
      : formData.email;

  // Show 2FA verification step
  if (loginStep === "2fa" && requires2FA) {
    return (
      <div className="max-w-md mx-auto">
        <TwoFactorVerify
          userId={userData?.id}
          email={userData?.email || formData.email}
          onVerify={handle2FAVerify}
          onCancel={handle2FACancel}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-saffron-50 via-amber-50 to-orange-50">
      <div className="w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Column - Branding & Benefits (AstroSage Style) */}
          <div className="hidden lg:block">
            <div className="text-center lg:text-left mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-saffron-500 to-amber-600 shadow-xl mb-6">
                <span className="text-5xl">🕉️</span>
              </div>
              <h1 className="text-5xl font-bold text-slate-900 mb-4">
                Welcome to AstroSetu
              </h1>
              <p className="text-lg text-slate-700 mb-8">
                Your trusted companion for accurate astrological insights and cosmic guidance
              </p>
            </div>
            
            {/* Benefits List */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-saffron-200">
                <span className="text-2xl">✨</span>
                <div>
                  <div className="font-bold text-slate-900 mb-1">Accurate Predictions</div>
                  <div className="text-sm text-slate-600">Powered by advanced Vedic astrology calculations</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-saffron-200">
                <span className="text-2xl">🔮</span>
                <div>
                  <div className="font-bold text-slate-900 mb-1">Expert Astrologers</div>
                  <div className="text-sm text-slate-600">Connect with certified Vedic astrologers</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-saffron-200">
                <span className="text-2xl">📊</span>
                <div>
                  <div className="font-bold text-slate-900 mb-1">Detailed Reports</div>
                  <div className="text-sm text-slate-600">Comprehensive Kundli and life predictions</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-saffron-200">
                <span className="text-2xl">🔐</span>
                <div>
                  <div className="font-bold text-slate-900 mb-1">Secure & Private</div>
                  <div className="text-sm text-slate-600">Your data is encrypted and protected</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Login Form */}
          <div className="w-full max-w-md mx-auto lg:max-w-full">
            <Card className="border-2 border-saffron-200 shadow-2xl relative overflow-hidden">
          <HeaderPattern />
          <div className="relative z-10">
            <CardHeader
              eyebrow={isRegister ? "✨ New Account" : "🔐 Secure Login"}
              title={isRegister ? "Create Your Account" : "Sign In to AstroSetu"}
              subtitle={isRegister ? "Start your astrological journey" : "Industry-standard security with 2FA support"}
            />
            <CardContent className="space-y-5">
              {/* Login Method Toggle (for login only) */}
              {!isRegister && (
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod("email");
                      setOtpSent(false);
                      setFormData({ ...formData, otp: "" });
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      loginMethod === "email"
                        ? "bg-white text-saffron-700 shadow-md"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    📧 Email
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod("phone");
                      setOtpSent(false);
                      setFormData({ ...formData, otp: "" });
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      loginMethod === "phone"
                        ? "bg-white text-saffron-700 shadow-md"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    📱 Phone
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod("otp");
                      setOtpSent(false);
                      setFormData({ ...formData, otp: "" });
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      loginMethod === "otp"
                        ? "bg-white text-saffron-700 shadow-md"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    🔢 OTP
                  </button>
                </div>
              )}

              {/* Registration Form */}
              {isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Password (Optional)
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                    />
                    <div className="text-xs text-slate-500 mt-1">
                      Leave empty for demo mode. Use 8+ characters with numbers and symbols for security.
                    </div>
                  </div>
                </>
              )}

              {/* Email Login */}
              {loginMethod === "email" && !isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && canSubmit && !loading) {
                          handleSubmit();
                        }
                      }}
                    />
                    <div className="text-xs text-slate-500 mt-1">
                      Optional for demo mode
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-saffron-600 focus:ring-saffron-500"
                    />
                    <label htmlFor="rememberMe" className="text-xs text-slate-600 cursor-pointer">
                      Remember me for 30 days
                    </label>
                  </div>
                </>
              )}

              {/* Phone Login */}
              {loginMethod === "phone" && !isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    required
                    autoComplete="tel"
                    autoFocus
                  />
                </div>
              )}

              {/* OTP Login */}
              {loginMethod === "otp" && !isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <PhoneInput
                      value={formData.phone}
                      onChange={(value) => setFormData({ ...formData, phone: value })}
                      placeholder="Enter phone number"
                      required
                      disabled={otpSent}
                    />
                  </div>
                  {/* Authorization Checkbox */}
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="authorized"
                      checked={formData.authorized}
                      onChange={(e) => setFormData({ ...formData, authorized: e.target.checked })}
                      className="w-4 h-4 mt-1 rounded border-slate-300 text-saffron-600 focus:ring-saffron-500"
                    />
                    <label htmlFor="authorized" className="text-xs text-slate-600 cursor-pointer">
                      I authorize AstroSetu to send me OTP on this number
                    </label>
                  </div>
                  {otpSent && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Enter OTP <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.otp}
                        onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                        placeholder="000000"
                        maxLength={6}
                        className="text-center text-2xl font-bold tracking-widest"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && formData.otp.length === 6 && !loading) {
                            handleSubmit();
                          }
                        }}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-slate-500">
                          OTP sent to {formData.phone}
                        </div>
                        {otpCountdown > 0 ? (
                          <div className="text-xs text-slate-500">
                            Resend in {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, "0")}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={resendOTP}
                            className="text-xs text-saffron-600 hover:text-saffron-700 font-semibold"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Error Message */}
              {err && (
                <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">⚠️</span>
                    <div className="flex-1">
                      <div className="font-semibold mb-1">Login Failed</div>
                      <div>{err}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons - AstroSage Style */}
              <div className="space-y-3">
                {loginMethod === "otp" && !otpSent ? (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={loading || !canSubmit || !formData.authorized}
                    className="w-full py-4 text-base font-bold shadow-lg bg-gradient-to-r from-saffron-500 to-orange-500 hover:from-saffron-600 hover:to-orange-600"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin inline-block mr-2">⏳</span>
                        Sending OTP...
                      </>
                    ) : (
                      "Get OTP"
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={loading || !canSubmit}
                    className="w-full py-4 text-base font-bold shadow-lg bg-gradient-to-r from-saffron-500 to-orange-500 hover:from-saffron-600 hover:to-orange-600"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin inline-block mr-2">⏳</span>
                        {isRegister ? "Creating Account..." : "Signing In..."}
                      </>
                    ) : isRegister ? (
                      "Create Account"
                    ) : loginMethod === "otp" && otpSent ? (
                      "Verify OTP & Login"
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                )}
                
                {/* AstroSetu ID Button */}
                {!isRegister && loginMethod === "email" && (
                  <Button 
                    variant="secondary"
                    onClick={() => {
                      setFormData({ ...formData, email: "demo@astrosetu.com" });
                      handleSubmit();
                    }}
                    disabled={loading}
                    className="w-full py-3 text-sm font-semibold"
                  >
                    AstroSetu ID
                  </Button>
                )}
              </div>

              {/* Toggle Register/Login */}
              <div className="text-center pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setLoginMethod("email");
                    setOtpSent(false);
                    setFormData({ name: "", email: "", phone: "", password: "", otp: "", rememberMe: false, authorized: false, privacyConsent: false });
                    setErr(null);
                  }}
                  className="text-sm text-saffron-600 hover:text-saffron-700 font-semibold"
                >
                  {isRegister ? "Already have an account? Sign in" : "Don&apos;t have an account? Register"}
                </button>
              </div>

          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-start gap-2 mb-2">
              <input
                type="checkbox"
                id="privacyConsent"
                checked={formData.privacyConsent || false}
                onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-saffron-600 focus:ring-saffron-500"
                required
              />
              <label htmlFor="privacyConsent" className="text-[11px] text-slate-600 cursor-pointer">
                I understand how my birth details and contact information are used.{" "}
                <Link href="/privacy" className="underline text-saffron-600 hover:text-saffron-700">
                  View Privacy &amp; Data Use
                </Link>
              </label>
            </div>
          </div>

              {/* Security Features */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex flex-wrap gap-2 justify-center mb-3">
                  <Badge className="text-xs">🔒 Secure</Badge>
                  <Badge className="text-xs">🛡️ 2FA Support</Badge>
                  <Badge className="text-xs">🔐 Encrypted</Badge>
                </div>
                <div className="text-xs text-slate-500 text-center">
                  {isRegister 
                    ? "By registering, you agree to our Terms & Conditions and Privacy Policy"
                    : "Your data is protected with industry-standard security measures"
                  }
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-600 mx-auto mb-4"></div><div className="text-slate-600">Loading...</div></div></div>}>
      <LoginPageContent />
    </Suspense>
  );
}
