"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { HeaderPattern } from "@/components/ui/HeaderPattern";

export default function PrivacyPage() {
  const effectiveDate = "December 26, 2024";

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-white/90 text-base">
            Effective Date: {effectiveDate}
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
                  AstroSetu ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and services (collectively, the "Service") available at https://astrosetu-app.vercel.app.
                </p>
                <p className="mt-3">
                  By using our Service, you consent to the data practices described in this Privacy Policy. If you do not agree with this policy, please do not use our Service.
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">1. Information We Collect</h2>
                <p>We may collect:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Name (optional)</li>
                  <li>Date of birth</li>
                  <li>Time of birth</li>
                  <li>Place of birth</li>
                  <li>Email address (if you create an account)</li>
                  <li>Usage data (pages viewed, features used)</li>
                  <li>Device and browser information</li>
                </ul>
              </section>

              {/* How We Use Information */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">2. How We Use Your Information</h2>
                <p>We use your data to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Generate astrological charts and insights</li>
                  <li>Improve app accuracy and performance</li>
                  <li>Provide customer support</li>
                  <li>Process subscriptions (if applicable)</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              {/* Astrology & AI Processing */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">3. Astrology & AI Processing</h2>
                <p>Birth details are processed by:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Astrology calculation engines</li>
                  <li>AI systems that generate interpretations</li>
                </ul>
                <p className="mt-3">
                  This processing is automated and informational only.
                </p>
              </section>

              {/* Data Storage & Security */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">4. Data Storage & Security</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We use reasonable security measures to protect your data</li>
                  <li>We do not guarantee absolute security</li>
                  <li>Sensitive data is not sold to third parties</li>
                </ul>
              </section>

              {/* Third-Party Services */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">5. Third-Party Services</h2>
                <p>We may use trusted third-party services for:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Hosting</li>
                  <li>Analytics</li>
                  <li>Payment processing</li>
                  <li>Astrology calculations</li>
                </ul>
                <p className="mt-3">
                  These services are bound by their own privacy policies.
                </p>
              </section>

              {/* Cookies & Analytics */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">6. Cookies & Analytics</h2>
                <p>AstroSetu may use cookies or similar technologies to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Improve user experience</li>
                  <li>Understand usage patterns</li>
                </ul>
                <p className="mt-3">
                  You may disable cookies in your browser, but some features may not work. See our <a href="/cookies" className="text-indigo-600 hover:underline">Cookie Policy</a> for more details.
                </p>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">7. Your Rights</h2>
                <p>Depending on your jurisdiction, you may have the right to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Access your data</li>
                  <li>Request correction or deletion</li>
                  <li>Withdraw consent</li>
                </ul>
                <p className="mt-3">
                  Requests can be sent to <a href="mailto:support@astrosetu.app" className="text-indigo-600 hover:underline">support@astrosetu.app</a>.
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">8. Children's Privacy</h2>
                <p>
                  AstroSetu is not intended for children under 13. We do not knowingly collect data from children.
                </p>
              </section>

              {/* Changes to Policy */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">9. Changes to This Policy</h2>
                <p>
                  We may update this policy from time to time. Continued use implies acceptance of changes.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
