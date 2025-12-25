"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-saffron-50 via-amber-50 to-orange-50 p-4">
      <Card className="max-w-3xl w-full shadow-2xl border-saffron-200">
        <CardHeader
          eyebrow="Privacy & Data Use"
          title="How AstroSetu uses your data"
          subtitle="Plain‑English explanation for users, reviewers, and partners."
          icon="🔒"
        />
        <CardContent className="space-y-4 text-sm text-slate-700">
          <section>
            <h2 className="font-semibold text-slate-900 mb-1">What we collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Birth details you provide (date, time, place, optional name and gender).</li>
              <li>Basic usage events (e.g. chart generated, subscription screen viewed) for analytics.</li>
              <li>Optional contact details (email / phone) if you register or purchase.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-1">How we use your birth data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To compute your Kundli and related calculations (dashas, compatibility, reports).</li>
              <li>To personalise insights based on your chosen goals (career, marriage, money, peace).</li>
              <li>To show anonymised statistics that help us improve accuracy (never sold to brokers).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-1">AI processing</h2>
            <p>
              AI is used to summarise and explain astrological patterns. We do not train generic large
              models on your identifiable data. Inputs are passed to AI services with the minimum
              required context, and outputs are stored only as part of your reports.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-1">Retention & control</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You can clear local data at any time by logging out or clearing your browser/app data.</li>
              <li>Server‑side profiles and orders are kept only as long as needed for legal, billing, and support.</li>
              <li>For deletion requests, contact us from your registered email; we will remove your profile and charts where legally allowed.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-1">Permissions</h2>
            <p>
              The mobile app only requests access to: network connectivity, optional notifications, and
              (if enabled) coarse location for suggested birth places. We do not access photos, contacts,
              microphone or files for astrology features.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900 mb-1">Contact</h2>
            <p>
              For privacy questions or data requests, please contact our support team using the email
              address shown in the app store listing. We aim to respond within 7 working days.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

