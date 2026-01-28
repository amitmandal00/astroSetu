"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: number;
};

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Namaste! I'm your AI astrology assistant. Ask me anything about astrology, Kundli, doshas, remedies, or get personalized guidance!",
      sender: "ai",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses: { [key: string]: string } = {
        kundli: "Kundli, also known as birth chart, is a map of the sky at the time of your birth. It shows the positions of planets, signs, and houses. Would you like to generate your Kundli?",
        dosha: "Doshas are astrological afflictions that can affect your life. Common doshas include Manglik, Kaal Sarp, and Shani dosha. Each has specific remedies. Which dosha would you like to know about?",
        remedy: "Remedies in astrology include wearing gemstones, chanting mantras, performing pujas, and following specific rituals. The remedy depends on your specific planetary positions. Would you like a personalized remedy suggestion?",
        match: "Marriage matching involves comparing two birth charts to check compatibility. We use Guna Milan (36 points system) and analyze Manglik dosha. Would you like to check compatibility?",
        horoscope: "Horoscopes provide daily, weekly, monthly, and yearly predictions based on your zodiac sign. They cover career, love, health, and finance. Which time period interests you?"
      };

      const lowerInput = input.toLowerCase();
      let aiText = "I understand you're asking about astrology. ";

      if (lowerInput.includes("kundli") || lowerInput.includes("birth chart")) {
        aiText = aiResponses.kundli;
      } else if (lowerInput.includes("dosha")) {
        aiText = aiResponses.dosha;
      } else if (lowerInput.includes("remedy") || lowerInput.includes("remedies")) {
        aiText = aiResponses.remedy;
      } else if (lowerInput.includes("match") || lowerInput.includes("compatibility")) {
        aiText = aiResponses.match;
      } else if (lowerInput.includes("horoscope") || lowerInput.includes("prediction")) {
        aiText = aiResponses.horoscope;
      } else {
        aiText += "I can help you with Kundli generation, dosha analysis, remedies, marriage matching, and horoscopes. What would you like to know?";
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        sender: "ai",
        timestamp: Date.now()
      };

      setMessages((prev) => [...prev, aiMessage]);
      setLoading(false);
    }, 1000);
  }

  return (
    <>
      {/* Chatbot Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-2xl hover:shadow-indigo-500/50 transition-all hover:scale-110 z-50 flex items-center justify-center text-2xl"
          aria-label="Open AI Chatbot"
        >
          🤖
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border-2 border-indigo-200 flex flex-col z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <div>
                <div className="font-bold">AI Astrology Assistant</div>
                <div className="text-xs opacity-90">Online • Ready to help</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-900 border border-slate-200"
                  }`}
                >
                  <div className="text-sm">{msg.text}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2">
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

          {/* Input */}
          <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask me anything about astrology..."
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={loading || !input.trim()}>
                ➤
              </Button>
            </div>
            <div className="text-xs text-slate-500 mt-2 text-center">
              AI-powered • May provide general guidance
            </div>
          </div>
        </div>
      )}
    </>
  );
}

