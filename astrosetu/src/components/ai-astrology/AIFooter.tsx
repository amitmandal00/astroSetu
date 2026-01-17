/**
 * AI Astrology Section Footer
 * Three-column layout with disclaimers and legal links
 * Emphasizes autonomous nature and legal safety
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// CRITICAL FIX (ChatGPT 23:57): Fetch build ID from /build.json (100% reliable)
// Build ID helps prove deployed JS is active (not cached by SW/browser)
// Fetch from /build.json instead of env vars to ensure it matches actual deployed commit

export function AIFooter() {
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [buildId, setBuildId] = useState<string>("...");

  // CRITICAL FIX (ChatGPT 23:57): Fetch build ID from /build.json on mount
  // This ensures build ID matches actual deployed commit, even if env vars aren't set correctly
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/build.json", {
          cache: "no-store",
          headers: { "cache-control": "no-cache" },
        });

        if (!res.ok) {
          throw new Error(`build.json ${res.status}`);
        }

        const data = await res.json();
        if (!cancelled) {
          // CRITICAL FIX (ChatGPT Step 0): Show FULL commit SHA for complete verification
          // Show both short (7-char) and full SHA: "Build: cbb7d53 (cbb7d532...)" or just full SHA
          const fullSha = data?.fullSha || data?.buildId || "unknown";
          const shortId = data?.buildId || (fullSha !== "unknown" ? String(fullSha).slice(0, 7) : "unknown");
          // Show full SHA if available, otherwise fallback to short ID
          setBuildId(fullSha !== "unknown" ? fullSha : shortId);
          // CRITICAL FIX (ChatGPT Step 0): Log BUILD_ID once per page load
          console.log("[BUILD_ID]", fullSha);
        }
      } catch (error) {
        console.warn("[Footer] Failed to fetch build.json:", error);
        if (!cancelled) {
          setBuildId("unknown");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
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
              Fully automated platform. No human involvement. No live support. Educational guidance only.
            </p>
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} AstroSetu AI</p>
            <p className="text-xs text-slate-500">Operated by MindVeda</p>
            <p className="text-xs text-slate-600 font-medium">ABN: 60 656 401 253</p>
            {/* CRITICAL FIX (ChatGPT 23:57): Build ID stamp for deployment verification (from /build.json) */}
            <p className="text-xs text-slate-400 font-mono mt-2">Build: {buildId}</p>
          </div>

          {/* Middle Column: Important Notice */}
          <div className="space-y-4">
            <p className="text-slate-600 text-sm leading-relaxed">
              Fully automated platform. No human involvement. No live support. Educational guidance only.
            </p>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Important Notice</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                AstroSetu AI is a fully automated, self-service platform operated by MindVeda (ABN 60 656 401 253). All reports are generated automatically using AI-based interpretive systems for educational and informational purposes only. AstroSetu AI does not provide medical, legal, financial, psychological, or professional advice. No live consultations, personalised support, or human astrologers are offered. By using this platform, you acknowledge that interpretations are non-deterministic and intended for personal reflection only.
              </p>
            </div>
          </div>

          {/* Right Column: Legal Links */}
          <div className="space-y-4">
            {/* Collapsible Legal Section for Mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setIsLegalOpen(!isLegalOpen)}
                className="w-full flex items-center justify-between text-slate-700 font-semibold text-sm py-3 min-h-[44px] border-b border-slate-200"
              >
                <span>Legal & Policies</span>
                <span className="text-slate-400">{isLegalOpen ? "−" : "+"}</span>
              </button>
              {isLegalOpen && (
                <nav className="space-y-2 mt-2">
                  <Link href="/ai-astrology/faq" className="block text-slate-700 hover:text-amber-600 transition-colors text-sm py-2 min-h-[44px] flex items-center">
                    <span className="text-slate-400 mr-2">→</span>
                    FAQ
                  </Link>
                  <Link href="/privacy" className="block text-slate-700 hover:text-amber-600 transition-colors text-sm py-2 min-h-[44px] flex items-center">
                    <span className="text-slate-400 mr-2">→</span>
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="block text-slate-700 hover:text-amber-600 transition-colors text-sm py-2 min-h-[44px] flex items-center">
                    <span className="text-slate-400 mr-2">→</span>
                    Terms of Use
                  </Link>
                  <Link href="/disclaimer" className="block text-slate-700 hover:text-amber-600 transition-colors text-sm py-2 min-h-[44px] flex items-center">
                    <span className="text-slate-400 mr-2">→</span>
                    Disclaimer
                  </Link>
                  <Link href="/refund" className="block text-slate-700 hover:text-amber-600 transition-colors text-sm py-2 min-h-[44px] flex items-center">
                    <span className="text-slate-400 mr-2">→</span>
                    Refund Policy
                  </Link>
                  <Link href="/cookies" className="block text-slate-700 hover:text-amber-600 transition-colors text-sm py-2 min-h-[44px] flex items-center">
                    <span className="text-slate-400 mr-2">→</span>
                    Cookie Policy
                  </Link>
                  <div className="pt-2 border-t border-slate-200 mt-2">
                    <Link href="/contact" className="block text-slate-500 hover:text-amber-600 transition-colors text-xs py-2 min-h-[44px] flex items-center">
                      Contact & Legal Info
                    </Link>
                    <Link href="/data-breach" className="block text-slate-500 hover:text-amber-600 transition-colors text-xs py-2 min-h-[44px] flex items-center">
                      Data Breach Policy
                    </Link>
                    <Link href="/disputes" className="block text-slate-500 hover:text-amber-600 transition-colors text-xs py-2 min-h-[44px] flex items-center">
                      Dispute Resolution
                    </Link>
                  </div>
                </nav>
              )}
            </div>

            {/* Desktop: Always Visible */}
            <nav className="hidden md:block space-y-2">
              <Link href="/ai-astrology/faq" className="block text-slate-700 hover:text-amber-600 transition-colors text-sm py-1 flex items-center">
                <span className="text-slate-400 mr-2">→</span>
                FAQ
              </Link>
              <Link href="/privacy" className="block text-slate-700 hover:text-amber-600 transition-colors text-sm py-1 flex items-center">
                <span className="text-slate-400 mr-2">→</span>
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-slate-700 hover:text-amber-600 transition-colors text-sm py-1 flex items-center">
                <span className="text-slate-400 mr-2">→</span>
                Terms of Use
              </Link>
              <Link href="/disclaimer" className="block text-slate-700 hover:text-amber-600 transition-colors text-sm py-1 flex items-center">
                <span className="text-slate-400 mr-2">→</span>
                Disclaimer
              </Link>
              <Link href="/refund" className="block text-slate-700 hover:text-amber-600 transition-colors text-sm py-1 flex items-center">
                <span className="text-slate-400 mr-2">→</span>
                Refund Policy
              </Link>
              <Link href="/cookies" className="block text-slate-700 hover:text-amber-600 transition-colors text-sm py-1 flex items-center">
                <span className="text-slate-400 mr-2">→</span>
                Cookie Policy
              </Link>
            </nav>
            <div className="hidden md:block pt-2 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-2">Additional Information:</p>
              <nav className="space-y-1">
                <Link href="/contact" className="block text-slate-500 hover:text-amber-600 transition-colors text-xs py-1 flex items-center">
                  Contact & Legal Info
                </Link>
                <Link href="/data-breach" className="block text-slate-500 hover:text-amber-600 transition-colors text-xs py-1 flex items-center">
                  Data Breach Policy
                </Link>
                <Link href="/disputes" className="block text-slate-500 hover:text-amber-600 transition-colors text-xs py-1 flex items-center">
                  Dispute Resolution
                </Link>
              </nav>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-2">Contact (Legal & Compliance Only):</p>
              <div className="space-y-1 text-xs text-slate-600">
                <div>Privacy & Data Protection: <a href="mailto:privacy@mindveda.net" className="text-amber-600 hover:underline">privacy@mindveda.net</a></div>
                <div>Legal & Compliance: <a href="mailto:legal@mindveda.net" className="text-amber-600 hover:underline">legal@mindveda.net</a></div>
                <div>Security Reporting: <a href="mailto:security@mindveda.net" className="text-amber-600 hover:underline">security@mindveda.net</a></div>
              </div>
              <p className="text-xs text-slate-500 mt-2 italic">
                These contact points exist solely for legal and regulatory compliance. No live support is provided.
              </p>
            </div>
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} AstroSetu AI</p>
            <p className="text-xs text-slate-600 font-medium">
              No change-of-mind refunds on digital reports.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

