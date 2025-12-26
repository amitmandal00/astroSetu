"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { HeaderPattern } from "@/components/ui/HeaderPattern";

export default function RefundPage() {
  const lastUpdated = "December 26, 2024";

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Refund Policy</h1>
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
                  This Refund Policy explains our policy regarding refunds for services, subscriptions, and consultations purchased through AstroSetu. By making a purchase, you agree to the terms outlined in this policy.
                </p>
              </section>

              {/* Digital Products */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">2. Digital Products & Reports</h2>
                <div className="bg-slate-50 border-l-4 border-slate-400 p-4 my-4 rounded-r-lg">
                  <p className="font-semibold text-slate-900 mb-2">General Policy:</p>
                  <p className="text-slate-800">
                    Due to the digital nature of our astrological reports, kundlis, and generated content, these are generally <strong>non-refundable</strong> once generated and delivered.
                  </p>
                </div>
                
                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">2.1 Refundable Cases</h3>
                <p>We may provide refunds in the following exceptional circumstances:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Technical error preventing report generation or delivery</li>
                  <li>Duplicate payment or unauthorized transaction</li>
                  <li>Purchase made by mistake within 2 hours of purchase (before report generation)</li>
                </ul>

                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">2.2 Non-Refundable Cases</h3>
                <p>Refunds will not be provided for:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Reports already generated and delivered</li>
                  <li>Dissatisfaction with astrological interpretations or predictions</li>
                  <li>Change of mind after viewing the report</li>
                  <li>Incorrect birth details provided by the user</li>
                  <li>Reports accessed or downloaded</li>
                </ul>
              </section>

              {/* Consultation Services */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">3. Consultation Services</h2>
                
                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">3.1 Cancellation & Refund</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Full Refund:</strong> Cancellation at least 24 hours before the scheduled consultation time</li>
                  <li><strong>50% Refund:</strong> Cancellation between 12-24 hours before the scheduled time</li>
                  <li><strong>No Refund:</strong> Cancellation less than 12 hours before the scheduled time, or no-show</li>
                  <li><strong>Rescheduling:</strong> One free rescheduling allowed if requested at least 24 hours in advance</li>
                </ul>

                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">3.2 Refund Process</h3>
                <p>
                  Refund requests must be submitted via email to <a href="mailto:support@astrosetu.com" className="text-indigo-600 hover:underline">support@astrosetu.com</a> or through your account dashboard. Include your order/transaction ID and reason for cancellation.
                </p>
              </section>

              {/* Subscriptions */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">4. Subscriptions</h2>
                
                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">4.1 Cancellation</h3>
                <p>
                  You can cancel your subscription at any time through your account settings. Cancellation will:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Stop future automatic renewals</li>
                  <li>Allow you to use the subscription until the end of the current billing period</li>
                  <li>Not provide refunds for the current billing period (no prorated refunds)</li>
                </ul>

                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">4.2 Auto-Renewal</h3>
                <p>
                  Subscriptions automatically renew at the end of each billing period unless cancelled before the renewal date. We will send a reminder email before renewal. You are responsible for cancelling before renewal to avoid charges.
                </p>

                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">4.3 Refund Eligibility</h3>
                <p>
                  Subscription refunds are only available within <strong>7 days</strong> of the initial purchase or renewal, and only if you have not used any subscription features during that period.
                </p>
              </section>

              {/* Refund Processing */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">5. Refund Processing</h2>
                
                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">5.1 Processing Time</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Refund requests are reviewed within <strong>3-5 business days</strong></li>
                  <li>Approved refunds are processed to your original payment method within <strong>7-14 business days</strong></li>
                  <li>Bank transfers may take additional time depending on your financial institution</li>
                </ul>

                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">5.2 Payment Method</h3>
                <p>
                  Refunds are issued to the original payment method used for the purchase. If that method is no longer available (e.g., expired card), please contact us to arrange an alternative method.
                </p>

                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">5.3 Transaction Fees</h3>
                <p>
                  Processing fees charged by payment gateways may be deducted from refunds in certain cases, as permitted by law. We will inform you of any deductions before processing.
                </p>
              </section>

              {/* Chargebacks */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">6. Chargebacks & Disputes</h2>
                <p>
                  If you initiate a chargeback or dispute with your payment provider without first contacting us, your account may be suspended pending resolution. We encourage you to contact us first at <a href="mailto:support@astrosetu.com" className="text-indigo-600 hover:underline">support@astrosetu.com</a> to resolve any issues.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">7. Contact Us</h2>
                <p>
                  For refund requests, questions, or concerns, please contact us:
                </p>
                <ul className="list-none space-y-1 ml-4 mt-2">
                  <li><strong>Email:</strong> <a href="mailto:support@astrosetu.com" className="text-indigo-600 hover:underline">support@astrosetu.com</a></li>
                  <li><strong>Website:</strong> <a href="/contact" className="text-indigo-600 hover:underline">Contact Us Page</a></li>
                </ul>
              </section>

              {/* Note */}
              <section className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mt-6">
                <p className="font-semibold text-amber-900 mb-2">Important Note:</p>
                <p className="text-amber-800 text-sm">
                  This refund policy is subject to change. We reserve the right to modify it at any time. Any changes will be posted on this page with an updated "Last Updated" date. Continued use of our Service after changes constitutes acceptance of the modified policy.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

