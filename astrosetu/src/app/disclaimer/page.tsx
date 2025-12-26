"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { HeaderPattern } from "@/components/ui/HeaderPattern";

export default function DisclaimerPage() {
  const effectiveDate = "December 26, 2024";

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Astrology Disclaimer</h1>
          <p className="text-white/90 text-base">
            Effective Date: {effectiveDate}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="prose prose-slate max-w-none">
            <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
              {/* Main Disclaimer */}
              <section className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg">
                <p className="text-amber-900 font-semibold mb-4 text-base">
                  AstroSetu provides astrology-based insights derived from traditional belief systems.
                </p>
                <ul className="list-disc list-inside space-y-2 text-amber-800 ml-4">
                  <li>Astrology is not a science</li>
                  <li>Interpretations are subjective</li>
                  <li>Results may vary across cultures, astrologers, and systems</li>
                </ul>
                <p className="mt-4 text-amber-900 font-semibold">
                  All content is provided for guidance and reflection only.
                </p>
                <p className="mt-3 text-amber-900 font-semibold">
                  AstroSetu does not guarantee outcomes related to marriage, career, health, finances, or any other life matters.
                </p>
              </section>

              {/* Additional Information */}
              <section>
                <p className="text-slate-700">
                  For detailed terms and conditions, please see our <a href="/terms" className="text-indigo-600 hover:underline font-medium">Terms & Conditions</a> page.
                </p>
                <p className="mt-3 text-slate-700">
                  For questions or concerns, contact us at <a href="mailto:support@astrosetu.app" className="text-indigo-600 hover:underline font-medium">support@astrosetu.app</a>.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

