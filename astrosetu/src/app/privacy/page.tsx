"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { HeaderPattern } from "@/components/ui/HeaderPattern";

export default function PrivacyPage() {
  const effectiveDate = "December 26, 2024";

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-white/90 text-base">
            Effective Date: {effectiveDate}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="prose prose-slate max-w-none">
            <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
              {/* Australian Privacy Principles */}
              <section className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-3">1. Australian Privacy Principles (APP) Compliance</h2>
                <p className="text-indigo-900 font-semibold mb-2">
                  AstroSetu complies with the Australian Privacy Principles (APPs) set out in the Privacy Act 1988 (Cth). This section explains our compliance:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-indigo-800">
                  <li><strong>APP 1:</strong> We maintain this Privacy Policy and make it readily available</li>
                  <li><strong>APP 3:</strong> We only collect personal information reasonably necessary for our functions</li>
                  <li><strong>APP 5:</strong> We notify you when collecting personal information</li>
                  <li><strong>APP 8:</strong> We take steps to ensure cross-border data transfers are protected</li>
                  <li><strong>APP 11:</strong> We implement security measures to protect personal information</li>
                  <li><strong>APP 12:</strong> You have the right to access your personal information</li>
                  <li><strong>APP 13:</strong> You can request correction of inaccurate information</li>
                </ul>
                <p className="mt-3 text-indigo-800">
                  For privacy complaints, contact our Privacy Officer at <a href="mailto:privacy@astrosetu.app" className="text-indigo-600 hover:underline font-medium">privacy@astrosetu.app</a> or the Office of the Australian Information Commissioner (OAIC) at <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">www.oaic.gov.au</a>.
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">2. Information We Collect</h2>
                <p>We may collect:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Name (optional)</li>
                  <li>Date of birth</li>
                  <li>Time of birth</li>
                  <li>Place of birth</li>
                  <li>Email address (if you create an account)</li>
                  <li>Usage data (pages viewed, features used)</li>
                  <li>Device and browser information</li>
                  <li>Payment information (processed securely by third parties)</li>
                </ul>
                <p className="mt-3">
                  <strong>When We Collect:</strong> We collect information when you use our services, create an account, make a purchase, or contact us.
                </p>
              </section>

              {/* How We Use Information */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Your Information</h2>
                <p>We use your data to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Generate astrological charts and insights</li>
                  <li>Improve app accuracy and performance</li>
                  <li>Provide customer support</li>
                  <li>Process subscriptions (if applicable)</li>
                  <li>Send service-related communications (with your consent for marketing)</li>
                  <li>Comply with legal obligations</li>
                  <li>Prevent fraud and ensure platform security</li>
                </ul>
                <p className="mt-3">
                  <strong>Legal Basis (GDPR - EU Users):</strong> We process your data based on: (1) your consent, (2) contractual necessity, (3) legitimate interests, or (4) legal obligations.
                </p>
              </section>

              {/* Astrology & AI Processing */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">4. Astrology & AI Processing</h2>
                <p>Birth details are processed by:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Astrology calculation engines</li>
                  <li>AI systems that generate interpretations</li>
                </ul>
                <p className="mt-3">
                  This processing is automated and informational only. We may use third-party APIs (such as Prokerala) for calculations, which are bound by their own privacy policies.
                </p>
              </section>

              {/* Data Storage & Security */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">5. Data Storage & Security</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We use reasonable security measures (encryption, secure servers, access controls) to protect your data</li>
                  <li>Data is stored on secure servers with industry-standard protections</li>
                  <li>We do not guarantee absolute security, but we take all reasonable steps to protect your information</li>
                  <li>Sensitive data is not sold to third parties</li>
                  <li>We regularly review and update our security practices</li>
                </ul>
                <p className="mt-3">
                  <strong>Data Retention:</strong> We retain your personal information for as long as necessary to provide services and comply with legal obligations. Account data is retained until you request deletion or your account is inactive for 3 years.
                </p>
              </section>

              {/* Data Breach Notification */}
              <section className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                <h2 className="text-xl font-bold text-slate-900 mb-3">5A. Data Breach Notification</h2>
                <p className="text-amber-900 font-semibold mb-2">
                  Under the Privacy Act 1988, we are required to notify you and the Office of the Australian Information Commissioner (OAIC) if we experience a data breach likely to result in serious harm.
                </p>
                <p className="text-amber-800">
                  <strong>What constitutes a data breach?</strong> A data breach occurs when personal information is accessed, disclosed, or lost in circumstances likely to result in serious harm.
                </p>
                <p className="mt-3 text-amber-800">
                  <strong>Our Response:</strong> If we become aware of a data breach, we will:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-amber-800">
                  <li>Contain the breach and assess potential harm</li>
                  <li>Notify affected individuals as soon as practicable</li>
                  <li>Report to the OAIC if required</li>
                  <li>Take steps to prevent future breaches</li>
                </ul>
                <p className="mt-3 text-amber-800">
                  If you believe we have experienced a data breach, please contact us immediately at <a href="mailto:privacy@astrosetu.app" className="text-amber-700 hover:underline font-medium">privacy@astrosetu.app</a>.
                </p>
                <p className="mt-3">
                  For detailed information, see our <a href="/data-breach" className="text-indigo-600 hover:underline">Data Breach Notification Policy</a>.
                </p>
              </section>

              {/* Third-Party Services */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">6. Third-Party Services & Cross-Border Disclosure</h2>
                <p>We may use trusted third-party services for:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Hosting (may be located outside Australia)</li>
                  <li>Analytics (Google Analytics, etc.)</li>
                  <li>Payment processing (Razorpay, Stripe, etc.)</li>
                  <li>Astrology calculations (Prokerala API, etc.)</li>
                </ul>
                <p className="mt-3">
                  <strong>Cross-Border Disclosure (APP 8):</strong> Your data may be stored or processed outside Australia. We take reasonable steps to ensure overseas recipients comply with privacy obligations similar to the APPs, including through contractual arrangements.
                </p>
                <p className="mt-3">
                  These services are bound by their own privacy policies, which we encourage you to review.
                </p>
              </section>

              {/* Cookies & Analytics */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">7. Cookies & Analytics</h2>
                <p>AstroSetu may use cookies or similar technologies to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Improve user experience</li>
                  <li>Understand usage patterns</li>
                  <li>Remember your preferences</li>
                  <li>Provide personalized content</li>
                </ul>
                <p className="mt-3">
                  You may disable cookies in your browser, but some features may not work. See our <a href="/cookies" className="text-indigo-600 hover:underline">Cookie Policy</a> for more details.
                </p>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">8. Your Rights</h2>
                <p>Depending on your jurisdiction, you may have the right to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw consent for processing where applicable</li>
                  <li><strong>Complain:</strong> Lodge a complaint with relevant privacy authorities</li>
                </ul>
                <p className="mt-3">
                  <strong>To Exercise Your Rights:</strong> Contact our Privacy Officer at <a href="mailto:privacy@astrosetu.app" className="text-indigo-600 hover:underline">privacy@astrosetu.app</a>. We aim to respond within 30 days.
                </p>
              </section>

              {/* GDPR Rights */}
              <section className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <h2 className="text-xl font-bold text-slate-900 mb-3">8A. Your Rights (GDPR - EU Users)</h2>
                <p className="text-blue-900 font-semibold mb-2">
                  If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2 text-blue-800">
                  <li><strong>Right of Access:</strong> You can request a copy of your personal data</li>
                  <li><strong>Right to Rectification:</strong> You can request correction of inaccurate data</li>
                  <li><strong>Right to Erasure:</strong> You can request deletion of your personal data (&quot;right to be forgotten&quot;)</li>
                  <li><strong>Right to Restrict Processing:</strong> You can request limitation of processing</li>
                  <li><strong>Right to Data Portability:</strong> You can request your data in a machine-readable format</li>
                  <li><strong>Right to Object:</strong> You can object to processing based on legitimate interests</li>
                  <li><strong>Right to Withdraw Consent:</strong> You can withdraw consent at any time</li>
                </ul>
                <p className="mt-3 text-blue-800">
                  To exercise these rights, contact <a href="mailto:privacy@astrosetu.app" className="text-blue-600 hover:underline font-medium">privacy@astrosetu.app</a>. We will respond within 30 days.
                </p>
                <p className="mt-3 text-blue-800">
                  You also have the right to lodge a complaint with your local data protection authority.
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">9. Children&apos;s Privacy</h2>
                <p>
                  AstroSetu is not intended for children under 13 (or 16 in the EU). We do not knowingly collect data from children without parental consent.
                </p>
                <p className="mt-3">
                  If we become aware that we have collected personal information from a child without parental consent, we will take steps to delete such information promptly.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">10. Contact Information</h2>
                <p>For privacy-related inquiries or complaints:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li><strong>Privacy Officer:</strong> <a href="mailto:privacy@astrosetu.app" className="text-indigo-600 hover:underline">privacy@astrosetu.app</a></li>
                  <li><strong>General Support:</strong> <a href="mailto:support@astrosetu.app" className="text-indigo-600 hover:underline">support@astrosetu.app</a></li>
                  <li><strong>Australian Users:</strong> Office of the Australian Information Commissioner (OAIC): <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">www.oaic.gov.au</a></li>
                </ul>
              </section>

              {/* Changes to Policy */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">11. Changes to This Policy</h2>
                <p>
                  We may update this policy from time to time. We will notify you of material changes by posting the updated policy on this page with a new effective date. Continued use after changes implies acceptance.
                </p>
                <p className="mt-3">
                  We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
