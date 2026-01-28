"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { session } from "@/lib/session";

const GOALS = [
  { id: "marriage", label: "Marriage & relationships", icon: "💍" },
  { id: "career", label: "Career & promotions", icon: "💼" },
  { id: "money", label: "Money & investments", icon: "💰" },
  { id: "health", label: "Health & wellbeing", icon: "💊" },
  { id: "peace", label: "Peace of mind & spirituality", icon: "🕉️" },
];

export default function OnboardingGoalsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const existing = session.getGoals();
    if (existing.length) {
      setSelected(existing);
    }
  }, []);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  }

  function handleContinue() {
    if (selected.length === 0) return;
    session.saveGoals(selected);
    router.push("/kundli");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-saffron-50 via-amber-50 to-orange-50 p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-saffron-200">
        <CardHeader
          eyebrow="Step 3"
          title="What do you want guidance on?"
          subtitle="We’ll tailor insights to what matters most to you. You can change this anytime."
          icon="🎯"
        />
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {GOALS.map((g) => {
              const active = selected.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggle(g.id)}
                  className={`flex flex-col items-start p-3 rounded-2xl text-left border text-sm ${
                    active
                      ? "border-saffron-500 bg-saffron-50 shadow-md"
                      : "border-slate-200 bg-white hover:border-saffron-200"
                  }`}
                >
                  <span className="text-xl mb-1">{g.icon}</span>
                  <span className="font-semibold text-slate-900">{g.label}</span>
                </button>
              );
            })}
          </div>
          <Button
            onClick={handleContinue}
            disabled={selected.length === 0}
            className="w-full py-3 text-base font-bold bg-gradient-to-r from-saffron-500 to-orange-500 hover:from-saffron-600 hover:to-orange-600"
          >
            Continue to your insights
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

