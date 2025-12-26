"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">About AstroSetu</h1>
          <p className="text-white/90 text-base">
            Bridging humans with cosmic guidance through authentic Vedic astrology
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader eyebrow="Our Mission" title="Who We Are" />
          <CardContent>
            <p className="text-slate-700 leading-relaxed mb-4">
              AstroSetu is a trusted platform dedicated to making authentic Vedic astrology accessible to everyone. We combine traditional astrological wisdom with modern technology to provide accurate, personalized astrological insights and guidance.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Our mission is to help people understand their cosmic blueprint, make informed decisions, and navigate life&apos;s challenges with the wisdom of the stars.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader eyebrow="Our Services" title="What We Offer" />
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">Core Services</h3>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li>• Birth Chart (Kundli) Generation</li>
                  <li>• Kundli Matching for Marriage</li>
                  <li>• Daily, Weekly & Monthly Horoscopes</li>
                  <li>• Panchang & Muhurat Calculations</li>
                  <li>• Comprehensive Life Reports</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">Advanced Features</h3>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li>• Dosha Analysis & Remedies</li>
                  <li>• Dasha & Transit Predictions</li>
                  <li>• Numerology Analysis</li>
                  <li>• Expert Astrologer Consultations</li>
                  <li>• Personalized Guidance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader eyebrow="Our Values" title="What Sets Us Apart" />
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-indigo-50">
                <div className="text-3xl mb-2">🎯</div>
                <div className="font-semibold text-slate-900 mb-1">Accuracy</div>
                <div className="text-sm text-slate-600">Precise calculations using authentic Vedic principles</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50">
                <div className="text-3xl mb-2">🔒</div>
                <div className="font-semibold text-slate-900 mb-1">Privacy</div>
                <div className="text-sm text-slate-600">Your data is secure and protected</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-amber-50">
                <div className="text-3xl mb-2">👨‍🏫</div>
                <div className="font-semibold text-slate-900 mb-1">Expertise</div>
                <div className="text-sm text-slate-600">Certified and experienced astrologers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader eyebrow="Disclaimer" title="Important Note" />
          <CardContent>
            <p className="text-slate-700 leading-relaxed mb-3">
              Astrology is a belief-based system and not a science. Our services provide astrological interpretations and guidance for informational purposes only. We do not guarantee specific outcomes, and astrological insights should not be treated as deterministic facts.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Please consult qualified professionals for medical, legal, financial, or other matters requiring licensed expertise. Read our{" "}
              <Link href="/disclaimer" className="text-indigo-600 hover:underline font-medium">full disclaimer</Link> and{" "}
              <Link href="/terms" className="text-indigo-600 hover:underline font-medium">terms of service</Link>.
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Link href="/contact" className="flex-1">
            <button className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all">
              Contact Us
            </button>
          </Link>
          <Link href="/services" className="flex-1">
            <button className="w-full px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-all">
              Our Services
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

