"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ExplainablePrediction } from "./ExplainablePrediction";
import type { AIInsight } from "@/types/astrology";

type AIInsightsProps = {
  kundliData?: any;
  onGenerate?: () => void;
};

export function AIInsights({ kundliData, onGenerate }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function generateInsights() {
    setLoading(true);
    // Simulate AI analysis
    setTimeout(() => {
      setInsights([
        {
          category: "Career",
          insight: "Your chart shows strong potential for leadership roles. Jupiter in the 10th house indicates success in fields related to education, law, or spirituality.",
          confidence: 85,
          recommendations: [
            "Consider careers in teaching or consulting",
            "Focus on building expertise in your field",
            "Network with influential people in your industry"
          ],
          relatedPlanets: ["Jupiter", "Sun", "Mars"]
        },
        {
          category: "Relationships",
          insight: "Venus placement suggests you value harmony and beauty in relationships. However, Saturn's aspect may bring some delays in finding the right partner.",
          confidence: 78,
          recommendations: [
            "Be patient in relationships",
            "Focus on communication and understanding",
            "Consider remedies for Saturn if delays persist"
          ],
          relatedPlanets: ["Venus", "Saturn", "Moon"]
        },
        {
          category: "Health",
          insight: "Mars in the 6th house indicates good immunity, but you should be cautious about stress-related health issues.",
          confidence: 72,
          recommendations: [
            "Maintain a regular exercise routine",
            "Practice stress management techniques",
            "Regular health check-ups are advisable"
          ],
          relatedPlanets: ["Mars", "Sun", "Saturn"]
        },
        {
          category: "Finance",
          insight: "Strong 2nd and 11th house placements suggest good earning potential. However, Rahu's influence may cause fluctuations.",
          confidence: 80,
          recommendations: [
            "Invest in stable, long-term assets",
            "Avoid speculative investments",
            "Save for future financial security"
          ],
          relatedPlanets: ["Jupiter", "Rahu", "Venus"]
        }
      ]);
      setLoading(false);
    }, 2000);
  }

  return (
    <Card className="bg-gradient-to-br from-saffron-50 via-amber-50 to-orange-50 border-2 border-saffron-200 shadow-xl">
      <CardHeader 
        eyebrow="✨ AI-Powered Insights" 
        title="Personalized Astrological Analysis"
        subtitle="Get AI-generated insights based on your birth chart"
        icon="🤖"
      />
      <CardContent className="grid gap-4">
        {!insights ? (
          <div className="text-center py-12">
            {/* Enhanced visual with Indian spiritual theme */}
            <div className="relative mb-8 mx-auto w-64 h-48 flex items-center justify-center">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-saffron-100 via-amber-50 to-orange-50 rounded-2xl border-2 border-saffron-200"></div>
              {/* Orbital rings */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="w-40 h-40 border-2 border-saffron-400 rounded-full"></div>
                <div className="absolute w-48 h-48 border border-saffron-300 rounded-full"></div>
              </div>
              {/* Spiritual symbols */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4 text-3xl">☉</div>
                <div className="absolute top-4 right-4 text-3xl">☽</div>
                <div className="absolute bottom-4 left-4 text-3xl">⭐</div>
                <div className="absolute bottom-4 right-4 text-3xl">🪐</div>
              </div>
              {/* Central Om symbol with crystal ball */}
              <div className="relative z-10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl opacity-20 text-saffron-600">ॐ</div>
                </div>
                <div className="relative text-7xl mb-2 drop-shadow-lg">🔮</div>
                {/* Golden stand */}
                <div className="relative -mt-2 mx-auto w-16 h-3 bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 rounded-full shadow-md"></div>
              </div>
            </div>
            <p className="text-slate-700 mb-6 text-base leading-relaxed max-w-2xl mx-auto">
              Get personalized AI-powered insights about your career, relationships, health, and finances based on your Kundli.
            </p>
            <Button 
              onClick={generateInsights} 
              disabled={loading}
              className="px-8 py-4 text-base font-bold shadow-xl"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block mr-2">⏳</span>
                  Analyzing...
                </>
              ) : (
                <>
                  ✨ Generate AI Insights
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {insights.map((insight, index) => (
              <ExplainablePrediction
                key={index}
                insight={insight.insight}
                category={insight.category}
                confidence={insight.confidence}
                relatedPlanets={insight.relatedPlanets}
                kundliData={kundliData}
                recommendations={insight.recommendations}
              />
            ))}

            <Button 
              variant="secondary" 
              onClick={() => setInsights(null)}
              className="mt-2"
            >
              🔄 Generate New Insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

