/**
 * AI Astrology FAQ Page
 * Auto-generated frequently asked questions for autonomous platform
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { generateSEOMetadata, ASTROLOGY_KEYWORDS } from "@/lib/seo";
import { FAQSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = generateSEOMetadata({
  title: "FAQ - Frequently Asked Questions About AI Astrology Reports",
  description: "Find answers to common questions about AI-powered astrology reports, accuracy, birth time requirements, refunds, and how the automated platform works.",
  keywords: [
    ...ASTROLOGY_KEYWORDS,
    "FAQ",
    "frequently asked questions",
    "astrology help",
    "how does astrology work",
  ],
  url: "/ai-astrology/faq",
});

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
        If you&apos;re unsure of your exact birth time, we recommend:
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
        <strong> secular, educational context</strong>. You don&apos;t need to follow any particular religion or belief system to benefit from 
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
        Once you purchase a report, you receive immediate access to the digital content. Before purchasing, you&apos;ll be asked to acknowledge 
        that you understand this policy. We recommend reviewing the free Life Summary preview first to ensure our reports meet your expectations 
        before purchasing premium reports.
      </>
    ),
  },
  {
    question: "How does this work?",
    answer: (
      <>
        Our platform is <strong>100% automated</strong>. Here&apos;s how it works:
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
        Since this platform is fully automated with no human support, we&apos;ve created this comprehensive FAQ to address common questions. 
        Please review the FAQ items above. If your question isn&apos;t answered here, you can:
        <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
          <li>Try generating a new report with different birth details if you believe information was incorrect</li>
          <li>Review the free Life Summary to understand our reporting style before purchasing</li>
          <li>Remember that astrology provides guidance and insights, not definitive answers</li>
        </ul>
        We&apos;re designed as a self-service platform where you can explore multiple reports to gain deeper understanding.
      </>
    ),
  },
  {
    question: "Is astrology a science?",
    answer: (
      <>
        Astrology is not considered a science by the scientific community. It&apos;s better understood as a <strong>symbolic system</strong> 
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
        However, we don&apos;t claim to predict specific events with certainty. Life is influenced by many factors including free will, 
        environment, and circumstances. Use astrological insights as one tool among many for making informed decisions, not as the sole 
        basis for life choices.
      </>
    ),
  },
  {
    question: "How should I use this report best?",
    answer: (
      <>
        Use your report as a <strong>reflection and planning tool</strong> — not as absolute truth. Here&apos;s how to get the most value:
        <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
          <li><strong>For Self-Reflection:</strong> Use insights to understand your personality patterns and tendencies</li>
          <li><strong>For Planning:</strong> Consider favorable periods when making important decisions, but don&apos;t rely solely on astrology</li>
          <li><strong>For Growth:</strong> Use guidance to identify areas for personal development and improvement</li>
          <li><strong>For Perspective:</strong> View astrological insights as one lens among many (alongside logic, intuition, and professional advice)</li>
        </ul>
        Remember: Astrology provides guidance and insights for educational and self-reflection purposes only. Not professional advice.
      </>
    ),
  },
  {
    question: "Why are prices so low?",
    answer: (
      <>
        Our prices are low because the platform is <strong>fully automated</strong>, and we pass the cost savings to users. 
        Traditional astrology consultations can cost hundreds of dollars because they require human astrologers to spend hours analyzing charts. 
        Our AI system can generate detailed, personalized reports instantly, which means:
        <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
          <li><strong>No Human Labor Costs:</strong> AI handles all calculations and interpretations</li>
          <li><strong>Instant Delivery:</strong> Reports are generated in seconds, not days</li>
          <li><strong>Scalable Technology:</strong> We can serve many users simultaneously without additional costs</li>
          <li><strong>Efficiency:</strong> Automation allows us to offer quality reports at affordable prices</li>
        </ul>
        Lower prices don&apos;t mean lower quality — they reflect efficiency and automation. We believe quality astrological insights should be accessible to everyone.
      </>
    ),
  },
  {
    question: "What currency are prices in? Will I be charged in my local currency?",
    answer: (
      <>
        All prices are displayed in <strong>Australian Dollars (AUD)</strong>. When you proceed to checkout, 
        our payment provider (Stripe) will automatically convert the price to your local currency based on current exchange rates.
        <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
          <li><strong>Website Display:</strong> Prices shown as AU$ (e.g., AU$0.50)</li>
          <li><strong>At Checkout:</strong> Stripe displays the price in your local currency (e.g., $0.33 USD, ₹27 INR, £0.26 GBP)</li>
          <li><strong>Payment:</strong> You pay in your local currency</li>
          <li><strong>Exchange Rates:</strong> Stripe uses real-time exchange rates, which may vary slightly</li>
        </ul>
        This automatic conversion means you can purchase reports from anywhere in the world without worrying about currency conversion. 
        The final amount you pay will be shown clearly at checkout before you complete the payment.
      </>
    ),
  },
  {
    question: "How often should I buy reports?",
    answer: (
      <>
        There&apos;s no fixed rule — it depends on your needs and goals:
        <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
          <li><strong>For Major Decisions:</strong> Purchase reports when facing significant life decisions (marriage, career change, relocation)</li>
          <li><strong>For Annual Planning:</strong> The Year Analysis Report is ideal for yearly strategic planning and goal setting</li>
          <li><strong>For Long-Term Perspective:</strong> The 3-5 Year Strategic Life Phase Report provides extended outlook for major life transitions</li>
          <li><strong>One-Time Purchase:</strong> Many users find one comprehensive report sufficient for understanding their astrological profile</li>
        </ul>
        Since our reports are digital and you can reference them anytime, you don&apos;t need to buy multiple reports frequently. Consider your specific needs and purchase accordingly.
      </>
    ),
  },
  {
    question: "Will reports change if I regenerate?",
    answer: (
      <>
        Reports are generated based on your birth details (date, time, place) using consistent astrological calculations. 
        However, there may be slight variations if you regenerate a report because:
        <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
          <li><strong>AI Interpretation:</strong> Our AI system may phrase insights slightly differently each time</li>
          <li><strong>Content Structure:</strong> While core calculations remain the same, the presentation and emphasis may vary</li>
          <li><strong>Timing Context:</strong> Reports generated at different times may reference different current planetary transits in examples</li>
        </ul>
        The <strong>fundamental astrological data</strong> (your birth chart, planetary positions, dashas) will be consistent because it&apos;s calculated from fixed birth details. The variations are in how insights are presented and interpreted, not in the core astrological calculations.
      </>
    ),
  },
  {
    question: "Can two astrologers differ?",
    answer: (
      <>
        Yes, <strong>astrologers can and often do differ</strong> in their interpretations and predictions. This is normal and expected because:
        <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
          <li><strong>Interpretation Style:</strong> Different astrologers emphasize different planetary combinations and techniques</li>
          <li><strong>School of Thought:</strong> Various astrological traditions (Vedic, Western, Nadi) have different approaches</li>
          <li><strong>Experience & Intuition:</strong> Individual astrologers bring their own understanding and experience to interpretations</li>
          <li><strong>Belief-Based System:</strong> Astrology is not a science with definitive answers — it&apos;s a symbolic system open to interpretation</li>
        </ul>
        Our AI system uses consistent algorithms, so our reports are consistent. However, if you consult multiple astrologers (human or AI), you may receive different perspectives. This doesn&apos;t mean one is &quot;wrong&quot; — astrology offers insights and guidance, not absolute certainties. Consider multiple perspectives as different lenses for understanding your life patterns.
      </>
    ),
  },
];

export default function AIAstrologyFAQPage() {
  // Prepare FAQ data for structured data
  // Note: Simplified answers for structured data (full answers available on page)
  const faqDataForSchema = FAQ_ITEMS.map(item => {
    // Extract text summary from answers for structured data
    let answerText = "See FAQ page for full answer.";
    if (typeof item.answer === 'string') {
      answerText = item.answer;
    } else if (item.answer && typeof item.answer === 'object') {
      // Try to extract meaningful text from JSX
      const props = (item.answer as any).props;
      if (props?.children) {
        const extractText = (node: any): string => {
          if (typeof node === 'string') return node;
          if (Array.isArray(node)) return node.map(extractText).join(' ');
          if (node?.props?.children) return extractText(node.props.children);
          return '';
        };
        answerText = extractText(props.children).replace(/\s+/g, ' ').trim().substring(0, 200);
      }
    }
    
    return {
      question: item.question,
      answer: answerText || "See FAQ page for details.",
    };
  });

  return (
    <div className="cosmic-bg py-8">
      {/* FAQ Structured Data for Rich Snippets */}
      <FAQSchema faqs={faqDataForSchema} />
      
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
              <CardHeader title={item.question} />
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
              <Link href="/ai-astrology/input?reportType=life-summary">
                <Button className="cosmic-button px-8 py-4 text-lg">
                  Get Your Free Life Summary →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <Card className="mt-8 cosmic-card border-amber-200 bg-amber-50/50 max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-center mb-3">⚠️ Important Disclaimer</h3>
              <div className="text-sm text-slate-700 space-y-2">
                <p>
                  <strong>Educational Guidance Only:</strong> This report is generated by AI for educational and entertainment purposes only. 
                  It provides astrological guidance based on traditional calculations, not absolute predictions or certainties.
                </p>
                <p>
                  <strong>Not Professional Advice:</strong> Personalised astrological insights for educational and self-reflection purposes only. Not professional advice. Always consult qualified professionals for important life decisions.
                </p>
                <p>
                  <strong>No Guarantees:</strong> Results are based on astrological calculations and AI interpretation. 
                  Astrology is not a science and cannot predict future events with certainty.
                </p>
                <p>
                  <strong>Fully Automated Platform:</strong> This platform is 100% automated. No human astrologers review or modify reports. 
                  No live support is available. For questions, please see our <Link href="/ai-astrology/faq" className="text-amber-700 hover:text-amber-800 underline font-semibold">FAQ page</Link>.
                </p>
                <p className="pt-2 border-t border-amber-200">
                  <strong>Refund Policy:</strong> No change-of-mind refunds on digital reports. This does not limit your rights under Australian Consumer Law.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

