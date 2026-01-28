"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { AIHeader } from "@/components/ai-astrology/AIHeader";
import { AIFooter } from "@/components/ai-astrology/AIFooter";
import { LEGAL_DATES } from "@/lib/legal-dates";

export default function PrivacyPage() {
  const effectiveDate = LEGAL_DATES.EFFECTIVE_DATE;
  const lastUpdated = LEGAL_DATES.LAST_UPDATED;

  return (
    <div className="min-h-screen flex flex-col">
      <AIHeader />
      <main className="flex-1 cosmic-bg">
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-800">Privacy Policy</h1>
            <div className="text-slate-600 text-base space-y-1">
              <p>Effective Date: {effectiveDate}</p>
              <p>Last Updated: {lastUpdated}</p>
            </div>
          </div>

          <Card className="cosmic-card">
            <CardContent className="prose prose-slate max-w-none">
            <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
              {/* Plain-English Summary */}
              <section className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-6">
                <h2 className="text-lg font-bold text-slate-900 mb-3">In Short:</h2>
                <ul className="list-disc list-inside space-y-2 text-blue-900 ml-4">
                  <li>We only collect what&apos;s needed for reports</li>
                  <li>We don&apos;t sell your data</li>
                  <li>No humans read your charts</li>
                  <li>You can request deletion anytime</li>
                </ul>
              </section>

              {/* Australian Privacy Principles */}
              <section className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-3">1. Australian Privacy Principles (APP) Compliance</h2>
                <p className="text-indigo-900 font-semibold mb-4">
                  AstroSetu complies with all 13 Australian Privacy Principles (APPs) set out in Schedule 1 of the Privacy Act 1988 (Cth). This section explains our compliance with each principle:
                </p>
                
                <div className="space-y-4 text-indigo-900">
                  <div>
                    <h3 className="font-bold text-base mb-1">APP 1: Open and transparent management of personal information</h3>
                    <p className="text-sm text-indigo-800 ml-4">
                      We maintain this Privacy Policy and make it readily available on our website. We implement practices, procedures, and systems to ensure compliance with the APPs and to enable us to deal with privacy inquiries and complaints.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-1">APP 2: Anonymity and pseudonymity</h3>
                    <p className="text-sm text-indigo-800 ml-4">
                      Wherever possible and lawful, you may interact with us anonymously or using a pseudonym. However, some services (such as account creation, payments, or personalized reports) require personal information to function.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-1">APP 3: Collection of solicited personal information</h3>
                    <p className="text-sm text-indigo-800 ml-4">
                      We only collect personal information that is reasonably necessary for our functions or activities. We collect personal information by lawful and fair means and, where reasonable and practicable, directly from you. We do not collect sensitive information (such as health information) unless you consent and it is reasonably necessary for our services.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-1">APP 4: Dealing with unsolicited personal information</h3>
                    <p className="text-sm text-indigo-800 ml-4">
                      If we receive personal information we did not solicit, we will determine whether we could have collected it under APP 3. If not, we will destroy or de-identify it as soon as practicable, provided it is lawful and reasonable to do so.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-1">APP 5: Notification of the collection of personal information</h3>
                    <p className="text-sm text-indigo-800 ml-4">
                      At or before the time we collect personal information (or as soon as practicable after), we notify you about: the purposes of collection, who we may disclose it to, our Privacy Policy, and how to access and correct your information. You provide consent when you use our services or create an account.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-1">APP 6: Use or disclosure of personal information</h3>
                    <p className="text-sm text-indigo-800 ml-4">
                      We only use or disclose personal information for the primary purpose for which it was collected, or for related secondary purposes where you would reasonably expect such use or disclosure. We may also use or disclose it with your consent, or as required or authorized by law.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-1">APP 7: Direct marketing</h3>
                    <p className="text-sm text-indigo-800 ml-4">
                      We may use personal information for direct marketing only where you would reasonably expect it, you have consented, or we provide an opt-out mechanism. You can unsubscribe from marketing communications at any time by contacting us or using the unsubscribe link in our emails.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-1">APP 8: Cross-border disclosure of personal information</h3>
                    <p className="text-sm text-indigo-800 ml-4">
                      Before disclosing personal information to an overseas recipient, we take reasonable steps to ensure the recipient does not breach the APPs (unless an exception applies). We use contractual arrangements to protect your information when using overseas service providers.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-1">APP 9: Adoption, use or disclosure of government related identifiers</h3>
                    <p className="text-sm text-indigo-800 ml-4">
                      We do not adopt, use, or disclose government related identifiers (such as tax file numbers or Medicare numbers) as our own identifier, except in limited circumstances permitted by law.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-1">APP 10: Quality of personal information</h3>
                    <p className="text-sm text-indigo-800 ml-4">
                      We take reasonable steps to ensure the personal information we collect, use, and disclose is accurate, up-to-date, complete, and relevant. You can request corrections to ensure your information remains accurate.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-1">APP 11: Security of personal information</h3>
                    <p className="text-sm text-indigo-800 ml-4">
                      We take reasonable steps to protect personal information from misuse, interference, loss, unauthorized access, modification, or disclosure. This includes encryption, secure servers, access controls, and regular security reviews. We destroy or de-identify personal information when it is no longer needed.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-1">APP 12: Access to personal information</h3>
                    <p className="text-sm text-indigo-800 ml-4">
                      Upon request, we provide you with access to your personal information we hold, subject to exceptions under the Privacy Act. We respond to access requests within 30 days and may charge a reasonable fee for providing access.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-1">APP 13: Correction of personal information</h3>
                    <p className="text-sm text-indigo-800 ml-4">
                      We take reasonable steps to correct personal information to ensure it is accurate, up-to-date, complete, relevant, and not misleading. If we correct information, we notify third parties where reasonable and practicable. If we refuse a correction request, we provide written reasons.
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-indigo-100 rounded-lg">
                  <p className="text-sm font-semibold text-indigo-900 mb-2">Making a Privacy Complaint</p>
                  <p className="text-sm text-indigo-800 mb-2">
                    For privacy-related requests, contact <a href="mailto:privacy@mindveda.net" className="text-indigo-600 hover:underline font-medium">privacy@mindveda.net</a>. This is an automated compliance mailbox. AstroSetu does not provide live support. Please refer to FAQs and policies. Valid requests will be processed as required by law.
                  </p>
                  <p className="text-sm text-indigo-800">
                    If you are not satisfied with our response, you may lodge a complaint with the Office of the Australian Information Commissioner (OAIC) at <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium">www.oaic.gov.au</a> or by calling 1300 363 992.
                  </p>
                </div>
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
                  This processing is automated and informational only. Calculations may use internal engines or trusted third-party services, which are bound by their own privacy policies.
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
                <p className="mt-3 font-semibold text-slate-900">
                  <strong>Data Retention:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>We retain your personal information for as long as necessary to provide services and comply with legal obligations</li>
                  <li>Account data is retained until you request deletion or your account is inactive for 3 years</li>
                  <li>After deletion requests, data is removed within 30 days, except where retention is required by law (e.g., tax records)</li>
                  <li>Anonymous usage data may be retained for analytics purposes</li>
                </ul>
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
                  For privacy requests: <a href="mailto:privacy@mindveda.net" className="text-amber-700 hover:underline font-medium">privacy@mindveda.net</a>. For data breach notices: <a href="mailto:security@mindveda.net" className="text-amber-700 hover:underline font-medium">security@mindveda.net</a>. These are automated compliance mailboxes. AstroSetu does not provide live support. Valid requests will be processed as required by law.
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
                  <li>Astrology calculations (internal engines or trusted services)</li>
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
              <section className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                <h2 className="text-xl font-bold text-slate-900 mb-3">8. Your Rights</h2>
                <p className="text-green-900 font-semibold mb-3">Under Australian Privacy Principles (APPs) and applicable privacy laws, you have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2 text-green-800">
                  <li><strong>Access (APP 12):</strong> Request a copy of your personal information we hold. Valid requests will be handled as required by law and may charge a reasonable fee for providing access.</li>
                  <li><strong>Correction (APP 13):</strong> Request correction of inaccurate, incomplete, outdated, irrelevant, or misleading information. Valid requests will be handled as required by law where reasonable.</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information, subject to legal requirements (e.g., tax retention obligations).</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw consent for processing where applicable (e.g., marketing communications).</li>
                  <li><strong>Complain:</strong> Lodge a complaint with the Office of the Australian Information Commissioner (OAIC) or relevant privacy authority.</li>
                </ul>
                <p className="mt-4 text-green-900 font-semibold">
                  <strong>To Exercise Your Rights:</strong>
                </p>
                <p className="text-green-800">
                  For privacy-related requests, contact <a href="mailto:privacy@mindveda.net" className="text-green-700 hover:underline font-medium">privacy@mindveda.net</a>. Include your request details and verification information. This is an automated compliance mailbox. AstroSetu does not provide live support. Valid requests will be processed as required by law. No response timeline is guaranteed.
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
                  To exercise these rights, contact <a href="mailto:privacy@mindveda.net" className="text-blue-600 hover:underline font-medium">privacy@mindveda.net</a>. This is an automated compliance mailbox. AstroSetu does not provide live support. Valid requests will be processed as required by law. No response timeline is guaranteed.
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
              <section className="bg-slate-50 border-l-4 border-slate-400 p-4 rounded-r-lg">
                <h2 className="text-xl font-bold text-slate-900 mb-3">10. Contact Information & Privacy Officer</h2>
                <p className="font-semibold text-slate-900 mb-2">Data Controller & Privacy Officer:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li><strong>Business Name:</strong> MindVeda</li>
                  <li><strong>Trading As:</strong> AstroSetu AI</li>
                  <li><strong>ABN:</strong> 60 656 401 253</li>
                  <li><strong>Business Structure:</strong> Sole Trader</li>
                  <li><strong>Privacy Requests:</strong> <a href="mailto:privacy@mindveda.net" className="text-indigo-600 hover:underline font-medium">privacy@mindveda.net</a> (Privacy Act requests, data access, correction, deletion)</li>
                  <li><strong>Consumer Law:</strong> <a href="mailto:support@mindveda.net" className="text-indigo-600 hover:underline font-medium">support@mindveda.net</a> (Australian Consumer Law compliance)</li>
                  <li><strong>Legal Notices:</strong> <a href="mailto:legal@mindveda.net" className="text-indigo-600 hover:underline font-medium">legal@mindveda.net</a> (Legal notices, formal correspondence)</li>
                  <li><strong>Data Breach:</strong> <a href="mailto:security@mindveda.net" className="text-indigo-600 hover:underline font-medium">security@mindveda.net</a> (Data breach notifications)</li>
                  <li className="text-xs text-slate-600 italic ml-4 mt-2">All email addresses are automated compliance mailboxes. AstroSetu does not provide live support. Valid requests will be processed as required by law.</li>
                  <li><strong>Jurisdiction:</strong> Australia (Primary). India (Operational support only). All legal matters are governed by Australian law.</li>
                </ul>
                <p className="mt-4 font-semibold text-slate-900 mb-2">External Privacy Authority:</p>
                <p className="ml-4">
                  <strong>Australian Users:</strong> Office of the Australian Information Commissioner (OAIC): <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">www.oaic.gov.au</a> or 1300 363 992
                </p>
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

              {/* Operating Entity Notice */}
              <section className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-600 leading-relaxed">
                  <strong>AstroSetu AI</strong> is a fully automated astrology guidance platform.
                </p>
                <p className="text-sm text-slate-600 leading-relaxed mt-2">
                  <strong>Operated by MindVeda.</strong>
                </p>
                <p className="text-xs text-slate-500 mt-2 italic">
                  This platform is fully automated and provides educational guidance only.
                </p>
              </section>
            </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <AIFooter />
    </div>
  );
}
