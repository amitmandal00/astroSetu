"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { ServiceIcon } from "@/components/ui/ServiceIcon";

const COURSES = [
  {
    id: "course-1",
    title: "Introduction to Vedic Astrology",
    description: "Learn the fundamentals of Vedic astrology, including planets, signs, houses, and their meanings.",
    level: "Beginner",
    duration: "4 weeks",
    lessons: 12,
    price: 999,
    instructor: "Pandit Ravi Shankar",
    topics: ["Planets", "Signs", "Houses", "Nakshatras"]
  },
  {
    id: "course-2",
    title: "Kundli Reading Mastery",
    description: "Master the art of reading and interpreting birth charts (Kundli) with practical examples.",
    level: "Intermediate",
    duration: "6 weeks",
    lessons: 18,
    price: 1999,
    instructor: "Dr. Priya Sharma",
    topics: ["Chart Analysis", "Planetary Positions", "Doshas", "Remedies"]
  },
  {
    id: "course-3",
    title: "Marriage Matching & Compatibility",
    description: "Deep dive into Guna Milan, Ashtakoot matching, and compatibility analysis for marriage.",
    level: "Intermediate",
    duration: "5 weeks",
    lessons: 15,
    price: 1499,
    instructor: "Acharya Vikram",
    topics: ["Guna Milan", "Manglik Analysis", "Dosha Matching", "Compatibility"]
  },
  {
    id: "course-4",
    title: "Remedies & Solutions",
    description: "Learn various astrological remedies including gemstones, mantras, pujas, and rituals.",
    level: "Advanced",
    duration: "8 weeks",
    lessons: 24,
    price: 2999,
    instructor: "Swami Ananda",
    topics: ["Gemstones", "Mantras", "Pujas", "Rituals", "Yantras"]
  }
];

const ARTICLES = [
  {
    id: "article-1",
    title: "Understanding Your Ascendant (Lagna)",
    category: "Basics",
    readTime: "5 min",
    views: 1250
  },
  {
    id: "article-2",
    title: "Planetary Transits and Their Effects",
    category: "Transits",
    readTime: "8 min",
    views: 980
  },
  {
    id: "article-3",
    title: "Manglik Dosha: Complete Guide",
    category: "Doshas",
    readTime: "10 min",
    views: 2100
  },
  {
    id: "article-4",
    title: "Choosing the Right Gemstone",
    category: "Remedies",
    readTime: "7 min",
    views: 1500
  }
];

export default function LearnPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Function to get course-specific visual
  const getCourseVisual = (courseTitle: string) => {
    let icon = "📚";
    let gradient = "from-indigo-100 via-purple-50 to-blue-50";
    let title = "Astrology Course";

    if (courseTitle.includes("Vedic") || courseTitle.includes("Introduction")) {
      icon = "📖";
      gradient = "from-indigo-100 via-purple-50 to-blue-50";
      title = "Vedic Astrology Basics";
    } else if (courseTitle.includes("Kundli") || courseTitle.includes("Reading")) {
      icon = "🔮";
      gradient = "from-purple-100 via-indigo-50 to-blue-50";
      title = "Kundli Reading";
    } else if (courseTitle.includes("Marriage") || courseTitle.includes("Matching")) {
      icon = "💑";
      gradient = "from-rose-100 via-pink-50 to-purple-50";
      title = "Marriage Matching";
    } else if (courseTitle.includes("Remedies") || courseTitle.includes("Solutions")) {
      icon = "💎";
      gradient = "from-emerald-100 via-teal-50 to-green-50";
      title = "Remedies & Solutions";
    }
    return { icon, gradient, title };
  };

  return (
    <div className="grid gap-6">
      {/* Header - Indian spiritual theme */}
      <div className="rounded-3xl bg-gradient-to-r from-saffron-500 via-amber-500 to-orange-500 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 text-4xl">📚</div>
          <div className="absolute top-4 right-4 text-4xl">ॐ</div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Learn Astrology (ज्योतिष सीखें)</h1>
          <p className="text-white/90 text-base max-w-3xl">
            Master the art of astrology through comprehensive courses, articles, and tutorials from expert astrologers.
          </p>
        </div>
      </div>

      {/* Courses Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>📚</span>
            <span>Featured Courses</span>
          </h2>
          <Button variant="secondary">View All Courses</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {COURSES.map((course) => {
            const { icon: courseIcon, gradient: courseGradient, title: courseVisualTitle } = getCourseVisual(course.title);
            return (
              <Card key={course.id} className="hover:shadow-xl transition-all overflow-hidden">
                <div className="relative h-40 overflow-hidden">
                  <div className={`w-full h-full bg-gradient-to-br ${courseGradient} flex items-center justify-center relative overflow-hidden`}>
                    <div className="text-center relative z-10">
                      <div className="text-7xl mb-3">{courseIcon}</div>
                      <div className="text-sm font-bold text-slate-700 bg-white/90 px-4 py-1.5 rounded-full shadow-sm">
                        {courseVisualTitle}
                      </div>
                      <div className="text-xs text-slate-600 mt-1 bg-white/70 px-3 py-0.5 rounded-full inline-block">
                        {course.level}
                      </div>
                    </div>
                    {/* Decorative learning elements */}
                    <div className="absolute inset-0 opacity-15">
                      <div className="absolute top-3 left-3 text-3xl">📚</div>
                      <div className="absolute top-3 right-3 text-3xl">🕉️</div>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-2xl">📖</div>
                      <div className="absolute top-1/2 left-6 text-2xl">⭐</div>
                      <div className="absolute top-1/2 right-6 text-2xl">✨</div>
                    </div>
                  </div>
                </div>
                <CardHeader eyebrow="📚 Course" title={course.title} subtitle={course.instructor} icon={courseIcon} />
              <CardContent className="grid gap-4">
                <p className="text-sm text-slate-700">{course.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  <Badge tone="indigo">{course.level}</Badge>
                  <Badge>⏱️ {course.duration}</Badge>
                  <Badge>📖 {course.lessons} lessons</Badge>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Topics Covered:</div>
                  <div className="flex flex-wrap gap-1">
                    {course.topics.map((topic) => (
                      <Badge key={topic} className="text-xs">{topic}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <div className="text-2xl font-bold text-indigo-600">₹{course.price}</div>
                  <Button>Enroll Now</Button>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      </div>

      {/* Articles Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>📄</span>
            <span>Popular Articles</span>
          </h2>
          <Button variant="secondary">View All Articles</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {ARTICLES.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <Badge tone="amber">{article.category}</Badge>
                  <span className="text-xs text-slate-500">👁️ {article.views}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{article.title}</h3>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span>⏱️ {article.readTime} read</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <Card className="bg-gradient-to-br from-saffron-50 to-white border-saffron-200/60">
        <CardHeader eyebrow="✨ Quick Access" title="Learning Resources" icon="📚" />
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/sessions">
              <div className="p-4 rounded-xl border-2 border-saffron-200 bg-white hover:bg-saffron-50 transition-colors cursor-pointer">
                <div className="text-2xl mb-2">🎥</div>
                <div className="font-semibold text-slate-900">Live Sessions</div>
                <div className="text-sm text-slate-600">Join webinars and workshops</div>
              </div>
            </Link>
            <Link href="/community">
              <div className="p-4 rounded-xl border-2 border-saffron-200 bg-white hover:bg-saffron-50 transition-colors cursor-pointer">
                <div className="text-2xl mb-2">💬</div>
                <div className="font-semibold text-slate-900">Community Forum</div>
                <div className="text-sm text-slate-600">Ask questions and discuss</div>
              </div>
            </Link>
            <div className="p-4 rounded-xl border-2 border-saffron-200 bg-white hover:bg-saffron-50 transition-colors cursor-pointer">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-semibold text-slate-900">Video Tutorials</div>
              <div className="text-sm text-slate-600">Step-by-step guides</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

