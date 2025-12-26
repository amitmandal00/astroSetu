"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { Input } from "@/components/ui/Input";
import { apiPost } from "@/lib/http";
import Link from "next/link";

type ComplianceCategory = "data_deletion" | "account_access" | "legal_notice" | "privacy_complaint";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    email: "",
    category: "data_deletion" as ComplianceCategory,
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiPost<{
        ok: boolean;
        data?: { message: string; submissionId?: string };
        error?: string;
      }>("/api/contact", {
        email: formData.email.trim(),
        subject: `[${formData.category.toUpperCase().replace(/_/g, " ")}] Compliance Request`,
        message: formData.message.trim(),
        category: formData.category === "privacy_complaint" ? "privacy" : "general",
      });

      if (!res.ok) {
        throw new Error(res.error || "Failed to submit request");
      }

      setSuccess(true);
      // Reset form
      setFormData({
        email: "",
        category: "data_deletion",
        message: "",
      });

      // Reset success message after 8 seconds
      setTimeout(() => setSuccess(false), 8000);
    } catch (err: any) {
      setError(err?.message || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Contact & Legal Information</h1>
          <p className="text-white/90 text-base">
            Compliance requests and legal notices only
          </p>
        </div>
      </div>

      {/* Primary Message - Critical */}
      <Card className="border-2 border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h2 className="font-bold text-slate-900 mb-2">Self-Service Platform</h2>
              <p className="text-slate-700 text-sm leading-relaxed">
                <strong>AstroSetu is a self-service, automated platform.</strong> We do not provide live support, 
                consultations, or personalised assistance. This page is for compliance requests and legal notices only.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader eyebrow="Legal & Compliance" title="Contact Information" />
          <CardContent className="space-y-6">
            {/* General Contact */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="text-2xl">📧</div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 mb-1">General Contact (Required by Law)</div>
                  <a 
                    href="mailto:support@astrosetu.app" 
                    className="text-indigo-600 hover:underline break-all"
                  >
                    support@astrosetu.app
                  </a>
                  <div className="text-sm text-slate-600 mt-1">
                    <strong>Purpose:</strong> Legal notices, account access issues, compliance requests only
                  </div>
                  <div className="text-xs text-slate-500 mt-1 italic">
                    This email is monitored periodically. We do not guarantee responses to general inquiries.
                  </div>
                </div>
              </div>

              {/* Privacy Contact */}
              <div className="flex items-start gap-4">
                <div className="text-2xl">🔒</div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 mb-1">
                    Privacy & Data Protection (Mandatory under AU law)
                  </div>
                  <a 
                    href="mailto:privacy@astrosetu.app" 
                    className="text-indigo-600 hover:underline break-all"
                  >
                    privacy@astrosetu.app
                  </a>
                  <div className="text-sm text-slate-600 mt-1">
                    <strong>Purpose:</strong> Data access, correction, deletion, privacy complaints
                  </div>
                  <div className="text-xs text-slate-500 mt-1 italic">
                    This satisfies Australian Privacy Act requirements without creating support load.
                  </div>
                </div>
              </div>

              {/* Legal Entity */}
              <div className="flex items-start gap-4 pt-4 border-t border-slate-200">
                <div className="text-2xl">📍</div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 mb-1">Legal Entity & Jurisdiction</div>
                  <div className="text-slate-700 text-sm space-y-1">
                    <div><strong>Legal Entity:</strong> AstroSetu Services Pvt. Ltd.</div>
                    <div><strong>Operating Jurisdiction:</strong> Australia (primary)</div>
                    <div><strong>International Operations:</strong> India</div>
                  </div>
                </div>
              </div>
            </div>

            {/* What We Don't Offer */}
            <div className="pt-4 border-t border-slate-200">
              <div className="font-semibold text-slate-900 mb-3">What We Do NOT Offer</div>
              <div className="text-sm text-slate-700 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Phone support</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>WhatsApp or chat support</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Personal astrology consultations</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Interpretation assistance</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Refund negotiation via email</span>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-3 italic">
                This platform is fully automated. Most answers can be found in our self-help resources below.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Request Form */}
        <Card>
          <CardHeader eyebrow="Compliance Requests Only" title="Compliance Request Form" />
          <CardContent>
            {/* Important Notice */}
            <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-sm text-slate-700">
                <strong>This form is for compliance and account access requests only.</strong>
                <br />
                <span className="text-slate-600">
                  We do not provide customer support or personalised assistance.
                </span>
              </div>
            </div>

            {success && (
              <div className="mb-4 p-4 rounded-xl bg-green-50 border-2 border-green-200 text-green-700">
                <div className="flex items-start gap-2">
                  <span className="text-lg">✅</span>
                  <div>
                    <div className="font-semibold mb-1">Request Submitted</div>
                    <div className="text-sm">
                      Your compliance request has been received. We will process it according to 
                      applicable privacy laws. No response timeline is guaranteed.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-700">
                <div className="flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <div className="font-semibold mb-1">Error</div>
                    <div className="text-sm">{error}</div>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Request Category <span className="text-rose-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ComplianceCategory })}
                  disabled={loading}
                  required
                >
                  <option value="data_deletion">Data Deletion Request</option>
                  <option value="account_access">Account Access Issue</option>
                  <option value="legal_notice">Legal Notice</option>
                  <option value="privacy_complaint">Privacy Complaint</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none"
                  rows={5}
                  placeholder="Please describe your compliance request..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  disabled={loading}
                  maxLength={500}
                />
                <div className="text-xs text-slate-500 mt-1">
                  {formData.message.length}/500 characters
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <span className="animate-spin inline-block mr-2">⏳</span>
                    Submitting...
                  </>
                ) : (
                  "Submit Compliance Request"
                )}
              </Button>

              <div className="text-xs text-slate-500 text-center">
                By submitting this form, you agree to our{" "}
                <Link href="/terms" className="text-indigo-600 hover:underline">Terms & Conditions</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Self-Help Section */}
      <Card>
        <CardHeader eyebrow="Self-Help Resources" title="Find Answers Yourself" />
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link 
              href="/faq" 
              className="p-4 rounded-lg border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <div className="text-2xl mb-2">📘</div>
              <div className="font-semibold text-slate-900 mb-1">Help & FAQs</div>
              <div className="text-sm text-slate-600">
                Common questions and answers
              </div>
            </Link>

            <Link 
              href="/terms" 
              className="p-4 rounded-lg border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <div className="text-2xl mb-2">⚖️</div>
              <div className="font-semibold text-slate-900 mb-1">Terms & Disclaimer</div>
              <div className="text-sm text-slate-600">
                Service terms and legal disclaimers
              </div>
            </Link>

            <Link 
              href="/privacy" 
              className="p-4 rounded-lg border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <div className="text-2xl mb-2">🔐</div>
              <div className="font-semibold text-slate-900 mb-1">Privacy Policy</div>
              <div className="text-sm text-slate-600">
                How we handle your data
              </div>
            </Link>

            <Link 
              href="/refund" 
              className="p-4 rounded-lg border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <div className="text-2xl mb-2">💳</div>
              <div className="font-semibold text-slate-900 mb-1">Refund Policy</div>
              <div className="text-sm text-slate-600">
                Refund terms and conditions
              </div>
            </Link>

            <Link 
              href="/disclaimer" 
              className="p-4 rounded-lg border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <div className="text-2xl mb-2">ℹ️</div>
              <div className="font-semibold text-slate-900 mb-1">Astrology Disclaimer</div>
              <div className="text-sm text-slate-600">
                Important information about our services
              </div>
            </Link>

            <div className="p-4 rounded-lg border-2 border-slate-200 bg-slate-50">
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-semibold text-slate-900 mb-1">How Calculations Work</div>
              <div className="text-sm text-slate-600">
                Coming soon: Explanation of our astrology calculations
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
