"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { HeaderPattern } from "@/components/ui/HeaderPattern";

export default function RefundPage() {
  const effectiveDate = "December 26, 2024";

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Refund & Cancellation Policy</h1>
          <p className="text-white/90 text-base">
            Effective Date: {effectiveDate}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="prose prose-slate max-w-none">
            <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
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
                <h2 className="text-xl font-bold text-slate-900 mb-3">Refund Request Process</h2>
                <p>
                  To request a refund:
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-4 mt-2">
                  <li>Email us at <a href="mailto:support@astrosetu.app" className="text-indigo-600 hover:underline">support@astrosetu.app</a></li>
                  <li>Include: Order/transaction ID, reason for refund, and supporting details</li>
                  <li>We will review your request within 5 business days</li>
                  <li>If approved, refunds are processed within 7-14 business days to the original payment method</li>
                </ol>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Contact</h2>
                <p>
                  For refund requests or questions:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li><strong>Email:</strong> <a href="mailto:support@astrosetu.app" className="text-indigo-600 hover:underline font-medium">support@astrosetu.app</a></li>
                  <li><strong>Subject:</strong> &quot;Refund Request - [Order ID]&quot;</li>
                  <li><strong>Response Time:</strong> We aim to respond within 5 business days</li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

