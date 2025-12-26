"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { HeaderPattern } from "@/components/ui/HeaderPattern";

export default function AccessibilityPage() {
  const effectiveDate = "December 26, 2024";

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Accessibility Statement</h1>
          <p className="text-white/90 text-base">
            Effective Date: {effectiveDate}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="prose prose-slate max-w-none">
            <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
              {/* Commitment */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Our Commitment</h2>
                <p>
                  AstroSetu is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to achieve these goals.
                </p>
              </section>

              {/* Standards */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Conformance Status</h2>
                <p>
                  The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. AstroSetu aims to conform to WCAG 2.1 Level AA standards.
                </p>
                <p className="mt-3">
                  We are actively working to achieve full compliance and continuously monitor and improve our accessibility features.
                </p>
              </section>

              {/* Features */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Accessibility Features</h2>
                <p>We have implemented the following accessibility features:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li>Keyboard navigation support throughout the site</li>
                  <li>Alt text for images and visual elements</li>
                  <li>Clear heading structure and semantic HTML</li>
                  <li>Sufficient color contrast ratios</li>
                  <li>Text resizing capabilities</li>
                  <li>Focus indicators for interactive elements</li>
                  <li>Screen reader compatibility</li>
                </ul>
              </section>

              {/* Known Issues */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Known Issues & Ongoing Improvements</h2>
                <p>
                  We are aware that some parts of AstroSetu may not be fully accessible. We are working to address these issues:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li>Continuing to improve form accessibility</li>
                  <li>Enhancing mobile accessibility features</li>
                  <li>Improving multimedia content accessibility</li>
                  <li>Regular accessibility audits and updates</li>
                </ul>
              </section>

              {/* Feedback */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Feedback & Reporting Issues</h2>
                <p>
                  AstroSetu aims to meet WCAG 2.1 AA standards. We do not provide individual accessibility assistance, but feedback may be submitted via email for compliance monitoring purposes.
                </p>
                <p className="mt-3">
                  For accessibility feedback (compliance monitoring only), see our <a href="/contact" className="text-indigo-600 hover:underline">Contact & Legal Information</a> page.
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  <strong>Note:</strong> No response timeline is guaranteed. Accessibility improvements are implemented as part of our ongoing platform development.
                </p>
              </section>

              {/* Legal */}
              <section className="bg-slate-50 border-l-4 border-slate-400 p-4 rounded-r-lg">
                <h2 className="text-xl font-bold text-slate-900 mb-3">Legal Compliance</h2>
                <p>
                  This accessibility statement is provided in accordance with the <strong>Disability Discrimination Act 1992 (Cth)</strong> and aligns with international standards including WCAG 2.1 and the Americans with Disabilities Act (ADA) where applicable.
                </p>
              </section>

              {/* Updates */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Updates to This Statement</h2>
                <p>
                  We will review and update this accessibility statement regularly. Last updated: {effectiveDate}
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

