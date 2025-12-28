"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { AIHeader } from "@/components/ai-astrology/AIHeader";
import { AIFooter } from "@/components/ai-astrology/AIFooter";
import { LEGAL_DATES } from "@/lib/legal-dates";

export default function DisclaimerPage() {
  const effectiveDate = LEGAL_DATES.EFFECTIVE_DATE;
  const lastUpdated = LEGAL_DATES.LAST_UPDATED;

  return (
    <div className="min-h-screen flex flex-col">
      <AIHeader />
      <main className="flex-1 cosmic-bg">
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-800">Astrology Disclaimer</h1>
            <div className="text-slate-600 text-base space-y-1">
              <p>Effective Date: {effectiveDate}</p>
              <p>Last Updated: {lastUpdated}</p>
            </div>
          </div>

          <Card className="cosmic-card">
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
                  All content is provided for informational purposes only. AstroSetu does not provide professional, medical, legal, or financial advice. Personalised insights are provided for informational and self-reflection purposes only.
                </p>
              </section>

              {/* No Guarantees Section */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">No Guarantees</h2>
                <p className="font-semibold text-slate-900 mb-3">
                  AstroSetu does not guarantee outcomes related to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Marriage or Relationships:</strong> We do not guarantee compatibility, relationship success, or marriage outcomes</li>
                  <li><strong>Career or Finances:</strong> We do not guarantee job success, promotions, financial gains, or business outcomes</li>
                  <li><strong>Health or Wellbeing:</strong> We do not guarantee health outcomes, medical diagnoses, or treatment effectiveness</li>
                  <li><strong>Legal Matters:</strong> We do not guarantee legal outcomes, court decisions, or legal advice</li>
                  <li><strong>Any Other Life Matters:</strong> Astrological interpretations are belief-based and should not be relied upon for critical decisions</li>
                </ul>
              </section>

              {/* Additional Information */}
              <section>
                <p className="text-slate-700">
                  For detailed terms and conditions, please see our <a href="/terms" className="text-indigo-600 hover:underline font-medium">Terms & Conditions</a> page.
                </p>
                <p className="mt-3 text-slate-700">
                  For compliance requests only, see our <a href="/contact" className="text-indigo-600 hover:underline font-medium">Contact & Legal Information</a> page.
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

