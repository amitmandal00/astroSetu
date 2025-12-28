"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { HeaderPattern } from "@/components/ui/HeaderPattern";

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "What is a Kundli or Birth Chart?",
    answer: "A Kundli (also called birth chart or horoscope) is a map of the positions of planets, stars, and other celestial bodies at the exact time and place of your birth. It forms the foundation of Vedic astrology and is used to understand your personality, life events, and potential future."
  },
  {
    question: "How accurate are the astrological predictions?",
    answer: "Astrology is a belief-based system and not a science. Our predictions and interpretations are based on traditional Vedic astrology principles and are meant for guidance purposes only. We do not guarantee specific outcomes. Please read our disclaimer for more information."
  },
  {
    question: "What information do I need to generate a Kundli?",
    answer: "To generate your Kundli, you need: (1) Date of birth (day, month, year), (2) Time of birth (hours and minutes), (3) Place of birth (city and state/country). The more accurate the birth details, the more precise your Kundli will be."
  },
  {
    question: "Is my personal information safe?",
    answer: "Yes, we take your privacy seriously. Your birth details and personal information are encrypted and stored securely. We only use this data to generate your astrological reports. Please read our Privacy Policy for detailed information on how we handle your data."
  },
  {
    question: "What is Kundli Matching?",
    answer: "Kundli Matching (also called Guna Milan or Horoscope Matching) is a compatibility analysis used in arranged marriages. It analyzes 36 compatibility points (Gunas) based on the birth charts of both partners, including factors like Varna, Vashya, Tara, Yoni, and more."
  },
  {
    question: "What is Manglik Dosha?",
    answer: "Manglik Dosha (or Mangal Dosha) occurs when Mars is positioned in certain houses (1st, 4th, 7th, 8th, or 12th) of the birth chart. It is believed to affect marital compatibility. However, this dosha can be neutralized through various remedies. Our detailed Manglik analysis includes specific remedies."
  },
  {
    question: "Can I consult with an astrologer?",
    answer: "Yes! We offer consultations with expert astrologers through chat, phone, or video calls. You can browse our astrologers and book a session based on your preference and requirements."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major payment methods including credit/debit cards, UPI, net banking, and digital wallets. All payments are processed securely through trusted payment gateways."
  },
  {
    question: "Can I get a refund?",
    answer: "Digital reports are generally non-refundable once generated. Consultation services can be cancelled for a full refund if cancelled at least 24 hours in advance. Please read our Refund Policy for detailed information."
  },
  {
    question: "Do you provide services in languages other than English?",
    answer: "Currently, our primary interface is in English and Hindi. We are working on adding support for more Indian languages. Stay tuned for updates!"
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-white/90 text-base">
            Find answers to common questions about our services
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-200">
              {faqs.map((faq, index) => (
                <div key={index} className="p-6">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex items-center justify-between text-left gap-4"
                  >
                    <h3 className="text-lg font-semibold text-slate-900 pr-4">
                      {faq.question}
                    </h3>
                    <div className="flex-shrink-0 text-2xl text-indigo-600">
                      {openIndex === index ? "−" : "+"}
                    </div>
                  </button>
                  {openIndex === index && (
                    <div className="mt-4 text-slate-700 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-indigo-50 border-indigo-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-semibold text-slate-900 mb-2">Still have questions?</h3>
              <p className="text-slate-700 mb-4">AstroSetu is a fully automated platform. For compliance and legal notices only, see our <Link href="/contact" className="text-purple-600 hover:underline">Contact & Legal Information</Link> page.</p>
              <a
                href="/contact"
                className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all"
              >
                Contact Us
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

