"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { AIHeader } from "@/components/ai-astrology/AIHeader";
import { AIFooter } from "@/components/ai-astrology/AIFooter";
import { LEGAL_DATES } from "@/lib/legal-dates";

export default function DisputesPage() {
  const effectiveDate = LEGAL_DATES.EFFECTIVE_DATE;
  const lastUpdated = LEGAL_DATES.LAST_UPDATED;

  return (
    <div className="min-h-screen flex flex-col">
      <AIHeader />
      <main className="flex-1 cosmic-bg">
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-800">Dispute Resolution Policy</h1>
            <div className="text-slate-600 text-base space-y-1">
              <p>Effective Date: {effectiveDate}</p>
              <p>Last Updated: {lastUpdated}</p>
            </div>
          </div>

          <Card className="cosmic-card">
          <CardContent className="prose prose-slate max-w-none">
            <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
              {/* Overview */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Our Commitment</h2>
                <p>
                  AstroSetu is committed to resolving any disputes or complaints fairly and promptly. We value your feedback and take all concerns seriously.
                </p>
              </section>

              {/* Step 1: Contact Us */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Step 1: Contact Us First</h2>
                <p>
                  Dispute and legal notices:
                </p>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mt-3">
                  <p className="text-sm text-slate-700 mb-2">
                    <strong>Legal & Disputes:</strong> <a href="mailto:legal@astrosetu.app" className="text-indigo-600 hover:underline">legal@astrosetu.app</a>
                  </p>
                  <p className="text-xs text-slate-600 italic mb-2">
                    This is an automated compliance mailbox. AstroSetu does not provide live support. Valid legal notices and disputes will be processed as required by law.
                  </p>
                  <p className="text-xs text-slate-600">
                    Include: Your account details, description of the issue, and any relevant documents. Use subject line: &quot;Complaint&quot; or &quot;Dispute&quot;
                  </p>
                </div>
                <p className="mt-3 text-sm text-slate-600 italic">
                  <strong>Note:</strong> AstroSetu is a fully automated platform. This inbox is monitored for legal and regulatory compliance only. No response timeline is guaranteed.
                </p>
              </section>

              {/* Internal Review */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Step 2: Internal Review</h2>
                <p>
                  Valid legal and compliance requests will be handled as required by law:
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-4 mt-2">
                  <li>Review of your complaint or dispute</li>
                  <li>Investigation of the matter</li>
                  <li>Review of relevant records and information</li>
                  <li>Response as required by applicable laws and regulations</li>
                </ol>
                <p className="mt-3 text-sm text-slate-600 italic">
                  This process is automated and compliance-focused. No response timeline is guaranteed.
                </p>
              </section>

              {/* Australian Users */}
              <section className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
                <h2 className="text-xl font-bold text-slate-900 mb-3">Step 3: External Dispute Resolution (Australian Users)</h2>
                <p className="text-indigo-900 font-semibold mb-2">
                  If we cannot resolve your complaint internally, Australian users have access to external dispute resolution bodies:
                </p>
                
                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">Consumer Complaints</h3>
                <p className="text-indigo-800">
                  <strong>Australian Competition & Consumer Commission (ACCC)</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-1 text-indigo-800">
                  <li>Website: <a href="https://www.accc.gov.au" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">www.accc.gov.au</a></li>
                  <li>Phone: 1300 302 502</li>
                  <li>For issues related to consumer guarantees, pricing, or unfair practices</li>
                </ul>

                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">Privacy Complaints</h3>
                <p className="text-indigo-800">
                  <strong>Office of the Australian Information Commissioner (OAIC)</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-1 text-indigo-800">
                  <li>Website: <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">www.oaic.gov.au</a></li>
                  <li>Phone: 1300 363 992</li>
                  <li>For privacy breaches or data protection issues</li>
                </ul>

                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">Other Options</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-1 text-indigo-800">
                  <li><strong>State/Territory Consumer Affairs:</strong> Contact your local consumer affairs office</li>
                  <li><strong>Small Claims Tribunal:</strong> For disputes involving financial loss</li>
                  <li><strong>Mediation Services:</strong> Independent mediation services available in your state</li>
                </ul>
              </section>

              {/* International Users */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Step 3: External Resolution (International Users)</h2>
                <p>
                  For users outside Australia:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li><strong>EU Users:</strong> Contact your local data protection authority for privacy-related complaints</li>
                  <li><strong>India:</strong> Consumer disputes can be filed with consumer forums under the Consumer Protection Act</li>
                  <li><strong>Other Jurisdictions:</strong> Contact relevant consumer protection or privacy authorities in your country</li>
                </ul>
              </section>

              {/* Alternative Dispute Resolution */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Alternative Dispute Resolution (ADR)</h2>
                <p>
                  If both parties agree, we may engage in:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li><strong>Mediation:</strong> An independent mediator helps facilitate a resolution</li>
                  <li><strong>Arbitration:</strong> A binding decision by an independent arbitrator</li>
                </ul>
                <p className="mt-3">
                  ADR can be faster and less expensive than court proceedings.
                </p>
              </section>

              {/* Legal Proceedings */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Legal Proceedings</h2>
                <p>
                  As a last resort, you may pursue legal action:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li><strong>Australian Users:</strong> Proceedings in Australian courts, subject to the jurisdiction clause in our Terms & Conditions</li>
                  <li><strong>International Users:</strong> As specified in the Terms & Conditions for your jurisdiction</li>
                </ul>
                <p className="mt-3">
                  We encourage you to exhaust all other dispute resolution options before pursuing legal action.
                </p>
              </section>

              {/* Types of Disputes */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Common Types of Disputes</h2>
                <p>
                  This policy covers disputes relating to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Service quality or delivery</li>
                  <li>Billing or payment issues</li>
                  <li>Account access or termination</li>
                  <li>Privacy or data protection</li>
                  <li>Refund requests</li>
                  <li>Terms and conditions interpretation</li>
                </ul>
              </section>

              {/* No Retaliation */}
              <section className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                <h2 className="text-xl font-bold text-slate-900 mb-3">No Retaliation</h2>
                <p className="text-green-900">
                  We will not retaliate against you for raising a complaint or dispute in good faith. Your account and services will not be affected by your complaint.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Contact Information</h2>
                <p>
                  Dispute and legal notices:
                </p>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mt-3">
                  <p className="text-sm text-slate-700 mb-2">
                    <strong>Legal & Disputes:</strong> <a href="mailto:legal@astrosetu.app" className="text-indigo-600 hover:underline">legal@astrosetu.app</a>
                  </p>
                  <p className="text-xs text-slate-600 italic">
                    This is an automated compliance mailbox. AstroSetu does not provide live support. Valid legal notices and disputes will be processed as required by law.
                  </p>
                </div>
              </section>

              {/* Updates */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Policy Updates</h2>
                <p>
                  We may update this dispute resolution policy from time to time. Last updated: {effectiveDate}
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

