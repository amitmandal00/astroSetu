"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const footerLinks = {
  services: [
    { href: "/kundli", label: "Kundli", icon: "🔮" },
    { href: "/match", label: "Kundli Matching", icon: "💑" },
    { href: "/horoscope", label: "Horoscope", icon: "⭐" },
    { href: "/panchang", label: "Panchang", icon: "📿" },
    { href: "/muhurat", label: "Muhurat", icon: "⏰" },
    { href: "/numerology", label: "Numerology", icon: "🔢" },
  ],
  reports: [
    { href: "/lifereport", label: "Life Report", icon: "📄" },
    { href: "/reports/mangal-dosha", label: "Mangal Dosha", icon: "🔥" },
    { href: "/reports/dasha-phal", label: "Dasha Phal", icon: "⏳" },
    { href: "/reports/gochar", label: "Gochar Phal", icon: "🌙" },
    { href: "/reports/varshphal", label: "Varshphal", icon: "📅" },
    { href: "/reports/lalkitab", label: "Lal Kitab", icon: "📖" },
  ],
  information: [
    { href: "/faq", label: "FAQs", icon: "❓" },
    { href: "/learn", label: "Learn Astrology", icon: "📚" },
    { href: "/about", label: "About", icon: "ℹ️" },
  ],
  company: [
    { href: "/about", label: "About Us", icon: null },
    { href: "/blog", label: "Blog", icon: null },
    { href: "/careers", label: "Careers", icon: null },
    { href: "/contact", label: "Contact Us", icon: null },
    { href: "/testimonials", label: "Testimonials", icon: null },
    { href: "/faq", label: "FAQ", icon: null },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy", icon: null },
    { href: "/terms", label: "Terms of Service", icon: null },
    { href: "/disclaimer", label: "Disclaimer", icon: null },
    { href: "/refund", label: "Refund Policy", icon: null },
    { href: "/cookies", label: "Cookie Policy", icon: null },
    { href: "/accessibility", label: "Accessibility", icon: null },
    { href: "/disputes", label: "Dispute Resolution", icon: null },
    { href: "/data-breach", label: "Data Breach Policy", icon: null },
  ],
};

const socialLinks = [
  { href: "https://facebook.com/astrosetu", icon: "📘", label: "Facebook", name: "Facebook" },
  { href: "https://instagram.com/astrosetu", icon: "📷", label: "Instagram", name: "Instagram" },
  { href: "https://twitter.com/astrosetu", icon: "🐦", label: "Twitter", name: "Twitter" },
  { href: "https://youtube.com/@astrosetu", icon: "📺", label: "YouTube", name: "YouTube" },
  { href: "https://linkedin.com/company/astrosetu", icon: "💼", label: "LinkedIn", name: "LinkedIn" },
];

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" }
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Left: Branding */}
          <div>
            <Logo size="sm" showText={true} />
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Automated Astrology Platform
            </p>
          </div>

          {/* Center: Legal Links */}
          <div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-saffron-600 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-saffron-600 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/disclaimer"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-saffron-600 transition-colors"
              >
                Disclaimer
              </Link>
              <Link
                href="/refund"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-saffron-600 transition-colors"
              >
                Refund
              </Link>
              <Link
                href="/cookies"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-saffron-600 transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>

          {/* Right: Autonomous Notice */}
          <div className="text-xs text-slate-500 text-right md:text-left">
            <p>Fully automated platform. No human involvement. No live support.</p>
            <p className="mt-1">Educational guidance only.</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              © {currentYear} <span className="font-semibold text-slate-900">AstroSetu AI</span>
              <br className="sm:hidden" />
              <span className="text-slate-500">Operated by MindVeda</span>
              <br className="sm:hidden" />
              <span className="text-slate-600 font-medium">ABN: 60 656 401 253</span>
            </div>
            <div className="text-slate-500">
              <a href="mailto:privacy@mindveda.net" className="hover:text-saffron-600 transition-colors">
                privacy@mindveda.net
              </a>
              {" • "}
              <a href="mailto:legal@mindveda.net" className="hover:text-saffron-600 transition-colors">
                legal@mindveda.net
              </a>
              {" • "}
              <a href="mailto:security@mindveda.net" className="hover:text-saffron-600 transition-colors">
                security@mindveda.net
              </a>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500 text-center">
            <p>These contact points exist solely for legal and regulatory compliance. No live support is provided.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

