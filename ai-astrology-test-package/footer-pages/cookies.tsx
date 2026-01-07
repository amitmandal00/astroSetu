"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { AIHeader } from "@/components/ai-astrology/AIHeader";
import { AIFooter } from "@/components/ai-astrology/AIFooter";
import { LEGAL_DATES } from "@/lib/legal-dates";

export default function CookiesPage() {
  const effectiveDate = LEGAL_DATES.EFFECTIVE_DATE;
  const lastUpdated = LEGAL_DATES.LAST_UPDATED;

  return (
    <div className="min-h-screen flex flex-col">
      <AIHeader />
      <main className="flex-1 cosmic-bg">
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-800">Cookie Policy</h1>
            <div className="text-slate-600 text-base space-y-1">
              <p>Effective Date: {effectiveDate}</p>
              <p>Last Updated: {lastUpdated}</p>
            </div>
          </div>

          <Card className="cosmic-card">
          <CardContent className="prose prose-slate max-w-none">
            <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
              {/* Introduction */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">1. What Are Cookies?</h2>
                <p>
                  Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.
                </p>
              </section>

              {/* Types of Cookies */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">2. Types of Cookies We Use</h2>
                
                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">2.1 Essential Cookies</h3>
                <p>
                  These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt-out of these cookies.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Session management and authentication</li>
                  <li>Security and fraud prevention</li>
                  <li>Load balancing and performance</li>
                </ul>

                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">2.2 Analytics Cookies</h3>
                <p>
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Page views and navigation patterns</li>
                  <li>Time spent on pages</li>
                  <li>Error tracking and debugging</li>
                  <li>Popular features and services</li>
                </ul>

                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">2.3 Functional Cookies</h3>
                <p>
                  These cookies allow the website to remember choices you make and provide enhanced, personalized features.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Language preferences</li>
                  <li>Saved Kundli reports</li>
                  <li>Display preferences</li>
                  <li>Form data retention</li>
                </ul>

                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">2.4 Advertising Cookies</h3>
                <p>
                  These cookies are used to deliver relevant advertisements and track campaign effectiveness.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Ad targeting and personalization</li>
                  <li>Campaign performance measurement</li>
                  <li>Frequency capping</li>
                </ul>
              </section>

              {/* Third-Party Cookies */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">3. Third-Party Cookies</h2>
                <p>
                  We use services from third-party providers who may set their own cookies on your device:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li><strong>Google Analytics:</strong> For website analytics and performance tracking</li>
                  <li><strong>Payment Processors:</strong> For secure payment processing</li>
                  <li><strong>Social Media Platforms:</strong> For social sharing features</li>
                  <li><strong>Advertising Networks:</strong> For relevant ad delivery (if applicable)</li>
                </ul>
              </section>

              {/* Managing Cookies */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">4. How to Manage Cookies</h2>
                <p>
                  You can control and manage cookies in several ways:
                </p>
                
                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">4.1 Browser Settings</h3>
                <p>
                  Most browsers allow you to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>View cookies and delete them individually or all at once</li>
                  <li>Block cookies from specific websites</li>
                  <li>Block third-party cookies</li>
                  <li>Delete all cookies when you close your browser</li>
                  <li>Get notified when a cookie is set</li>
                </ul>
                
                <p className="mt-3">
                  Please note that blocking or deleting cookies may affect your ability to use certain features of our website.
                </p>

                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">4.2 Browser-Specific Instructions</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
                  <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                  <li><strong>Edge:</strong> Settings → Privacy, Search, and Services → Cookies and site permissions</li>
                </ul>
              </section>

              {/* Impact of Disabling */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">5. Impact of Disabling Cookies</h2>
                <p>
                  If you choose to disable cookies, some features of our website may not function properly:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>You may need to re-enter information more frequently</li>
                  <li>Some personalized features may not be available</li>
                  <li>Your preferences may not be saved</li>
                  <li>Some functionality may be limited</li>
                </ul>
              </section>

              {/* Updates */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">6. Updates to This Policy</h2>
                <p>
                  We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated &quot;Last Updated&quot; date. We encourage you to review this policy periodically.
                </p>
              </section>

              {/* Managing Cookies */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">7. Managing Cookies</h2>
                <p>
                  You may manage cookies through your browser settings as described above. No additional assistance or cookie management support is provided.
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

