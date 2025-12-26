"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { HeaderPattern } from "@/components/ui/HeaderPattern";

export default function DataBreachPage() {
  const effectiveDate = "December 26, 2024";

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Data Breach Notification Policy</h1>
          <p className="text-white/90 text-base">
            Effective Date: {effectiveDate}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="prose prose-slate max-w-none">
            <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
              {/* Overview */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Overview</h2>
                <p>
                  AstroSetu takes data security seriously. Under the Privacy Act 1988 (Cth), we are required to notify you and the Office of the Australian Information Commissioner (OAIC) if we experience a data breach that is likely to result in serious harm.
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
                <h2 className="text-xl font-bold text-slate-900 mb-3">Our Response Procedure</h2>
                <p className="font-semibold text-amber-900 mb-2">
                  If we become aware of a suspected or actual data breach, we will:
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-4 mt-2 text-amber-800">
                  <li><strong>Contain:</strong> Immediately take steps to contain the breach and prevent further unauthorized access</li>
                  <li><strong>Assess:</strong> Assess the scope and potential harm of the breach</li>
                  <li><strong>Notify:</strong> Notify affected individuals as soon as practicable</li>
                  <li><strong>Report:</strong> Report to the OAIC if the breach is likely to result in serious harm</li>
                  <li><strong>Remediate:</strong> Take steps to prevent similar breaches in the future</li>
                  <li><strong>Review:</strong> Review and update our security measures</li>
                </ol>
              </section>

              {/* Notification Timeline */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Notification Timeline</h2>
                <p>
                  <strong>If we assess that a breach is likely to result in serious harm:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li>We will notify affected individuals <strong>as soon as practicable</strong> after becoming aware</li>
                  <li>We will notify the OAIC <strong>within 30 days</strong> of becoming aware (if required)</li>
                  <li>If we cannot identify all affected individuals, we will publish a public notification</li>
                </ul>
              </section>

              {/* What We Will Tell You */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">What We Will Tell You</h2>
                <p>
                  If you are affected by a data breach, we will notify you with:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Description of the breach</li>
                  <li>Types of information involved</li>
                  <li>Steps we have taken to contain the breach</li>
                  <li>Steps you can take to protect yourself</li>
                  <li>Contact information for further assistance</li>
                </ul>
              </section>

              {/* What You Should Do */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">What You Should Do</h2>
                <p>
                  If you are notified of a data breach:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li><strong>Change Passwords:</strong> Change passwords for affected accounts immediately</li>
                  <li><strong>Monitor Accounts:</strong> Monitor your financial accounts and credit reports</li>
                  <li><strong>Be Vigilant:</strong> Watch for suspicious activity or unauthorized transactions</li>
                  <li><strong>Report Fraud:</strong> Report any suspicious activity to relevant authorities</li>
                  <li><strong>Contact Us:</strong> Contact us if you have concerns or need assistance</li>
                </ul>
              </section>

              {/* Reporting a Breach */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Reporting a Suspected Breach</h2>
                <p>
                  If you believe we have experienced a data breach, please contact us immediately:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li><strong>Privacy Officer:</strong> <a href="mailto:privacy@astrosetu.app" className="text-indigo-600 hover:underline font-medium">privacy@astrosetu.app</a></li>
                  <li><strong>Emergency Contact:</strong> <a href="mailto:security@astrosetu.app" className="text-indigo-600 hover:underline font-medium">security@astrosetu.app</a></li>
                  <li><strong>Subject Line:</strong> &quot;URGENT: Data Breach Report&quot;</li>
                </ul>
                <p className="mt-3">
                  Include as much detail as possible about the suspected breach.
                </p>
              </section>

              {/* Prevention */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Our Prevention Measures</h2>
                <p>
                  We implement multiple layers of security to prevent data breaches:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and assessments</li>
                  <li>Access controls and authentication measures</li>
                  <li>Staff training on data security</li>
                  <li>Incident response planning</li>
                  <li>Regular backups and disaster recovery procedures</li>
                </ul>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Contact & Further Information</h2>
                <p>
                  For questions about this policy or to report a breach:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li><strong>Privacy Officer:</strong> <a href="mailto:privacy@astrosetu.app" className="text-indigo-600 hover:underline">privacy@astrosetu.app</a></li>
                  <li><strong>Office of the Australian Information Commissioner:</strong> <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">www.oaic.gov.au</a></li>
                </ul>
                <p className="mt-3">
                  This policy is part of our broader <a href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</a>.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

