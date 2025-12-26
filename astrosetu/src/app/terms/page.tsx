"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { HeaderPattern } from "@/components/ui/HeaderPattern";

export default function TermsPage() {
  const effectiveDate = "December 26, 2024";

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Terms & Conditions</h1>
          <p className="text-white/90 text-base">
            Effective Date: {effectiveDate}
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
                  Welcome to AstroSetu ("we", "us", "our"). AstroSetu provides astrology-based tools, insights, and AI-generated interpretations for informational and spiritual guidance purposes only.
                </p>
                <p className="mt-3">
                  By accessing or using AstroSetu (website, mobile apps, or related services), you agree to be bound by these Terms & Conditions.
                </p>
                <p className="mt-3 font-semibold text-slate-900">
                  If you do not agree, please do not use the service.
                </p>
              </section>

              {/* Nature of Service */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">2. Nature of the Service</h2>
                <p>AstroSetu provides:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li>Birth chart (Kundli) generation</li>
                  <li>Astrology-based interpretations</li>
                  <li>AI-generated explanations</li>
                  <li>Reports and insights based on traditional astrological systems</li>
                </ul>
                <p className="mt-3 font-semibold text-slate-900">
                  All outputs are belief-based, non-deterministic, and indicative only.
                </p>
              </section>

              {/* No Professional Advice */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">3. No Professional Advice</h2>
                <p>AstroSetu does not provide:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Medical advice</li>
                  <li>Legal advice</li>
                  <li>Financial or investment advice</li>
                  <li>Psychological or mental health advice</li>
                </ul>
                <p className="mt-3 font-semibold text-slate-900">
                  You must not rely on AstroSetu for critical life decisions. Always consult qualified professionals where appropriate.
                </p>
              </section>

              {/* User Responsibility */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">4. User Responsibility</h2>
                <p>You acknowledge and agree that:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Astrology interpretations vary by belief system</li>
                  <li>Results may differ between astrologers, systems, or platforms</li>
                  <li>You are solely responsible for how you interpret and use the information provided</li>
                </ul>
                <p className="mt-3 font-semibold text-slate-900">
                  AstroSetu shall not be liable for decisions made based on the use of the platform.
                </p>
              </section>

              {/* Accounts & Data Accuracy */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">5. Accounts & Data Accuracy</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You are responsible for providing accurate birth details.</li>
                  <li>Incorrect data will result in incorrect outputs.</li>
                  <li>AstroSetu is not responsible for inaccuracies caused by user input.</li>
                </ul>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">6. Intellectual Property</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>The AstroSetu platform, design, software, and branding are owned by AstroSetu.</li>
                  <li>Generated reports and outputs are provided for personal use only.</li>
                  <li>You may not resell, redistribute, or commercially exploit content without permission.</li>
                </ul>
              </section>

              {/* Payments & Subscriptions */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">7. Payments & Subscriptions (If Applicable)</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Paid features, subscriptions, or reports are clearly described at purchase.</li>
                  <li>Prices may change at any time.</li>
                  <li>Subscriptions auto-renew unless cancelled before the renewal date.</li>
                </ul>
                <p className="mt-3">
                  Refunds are governed by the Refund Policy (see <a href="/refund" className="text-indigo-600 hover:underline">/refund</a>).
                </p>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">8. Limitation of Liability</h2>
                <p className="font-semibold text-slate-900 mb-2">To the maximum extent permitted by law:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>AstroSetu is provided "as is" and "as available"</li>
                  <li>We make no guarantees of accuracy, completeness, or outcomes</li>
                  <li>We are not liable for any direct, indirect, incidental, or consequential damages arising from use of the service</li>
                </ul>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">9. Termination</h2>
                <p>We may suspend or terminate access if:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>These terms are violated</li>
                  <li>Misuse or abuse of the platform occurs</li>
                  <li>Legal or operational reasons require it</li>
                </ul>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">10. Governing Law</h2>
                <p>
                  These Terms shall be governed by the laws of <strong>India</strong>, without regard to conflict-of-law principles.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">11. Contact</h2>
                <p>For questions or concerns:</p>
                <p className="mt-2">
                  📧 <a href="mailto:support@astrosetu.app" className="text-indigo-600 hover:underline font-medium">support@astrosetu.app</a>
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

