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
    <footer className="border-t-2 border-slate-200 bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8 lg:gap-6 xl:gap-8">
          {/* Branding Column - Wider */}
          <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2">
            <Logo size="md" showText={true} />
            <p className="text-sm text-slate-700 mt-4 max-w-sm leading-relaxed">
              Bridging humans with cosmic guidance. Your trusted companion for astrology, horoscopes, and consultations.
            </p>
            
            {/* Social Media Links */}
            <div className="mt-6">
              <div className="text-xs font-semibold text-slate-900 mb-3">Follow Us</div>
              <div className="flex flex-wrap items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-saffron-100 to-amber-100 border-2 border-saffron-200 flex items-center justify-center text-lg hover:from-saffron-200 hover:to-amber-200 hover:scale-110 transition-all shadow-sm"
                    title={social.label}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="mt-6">
              <div className="text-xs font-semibold text-slate-900 mb-2">Subscribe to Newsletter</div>
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); }}>
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 text-sm border-2 border-slate-300 rounded-lg focus:outline-none focus:border-saffron-500 focus:ring-2 focus:ring-saffron-200"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-saffron-500 to-amber-600 text-white text-sm font-semibold rounded-lg hover:from-saffron-600 hover:to-amber-700 transition-all shadow-md"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Trust Signals */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="text-green-600">✓</span>
                <span>Secure Payments</span>
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Our Services</h3>
            <ul className="space-y-2.5">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-saffron-600 transition-colors flex items-center gap-2 group"
                  >
                    {link.icon && <span className="text-base group-hover:scale-110 transition-transform">{link.icon}</span>}
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Reports Column */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Reports</h3>
            <ul className="space-y-2.5">
              {footerLinks.reports.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-saffron-600 transition-colors flex items-center gap-2 group"
                  >
                    {link.icon && <span className="text-base group-hover:scale-110 transition-transform">{link.icon}</span>}
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information Column */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Information</h3>
            <ul className="space-y-2.5">
              {footerLinks.information.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-saffron-600 transition-colors flex items-center gap-2 group"
                  >
                    {link.icon && <span className="text-base group-hover:scale-110 transition-transform">{link.icon}</span>}
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Legal Column */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Company</h3>
            <ul className="space-y-2.5 mb-6">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-saffron-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            <h3 className="text-sm font-bold text-slate-900 mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-saffron-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact & Language Section */}
        <div className="mt-10 pt-8 border-t-2 border-slate-200 grid md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Contact Us</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span>📧</span>
                <a href="mailto:support@astrosetu.app" className="hover:text-saffron-600 transition-colors">
                  support@astrosetu.app
                </a>
                <span className="text-xs text-slate-500">(Legal & compliance only)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <a href="mailto:privacy@astrosetu.app" className="hover:text-saffron-600 transition-colors">
                  privacy@astrosetu.app
                </a>
                <span className="text-xs text-slate-500">(Privacy requests)</span>
              </div>
              <div className="flex items-start gap-2 mt-3">
                <span>📍</span>
                <span className="text-xs">
                  AstroSetu Services Pvt. Ltd.<br />
                  Mumbai, Maharashtra, India
                </span>
              </div>
            </div>
          </div>

          {/* Languages */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Available Languages</h3>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <Link
                  key={lang.code}
                  href={`?lang=${lang.code}`}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-saffron-100 hover:text-saffron-700 rounded-lg border border-slate-200 hover:border-saffron-300 transition-all flex items-center gap-1.5"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </Link>
              ))}
            </div>
            
            {/* App Download Links */}
            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-900 mb-2">Download Our App</div>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://play.google.com/store/apps/details?id=com.astrosetu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-all flex items-center gap-1.5"
                >
                  <span>🤖</span>
                  <span>Google Play</span>
                </a>
                <a
                  href="https://apps.apple.com/app/astrosetu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-all flex items-center gap-1.5"
                >
                  <span>🍎</span>
                  <span>App Store</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Gateways & Certifications */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Payment Methods */}
            <div>
              <div className="text-xs font-semibold text-slate-900 mb-2">Accepted Payment Methods</div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3 py-1.5 bg-white border-2 border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                  💳 Cards
                </div>
                <div className="px-3 py-1.5 bg-white border-2 border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                  🏦 UPI
                </div>
                <div className="px-3 py-1.5 bg-white border-2 border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                  📱 Wallets
                </div>
                <div className="px-3 py-1.5 bg-white border-2 border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                  🔒 Secure
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="text-green-600 font-bold">✓</span>
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="text-blue-600 font-bold">✓</span>
                <span>ISO Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <div className="text-slate-600 text-xs">
              © {currentYear} <span className="font-semibold text-slate-900">AstroSetu</span>. All rights reserved.
              <br className="hidden sm:block" />
              <span className="hidden sm:inline">
                ABN: [To be provided] | 
                <Link href="/disputes" className="hover:text-saffron-600 transition-colors ml-1">Disputes</Link>
                <span> | </span>
                <Link href="/accessibility" className="hover:text-saffron-600 transition-colors">Accessibility</Link>
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
              <Link href="/privacy" className="hover:text-saffron-600 transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-saffron-600 transition-colors">
                Terms of Service
              </Link>
              <span>•</span>
              <Link href="/disclaimer" className="hover:text-saffron-600 transition-colors">
                Disclaimer
              </Link>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Made with 🔮 for the Indian market</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

