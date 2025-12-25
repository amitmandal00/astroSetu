"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ChatMessage, ChatSession } from "@/types/astrology";
import { apiGet, apiPost } from "@/lib/http";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

type SessionRes = { ok: boolean; data?: ChatSession; error?: string };
type MsgRes = { ok: boolean; data?: ChatMessage[]; error?: string };
type MsgPostRes = { ok: boolean; data?: ChatMessage; error?: string };

export default function ChatPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;

  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);

  const lastTs = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const canSend = useMemo(() => text.trim().length > 0 && session?.status === "active" && !sending, [text, session?.status, sending]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = await apiGet<SessionRes>(`/api/chat/sessions/${sessionId}`);
        if (!s.ok) throw new Error(s.error || "Failed");
        if (!alive) return;
        setSession(s.data!);

        const m = await apiGet<MsgRes>(`/api/chat/sessions/${sessionId}/messages`);
        if (!m.ok) throw new Error(m.error || "Failed");
        if (!alive) return;
        setMessages(m.data ?? []);
        lastTs.current = (m.data?.at(-1)?.createdAt ?? 0);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? "Something went wrong");
      }
    })();
    return () => { alive = false; };
  }, [sessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time message polling (optimized)
  useEffect(() => {
    let timer: any;
    let alive = true;
    let pollInterval = 1500; // Start with 1.5s

    async function poll() {
      try {
        const m = await apiGet<MsgRes>(`/api/chat/sessions/${sessionId}/messages?after=${lastTs.current}`);
        if (!m.ok) return;
        if (!alive) return;
        const add = m.data ?? [];
        if (add.length) {
          setMessages(prev => [...prev, ...add]);
          lastTs.current = add.at(-1)!.createdAt;
          setIsTyping(false); // Stop typing indicator when message arrives
          // Increase poll interval if no new messages (reduce server load)
          pollInterval = Math.min(pollInterval * 1.1, 5000);
        } else {
          // Decrease poll interval if messages are coming (faster updates)
          pollInterval = Math.max(pollInterval * 0.9, 1000);
        }
      } catch { /* ignore */ }
      if (alive) {
        timer = setTimeout(poll, pollInterval);
      }
    }

    poll();
    return () => { alive = false; clearTimeout(timer); };
  }, [sessionId]);

  async function send() {
    setErr(null);
    const t = text.trim();
    if (!t || sending) return;
    
    setSending(true);
    setText("");
    
    // Optimistically add message
    const tempMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      sessionId,
      sender: "user",
      text: t,
      createdAt: Date.now(),
    };
    setMessages(prev => [...prev, tempMessage]);
    setIsTyping(true); // Show typing indicator for astrologer

    try {
      const res = await apiPost<MsgPostRes>(`/api/chat/sessions/${sessionId}/messages`, { sender: "user", text: t });
      if (!res.ok) throw new Error(res.error || "Failed");
      const m = res.data;
      if (m) {
        // Replace temp message with real one
        setMessages(prev => prev.map(msg => msg.id === tempMessage.id ? m : msg));
        lastTs.current = Math.max(lastTs.current, m.createdAt);
      }
    } catch (e: any) {
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setErr(e?.message ?? "Failed to send");
      setText(t); // Restore text
    } finally {
      setSending(false);
    }
  }

  function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  async function endSession() {
    try {
      await fetch(`/api/chat/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "end" })
      });
      router.push("/astrologers");
    } catch { /* ignore */ }
  }

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader eyebrow="Consultation" title="Chat session" subtitle="Calm, focused UI — the monetization core." />
        <CardContent className="flex flex-wrap items-center gap-2">
          <Badge tone={session?.status === "active" ? "green" : "neutral"}>{session?.status ?? "Loading"}</Badge>
          <Button variant="secondary" onClick={() => router.push("/astrologers")}>Back</Button>
          <Button variant="ghost" onClick={endSession}>End session</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader eyebrow="Messages" title="Conversation" />
        <CardContent>
          <div className="h-[60vh] overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-4 space-y-4 scrollbar-hide">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">💬</div>
                  <div className="text-sm">Start the conversation...</div>
                </div>
              </div>
            )}
            {messages.map((m, idx) => {
              const isUser = m.sender === "user";
              const isSystem = m.sender === "system";
              const showAvatar = !isUser && !isSystem;
              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const showSender = !prevMsg || prevMsg.sender !== m.sender;
              
              return (
                <div
                  key={m.id}
                  className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  {showAvatar && (
                    <Avatar
                      name="Astrologer"
                      size="sm"
                      className="flex-shrink-0"
                    />
                  )}
                  {!showAvatar && !isUser && <div className="w-8" />}
                  <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[75%]`}>
                    {showSender && !isSystem && (
                      <div className={`text-xs font-semibold text-slate-500 mb-1 px-2 ${isUser ? "text-right" : "text-left"}`}>
                        {isUser ? "You" : "Astrologer"}
                      </div>
                    )}
                    <div
                      className={[
                        "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                        isUser
                          ? "bg-gradient-to-r from-saffron-500 to-amber-500 text-white"
                          : isSystem
                            ? "bg-slate-100 text-slate-700 border border-slate-200"
                            : "bg-white text-slate-900 border border-slate-200"
                      ].join(" ")}
                    >
                      <div className="whitespace-pre-wrap break-words">{m.text}</div>
                      <div className={`text-[10px] mt-1.5 ${isUser ? "text-white/80" : "text-slate-500"}`}>
                        {formatTime(m.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex items-end gap-2">
                <Avatar name="Astrologer" size="sm" className="flex-shrink-0" />
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={session?.status === "active" ? "Type your question..." : "Session ended"}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={session?.status !== "active" || sending}
              className="resize-none"
            />
            <Button onClick={send} disabled={!canSend} className="min-w-[100px]">
              {sending ? "Sending..." : "Send"}
            </Button>
          </div>

          {err ? <div className="text-sm text-rose-700 mt-3">{err}</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}
