/**
 * AI Astrology Section Footer
 * Three-column layout with disclaimers and legal links
 * Emphasizes autonomous nature and legal safety
 */

"use client";

import Link from "next/link";

export function AIFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column: Brand & Description */}
          <div className="space-y-4">
            <Link href="/ai-astrology" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                <span className="text-white text-xl font-bold">★</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900">AstroSetu AI</span>
              </div>
            </Link>
            <p className="text-slate-600 text-sm leading-relaxed">
              A fully automated astrology intelligence platform. No human involvement. No live support.
            </p>
            <p className="text-xs text-slate-500">© 2024 AstroSetu</p>
          </div>

          {/* Middle Column: Important Notice */}
          <div className="space-y-4">
            <p className="text-slate-600 text-sm leading-relaxed">
              A fully automated astrology intelligence platform. No human involvement. No live support.
            </p>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Important Notice</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Reports are generated automatically using AI-based astrological interpretation for educational purposes only. No medical, legal, financial, or professional advice is provided.
              </p>
            </div>
          </div>

          {/* Right Column: Legal Links */}
          <div className="space-y-4">
            <nav className="space-y-2">
              <Link href="/ai-astrology/faq" className="block text-slate-700 hover:text-amber-600 transition-colors text-sm">
                <span className="text-slate-400 mr-2">→</span>
                FAQ
              </Link>
              <Link href="/privacy" className="block text-slate-700 hover:text-amber-600 transition-colors text-sm">
                <span className="text-slate-400 mr-2">→</span>
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-slate-700 hover:text-amber-600 transition-colors text-sm">
                <span className="text-slate-400 mr-2">→</span>
                Terms of Use
              </Link>
              <Link href="/disclaimer" className="block text-slate-700 hover:text-amber-600 transition-colors text-sm">
                <span className="text-slate-400 mr-2">→</span>
                Disclaimer
              </Link>
              <Link href="/refund-policy" className="block text-slate-700 hover:text-amber-600 transition-colors text-sm">
                <span className="text-slate-400 mr-2">→</span>
                Refund Policy
              </Link>
            </nav>
            <p className="text-xs text-slate-500">© 2024 AstroSetu</p>
            <p className="text-xs text-slate-600 font-medium">
              No change-of-mind refunds on digital reports.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

