"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { AstroImage } from "@/components/ui/AstroImage";
import type { CommunityPost } from "@/types/astrology";

const SAMPLE_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    userId: "user-1",
    userName: "Rajesh Kumar",
    title: "How to interpret Manglik dosha in Kundli?",
    content: "I recently got my Kundli generated and found that I have Manglik dosha. Can someone explain what this means and what remedies are available?",
    category: "question",
    likes: 24,
    replies: 8,
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    tags: ["Manglik", "Dosha", "Kundli", "Remedies"]
  },
  {
    id: "post-2",
    userId: "user-2",
    userName: "Priya Sharma",
    title: "My experience with online puja services",
    content: "I booked a Ganesh Puja last month and the experience was amazing! The live streaming was clear and I received prasad within 3 days. Highly recommend!",
    category: "experience",
    likes: 45,
    replies: 12,
    createdAt: Date.now() - 5 * 60 * 60 * 1000,
    tags: ["Puja", "Experience", "Review"]
  },
  {
    id: "post-3",
    userId: "user-3",
    userName: "Amit Patel",
    title: "Best time for marriage according to horoscope?",
    content: "Looking for advice on choosing the right muhurat for marriage. My partner and I are planning to get married next year.",
    category: "help",
    likes: 18,
    replies: 15,
    createdAt: Date.now() - 8 * 60 * 60 * 1000,
    tags: ["Marriage", "Muhurat", "Horoscope"]
  }
];

export default function CommunityPage() {
  const [posts] = useState<CommunityPost[]>(SAMPLE_POSTS);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["all", "question", "discussion", "experience", "help"];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = filter === "all" || post.category === filter;
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function formatTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div className="grid gap-6">
      {/* Header - Indian spiritual theme */}
      <div className="rounded-3xl bg-gradient-to-r from-saffron-500 via-amber-500 to-orange-500 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 text-4xl">💬</div>
          <div className="absolute top-4 right-4 text-4xl">ॐ</div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Community (समुदाय)</h1>
          <p className="text-white/90 text-base">
            Ask anonymously • verified answers
          </p>
        </div>
      </div>

      {/* Question Input Card matching reference */}
      <Card>
        <CardContent className="p-5">
          <div className="flex gap-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask your question anonymously..."
              className="flex-1"
            />
            <Button className="whitespace-nowrap">
              Post Question
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts List matching reference */}
      <div className="grid gap-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-all overflow-hidden">
            <div className="relative h-40 overflow-hidden">
              {(() => {
                // Category-specific meaningful visuals for community discussions
                const categoryVisuals: Record<string, { icon: string; gradient: string; title: string }> = {
                  "question": { 
                    icon: "❓", 
                    gradient: "from-blue-100 via-indigo-50 to-purple-50",
                    title: "Question"
                  },
                  "experience": { 
                    icon: "✨", 
                    gradient: "from-amber-100 via-yellow-50 to-orange-50",
                    title: "Experience"
                  },
                  "help": { 
                    icon: "💬", 
                    gradient: "from-emerald-100 via-teal-50 to-green-50",
                    title: "Help Needed"
                  },
                  "discussion": { 
                    icon: "💭", 
                    gradient: "from-purple-100 via-pink-50 to-rose-50",
                    title: "Discussion"
                  }
                };
                const visual = categoryVisuals[post.category] || { icon: "💬", gradient: "from-slate-100 via-gray-50 to-slate-50", title: "Post" };
                
                return (
                  <div className={`w-full h-full bg-gradient-to-br ${visual.gradient} flex items-center justify-center relative overflow-hidden`}>
                    {/* Main visual content */}
                    <div className="text-center z-10">
                      <div className="text-7xl mb-3">{visual.icon}</div>
                      <div className="text-sm font-bold text-slate-700 bg-white/90 px-4 py-1.5 rounded-full shadow-sm">
                        {visual.title}
                      </div>
                      <div className="text-xs text-slate-600 mt-1 bg-white/70 px-3 py-0.5 rounded-full inline-block">
                        {post.tags[0] || "Astrology"}
                      </div>
                    </div>
                    {/* Decorative community elements */}
                    <div className="absolute inset-0 opacity-15">
                      <div className="absolute top-3 left-3 text-3xl">💬</div>
                      <div className="absolute top-3 right-3 text-3xl">🕉️</div>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-2xl">👥</div>
                      <div className="absolute top-1/2 left-6 text-2xl">💭</div>
                      <div className="absolute top-1/2 right-6 text-2xl">🤝</div>
                    </div>
                    {/* Community interaction indicators */}
                    <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
                      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm border border-white/50">
                        <span className="text-sm">👍</span>
                        <span className="text-xs font-bold text-slate-700">{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm border border-white/50">
                        <span className="text-sm">💬</span>
                        <span className="text-xs font-bold text-slate-700">{post.replies}</span>
                      </div>
                    </div>
                    {/* User info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-3">
                      <div className="text-xs font-semibold text-white mb-0.5">{post.userName}</div>
                      <div className="text-xs text-white/90">{formatTimeAgo(post.createdAt)}</div>
                    </div>
                  </div>
                );
              })()}
            </div>
            <CardContent className="p-5">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{post.title}</h3>
              <div className="text-amber-600 font-semibold text-sm mb-2">Astrologer Answer</div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Insight summary shown here for clarity and trust.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-slate-500">No posts found. Be the first to create a post!</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

