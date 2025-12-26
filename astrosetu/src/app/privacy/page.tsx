"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { HeaderPattern } from "@/components/ui/HeaderPattern";

export default function PrivacyPage() {
  const lastUpdated = "December 26, 2024";

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Privacy Policy</h1>
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
                  AstroSetu ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and services (collectively, the "Service") available at https://astrosetu-app.vercel.app.
                </p>
                <p className="mt-3">
                  By using our Service, you consent to the data practices described in this Privacy Policy. If you do not agree with this policy, please do not use our Service.
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">2. Information We Collect</h2>
                
                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">2.1 Personal Information</h3>
                <p>To provide astrological services, we collect the following information:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Birth Details:</strong> Date of birth, time of birth, place of birth (city, state, country), and coordinates (latitude/longitude) for accurate astrological calculations</li>
                  <li><strong>Account Information:</strong> Name, email address, phone number (optional), password (encrypted)</li>
                  <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely by third-party payment processors; we do not store full credit card numbers)</li>
                  <li><strong>Profile Information:</strong> Gender, preferences, saved kundlis, consultation history</li>
                </ul>

                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">2.2 Usage Information</h3>
                <p>We automatically collect certain information when you use our Service:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Device information (device type, operating system, browser type)</li>
                  <li>IP address and approximate location</li>
                  <li>Pages visited, features used, time spent on the Service</li>
                  <li>Search queries and interaction patterns</li>
                  <li>Error logs and performance data</li>
                </ul>

                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">2.3 Cookies & Tracking Technologies</h3>
                <p>
                  We use cookies, web beacons, and similar tracking technologies to enhance your experience, analyze usage, and provide personalized content. You can manage cookie preferences through your browser settings. See our <a href="/cookies" className="text-indigo-600 hover:underline">Cookie Policy</a> for more details.
                </p>
              </section>

              {/* How We Use Information */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Your Information</h2>
                <p>We use the collected information for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Service Provision:</strong> To generate astrological charts, kundlis, predictions, and personalized reports based on your birth details</li>
                  <li><strong>Account Management:</strong> To create and manage your account, process payments, and provide customer support</li>
                  <li><strong>Service Improvement:</strong> To analyze usage patterns, improve our algorithms, and enhance user experience</li>
                  <li><strong>Communication:</strong> To send service-related notifications, respond to inquiries, and send important updates (with your consent for marketing communications)</li>
                  <li><strong>Security:</strong> To detect and prevent fraud, abuse, and unauthorized access</li>
                  <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our Terms of Service</li>
                </ul>
              </section>

              {/* Third-Party Services */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">4. Third-Party Services & Data Sharing</h2>
                
                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">4.1 Astrology Calculation APIs</h3>
                <p>
                  We use third-party APIs, including <strong>Prokerala</strong>, for astrological calculations. When you request a kundli or astrological report:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Your birth details (date, time, place) are sent to these APIs to perform calculations</li>
                  <li>These services process data according to their own privacy policies</li>
                  <li>We ensure API providers follow industry-standard security practices</li>
                </ul>

                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">4.2 Other Third-Party Services</h3>
                <p>We may share information with:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Payment Processors:</strong> To process payments securely (Stripe, Razorpay, etc.)</li>
                  <li><strong>Analytics Providers:</strong> To understand usage patterns (Google Analytics, etc.)</li>
                  <li><strong>Cloud Hosting:</strong> To store and process data (Vercel, AWS, etc.)</li>
                  <li><strong>Customer Support:</strong> To provide assistance (email services, chat platforms)</li>
                </ul>

                <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">4.3 Legal Disclosures</h3>
                <p>
                  We may disclose your information if required by law, court order, or government request, or to protect our rights, property, or safety.
                </p>
              </section>

              {/* Data Storage & Security */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">5. Data Storage & Security</h2>
                <p><strong>Storage Duration:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Account information and saved kundlis are stored until you delete your account or request deletion</li>
                  <li>Some data may be retained for legal or business purposes (e.g., transaction records for tax compliance)</li>
                  <li>Astrological calculations may be processed transiently (not stored long-term) or cached for performance</li>
                </ul>
                <p className="mt-3"><strong>Security Measures:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Encryption in transit (HTTPS/TLS) and at rest for sensitive data</li>
                  <li>Secure password hashing and authentication</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and employee training</li>
                </ul>
                <p className="mt-3 text-amber-700 bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg">
                  <strong>Note:</strong> While we implement industry-standard security measures, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
                </p>
              </section>

              {/* User Rights */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">6. Your Rights & Choices</h2>
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Access:</strong> Request a copy of your personal data stored by us</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information through your account settings or by contacting us</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and associated data (subject to legal retention requirements)</li>
                  <li><strong>Data Portability:</strong> Request your data in a structured, machine-readable format</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
                  <li><strong>Cookie Preferences:</strong> Manage cookie settings through your browser</li>
                </ul>
                <p className="mt-3">
                  To exercise these rights, please contact us at <a href="mailto:privacy@astrosetu.com" className="text-indigo-600 hover:underline">privacy@astrosetu.com</a> or use the contact form on our website.
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">7. Children's Privacy</h2>
                <p>
                  Our Service is not intended for users under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child under 18, we will take steps to delete such information promptly. Parents or guardians should supervise their children's use of the internet and our Service.
                </p>
              </section>

              {/* International Users */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">8. International Data Transfers</h2>
                <p>
                  Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using our Service, you consent to the transfer of your information to these countries. We ensure appropriate safeguards are in place for such transfers.
                </p>
              </section>

              {/* Changes to Privacy Policy */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">9. Changes to This Privacy Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page with an updated "Last Updated" date. We encourage you to review this Privacy Policy periodically.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">10. Contact Us</h2>
                <p>
                  If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                </p>
                <ul className="list-none space-y-1 ml-4 mt-2">
                  <li><strong>Email:</strong> <a href="mailto:privacy@astrosetu.com" className="text-indigo-600 hover:underline">privacy@astrosetu.com</a></li>
                  <li><strong>Website:</strong> <a href="/contact" className="text-indigo-600 hover:underline">Contact Us Page</a></li>
                </ul>
              </section>

              {/* GDPR Note */}
              <section className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 mt-6">
                <h3 className="text-lg font-semibold text-indigo-900 mb-2">Note for EU/UK Users (GDPR)</h3>
                <p className="text-indigo-800 text-sm">
                  If you are located in the European Union or United Kingdom, you have additional rights under the General Data Protection Regulation (GDPR). These include the right to object to processing, the right to restrict processing, and the right to lodge a complaint with a supervisory authority. Please contact us if you wish to exercise these rights.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
