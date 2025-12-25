"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Astrologer } from "@/types/astrology";
import { apiGet } from "@/lib/http";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { Avatar } from "@/components/ui/Avatar";

export default function AstrologersPage() {
  const [q, setQ] = useState("");
  const [data, setData] = useState<Astrologer[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "daily" | "expert" | "love" | "career">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setErr(null);
    apiGet<{ ok: boolean; data?: Astrologer[]; error?: string }>("/api/astrologers")
      .then((res) => {
        if (!res.ok) throw new Error(res.error || "Failed");
        setData(res.data ?? []);
      })
      .catch((e) => {
        console.error("Error fetching astrologers:", e);
        setErr(e?.message ?? "Something went wrong");
        setData([]); // Set empty array on error
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let result = data;
    // Apply filter
    if (filter !== "all") {
      // Filter logic can be added here based on astrologer properties
    }
    // Apply search
    const s = q.trim().toLowerCase();
    if (s) {
      result = result.filter(a =>
        a.name.toLowerCase().includes(s) ||
        a.skills.join(" ").toLowerCase().includes(s) ||
        a.languages.join(" ").toLowerCase().includes(s)
      );
    }
    return result;
  }, [q, data, filter]);

  return (
    <div className="grid gap-5">
      {/* Header - Indian spiritual theme */}
      <div className="rounded-3xl bg-gradient-to-r from-saffron-500 via-amber-500 to-orange-500 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 text-4xl">👨‍🏫</div>
          <div className="absolute top-4 right-4 text-4xl">ॐ</div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Talk to Astrologers (ज्योतिषी से बात करें)</h1>
        </div>
      </div>

      {/* Tabs matching reference */}
      <div className="flex flex-wrap gap-2">
        {(["all", "daily", "expert", "love", "career"] as const).map((type) => {
          const tabIcons: Record<string, string> = {
            "all": "🌟",
            "daily": "📅",
            "expert": "👨‍🏫",
            "love": "💑",
            "career": "💼"
          };
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                filter === type
                  ? "bg-gradient-to-r from-saffron-500 via-amber-500 to-orange-500 text-white shadow-md"
                  : "bg-white text-slate-600 hover:text-slate-900 border-2 border-slate-300"
              }`}
            >
              <span>{tabIcons[type] || "•"}</span>
              {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-slate-500">Loading astrologers...</div>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-slate-500 mb-2">No astrologers found</div>
              {err && <div className="text-sm text-rose-700">{err}</div>}
            </CardContent>
          </Card>
        ) : (
          filtered.map((a) => (
            <Card key={a.id} className="hover:shadow-lg transition-all overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Profile Picture with enhanced visual */}
                  <div className="relative flex-shrink-0">
                    <Avatar 
                      name={a.name} 
                      size="lg" 
                      online={a.isOnline}
                      className="flex-shrink-0"
                    />
                    {a.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-md">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-1">
                          {a.name}
                          {a.isOnline && (
                            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                              Online
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1">
                            <span>👨‍🏫</span>
                            <span>{a.skills[0] || "Vedic"}</span>
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="flex items-center gap-1">
                            <span>⭐</span>
                            <span>{a.experienceYears} Years Exp</span>
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="flex items-center gap-1">
                            <span>💬</span>
                            <span>{a.languages.join(", ")}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end mb-1">
                          <span className="text-amber-500 text-lg">⭐</span>
                          <span className="text-amber-600 font-bold">{a.ratingAvg.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {a.totalConsultations || 0}+ Consultations
                        </div>
                      </div>
                    </div>
                    
                    {/* Skills badges */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {a.skills.slice(0, 3).map((skill, idx) => (
                        <Badge key={idx} tone="amber" className="text-xs font-semibold">
                          {skill}
                        </Badge>
                      ))}
                      {a.skills.length > 3 && (
                        <Badge className="text-xs font-semibold">
                          +{a.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t-2 border-slate-200">
                      <Link href={`/astrologers/${a.id}`} className="flex-1">
                        <button
                          type="button"
                          className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-saffron-600 via-amber-600 to-orange-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 border-2 border-saffron-700/30"
                        >
                          <span className="text-lg">💬</span>
                          <span>Chat Now</span>
                          <span className="text-base opacity-90">→</span>
                        </button>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          alert(`Calling ${a.name}...`);
                        }}
                        className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 border-2 border-emerald-700/30 whitespace-nowrap"
                      >
                        <span className="text-lg">📞</span>
                        <span>Call</span>
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Bottom Action Buttons matching reference */}
      {filtered.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pb-4 lg:hidden">
          <div className="max-w-md mx-auto grid grid-cols-2 gap-3 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                if (filtered.length > 0) {
                  window.location.href = `/astrologers/${filtered[0].id}`;
                }
              }}
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-saffron-600 via-amber-600 to-orange-600 text-white font-bold text-base shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 border-2 border-saffron-700/30"
            >
              <span className="text-xl">💬</span>
              <span>Chat</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (filtered.length > 0) {
                  alert(`Calling ${filtered[0].name}...`);
                }
              }}
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-base shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 border-2 border-emerald-700/30"
            >
              <span className="text-xl">📞</span>
              <span>Call</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
