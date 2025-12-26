"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { HeaderPattern } from "@/components/ui/HeaderPattern";

export default function DisclaimerPage() {
  const lastUpdated = "December 26, 2024";

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Astrology Disclaimer</h1>
          <p className="text-white/90 text-base">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="prose prose-slate max-w-none">
            <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
              {/* Critical Warning */}
              <section className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <h2 className="text-xl font-bold text-red-900 mb-3">⚠️ Critical Notice</h2>
                <p className="text-red-800 font-semibold mb-2">
                  Astrology is a belief-based system and NOT a science. The information provided through AstroSetu is for informational, entertainment, and guidance purposes only.
                </p>
                <p className="text-red-800">
                  <strong>DO NOT</strong> make critical life decisions (marriage, career, finance, health, legal matters) based solely on astrological interpretations or predictions.
                </p>
              </section>

              {/* Nature of Astrology */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">1. Nature of Astrological Services</h2>
                <p>
                  AstroSetu provides astrological services based on traditional Vedic astrology principles and calculations. These services include:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Birth chart (Kundli) generation and analysis</li>
                  <li>Astrological predictions and interpretations</li>
                  <li>Dosha analysis and remedies</li>
                  <li>Compatibility matching (Guna Milan, Nakshatra Porutham)</li>
                  <li>Horoscope readings (daily, weekly, monthly, yearly)</li>
                  <li>Auspicious timing calculations (Muhurat, Panchang, Choghadiya)</li>
                </ul>
                <p className="mt-3">
                  <strong>Important:</strong> These interpretations are based on ancient belief systems and should be understood as symbolic, indicative, and open to interpretation rather than deterministic facts.
                </p>
              </section>

              {/* No Guarantees */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">2. No Guarantees or Warranties</h2>
                <p>We explicitly state that:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>No Accuracy Guarantee:</strong> We do not guarantee the accuracy, completeness, or reliability of any astrological predictions, interpretations, or calculations.</li>
                  <li><strong>Variability:</strong> Astrological interpretations may vary between different systems, astrologers, and schools of thought. Our interpretations represent one perspective among many.</li>
                  <li><strong>No Outcome Guarantee:</strong> We do not guarantee any specific outcomes, results, or consequences based on astrological guidance.</li>
                  <li><strong>Belief-Based:</strong> Astrology is a matter of personal belief and faith. It is not scientifically proven or universally accepted.</li>
                </ul>
              </section>

              {/* Not Professional Advice */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">3. Not Professional Advice</h2>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-4 rounded-r-lg">
                  <p className="font-semibold text-amber-900 mb-2">AstroSetu does NOT provide:</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-800">
                    <li><strong>Medical Advice:</strong> Our services are not a substitute for medical diagnosis, treatment, or advice from licensed healthcare professionals.</li>
                    <li><strong>Legal Advice:</strong> We do not provide legal counsel or guidance. Consult qualified lawyers for legal matters.</li>
                    <li><strong>Financial Advice:</strong> Our predictions should not be used for investment, financial planning, or business decisions. Consult certified financial advisors.</li>
                    <li><strong>Psychological Counseling:</strong> For mental health concerns, consult licensed psychologists or therapists.</li>
                    <li><strong>Marriage Counseling:</strong> For relationship issues, consult professional counselors or therapists.</li>
                  </ul>
                </div>
              </section>

              {/* User Responsibility */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">4. User Responsibility</h2>
                <p>By using AstroSetu, you acknowledge and agree that:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Personal Decisions:</strong> You are solely responsible for all decisions made based on astrological information provided through our Service.</li>
                  <li><strong>No Liability:</strong> AstroSetu, its owners, employees, and partners are not liable for any outcomes, consequences, losses, or damages resulting from your use of astrological services.</li>
                  <li><strong>Critical Decisions:</strong> For important life decisions (marriage, career changes, investments, health treatments), you should consult appropriate licensed professionals in addition to or instead of relying solely on astrological guidance.</li>
                  <li><strong>Individual Discretion:</strong> You understand that astrology is subjective and should use your own judgment and common sense when interpreting astrological insights.</li>
                </ul>
              </section>

              {/* Limitations */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">5. Limitations & Exclusions</h2>
                <p>We specifically disclaim liability for:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Any emotional distress, anxiety, or psychological impact resulting from astrological predictions</li>
                  <li>Financial losses from investment or business decisions based on astrological guidance</li>
                  <li>Relationship problems or marriage-related consequences</li>
                  <li>Health issues resulting from reliance on astrological remedies instead of medical treatment</li>
                  <li>Legal consequences from decisions made based on astrological interpretations</li>
                  <li>Any indirect, incidental, or consequential damages</li>
                </ul>
              </section>

              {/* Third-Party Services */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">6. Third-Party Calculations</h2>
                <p>
                  We use third-party APIs and services (including Prokerala) for astrological calculations. While we ensure these services follow industry standards, we are not responsible for:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Calculation errors from third-party services</li>
                  <li>Discrepancies between different calculation methods</li>
                  <li>Data handling by third-party providers</li>
                </ul>
              </section>

              {/* Consultation Services */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">7. Astrologer Consultations</h2>
                <p>
                  If you book consultations with astrologers through our platform:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Individual astrologers are independent service providers, not employees of AstroSetu</li>
                  <li>Astrologer opinions and interpretations are their own and do not represent AstroSetu's views</li>
                  <li>We facilitate connections but are not responsible for the quality or accuracy of astrologer advice</li>
                  <li>Disputes with individual astrologers should be resolved directly with the astrologer or through our support team</li>
                </ul>
              </section>

              {/* Acceptance */}
              <section className="bg-slate-100 border-2 border-slate-300 rounded-lg p-4 mt-6">
                <h2 className="text-xl font-bold text-slate-900 mb-3">8. Acceptance of Terms</h2>
                <p className="font-semibold text-slate-900">
                  By using AstroSetu's services, you acknowledge that you have read, understood, and agree to this disclaimer. You understand that astrology is a belief-based system, that predictions are not guaranteed, and that you assume full responsibility for any decisions made based on astrological information.
                </p>
                <p className="mt-3 text-slate-800">
                  If you do not agree with this disclaimer, please do not use our Service.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">9. Questions or Concerns</h2>
                <p>
                  If you have questions about this disclaimer or our services, please contact us:
                </p>
                <ul className="list-none space-y-1 ml-4 mt-2">
                  <li><strong>Email:</strong> <a href="mailto:support@astrosetu.com" className="text-indigo-600 hover:underline">support@astrosetu.com</a></li>
                  <li><strong>Website:</strong> <a href="/contact" className="text-indigo-600 hover:underline">Contact Us Page</a></li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

