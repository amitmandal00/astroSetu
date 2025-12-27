/**
 * AI Astrology FAQ Page
 * Auto-generated frequently asked questions for autonomous platform
 */

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const FAQ_ITEMS = [
  {
    question: "Is this accurate?",
    answer: (
      <>
        Our AI-powered reports are based on traditional Vedic astrology calculations and are generated using advanced algorithms. 
        However, astrology should be understood as <strong>guidance and insight</strong>, not absolute predictions or certainties. 
        The accuracy depends on the quality of birth information provided and the interpretation of astrological principles. 
        We frame our reports as educational guidance to help you understand yourself better, not as definitive predictions of future events.
      </>
    ),
  },
  {
    question: "What if my birth time is wrong?",
    answer: (
      <>
        Accurate birth time is important for precise astrological calculations, especially for the Ascendant (Lagna) and Moon sign positions. 
        If you're unsure of your exact birth time, we recommend:
        <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
          <li>Checking your birth certificate or hospital records</li>
          <li>Asking family members who were present at your birth</li>
          <li>Using an approximate time range if exact time is unknown</li>
        </ul>
        The more accurate your birth time, the more precise your report will be. However, even approximate times can provide valuable insights 
        about your personality and life patterns.
      </>
    ),
  },
  {
    question: "Is this religious?",
    answer: (
      <>
        Vedic astrology has its origins in ancient Indian culture and is associated with Hindu traditions, but our reports are presented in a 
        <strong> secular, educational context</strong>. You don't need to follow any particular religion or belief system to benefit from 
        astrological insights. We treat astrology as a symbolic language for understanding personality patterns and life themes, similar to 
        psychology or personality assessment tools. Our platform is designed to be inclusive and accessible to people of all backgrounds.
      </>
    ),
  },
  {
    question: "Can I get a refund?",
    answer: (
      <>
        <strong>No, all digital reports are final sale and non-refundable.</strong> This is standard practice for digital products and services. 
        Once you purchase a report, you receive immediate access to the digital content. Before purchasing, you'll be asked to acknowledge 
        that you understand this policy. We recommend reviewing the free Life Summary preview first to ensure our reports meet your expectations 
        before purchasing premium reports.
      </>
    ),
  },
  {
    question: "How does this work?",
    answer: (
      <>
        Our platform is <strong>100% automated</strong>. Here's how it works:
        <ol className="list-decimal list-inside mt-2 space-y-2 ml-4">
          <li><strong>Enter Your Details:</strong> Provide your name, date of birth, time of birth, and place of birth</li>
          <li><strong>AI Generates Report:</strong> Our AI system calculates your birth chart and generates personalized insights</li>
          <li><strong>Preview (Free):</strong> Get a free Life Summary to see the quality of our reports</li>
          <li><strong>Purchase (Optional):</strong> Buy detailed reports like Marriage Timing or Career & Money Path</li>
          <li><strong>Read & Download:</strong> Access your report online or download as PDF</li>
        </ol>
        No humans are involved in the process. Everything is automated for instant, consistent results.
      </>
    ),
  },
  {
    question: "Is this fully automated?",
    answer: (
      <>
        Yes, <strong>this platform is 100% automated</strong>. No human astrologers review or modify your reports. 
        Our AI system processes your birth details, performs astrological calculations, and generates reports automatically. 
        This means:
        <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
          <li>No waiting for human review</li>
          <li>Instant report generation</li>
          <li>Consistent quality and format</li>
          <li>No live support or chat available</li>
        </ul>
        If you have questions, please refer to this FAQ page. This fully autonomous design allows us to offer reports at affordable prices 
        while maintaining high quality and consistency.
      </>
    ),
  },
  {
    question: "What makes this different from other astrology services?",
    answer: (
      <>
        Our platform is designed to be <strong>autonomous, fast, and affordable</strong>. Unlike services that require booking appointments 
        with human astrologers, our AI generates reports instantly. Key differences:
        <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
          <li><strong>Instant Results:</strong> Get your report in seconds, not days</li>
          <li><strong>Affordable Pricing:</strong> $29 for detailed reports vs. hundreds for consultations</li>
          <li><strong>Privacy:</strong> Your data is processed automatically, no human review</li>
          <li><strong>Consistency:</strong> Same quality and format every time</li>
          <li><strong>No Scheduling:</strong> Available 24/7, no appointments needed</li>
        </ul>
        We focus on providing valuable astrological insights through automation, making quality astrology accessible to everyone.
      </>
    ),
  },
  {
    question: "What if I have a question about my report?",
    answer: (
      <>
        Since this platform is fully automated with no human support, we've created this comprehensive FAQ to address common questions. 
        Please review the FAQ items above. If your question isn't answered here, you can:
        <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
          <li>Try generating a new report with different birth details if you believe information was incorrect</li>
          <li>Review the free Life Summary to understand our reporting style before purchasing</li>
          <li>Remember that astrology provides guidance and insights, not definitive answers</li>
        </ul>
        We're designed as a self-service platform where you can explore multiple reports to gain deeper understanding.
      </>
    ),
  },
  {
    question: "Is astrology a science?",
    answer: (
      <>
        Astrology is not considered a science by the scientific community. It's better understood as a <strong>symbolic system</strong> 
        and <strong>ancient art form</strong> that uses planetary positions as metaphors for understanding human personality and life patterns. 
        We present astrology as educational guidance and a tool for self-reflection, not as a scientific prediction method. 
        Think of it as similar to personality assessments, psychological frameworks, or cultural wisdom traditions - valuable for insights 
        and self-understanding, but not scientifically proven to predict the future.
      </>
    ),
  },
  {
    question: "Can astrology predict the future?",
    answer: (
      <>
        We frame astrology as <strong>guidance and insight</strong>, not future prediction. Astrological reports can:
        <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
          <li>Reveal personality traits and tendencies</li>
          <li>Highlight favorable and challenging periods based on planetary transits</li>
          <li>Provide insights into relationship compatibility</li>
          <li>Suggest optimal timing for important decisions</li>
        </ul>
        However, we don't claim to predict specific events with certainty. Life is influenced by many factors including free will, 
        environment, and circumstances. Use astrological insights as one tool among many for making informed decisions, not as the sole 
        basis for life choices.
      </>
    ),
  },
];

export default function AIAstrologyFAQPage() {
  return (
    <div className="min-h-screen cosmic-bg py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/ai-astrology" className="text-sm text-amber-700 hover:text-amber-800 mb-4 inline-block">
            ← Back to AI Astrology
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-slate-600">
            Everything you need to know about our AI-powered astrology platform
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-6">
          {FAQ_ITEMS.map((item, index) => (
            <Card key={index} className="cosmic-card">
              <CardHeader>
                <h2 className="text-xl font-bold text-slate-800">{item.question}</h2>
              </CardHeader>
              <CardContent>
                <div className="text-slate-700 leading-relaxed">{item.answer}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="cosmic-card bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                Ready to Get Your Report?
              </h2>
              <p className="text-slate-600 mb-6">
                Start with a free Life Summary, no payment required.
              </p>
              <Link href="/ai-astrology/input?reportType=lifeSummary">
                <Button className="cosmic-button px-8 py-4 text-lg">
                  Get Your Free Life Summary →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <Card className="mt-8 cosmic-card border-amber-200 bg-amber-50/50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 mb-3">⚠️ Important Disclaimer</h3>
              <div className="text-sm text-slate-700 space-y-2">
                <p>
                  <strong>Educational Guidance Only:</strong> All reports are for educational and entertainment purposes only. 
                  They should not be used as a substitute for professional medical, legal, financial, or psychological advice.
                </p>
                <p>
                  <strong>No Guarantees:</strong> Astrology is not a science and cannot predict future events with certainty. 
                  Use insights as guidance, not absolute truth.
                </p>
                <p>
                  <strong>Fully Automated:</strong> This platform is 100% automated. No human support is available. 
                  Digital products are non-refundable.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

