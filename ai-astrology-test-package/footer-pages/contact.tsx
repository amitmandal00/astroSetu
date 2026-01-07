"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AIHeader } from "@/components/ai-astrology/AIHeader";
import { AIFooter } from "@/components/ai-astrology/AIFooter";
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
  const [responseData, setResponseData] = useState<{ autoReplySent?: boolean; emailConfigured?: boolean } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiPost<{
        ok: boolean;
        data?: { message: string; submissionId?: string; autoReplySent?: boolean; emailConfigured?: boolean };
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

      setResponseData({
        autoReplySent: res.data?.autoReplySent,
        emailConfigured: res.data?.emailConfigured,
      });
      setSuccess(true);
      // Reset form
      setFormData({
        email: "",
        category: "data_deletion",
        message: "",
      });

      // Reset success message after 8 seconds
      setTimeout(() => {
        setSuccess(false);
        setResponseData(null);
      }, 8000);
    } catch (err: any) {
      setError(err?.message || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AIHeader />
      <main className="flex-1 cosmic-bg">
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-800">Legal & Compliance Contact</h1>
            <p className="text-slate-600 text-base mb-3 max-w-2xl mx-auto leading-relaxed">
              AstroSetu AI is a fully automated, self-service platform operated by MindVeda (ABN 60 656 401 253).
            </p>
            <p className="text-slate-600 text-sm max-w-2xl mx-auto mb-2">
              All reports are generated automatically using AI-based interpretive systems for educational and informational purposes only.
            </p>
            <p className="text-slate-600 text-sm max-w-2xl mx-auto">
              AstroSetu AI does not provide medical, legal, financial, psychological, or professional advice. No live consultations, personalised support, or human astrologers are offered.
            </p>
          </div>

          {/* Status Banner - Calm, Official */}
          <div className="mb-8">
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
              <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600">
                <span>Educational use only</span>
                <span>•</span>
                <span>Fully automated</span>
                <span>•</span>
                <span>No live support</span>
              </div>
            </div>
          </div>

          {/* Section 1: Self-Service First (Dominant) */}
          <Card className="cosmic-card mb-8">
            <CardHeader eyebrow="Start Here" title="Find answers instantly — no contact required" />
            <CardContent>
              <p className="text-sm text-slate-700 mb-6 leading-relaxed">
                AstroSetu is designed as a self-service platform.
                Most questions are answered in our published policies and FAQs below.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link 
                  href="/ai-astrology/faq" 
                  className="p-4 rounded-lg border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="text-2xl mb-2">📘</div>
                  <div className="font-semibold text-slate-900 mb-1">FAQs</div>
                  <div className="text-sm text-slate-600">
                    Common questions and answers
                  </div>
                </Link>

                <Link 
                  href="/terms" 
                  className="p-4 rounded-lg border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="text-2xl mb-2">📜</div>
                  <div className="font-semibold text-slate-900 mb-1">Terms & Disclaimer</div>
                  <div className="text-sm text-slate-600">
                    Service terms and legal disclaimers
                  </div>
                </Link>

                <Link 
                  href="/privacy" 
                  className="p-4 rounded-lg border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="text-2xl mb-2">🔒</div>
                  <div className="font-semibold text-slate-900 mb-1">Privacy Policy</div>
                  <div className="text-sm text-slate-600">
                    How we handle your data
                  </div>
                </Link>

                <Link 
                  href="/refund" 
                  className="p-4 rounded-lg border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="text-2xl mb-2">💳</div>
                  <div className="font-semibold text-slate-900 mb-1">Refund Policy</div>
                  <div className="text-sm text-slate-600">
                    Refund terms and conditions
                  </div>
                </Link>

                <Link 
                  href="/disclaimer" 
                  className="p-4 rounded-lg border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="text-2xl mb-2">ℹ️</div>
                  <div className="font-semibold text-slate-900 mb-1">Astrology Disclaimer</div>
                  <div className="text-sm text-slate-600">
                    Important information about our services
                  </div>
                </Link>

                <div className="p-4 rounded-lg border-2 border-slate-200 bg-slate-50">
                  <div className="text-2xl mb-2">🧮</div>
                  <div className="font-semibold text-slate-900 mb-1">How Calculations Work</div>
                  <div className="text-sm text-slate-600">
                    Coming soon: Explanation of our astrology calculations
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Compliance Contact (De-emphasized) */}
          <Card className="cosmic-card mb-8">
            <CardHeader eyebrow="Legal & Regulatory Contact" title="Legal & Regulatory Contact (Mandatory Disclosure)" />
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                AstroSetu AI is a self-service, fully automated platform.
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Compliance and regulatory contact emails are managed under the MindVeda domain for operational purposes.
              </p>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">
                AstroSetu AI does not provide live customer support, consultations, or personalised assistance.
              </p>

              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div>
                  <div className="font-medium text-slate-900 mb-2">Contact Information (Legal & Compliance Only)</div>
                  <div className="space-y-2 mb-3">
                    <div className="text-slate-700 text-sm">
                      <span className="font-medium">Privacy & Data Protection:</span> <a href="mailto:privacy@mindveda.net" className="text-amber-600 hover:underline">privacy@mindveda.net</a>
                    </div>
                    <div className="text-slate-700 text-sm">
                      <span className="font-medium">Legal & Compliance:</span> <a href="mailto:legal@mindveda.net" className="text-amber-600 hover:underline">legal@mindveda.net</a>
                    </div>
                    <div className="text-slate-700 text-sm">
                      <span className="font-medium">Security Reporting:</span> <a href="mailto:security@mindveda.net" className="text-amber-600 hover:underline">security@mindveda.net</a>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mb-2 italic">
                    These contact points exist solely for legal and regulatory compliance. No live support is provided.
                  </p>
                  <p className="text-xs text-slate-600 mb-2 mt-3">These mailboxes are used only for:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-xs text-slate-600">
                    <li>Privacy access, correction, or deletion requests</li>
                    <li>Legal notices</li>
                    <li>Regulatory correspondence</li>
                    <li>Data breach notifications</li>
                    <li>Dispute resolution (as required by law)</li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <div className="font-medium text-slate-900 mb-1">Operating Entity</div>
                  <div className="text-slate-700 text-sm">AstroSetu AI is operated by MindVeda.</div>
                  <div className="text-xs text-slate-500 mt-1">This platform is fully automated and provides educational guidance only.</div>
                </div>

                <div>
                  <div className="font-medium text-slate-900 mb-1">Jurisdiction</div>
                  <div className="text-slate-700 text-sm">Australia (Primary)</div>
                  <div className="text-slate-700 text-sm">India (Operational support only)</div>
                  <div className="text-slate-600 text-xs mt-1 italic">All legal matters are governed by Australian law.</div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <div className="font-medium text-slate-900 mb-1">Registered Office</div>
                  <div className="text-slate-700 text-sm">[To be provided]</div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <div className="text-xs text-slate-500 italic space-y-1">
                    <p>✔ No promise of response</p>
                    <p>✔ &quot;As required by law&quot; protects you</p>
                    <p>✔ App-store safe language</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Compliance Request Form (Minimal, Below Self-Help) */}
          <Card className="cosmic-card max-w-2xl mx-auto">
            <CardHeader eyebrow="Regulatory Requests" title="Regulatory Request Form" />
            <CardContent>
              {success && (
                <div className="mb-4 space-y-3">
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
                    <div className="text-sm">
                      <div className="font-semibold mb-1">Request Submitted</div>
                      <div>
                        Your regulatory request has been received. Valid requests will be handled as required by law. 
                        No response timeline is guaranteed.
                      </div>
                    </div>
                  </div>
                  {!responseData?.emailConfigured && (
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                      <div className="text-sm">
                        <div className="font-semibold mb-1">⚠️ Email Service Not Configured</div>
                        <div>
                          Your request has been saved, but acknowledgement emails are not being sent because the email service is not configured.
                          <br />
                          <br />
                          <strong>Your submission was received and saved.</strong> To enable email notifications, configure <code className="text-xs bg-amber-100 px-1 py-0.5 rounded">RESEND_API_KEY</code> in your environment variables.
                        </div>
                      </div>
                    </div>
                  )}
                  {responseData?.emailConfigured && !responseData?.autoReplySent && (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
                      <div className="text-sm">
                        <div className="font-semibold mb-1">📧 Email Status</div>
                        <div>
                          Email service is configured. If you don&apos;t receive an acknowledgement email, please check your spam folder.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mb-4 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                  <div className="text-sm">
                    <div className="font-semibold mb-1">Error</div>
                    <div>{error}</div>
                  </div>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={loading}
                    className="bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Request Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-400 bg-white"
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-400 resize-none bg-white"
                    rows={5}
                    placeholder="Please describe your regulatory request..."
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
                
                <Button 
                  type="submit" 
                  className="w-full cosmic-button py-4" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin inline-block mr-2">⏳</span>
                      Submitting...
                    </>
                  ) : (
                    "Submit Regulatory Request"
                  )}
                </Button>

                <p className="text-xs text-slate-500 text-center mt-2">
                  Requests unrelated to legal or privacy compliance will not receive a response.
                </p>

                <p className="text-xs text-slate-600 text-center mt-2 font-medium">
                  You will receive an automated acknowledgement email if your request is successfully submitted.
                </p>

                <div className="text-xs text-slate-500 text-center">
                  By submitting this form, you agree to our{" "}
                  <Link href="/terms" className="text-slate-600 hover:underline">Terms & Conditions</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-slate-600 hover:underline">Privacy Policy</Link>.
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <AIFooter />
    </div>
  );
}
