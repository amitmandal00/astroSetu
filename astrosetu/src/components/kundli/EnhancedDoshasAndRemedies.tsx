"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { DoshaAnalysis } from "@/types/astrology";

type EnhancedDoshasAndRemediesProps = {
  dosha: DoshaAnalysis;
};

export function EnhancedDoshasAndRemedies({ dosha }: EnhancedDoshasAndRemediesProps) {
  const [expandedRemedies, setExpandedRemedies] = useState<Record<string, boolean>>({});
  
  const toggleRemedies = (doshaKey: string) => {
    setExpandedRemedies(prev => ({
      ...prev,
      [doshaKey]: !prev[doshaKey],
    }));
  };
  
  const getSeverityColor = (severity?: "High" | "Medium" | "Low") => {
    switch (severity) {
      case "High": return "from-red-500 to-rose-600";
      case "Medium": return "from-orange-500 to-amber-600";
      case "Low": return "from-yellow-500 to-amber-500";
      default: return "from-slate-400 to-slate-500";
    }
  };
  
  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      "Mantra": "🕉️",
      "Puja": "🕯️",
      "Gemstone": "💎",
      "Donation": "🙏",
      "Fasting": "🍽️",
      "Ritual": "✨",
      "Yantra": "🔯",
      "Other": "⭐",
    };
    return icons[type] || "⭐";
  };
  
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "Mantra": "from-purple-500 to-indigo-600",
      "Puja": "from-orange-500 to-amber-600",
      "Gemstone": "from-blue-500 to-cyan-600",
      "Donation": "from-emerald-500 to-green-600",
      "Fasting": "from-slate-500 to-gray-600",
      "Ritual": "from-pink-500 to-rose-600",
      "Yantra": "from-violet-500 to-purple-600",
      "Other": "from-slate-400 to-slate-500",
    };
    return colors[type] || "from-slate-400 to-slate-500";
  };
  
  return (
    <Card className="lg:col-span-2">
      <CardHeader 
        eyebrow="Dosha Analysis" 
        title="Planetary Doshas & Remedies" 
        subtitle="Comprehensive analysis of doshas with detailed remedies and solutions"
        icon="💎"
      />
      <CardContent className="space-y-6">
        {/* Overall Summary */}
        {dosha.totalDoshas !== undefined && (
          <div className={`p-4 rounded-xl border-2 ${
            dosha.totalDoshas === 0 
              ? "border-emerald-300 bg-emerald-50" 
              : dosha.totalDoshas <= 2
              ? "border-amber-300 bg-amber-50"
              : "border-red-300 bg-red-50"
          }`}>
            <div className="flex items-start gap-3">
              <div className={`text-2xl ${dosha.totalDoshas === 0 ? "text-emerald-600" : dosha.totalDoshas <= 2 ? "text-amber-600" : "text-red-600"}`}>
                {dosha.totalDoshas === 0 ? "✅" : dosha.totalDoshas <= 2 ? "⚠️" : "🔴"}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm mb-1">
                  Dosha Summary: {dosha.totalDoshas} {dosha.totalDoshas === 1 ? "Dosha" : "Doshas"} Detected
                </div>
                <div className="text-sm text-slate-700 mb-2">{dosha.overall}</div>
                {dosha.recommendation && (
                  <div className="text-xs font-semibold text-slate-800 mt-2 p-2 bg-white/60 rounded-lg">
                    💡 Recommendation: {dosha.recommendation}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Manglik Dosha */}
        <div className={`rounded-2xl border-2 p-5 ${
          dosha.manglik.status === "Manglik"
            ? "border-red-300 bg-gradient-to-br from-red-50 to-rose-50"
            : "border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50"
        } shadow-md`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🔥</span>
                <h3 className="font-bold text-lg text-slate-900">Manglik Dosha (Mangal Dosha)</h3>
              </div>
              <Badge 
                tone={dosha.manglik.status === "Manglik" ? "red" : "green"} 
                className="mb-2"
              >
                {dosha.manglik.status} • {dosha.manglik.severity} Severity
              </Badge>
              {dosha.manglik.house && (
                <div className="text-xs text-slate-600 mb-2">
                  Mars placed in {dosha.manglik.house}th house
                </div>
              )}
            </div>
          </div>
          
          {dosha.manglik.explanation && (
            <div className="mb-3 p-3 bg-white/60 rounded-lg">
              <div className="text-xs font-semibold text-slate-700 mb-1">Explanation:</div>
              <div className="text-sm text-slate-800 leading-relaxed">{dosha.manglik.explanation}</div>
            </div>
          )}
          
          {dosha.manglik.impact && dosha.manglik.impact.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-slate-700 mb-2">Possible Impacts:</div>
              <ul className="space-y-1">
                {dosha.manglik.impact.map((impact, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{impact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {dosha.manglik.detailedRemedies && dosha.manglik.detailedRemedies.length > 0 && (
            <div>
              <Button
                variant="secondary"
                onClick={() => toggleRemedies("manglik")}
                className="w-full sm:w-auto mb-3"
              >
                {expandedRemedies["manglik"] ? "Hide" : "Show"} Detailed Remedies ({dosha.manglik.detailedRemedies.length})
              </Button>
              
              {expandedRemedies["manglik"] && (
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  {dosha.manglik.detailedRemedies.map((remedy, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border-2 border-slate-200 bg-white shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xl">{getTypeIcon(remedy.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-bold text-sm text-slate-900">{remedy.name}</div>
                            <Badge className={`text-xs bg-gradient-to-r ${getTypeColor(remedy.type)} text-white`}>
                              {remedy.type}
                            </Badge>
                            {remedy.priority && (
                              <Badge tone={remedy.priority === "High" ? "red" : remedy.priority === "Medium" ? "orange" : "yellow"} className="text-xs">
                                {remedy.priority}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-slate-600 mb-2">{remedy.description}</div>
                        </div>
                      </div>
                      
                      {remedy.timing && (
                        <div className="text-xs text-slate-600 mb-1">
                          <span className="font-semibold">⏰ Timing:</span> {remedy.timing}
                        </div>
                      )}
                      {remedy.frequency && (
                        <div className="text-xs text-slate-600 mb-1">
                          <span className="font-semibold">🔄 Frequency:</span> {remedy.frequency}
                        </div>
                      )}
                      
                      {remedy.instructions && remedy.instructions.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-semibold text-slate-700 mb-1">Instructions:</div>
                          <ol className="text-xs text-slate-700 space-y-1 pl-4">
                            {remedy.instructions.map((instruction, i) => (
                              <li key={i} className="list-decimal">{instruction}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                      
                      {remedy.benefits && remedy.benefits.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <div className="text-xs font-semibold text-emerald-700 mb-1">Benefits:</div>
                          <ul className="text-xs text-slate-700 space-y-0.5">
                            {remedy.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-emerald-600">✓</span>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Kaal Sarp Dosha */}
        <div className={`rounded-2xl border-2 p-5 ${
          dosha.kaalSarp.present
            ? "border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50"
            : "border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50"
        } shadow-md`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🐍</span>
                <h3 className="font-bold text-lg text-slate-900">Kaal Sarp Dosha</h3>
              </div>
              <Badge 
                tone={dosha.kaalSarp.present ? "purple" : "green"} 
                className="mb-2"
              >
                {dosha.kaalSarp.present 
                  ? `Present${dosha.kaalSarp.type ? ` (${dosha.kaalSarp.type})` : ""} • ${dosha.kaalSarp.severity || "Medium"} Severity`
                  : "Not Present"
                }
              </Badge>
            </div>
          </div>
          
          {dosha.kaalSarp.explanation && (
            <div className="mb-3 p-3 bg-white/60 rounded-lg">
              <div className="text-xs font-semibold text-slate-700 mb-1">Explanation:</div>
              <div className="text-sm text-slate-800 leading-relaxed">{dosha.kaalSarp.explanation}</div>
            </div>
          )}
          
          {dosha.kaalSarp.impact && dosha.kaalSarp.impact.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-slate-700 mb-2">Possible Impacts:</div>
              <ul className="space-y-1">
                {dosha.kaalSarp.impact.map((impact, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span>{impact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {dosha.kaalSarp.detailedRemedies && dosha.kaalSarp.detailedRemedies.length > 0 && (
            <div>
              <Button
                variant="secondary"
                onClick={() => toggleRemedies("kaalSarp")}
                className="w-full sm:w-auto mb-3"
              >
                {expandedRemedies["kaalSarp"] ? "Hide" : "Show"} Detailed Remedies ({dosha.kaalSarp.detailedRemedies.length})
              </Button>
              
              {expandedRemedies["kaalSarp"] && (
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  {dosha.kaalSarp.detailedRemedies.map((remedy, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border-2 border-slate-200 bg-white shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xl">{getTypeIcon(remedy.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-bold text-sm text-slate-900">{remedy.name}</div>
                            <Badge className={`text-xs bg-gradient-to-r ${getTypeColor(remedy.type)} text-white`}>
                              {remedy.type}
                            </Badge>
                            {remedy.priority && (
                              <Badge tone={remedy.priority === "High" ? "red" : remedy.priority === "Medium" ? "orange" : "yellow"} className="text-xs">
                                {remedy.priority}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-slate-600 mb-2">{remedy.description}</div>
                        </div>
                      </div>
                      
                      {remedy.timing && (
                        <div className="text-xs text-slate-600 mb-1">
                          <span className="font-semibold">⏰ Timing:</span> {remedy.timing}
                        </div>
                      )}
                      
                      {remedy.instructions && remedy.instructions.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-semibold text-slate-700 mb-1">Instructions:</div>
                          <ol className="text-xs text-slate-700 space-y-1 pl-4">
                            {remedy.instructions.map((instruction, i) => (
                              <li key={i} className="list-decimal">{instruction}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                      
                      {remedy.benefits && remedy.benefits.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <div className="text-xs font-semibold text-emerald-700 mb-1">Benefits:</div>
                          <ul className="text-xs text-slate-700 space-y-0.5">
                            {remedy.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-emerald-600">✓</span>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Shani Dosha */}
        <div className="rounded-2xl border-2 border-slate-300 bg-gradient-to-br from-slate-50 to-gray-50 p-5 shadow-md">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🪐</span>
                <h3 className="font-bold text-lg text-slate-900">Shani (Saturn) Effects</h3>
              </div>
              {dosha.shani.period && (
                <Badge tone="slate" className="mb-2">
                  Period: {dosha.shani.period} • {dosha.shani.severity || "Medium"} Severity
                </Badge>
              )}
            </div>
          </div>
          
          {dosha.shani.explanation && (
            <div className="mb-3 p-3 bg-white/60 rounded-lg">
              <div className="text-xs font-semibold text-slate-700 mb-1">Explanation:</div>
              <div className="text-sm text-slate-800 leading-relaxed">{dosha.shani.explanation}</div>
            </div>
          )}
          
          {dosha.shani.effects && dosha.shani.effects.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-slate-700 mb-2">Effects:</div>
              <ul className="space-y-1">
                {dosha.shani.effects.map((effect, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-slate-500 mt-0.5">•</span>
                    <span>{effect}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {dosha.shani.detailedRemedies && dosha.shani.detailedRemedies.length > 0 && (
            <div>
              <Button
                variant="secondary"
                onClick={() => toggleRemedies("shani")}
                className="w-full sm:w-auto mb-3"
              >
                {expandedRemedies["shani"] ? "Hide" : "Show"} Detailed Remedies ({dosha.shani.detailedRemedies.length})
              </Button>
              
              {expandedRemedies["shani"] && (
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  {dosha.shani.detailedRemedies.map((remedy, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border-2 border-slate-200 bg-white shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xl">{getTypeIcon(remedy.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-bold text-sm text-slate-900">{remedy.name}</div>
                            <Badge className={`text-xs bg-gradient-to-r ${getTypeColor(remedy.type)} text-white`}>
                              {remedy.type}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-600 mb-2">{remedy.description}</div>
                        </div>
                      </div>
                      
                      {remedy.timing && (
                        <div className="text-xs text-slate-600 mb-1">
                          <span className="font-semibold">⏰ Timing:</span> {remedy.timing}
                        </div>
                      )}
                      
                      {remedy.instructions && remedy.instructions.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-semibold text-slate-700 mb-1">Instructions:</div>
                          <ol className="text-xs text-slate-700 space-y-1 pl-4">
                            {remedy.instructions.map((instruction, i) => (
                              <li key={i} className="list-decimal">{instruction}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                      
                      {remedy.benefits && remedy.benefits.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <div className="text-xs font-semibold text-emerald-700 mb-1">Benefits:</div>
                          <ul className="text-xs text-slate-700 space-y-0.5">
                            {remedy.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-emerald-600">✓</span>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Rahu-Ketu Dosha */}
        <div className="rounded-2xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 shadow-md">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🌑</span>
                <h3 className="font-bold text-lg text-slate-900">Rahu-Ketu Effects</h3>
              </div>
              {dosha.rahuKetu.severity && (
                <Badge tone="indigo" className="mb-2">
                  {dosha.rahuKetu.severity} Severity
                </Badge>
              )}
            </div>
          </div>
          
          {dosha.rahuKetu.explanation && (
            <div className="mb-3 p-3 bg-white/60 rounded-lg">
              <div className="text-xs font-semibold text-slate-700 mb-1">Explanation:</div>
              <div className="text-sm text-slate-800 leading-relaxed">{dosha.rahuKetu.explanation}</div>
            </div>
          )}
          
          {dosha.rahuKetu.effects && dosha.rahuKetu.effects.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-slate-700 mb-2">Effects:</div>
              <ul className="space-y-1">
                {dosha.rahuKetu.effects.map((effect, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span>{effect}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {dosha.rahuKetu.detailedRemedies && dosha.rahuKetu.detailedRemedies.length > 0 && (
            <div>
              <Button
                variant="secondary"
                onClick={() => toggleRemedies("rahuKetu")}
                className="w-full sm:w-auto mb-3"
              >
                {expandedRemedies["rahuKetu"] ? "Hide" : "Show"} Detailed Remedies ({dosha.rahuKetu.detailedRemedies.length})
              </Button>
              
              {expandedRemedies["rahuKetu"] && (
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  {dosha.rahuKetu.detailedRemedies.map((remedy, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border-2 border-slate-200 bg-white shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xl">{getTypeIcon(remedy.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-bold text-sm text-slate-900">{remedy.name}</div>
                            <Badge className={`text-xs bg-gradient-to-r ${getTypeColor(remedy.type)} text-white`}>
                              {remedy.type}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-600 mb-2">{remedy.description}</div>
                        </div>
                      </div>
                      
                      {remedy.timing && (
                        <div className="text-xs text-slate-600 mb-1">
                          <span className="font-semibold">⏰ Timing:</span> {remedy.timing}
                        </div>
                      )}
                      
                      {remedy.instructions && remedy.instructions.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-semibold text-slate-700 mb-1">Instructions:</div>
                          <ol className="text-xs text-slate-700 space-y-1 pl-4">
                            {remedy.instructions.map((instruction, i) => (
                              <li key={i} className="list-decimal">{instruction}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                      
                      {remedy.benefits && remedy.benefits.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <div className="text-xs font-semibold text-emerald-700 mb-1">Benefits:</div>
                          <ul className="text-xs text-slate-700 space-y-0.5">
                            {remedy.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-emerald-600">✓</span>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Pitra Dosha - if present */}
        {dosha.pitra && dosha.pitra.present && (
          <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🕉️</span>
                  <h3 className="font-bold text-lg text-slate-900">Pitra Dosha (Ancestral Dosha)</h3>
                </div>
                <Badge tone="amber" className="mb-2">Present</Badge>
              </div>
            </div>
            
            {dosha.pitra.explanation && (
              <div className="mb-3 p-3 bg-white/60 rounded-lg">
                <div className="text-xs font-semibold text-slate-700 mb-1">Explanation:</div>
                <div className="text-sm text-slate-800 leading-relaxed">{dosha.pitra.explanation}</div>
              </div>
            )}
            
            {dosha.pitra.detailedRemedies && dosha.pitra.detailedRemedies.length > 0 && (
              <div>
                <Button
                  variant="secondary"
                  onClick={() => toggleRemedies("pitra")}
                  className="w-full sm:w-auto mb-3"
                >
                  {expandedRemedies["pitra"] ? "Hide" : "Show"} Detailed Remedies ({dosha.pitra.detailedRemedies.length})
                </Button>
                
                {expandedRemedies["pitra"] && (
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    {dosha.pitra.detailedRemedies.map((remedy, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border-2 border-slate-200 bg-white shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-xl">{getTypeIcon(remedy.type)}</span>
                          <div className="flex-1">
                            <div className="font-bold text-sm text-slate-900 mb-1">{remedy.name}</div>
                            <div className="text-xs text-slate-600 mb-2">{remedy.description}</div>
                          </div>
                        </div>
                        
                        {remedy.instructions && remedy.instructions.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs font-semibold text-slate-700 mb-1">Instructions:</div>
                            <ol className="text-xs text-slate-700 space-y-1 pl-4">
                              {remedy.instructions.map((instruction, i) => (
                                <li key={i} className="list-decimal">{instruction}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Consultation CTA */}
        <div className="rounded-2xl border-2 border-purple-300 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="font-bold text-sm text-slate-900 mb-1">💬 Need Personalized Guidance?</div>
              <div className="text-xs text-slate-700">
                Consult our expert astrologers for detailed analysis, remedy timing, and personalized recommendations.
              </div>
            </div>
            <Link href="/astrologers">
              <Button className="px-6 py-2 text-sm">
                Consult Astrologer →
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

