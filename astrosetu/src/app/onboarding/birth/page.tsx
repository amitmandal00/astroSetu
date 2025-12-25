"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BirthDetails } from "@/types/astrology";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BirthDetailsForm } from "@/components/forms/BirthDetailsForm";
import { session } from "@/lib/session";

type BirthDetailsFormData = {
  name: string;
  gender: "Male" | "Female";
  day: string;
  month: string;
  year: string;
  hours: string;
  minutes: string;
  seconds: string;
  place: string;
};

const EMPTY_FORM: BirthDetailsFormData = {
  name: "",
  gender: "Male",
  day: "",
  month: "",
  year: "",
  hours: "",
  minutes: "",
  seconds: "",
  place: "",
};

export default function OnboardingBirthPage() {
  const router = useRouter();
  const [form, setForm] = useState<BirthDetailsFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bd = session.getBirthDetails();
    if (bd) {
      setForm({
        name: bd.name || "",
        gender: (bd.gender as "Male" | "Female") || "Male",
        day: bd.day?.toString() || bd.dob?.split("-")[2] || "",
        month: bd.month?.toString() || bd.dob?.split("-")[1] || "",
        year: bd.year?.toString() || bd.dob?.split("-")[0] || "",
        hours: bd.hours?.toString().padStart(2, "0") || bd.tob?.split(":")[0] || "",
        minutes: bd.minutes?.toString().padStart(2, "0") || bd.tob?.split(":")[1] || "",
        seconds: bd.seconds?.toString().padStart(2, "0") || bd.tob?.split(":")[2] || "00",
        place: bd.place || "",
      });
    }
  }, []);

  const canContinue = (() => {
    // Helper to safely parse and validate number
    const parseNumber = (val: string, min: number, max: number): boolean => {
      if (!val || typeof val !== 'string') return false;
      const trimmed = val.trim();
      if (trimmed === '') return false;
      const num = Number(trimmed);
      return !isNaN(num) && num >= min && num <= max;
    };
    
    const dayValid = parseNumber(form.day, 1, 31);
    const monthStr = String(form.month || '').trim();
    const monthValid = monthStr !== '' && parseNumber(monthStr, 1, 12);
    const yearValid = parseNumber(form.year, 1900, 2100);
    const hoursValid = parseNumber(form.hours, 0, 23);
    const minutesValid = parseNumber(form.minutes, 0, 59);
    const placeValid = (form.place || '').trim().length >= 2;
    
    return dayValid && monthValid && yearValid && hoursValid && minutesValid && placeValid;
  })();

  async function handleNext() {
    if (!canContinue) {
      setError("Please fill all required fields (date, time, place).");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const dob = `${form.year}-${String(form.month).padStart(2, "0")}-${String(form.day).padStart(
        2,
        "0",
      )}`;
      const tob = `${form.hours.padStart(2, "0")}:${form.minutes.padStart(
        2,
        "0",
      )}:${form.seconds.padStart(2, "0")}`;
      const birthDetails: BirthDetails = {
        name: form.name || undefined,
        gender: form.gender,
        dob,
        tob,
        place: form.place,
      };
      session.saveBirthDetails(birthDetails);
      router.push("/onboarding/identity");
    } catch (e: any) {
      setError(e?.message || "Could not save birth details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-saffron-50 via-amber-50 to-orange-50 p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-saffron-200">
        <CardHeader
          eyebrow="Step 1"
          title="Tell us your birth details"
          subtitle="Name is optional. We’ll use these details to generate a precise Kundli."
          icon="🔮"
        />
        <CardContent className="space-y-6">
          <BirthDetailsForm
            title={undefined}
            data={form}
            onChange={setForm}
            showQuickActions={true}
          />
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-200 text-sm text-rose-700">
              {error}
            </div>
          )}
          <Button
            onClick={handleNext}
            disabled={!canContinue || submitting}
            className="w-full py-3 text-base font-bold bg-gradient-to-r from-saffron-500 to-orange-500 hover:from-saffron-600 hover:to-orange-600"
          >
            {submitting ? "Saving..." : "Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

