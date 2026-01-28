"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { AstroImage } from "@/components/ui/AstroImage";
import type { LiveSession } from "@/types/astrology";

const UPCOMING_SESSIONS: LiveSession[] = [
  {
    id: "session-1",
    title: "Understanding Your Kundli - Beginner's Guide",
    astrologerId: "astro-1",
    astrologerName: "Pandit Ravi Shankar",
    startTime: Date.now() + 2 * 24 * 60 * 60 * 1000,
    endTime: Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
    type: "webinar",
    topic: "Kundli Basics",
    price: 299,
    attendees: 45,
    maxAttendees: 100,
    status: "upcoming"
  },
  {
    id: "session-2",
    title: "Marriage Compatibility Analysis",
    astrologerId: "astro-2",
    astrologerName: "Dr. Priya Sharma",
    startTime: Date.now() + 5 * 24 * 60 * 60 * 1000,
    endTime: Date.now() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000,
    type: "class",
    topic: "Marriage Matching",
    price: 499,
    attendees: 78,
    maxAttendees: 150,
    status: "upcoming"
  },
  {
    id: "session-3",
    title: "Remedies for Planetary Doshas",
    astrologerId: "astro-3",
    astrologerName: "Acharya Vikram",
    startTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
    endTime: Date.now() + 7 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000,
    type: "workshop",
    topic: "Remedies",
    price: 399,
    attendees: 120,
    maxAttendees: 200,
    status: "upcoming"
  }
];

export default function SessionsPage() {
  const [sessions] = useState<LiveSession[]>(UPCOMING_SESSIONS);
  const [filter, setFilter] = useState<"all" | "webinar" | "class" | "workshop">("all");

  const filteredSessions = filter === "all"
    ? sessions
    : sessions.filter(s => s.type === filter);

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function handleJoin(session: LiveSession) {
    alert(`Joining ${session.title}. Live session will start at ${formatDate(session.startTime)}`);
  }

  return (
    <div className="grid gap-6">
      {/* Header - Indian spiritual theme */}
      <div className="rounded-3xl bg-gradient-to-r from-saffron-500 via-amber-500 to-orange-500 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 text-4xl">🎥</div>
          <div className="absolute top-4 right-4 text-4xl">ॐ</div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Live Sessions (लाइव सत्र)</h1>
          <p className="text-white/80 text-base">
            Trending astrologers • real-time guidance
          </p>
        </div>
      </div>

      {/* Tabs matching reference */}
      <div className="flex flex-wrap gap-2">
        {(["all", "webinar", "class", "workshop"] as const).map((type) => {
          const tabIcons: Record<string, string> = {
            "all": "🌟",
            "webinar": "📹",
            "class": "📚",
            "workshop": "🛠️"
          };
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                filter === type
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
              }`}
            >
              <span>{tabIcons[type] || "•"}</span>
              {type === "all" ? "All Sessions" : type.charAt(0).toUpperCase() + type.slice(1) + "s"}
            </button>
          );
        })}
      </div>

      {/* Sessions Grid */}
      <div className="grid gap-4">
        {filteredSessions.map((session, idx) => (
          <Card key={session.id} className="hover:shadow-md transition-all overflow-hidden">
            <div className="relative h-40 overflow-hidden">
              {(() => {
                // Session-type-specific meaningful visuals for Indian astrology
                const sessionVisuals: Record<string, { icon: string; gradient: string; title: string }> = {
                  "webinar": { 
                    icon: "📹", 
                    gradient: "from-indigo-100 via-purple-50 to-blue-50",
                    title: "Live Webinar"
                  },
                  "class": { 
                    icon: "📚", 
                    gradient: "from-amber-100 via-yellow-50 to-orange-50",
                    title: "Learning Class"
                  },
                  "workshop": { 
                    icon: "🛠️", 
                    gradient: "from-emerald-100 via-teal-50 to-green-50",
                    title: "Interactive Workshop"
                  }
                };
                const visual = sessionVisuals[session.type] || { icon: "🎥", gradient: "from-slate-100 via-gray-50 to-slate-50", title: "Live Session" };
                
                return (
                  <div className={`w-full h-full bg-gradient-to-br ${visual.gradient} flex items-center justify-center relative overflow-hidden`}>
                    {/* Main visual content */}
                    <div className="text-center z-10">
                      <div className="text-7xl mb-3">{visual.icon}</div>
                      <div className="text-sm font-bold text-slate-700 bg-white/90 px-4 py-1.5 rounded-full shadow-sm">
                        {visual.title}
                      </div>
                      <div className="text-xs text-slate-600 mt-1 bg-white/70 px-3 py-0.5 rounded-full inline-block">
                        {session.topic}
                      </div>
                    </div>
                    {/* Decorative astrological elements */}
                    <div className="absolute inset-0 opacity-15">
                      <div className="absolute top-3 left-3 text-3xl">🎥</div>
                      <div className="absolute top-3 right-3 text-3xl">🕉️</div>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-2xl">📡</div>
                      <div className="absolute top-1/2 left-6 text-2xl">👨‍🏫</div>
                      <div className="absolute top-1/2 right-6 text-2xl">⭐</div>
                    </div>
                    {/* Overlay with session info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-3">
                      <div className="text-xs font-semibold text-white mb-1">{session.astrologerName}</div>
                      <div className="text-xs text-white/90">{session.attendees} attending</div>
                    </div>
                    {idx === 0 && (
                      <div className="absolute top-3 left-3 z-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/95 backdrop-blur-sm border-2 border-amber-400 shadow-lg">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                          <span className="text-white font-bold text-xs">LIVE</span>
                          <span className="text-white text-xs">• 1.6k watching</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            <CardContent className="p-5">
              <div className="grid md:grid-cols-[1fr_auto] gap-6">
                <div>
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{session.title}</h3>
                    <div className="text-sm text-slate-600">{session.astrologerName} • {session.attendees} yrs • {session.type === "webinar" ? "Vedic" : "Expert"}</div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1">📅 Date & Time</div>
                      <div className="text-sm text-slate-900">{formatDate(session.startTime)}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1">👥 Attendees</div>
                      <div className="text-sm text-slate-900">
                        {session.attendees}/{session.maxAttendees} registered
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1">💰 Price</div>
                      <div className="text-sm font-semibold text-amber-600">₹{session.price}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1">📚 Topic</div>
                      <div className="text-sm text-slate-900">{session.topic}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <Button onClick={() => handleJoin(session)} className="whitespace-nowrap">
                    {idx === 0 ? "Join Live" : "Join discussion"}
                  </Button>
                  {idx > 0 && (
                    <div className="text-xs text-slate-500 mt-2 text-center">
                      LIVE • Join discussion
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200/60">
        <CardHeader eyebrow="✨ What You Get" title="Live Session Benefits" icon="🎓" />
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold text-slate-900 mb-1">🎓 Learn from Experts</div>
              <div className="text-slate-600">Interactive sessions with verified astrologers</div>
            </div>
            <div>
              <div className="font-semibold text-slate-900 mb-1">💬 Q&A Sessions</div>
              <div className="text-slate-600">Ask questions and get personalized answers</div>
            </div>
            <div>
              <div className="font-semibold text-slate-900 mb-1">📱 Recorded Access</div>
              <div className="text-slate-600">Watch recordings if you miss the live session</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


