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
              {/* Subscriptions */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Subscriptions</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Subscriptions can be cancelled anytime from your account or app store.</li>
                  <li>Cancellation stops future billing but does not retroactively refund used periods.</li>
                </ul>
              </section>

              {/* One-Time Reports */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">One-Time Reports</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Digital reports are non-refundable once delivered, unless required by law.</li>
                </ul>
              </section>

              {/* Store Purchases */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Store Purchases</h2>
                <p>
                  App Store / Play Store purchases are governed by their respective refund policies.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Contact</h2>
                <p>
                  For refund requests or questions:
                </p>
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

