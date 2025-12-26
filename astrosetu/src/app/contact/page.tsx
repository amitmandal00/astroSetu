"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { Input } from "@/components/ui/Input";

export default function ContactPage() {
  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-white/90 text-base">
            Get in touch with our team for support, inquiries, or feedback
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader eyebrow="Get In Touch" title="Contact Information" />
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="text-2xl">📧</div>
                <div>
                  <div className="font-semibold text-slate-900 mb-1">Email</div>
                  <a href="mailto:support@astrosetu.app" className="text-indigo-600 hover:underline">
                    support@astrosetu.app
                  </a>
                  <div className="text-sm text-slate-600 mt-1">For general inquiries</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-2xl">📞</div>
                <div>
                  <div className="font-semibold text-slate-900 mb-1">Phone</div>
                  <a href="tel:+918001234567" className="text-indigo-600 hover:underline">
                    +91 800 123 4567
                  </a>
                  <div className="text-sm text-slate-600 mt-1">Mon-Sat, 9 AM - 6 PM IST</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-2xl">💬</div>
                <div>
                  <div className="font-semibold text-slate-900 mb-1">WhatsApp</div>
                  <a href="https://wa.me/918001234567" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    +91 800 123 4567
                  </a>
                  <div className="text-sm text-slate-600 mt-1">24/7 support available</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-2xl">📍</div>
                <div>
                  <div className="font-semibold text-slate-900 mb-1">Address</div>
                  <div className="text-slate-700">
                    AstroSetu Services Pvt. Ltd.<br />
                    Mumbai, Maharashtra<br />
                    India
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="font-semibold text-slate-900 mb-3">Business Hours</div>
              <div className="text-sm text-slate-700 space-y-1">
                <div>Monday - Friday: 9:00 AM - 6:00 PM IST</div>
                <div>Saturday: 10:00 AM - 4:00 PM IST</div>
                <div>Sunday: Closed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardHeader eyebrow="Send Message" title="Contact Form" />
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Thank you for your message! We'll get back to you soon."); }}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
                <Input type="text" placeholder="Your name" required />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <Input type="email" placeholder="your.email@example.com" required />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone (Optional)</label>
                <Input type="tel" placeholder="+91 123 456 7890" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                <Input type="text" placeholder="What is this regarding?" required />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none"
                  rows={5}
                  placeholder="Your message..."
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

