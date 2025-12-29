"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { AIHeader } from "@/components/ai-astrology/AIHeader";
import { AIFooter } from "@/components/ai-astrology/AIFooter";
import { LEGAL_DATES } from "@/lib/legal-dates";

export default function DataBreachPage() {
  const effectiveDate = LEGAL_DATES.EFFECTIVE_DATE;
  const lastUpdated = LEGAL_DATES.LAST_UPDATED;

  return (
    <div className="min-h-screen flex flex-col">
      <AIHeader />
      <main className="flex-1 cosmic-bg">
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-800">Data Breach Notification Policy</h1>
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
                <h2 className="text-xl font-bold text-slate-900 mb-3">Notifiable Data Breach Statement (Australia)</h2>
                <p>
                  AstroSetu takes data protection seriously.
                </p>
                <p className="mt-2">
                  In accordance with the Privacy Act 1988 (Cth) and the Notifiable Data Breaches (NDB) scheme, AstroSetu will notify affected individuals and the Office of the Australian Information Commissioner (OAIC) if a data breach is likely to result in serious harm.
                </p>
              </section>

              {/* What is a Data Breach */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">What Constitutes a Data Breach?</h2>
                <p>
                  A data breach occurs when personal information is:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li><strong>Accessed:</strong> Unauthorized access to personal information</li>
                  <li><strong>Disclosed:</strong> Unauthorized disclosure of personal information</li>
                  <li><strong>Lost:</strong> Loss of personal information that cannot be recovered</li>
                </ul>
                <p className="mt-3">
                  A breach is considered &quot;notifiable&quot; if it is likely to result in serious harm to individuals whose personal information is involved.
                </p>
              </section>

              {/* What is Serious Harm */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">What is Serious Harm?</h2>
                <p>
                  Serious harm may include:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Identity theft or fraud</li>
                  <li>Financial loss or harm</li>
                  <li>Threats to physical safety</li>
                  <li>Psychological harm, humiliation, or reputational damage</li>
                  <li>Discrimination or other forms of harm</li>
                </ul>
              </section>

              {/* Our Response */}
              <section className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                <h2 className="text-xl font-bold text-slate-900 mb-3">If a notifiable data breach occurs, we will:</h2>
                <ol className="list-decimal list-inside space-y-2 ml-4 mt-2 text-amber-800">
                  <li>Take immediate steps to contain and assess the breach</li>
                  <li>Determine the likelihood of serious harm</li>
                  <li>Notify affected individuals as soon as practicable</li>
                  <li>Report the breach to the OAIC where required</li>
                  <li>Take remedial action to prevent recurrence</li>
                </ol>
              </section>

              {/* What We Will Tell You */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Breach notifications may include:</h2>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Description of the breach</li>
                  <li>Types of information involved</li>
                  <li>Steps taken to contain the breach</li>
                  <li>Recommended actions for affected individuals</li>
                </ul>
              </section>

              {/* Reporting a Breach */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Reporting a Suspected Breach</h2>
                <p className="mb-3">
                  📧 <a href="mailto:privacy@mindveda.net" className="text-indigo-600 hover:underline font-medium">privacy@mindveda.net</a>
                </p>
                <p className="mb-3">
                  📧 <a href="mailto:security@mindveda.net" className="text-indigo-600 hover:underline font-medium">security@mindveda.net</a>
                </p>
                <p className="text-sm text-slate-600 italic">
                  This platform is fully automated. Breach reports are reviewed periodically in accordance with legal obligations.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Further Information</h2>
                <p className="mt-3 text-sm">
                  <strong>Office of the Australian Information Commissioner:</strong> <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">www.oaic.gov.au</a>
                </p>
                <p className="mt-3 text-sm">
                  This policy is part of our broader <a href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</a>.
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

