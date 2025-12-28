"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { AIHeader } from "@/components/ai-astrology/AIHeader";
import { AIFooter } from "@/components/ai-astrology/AIFooter";
import { LEGAL_DATES } from "@/lib/legal-dates";

export default function RefundPage() {
  const effectiveDate = LEGAL_DATES.EFFECTIVE_DATE;
  const lastUpdated = LEGAL_DATES.LAST_UPDATED;

  return (
    <div className="min-h-screen flex flex-col">
      <AIHeader />
      <main className="flex-1 cosmic-bg">
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-800">Refund & Cancellation Policy</h1>
            <div className="text-slate-600 text-base space-y-1">
              <p>Effective Date: {effectiveDate}</p>
              <p>Last Updated: {lastUpdated}</p>
            </div>
          </div>

          <Card className="cosmic-card">
            <CardContent className="prose prose-slate max-w-none">
            <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
              {/* Digital Goods Notice */}
              <section className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-6">
                <p className="text-amber-900 font-semibold">
                  Because reports are generated instantly and are digital goods, refunds are limited once delivery occurs, except where required under Australian Consumer Law.
                </p>
              </section>

              {/* Australian Consumer Law */}
              <section className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
                <h2 className="text-xl font-bold text-slate-900 mb-3">Australian Consumer Law Rights</h2>
                <p className="text-indigo-900 font-semibold mb-2">
                  If you are in Australia, you have rights under the Australian Consumer Law (ACL) that cannot be excluded. Our refund policy does not limit your statutory rights.
                </p>
                <p className="text-indigo-800">
                  <strong>Consumer Guarantees:</strong> Under the ACL, our services must be:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-indigo-800">
                  <li>Provided with due care and skill</li>
                  <li>Fit for the disclosed purpose</li>
                  <li>Delivered within a reasonable time</li>
                </ul>
                <p className="mt-3 text-indigo-800">
                  If we fail to meet these guarantees, you may be entitled to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-indigo-800">
                  <li>A refund for services not yet provided</li>
                  <li>Re-performance of services</li>
                  <li>Compensation for damages or loss</li>
                </ul>
                <p className="mt-3 text-indigo-800">
                  <strong>Important Note:</strong> The ACL guarantees relate to service quality, not to the outcome of astrological interpretations (which are belief-based and non-deterministic).
                </p>
                <p className="mt-3 text-indigo-800">
                  For more information, visit the ACCC website: <a href="https://www.accc.gov.au" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">www.accc.gov.au</a>
                </p>
              </section>

              {/* Subscriptions */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Subscriptions</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Subscriptions can be cancelled anytime from your account or app store.</li>
                  <li>Cancellation stops future billing but does not retroactively refund used periods.</li>
                  <li>You can use your subscription until the end of the current billing period after cancellation.</li>
                  <li>Refunds for unused subscription periods may be available if required by law (e.g., ACL guarantees).</li>
                </ul>
              </section>

              {/* One-Time Reports */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">One-Time Reports & Digital Services</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Digital reports are generally non-refundable once delivered.</li>
                  <li>However, refunds are available if:
                    <ul className="list-disc list-inside space-y-1 ml-6 mt-2">
                      <li>Required by law (e.g., ACL consumer guarantees not met)</li>
                      <li>Technical error prevented report generation or delivery</li>
                      <li>Duplicate payment or unauthorized transaction</li>
                      <li>Purchase made by mistake within 2 hours (before report generation)</li>
                    </ul>
                  </li>
                  <li>Dissatisfaction with astrological interpretations does not entitle you to a refund, as interpretations are belief-based.</li>
                </ul>
              </section>

              {/* Store Purchases */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">App Store / Play Store Purchases</h2>
                <p>
                  Purchases made through the Apple App Store or Google Play Store are subject to their respective refund policies:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li><strong>App Store:</strong> Contact Apple Support or request a refund through your Apple ID account</li>
                  <li><strong>Google Play:</strong> Request a refund through Google Play within the applicable time limit</li>
                </ul>
                <p className="mt-3">
                  We cannot process refunds for app store purchases directly. You must go through the app store platform.
                </p>
              </section>

              {/* Refund Process */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Refund Processing</h2>
                <p className="font-semibold text-slate-900 mb-3">
                  Refunds are processed automatically in accordance with this policy. No manual refund handling or negotiation is provided.
                </p>
                <p>
                  Eligible refunds (as defined above) are processed automatically to the original payment method. Processing time depends on your payment provider (typically 7-14 business days for credit cards, faster for digital wallets).
                </p>
                <p className="mt-3">
                  For compliance requests related to refunds, see our <a href="/contact" className="text-indigo-600 hover:underline">Contact & Legal Information</a> page.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Contact</h2>
                <p>
                  For compliance requests related to refunds, see our <a href="/contact" className="text-indigo-600 hover:underline font-medium">Contact & Legal Information</a> page.
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  <strong>Note:</strong> Refunds are processed automatically according to this policy. No individual refund negotiation or manual processing is provided.
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

