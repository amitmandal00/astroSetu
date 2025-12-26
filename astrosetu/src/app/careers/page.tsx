"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { HeaderPattern } from "@/components/ui/HeaderPattern";

export default function CareersPage() {
  return (
    <div className="grid gap-5">
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Careers</h1>
          <p className="text-white/90 text-base">
            Join our team and help bring cosmic guidance to millions
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">💼</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">We're Hiring!</h2>
            <p className="text-slate-600 mb-6">
              We're always looking for talented individuals to join our team. If you're passionate about astrology and technology, we'd love to hear from you.
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all"
            >
              Contact Us
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

