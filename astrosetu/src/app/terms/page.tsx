"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { HeaderPattern } from "@/components/ui/HeaderPattern";

export default function TermsPage() {
  const lastUpdated = "December 26, 2024";

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Terms & Conditions</h1>
          <p className="text-white/90 text-base">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="prose prose-slate max-w-none">
            <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
              {/* Introduction */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduction</h2>
                <p>
                  Welcome to AstroSetu ("we," "our," or "us"). These Terms & Conditions ("Terms") govern your access to and use of our website, mobile application, and services (collectively, the "Service") available at https://astrosetu-app.vercel.app and related domains.
                </p>
                <p className="mt-3">
                  By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access or use the Service.
                </p>
              </section>

              {/* Astrology Disclaimer */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">2. Astrology Disclaimer & Nature of Service</h2>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-4 rounded-r-lg">
                  <p className="font-semibold text-amber-900 mb-2">⚠️ Important Notice:</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-800">
                    <li>Astrology is a belief-based system and not a science. Results are indicative and for guidance purposes only.</li>
                    <li>Our Service provides astrological interpretations, predictions, and guidance based on traditional Vedic astrology principles.</li>
                    <li>We do not guarantee the accuracy, completeness, or reliability of any astrological predictions or interpretations.</li>
                    <li>Astrological insights should not be treated as deterministic facts or absolute truths.</li>
                    <li>Our Service does not provide professional medical, legal, financial, or psychological advice.</li>
                  </ul>
                </div>
                <p className="mt-3">
                  You acknowledge that astrological predictions and interpretations are subjective, belief-based, and may vary between different astrological systems and practitioners. You are solely responsible for any decisions you make based on the information provided through our Service.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">3. Limitation of Liability</h2>
                <p className="font-semibold text-slate-900 mb-2">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We provide the Service "as is" and "as available" without warranties of any kind, either express or implied.</li>
                  <li>We are not liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.</li>
                  <li>We are not responsible for any emotional, financial, legal, health-related, or other consequences resulting from decisions made based on astrological information provided through our Service.</li>
                  <li>We do not guarantee that the Service will be uninterrupted, secure, or error-free.</li>
                  <li>You agree not to hold us liable for any outcomes, events, or circumstances related to your use of astrological services, including but not limited to:
                    <ul className="list-disc list-inside ml-6 mt-2">
                      <li>Marriage or relationship decisions</li>
                      <li>Career or business choices</li>
                      <li>Financial investments or transactions</li>
                      <li>Health-related decisions</li>
                      <li>Legal matters</li>
                    </ul>
                  </li>
                </ul>
              </section>

              {/* User Responsibility */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">4. User Responsibility</h2>
                <p>You agree that:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You are at least 18 years old (or the age of majority in your jurisdiction) to use our Service.</li>
                  <li>You will provide accurate and complete information when using our Service, including birth details for astrological calculations.</li>
                  <li>You will use the Service only for lawful purposes and in accordance with these Terms.</li>
                  <li>You will not use the Service to make decisions that could cause harm to yourself or others.</li>
                  <li>You understand that astrological guidance is not a substitute for professional advice from qualified experts in medicine, law, finance, or psychology.</li>
                  <li>You will consult appropriate professionals for matters requiring licensed expertise.</li>
                </ul>
              </section>

              {/* Content Ownership */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">5. Content Ownership & Intellectual Property</h2>
                <p>
                  The Service, including all text, graphics, logos, software, algorithms, and astrological calculations, is owned by AstroSetu or our licensors and is protected by copyright, trademark, and other intellectual property laws.
                </p>
                <p className="mt-3">
                  Generated Reports: Astrological reports, kundlis, and interpretations generated for you through our Service belong to you for personal use. However, you may not:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Resell or redistribute reports or content generated through our Service</li>
                  <li>Use generated content for commercial purposes without permission</li>
                  <li>Modify, copy, or create derivative works of our Service or algorithms</li>
                </ul>
                <p className="mt-3">
                  Third-Party Services: We use third-party APIs (including Prokerala) for astrological calculations. These services are governed by their respective terms of service and privacy policies.
                </p>
              </section>

              {/* Payments & Refunds */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">6. Payments, Subscriptions & Refunds</h2>
                <p>
                  If you purchase any paid services, subscriptions, or consultations through our Service:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Payment Terms:</strong> All payments are processed securely through third-party payment processors. You agree to provide accurate payment information.</li>
                  <li><strong>Subscription Auto-Renewal:</strong> If you subscribe to a recurring service, your subscription will automatically renew at the end of each billing period unless you cancel before the renewal date. You can cancel anytime through your account settings.</li>
                  <li><strong>Refund Policy:</strong> Refunds are subject to our Refund Policy (available at /refund). Generally:
                    <ul className="list-disc list-inside ml-6 mt-2">
                      <li>Digital reports and kundlis are generally non-refundable once generated</li>
                      <li>Consultation services may be refundable if cancelled at least 24 hours before the scheduled time</li>
                      <li>Subscription cancellations will stop future charges but do not entitle you to refunds for past periods</li>
                    </ul>
                  </li>
                  <li><strong>Price Changes:</strong> We reserve the right to change our pricing with reasonable notice.</li>
                </ul>
              </section>

              {/* Prohibited Uses */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">7. Prohibited Uses</h2>
                <p>You agree not to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Use the Service for any unlawful purpose or in violation of any laws</li>
                  <li>Impersonate any person or entity or falsely state your affiliation</li>
                  <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                  <li>Attempt to gain unauthorized access to any part of the Service</li>
                  <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
                  <li>Reproduce, duplicate, or copy any portion of the Service for commercial purposes</li>
                </ul>
              </section>

              {/* Account Security */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">8. Account Security</h2>
                <p>
                  If you create an account, you are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                </p>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">9. Termination</h2>
                <p>
                  We may terminate or suspend your access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
                </p>
                <p className="mt-3">
                  You may stop using the Service at any time. If you have a subscription, you must cancel it to stop future charges.
                </p>
              </section>

              {/* Changes to Terms */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">10. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on this page with an updated "Last Updated" date. Your continued use of the Service after changes become effective constitutes acceptance of the modified Terms.
                </p>
              </section>

              {/* Governing Law & Jurisdiction */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">11. Governing Law & Jurisdiction</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of <strong>India</strong>, without regard to its conflict of law provisions.
                </p>
                <p className="mt-3">
                  Any disputes arising out of or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the courts in <strong>New Delhi, India</strong>.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">12. Contact Us</h2>
                <p>
                  If you have any questions about these Terms, please contact us at:
                </p>
                <ul className="list-none space-y-1 ml-4 mt-2">
                  <li><strong>Email:</strong> legal@astrosetu.com</li>
                  <li><strong>Website:</strong> <a href="/contact" className="text-indigo-600 hover:underline">Contact Us Page</a></li>
                </ul>
              </section>

              {/* Acceptance */}
              <section className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 mt-6">
                <p className="font-semibold text-slate-900">
                  By using AstroSetu, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

