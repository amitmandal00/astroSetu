"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { AIHeader } from "@/components/ai-astrology/AIHeader";
import { AIFooter } from "@/components/ai-astrology/AIFooter";
import { LEGAL_DATES } from "@/lib/legal-dates";

export default function CompliancePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AIHeader />
      <main className="flex-1 cosmic-bg">
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-800">AstroSetu — Compliance & Governance Summary</h1>
            <div className="text-slate-600 text-base space-y-1">
              <p>Last Updated: {LEGAL_DATES.LAST_UPDATED}</p>
            </div>
          </div>

          <Card className="cosmic-card">
            <CardContent className="prose prose-slate max-w-none">
              <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
                {/* Platform Information */}
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">Platform Information</h2>
                  <ul className="list-none space-y-2 ml-0">
                    <li><strong>Platform Name:</strong> AstroSetu</li>
                    <li><strong>Nature:</strong> Fully automated, self-service digital astrology platform</li>
                    <li><strong>Human Involvement:</strong> None (AI-generated content only)</li>
                  </ul>
                </section>

                {/* Regulatory Position */}
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">Regulatory Position</h2>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Operates under Australian Consumer Law (ACL)</li>
                    <li>Complies with Australian Privacy Act 1988 (Cth)</li>
                    <li>No professional advice provided (medical, legal, financial, psychological)</li>
                    <li>Astrology content is belief-based and educational only</li>
                  </ul>
                </section>

                {/* Data & Privacy */}
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">Data & Privacy</h2>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>User data processed for report generation only</li>
                    <li>No live monitoring or profiling</li>
                    <li>Privacy access and deletion requests supported via automated compliance process</li>
                    <li>Data breach handling aligned with OAIC NDB Scheme</li>
                  </ul>
                </section>

                {/* Customer Interaction Model */}
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">Customer Interaction Model</h2>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>No live support</li>
                    <li>No consultations</li>
                    <li>No personalised human guidance</li>
                    <li>Fully self-service via FAQs and published policies</li>
                  </ul>
                </section>

                {/* Financial & Commercial Independence */}
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">Financial & Commercial Independence</h2>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Operates independently as a personal digital project</li>
                    <li>No conflict with employer systems, data, IP, or clients</li>
                    <li>No use of employer time, resources, or proprietary information</li>
                  </ul>
                </section>

                {/* Legal Entity Information */}
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">Legal Entity Information</h2>
                  <ul className="list-none space-y-2 ml-0">
                    <li><strong>Legal Entity:</strong> AstroSetu Services Pty Ltd</li>
                    <li><strong>ABN:</strong> [To be provided]</li>
                    <li><strong>Registered Office:</strong> [To be provided]</li>
                    <li><strong>Jurisdiction:</strong> Australia (Primary), India (Operations)</li>
                  </ul>
                </section>

                {/* Compliance Contact */}
                <section className="bg-slate-50 border-l-4 border-slate-400 p-4 rounded-r-lg">
                  <h2 className="text-xl font-bold text-slate-900 mb-3">Compliance Contact</h2>
                  <p className="text-base">
                    📧 <a href="mailto:compliance@astrosetu.app" className="text-indigo-600 hover:underline font-medium">compliance@astrosetu.app</a>
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

