"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

type ExplainablePredictionProps = {
  insight: string;
  category: string;
  confidence: number;
  relatedPlanets: string[];
  kundliData?: any;
  recommendations?: string[];
};

export function ExplainablePrediction({
  insight,
  category,
  confidence,
  relatedPlanets,
  kundliData,
  recommendations = [],
}: ExplainablePredictionProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  // Get confidence level
  const getConfidenceLevel = (conf: number): { level: "Low" | "Medium" | "High"; color: "neutral" | "green" | "red" | "amber" | "indigo" } => {
    if (conf >= 75) return { level: "High", color: "green" };
    if (conf >= 50) return { level: "Medium", color: "amber" };
    return { level: "Low", color: "red" };
  };

  const confidenceInfo = getConfidenceLevel(confidence);

  // Extract planet positions from Kundli data
  const getPlanetInfo = (planetName: string) => {
    if (!kundliData?.planets) return null;
    const planet = kundliData.planets.find((p: any) => 
      p.name.toLowerCase() === planetName.toLowerCase()
    );
    return planet;
  };

  // Get house information
  const getHouseInfo = (planetName: string) => {
    const planet = getPlanetInfo(planetName);
    if (!planet) return null;
    
    if (kundliData?.chart?.houses) {
      const house = kundliData.chart?.houses?.find((h: any) => 
        h.planets?.includes(planetName)
      );
      return house;
    }
    return null;
  };

  // Get Dasha information
  const getDashaInfo = () => {
    if (!kundliData?.chart?.dasha) return null;
    return kundliData.chart?.dasha;
  };

  // Generate astrological rationale
  const getRationale = (planetName: string) => {
    const planet = getPlanetInfo(planetName);
    const house = getHouseInfo(planetName);
    
    if (!planet) return null;

    const rationales: Record<string, Record<string, string>> = {
      Jupiter: {
        "10": "Jupiter in 10th house (Karma Bhava) indicates success in career, authority, and public recognition. This is one of the most auspicious placements for professional growth.",
        "9": "Jupiter in 9th house (Dharma Bhava) brings spiritual wisdom, higher learning, and good fortune. It indicates strong connection with teachers and gurus.",
        "5": "Jupiter in 5th house (Putra Bhava) indicates intelligence, creativity, and success in education. It brings blessings for children and creative pursuits.",
      },
      Venus: {
        "7": "Venus in 7th house (Kalatra Bhava) is highly auspicious for marriage and partnerships. It brings harmony, beauty, and material comforts in relationships.",
        "2": "Venus in 2nd house (Dhana Bhava) indicates wealth, family happiness, and good speech. It brings financial prosperity and artistic talents.",
        "4": "Venus in 4th house (Sukha Bhava) brings happiness, property, and mother's blessings. It indicates comfort and luxury in life.",
      },
      Mars: {
        "1": "Mars in 1st house (Lagna) gives strong willpower, courage, and leadership qualities. However, it may also bring aggression if not balanced.",
        "6": "Mars in 6th house (Ari Bhava) gives victory over enemies, good health, and service-oriented nature. It indicates strong immunity and competitive spirit.",
        "10": "Mars in 10th house (Karma Bhava) indicates success in career through hard work and determination. It brings recognition in technical or military fields.",
      },
      Saturn: {
        "7": "Saturn in 7th house (Kalatra Bhava) may delay marriage but brings stable, long-lasting relationships. It teaches patience and commitment.",
        "10": "Saturn in 10th house (Karma Bhava) indicates success through hard work and perseverance. It brings recognition after struggles and delays.",
        "11": "Saturn in 11th house (Labha Bhava) brings gains through discipline and hard work. It indicates slow but steady financial growth.",
      },
      Sun: {
        "1": "Sun in 1st house (Lagna) gives strong personality, leadership, and self-confidence. It indicates royal qualities and authority.",
        "5": "Sun in 5th house (Putra Bhava) indicates intelligence, creativity, and success in education. It brings recognition in creative fields.",
        "10": "Sun in 10th house (Karma Bhava) is highly auspicious for career and public recognition. It indicates success in government or administrative roles.",
      },
      Moon: {
        "1": "Moon in 1st house (Lagna) gives emotional intelligence, popularity, and good health. It indicates strong intuition and caring nature.",
        "4": "Moon in 4th house (Sukha Bhava) brings happiness, property, and mother's blessings. It indicates comfort and emotional fulfillment.",
        "7": "Moon in 7th house (Kalatra Bhava) indicates harmonious relationships and emotional connection with partner. It brings caring and nurturing qualities.",
      },
    };

    const houseNum = house?.number?.toString();
    if (rationales[planetName] && houseNum && rationales[planetName][houseNum]) {
      return rationales[planetName][houseNum];
    }

    // Generic rationale
    return `${planetName} in ${planet.sign} sign indicates ${planetName.toLowerCase()}-related qualities and influences.`;
  };

  return (
    <Card className="p-6 rounded-xl border-2 border-saffron-200 bg-white shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge tone="amber" className="font-bold">{category}</Badge>
            <Badge tone={confidenceInfo.color} className="font-bold">
              Confidence: {confidenceInfo.level}
            </Badge>
            {confidence >= 75 && (
              <Badge tone="green" className="text-xs">✓ High Reliability</Badge>
            )}
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium mb-3">{insight}</p>
        </div>
      </div>

      {/* Related Planets */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-saffron-700 mb-2 flex items-center gap-1">
          <span>🪐</span>
          <span>Related Planets (ग्रह):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {relatedPlanets.map((planet) => {
            const planetInfo = getPlanetInfo(planet);
            const houseInfo = getHouseInfo(planet);
            return (
              <Badge key={planet} tone="indigo" className="text-xs font-bold">
                {planet}
                {planetInfo && ` (${planetInfo.sign})`}
                {houseInfo && ` - H${houseInfo.number}`}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Why This? Expandable Section */}
      <div className="mb-4">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-2 text-sm font-semibold text-purple-700 hover:text-purple-900 transition-colors"
        >
          <span>{showExplanation ? "▼" : "▶"}</span>
          <span>Why this? (क्यों?)</span>
        </button>

        {showExplanation && (
          <div className="mt-3 p-4 rounded-lg bg-purple-50 border border-purple-200 space-y-3">
            {/* Dasha Information */}
            {getDashaInfo() && (
              <div>
                <div className="text-xs font-semibold text-purple-900 mb-1 flex items-center gap-1">
                  <span>⏳</span>
                  <span>Current Dasha (दशा):</span>
                </div>
                <div className="text-sm text-purple-800">
                  {getDashaInfo()?.current} Dasha is active. This planetary period influences the timing and manifestation of predictions related to {category.toLowerCase()}.
                </div>
              </div>
            )}

            {/* Planet Positions & Rationale */}
            {relatedPlanets.map((planetName) => {
              const planetInfo = getPlanetInfo(planetName);
              const houseInfo = getHouseInfo(planetName);
              const rationale = getRationale(planetName);

              if (!planetInfo) return null;

              return (
                <div key={planetName} className="border-t border-purple-200 pt-2">
                  <div className="text-xs font-semibold text-purple-900 mb-1">
                    {planetName} Analysis:
                  </div>
                  <div className="text-sm text-purple-800 space-y-1">
                    <div>
                      <span className="font-semibold">Position:</span> {planetName} is in {planetInfo.sign} sign
                      {houseInfo && `, House ${houseInfo.number} (${getHouseName(houseInfo.number)})`}
                      {planetInfo.degree && ` at ${planetInfo.degree.toFixed(2)}°`}
                    </div>
                    {rationale && (
                      <div className="mt-1 italic text-purple-700">
                        {rationale}
                      </div>
                    )}
                    {planetInfo.retrograde && (
                      <div className="text-xs text-amber-700 font-semibold mt-1">
                        ⚠️ {planetName} is retrograde - effects may be internalized or delayed
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Astrological Rule */}
            <div className="border-t border-purple-200 pt-2">
              <div className="text-xs font-semibold text-purple-900 mb-1">
                Astrological Rule (नियम):
              </div>
              <div className="text-sm text-purple-800">
                {category === "Career" && "The 10th house (Karma Bhava) rules career, profession, and public reputation. Planets here influence professional success and authority."}
                {category === "Relationships" && "The 7th house (Kalatra Bhava) rules marriage, partnerships, and relationships. Venus and Moon here bring harmony, while Saturn may delay but stabilize."}
                {category === "Health" && "The 6th house (Ari Bhava) rules health, enemies, and service. Mars here gives good immunity, while malefic planets may cause health issues."}
                {category === "Finance" && "The 2nd house (Dhana Bhava) rules wealth and family, while the 11th house (Labha Bhava) rules gains and income. Jupiter and Venus here bring prosperity."}
                {!["Career", "Relationships", "Health", "Finance"].includes(category) && "Planetary positions and aspects determine life outcomes. Benefic planets in favorable houses bring positive results, while malefic planets may create challenges that can be overcome with remedies."}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-saffron-700 mb-2 flex items-center gap-1">
            <span>💡</span>
            <span>Recommendations:</span>
          </div>
          <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
            {recommendations.map((rec, i) => (
              <li key={i} className="leading-relaxed">{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

// Helper function to get house name
function getHouseName(houseNum: number): string {
  const houseNames: Record<number, string> = {
    1: "Lagna (Self)",
    2: "Dhana (Wealth)",
    3: "Sahaja (Siblings)",
    4: "Sukha (Happiness)",
    5: "Putra (Children)",
    6: "Ari (Enemies/Health)",
    7: "Kalatra (Spouse)",
    8: "Ayush (Longevity)",
    9: "Dharma (Religion)",
    10: "Karma (Career)",
    11: "Labha (Gains)",
    12: "Vyaya (Expenses)",
  };
  return houseNames[houseNum] || `House ${houseNum}`;
}
