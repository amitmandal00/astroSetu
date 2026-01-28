"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { apiGet } from "@/lib/http";
import type { ChatSession } from "@/types/astrology";
import { Avatar } from "@/components/ui/Avatar";

type SessionsRes = { ok: boolean; data?: ChatSession[]; error?: string };

export default function ChatHistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await apiGet<SessionsRes>("/api/chat/sessions");
        if (res.ok && res.data) {
          setSessions(res.data);
        }
      } catch (e) {
        console.error("Failed to fetch sessions:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return "Today";
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    }
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title="Chat History" />
        <CardContent>
          <div className="text-center py-8 text-slate-500">Loading chat sessions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Chat History</h1>
        <p className="text-slate-600">View and manage your consultation sessions</p>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="text-5xl mb-4">💬</div>
              <div className="text-lg font-semibold text-slate-900 mb-2">No chat sessions yet</div>
              <div className="text-slate-600 mb-6">Start a consultation with an astrologer to begin</div>
              <Button onClick={() => router.push("/astrologers")}>
                Browse Astrologers
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => router.push(`/chat/${session.id}`)}
              className="cursor-pointer"
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar name="Astrologer" size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-semibold text-slate-900 truncate">Consultation Session</div>
                        <Badge tone={session.status === "active" ? "green" : "neutral"}>
                          {session.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600">{formatDate(session.createdAt)}</div>
                    </div>
                    <Button variant="ghost" onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/chat/${session.id}`);
                    }}>
                      Open →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

