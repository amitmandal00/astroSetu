"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { Input } from "@/components/ui/Input";
import { apiPost, apiGet } from "@/lib/http";
import { Badge } from "@/components/ui/Badge";

type ContactCategory = "general" | "support" | "feedback" | "bug" | "partnership" | "other";

interface ContactInfo {
  emails: {
    support: { address: string; label: string; validated: boolean };
    privacy: { address: string; label: string; validated: boolean };
  };
  phone: {
    number: string;
    display: string;
    telLink: string;
    available: boolean;
    label: string;
  };
  whatsapp: {
    number: string;
    display: string;
    link: string;
    available24x7: boolean;
    label: string;
  };
  company: {
    name: string;
    address: { full: string; city: string; state: string; country: string };
    jurisdiction: string;
  };
  businessHours: {
    timezone: string;
    weekdays: { open: string; close: string; days: string };
    saturday: string | null;
    sunday: string;
  };
  availability: {
    isOpen: boolean;
    status: "open" | "closed";
    message: string;
    currentTime: string;
    nextOpenTime?: string;
    timezone: string;
  };
  autoResponse: {
    enabled: boolean;
    responseTime: string;
  };
}

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [contactInfoLoading, setContactInfoLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    category: "general" as ContactCategory,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch contact information on mount
  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const res = await apiGet<{ ok: boolean; data?: ContactInfo; error?: string }>("/api/contact/info");
        if (res.ok && res.data) {
          setContactInfo(res.data);
        } else {
          console.error("Failed to fetch contact info:", res.error);
          // Use fallback values if API fails
        }
      } catch (err) {
        console.error("Error fetching contact info:", err);
        // Use fallback values if API fails
      } finally {
        setContactInfoLoading(false);
      }
    }
    
    fetchContactInfo();
    
    // Refresh availability every minute
    const interval = setInterval(fetchContactInfo, 60000);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiPost<{
        ok: boolean;
        data?: { message: string; submissionId?: string; autoReplySent?: boolean };
        error?: string;
      }>("/api/contact", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        category: formData.category,
      });

      if (!res.ok) {
        throw new Error(res.error || "Failed to send message");
      }

      setSuccess(true);
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        category: "general",
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-white/90 text-base">
            Get in touch with our team for support, inquiries, or feedback
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader eyebrow="Get In Touch" title="Contact Information" />
          <CardContent className="space-y-6">
            {contactInfoLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin text-2xl">⏳</div>
                <span className="ml-2 text-slate-600">Loading contact information...</span>
              </div>
            ) : contactInfo ? (
              <>
                {/* Availability Status Badge */}
                <div className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge tone={contactInfo.availability.isOpen ? "green" : "neutral"}>
                        {contactInfo.availability.isOpen ? "● Open Now" : "○ Closed"}
                      </Badge>
                      <span className="text-sm text-slate-600">{contactInfo.availability.message}</span>
                    </div>
                  </div>
                  {contactInfo.autoResponse.enabled && (
                    <div className="text-xs text-slate-500 mt-2">
                      Auto-reply: Responses within {contactInfo.autoResponse.responseTime}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Support Email */}
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">📧</div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 mb-1">Email</div>
                      <a 
                        href={`mailto:${contactInfo.emails.support.address}`} 
                        className="text-indigo-600 hover:underline break-all"
                      >
                        {contactInfo.emails.support.address}
                      </a>
                      <div className="text-sm text-slate-600 mt-1">{contactInfo.emails.support.label}</div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">📞</div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                        Phone
                        {contactInfo.phone.available && (
                          <Badge tone="green" className="text-xs">Available</Badge>
                        )}
                      </div>
                      <a 
                        href={contactInfo.phone.telLink} 
                        className="text-indigo-600 hover:underline"
                      >
                        {contactInfo.phone.display}
                      </a>
                      <div className="text-sm text-slate-600 mt-1">{contactInfo.phone.label}</div>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">💬</div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                        WhatsApp
                        {contactInfo.whatsapp.available24x7 && (
                          <Badge tone="green" className="text-xs">24/7</Badge>
                        )}
                      </div>
                      <a 
                        href={contactInfo.whatsapp.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-600 hover:underline"
                      >
                        {contactInfo.whatsapp.display}
                      </a>
                      <div className="text-sm text-slate-600 mt-1">{contactInfo.whatsapp.label}</div>
                    </div>
                  </div>

                  {/* Company Address */}
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">📍</div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 mb-1">Legal Entity & Address</div>
                      <div className="text-slate-700">
                        {contactInfo.company.name}<br />
                        {contactInfo.company.address.full}
                      </div>
                      <div className="text-sm text-slate-600 mt-2">
                        <strong>Jurisdiction:</strong> {contactInfo.company.jurisdiction}
                      </div>
                    </div>
                  </div>

                  {/* Privacy Email */}
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">🔒</div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 mb-1">Privacy Matters</div>
                      <a 
                        href={`mailto:${contactInfo.emails.privacy.address}`} 
                        className="text-indigo-600 hover:underline break-all"
                      >
                        {contactInfo.emails.privacy.address}
                      </a>
                      <div className="text-sm text-slate-600 mt-1">{contactInfo.emails.privacy.label}</div>
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="font-semibold text-slate-900 mb-3">Business Hours ({contactInfo.businessHours.timezone})</div>
                  <div className="text-sm text-slate-700 space-y-1">
                    <div>
                      {contactInfo.businessHours.weekdays.days}: {contactInfo.businessHours.weekdays.open} - {contactInfo.businessHours.weekdays.close}
                    </div>
                    {contactInfo.businessHours.saturday && (
                      <div>Saturday: {contactInfo.businessHours.saturday}</div>
                    )}
                    <div>Sunday: {contactInfo.businessHours.sunday}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-500">
                Failed to load contact information. Please refresh the page.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardHeader eyebrow="Send Message" title="Contact Form" />
          <CardContent>
            {success && (
              <div className="mb-4 p-4 rounded-xl bg-green-50 border-2 border-green-200 text-green-700">
                <div className="flex items-start gap-2">
                  <span className="text-lg">✅</span>
                  <div>
                    <div className="font-semibold mb-1">Message Sent Successfully!</div>
                    <div className="text-sm">Thank you for contacting us. We&apos;ve sent you a confirmation email and will get back to you soon.</div>
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
                  Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone (Optional)</label>
                <Input
                  type="tel"
                  placeholder="+91 123 456 7890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Category
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ContactCategory })}
                  disabled={loading}
                >
                  <option value="general">General Inquiry</option>
                  <option value="support">Support Request</option>
                  <option value="feedback">Feedback</option>
                  <option value="bug">Bug Report</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="What is this regarding?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none"
                  rows={5}
                  placeholder="Your message..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  disabled={loading}
                />
                <div className="text-xs text-slate-500 mt-1">
                  {formData.message.length}/5000 characters
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <span className="animate-spin inline-block mr-2">⏳</span>
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>

              <div className="text-xs text-slate-500 text-center">
                By submitting this form, you agree to our{" "}
                <a href="/terms" className="text-indigo-600 hover:underline">Terms & Conditions</a>
                {" "}and{" "}
                <a href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</a>.
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

