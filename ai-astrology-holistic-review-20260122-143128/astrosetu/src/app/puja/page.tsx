"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { PujaService } from "@/types/astrology";
import { AstroImage } from "@/components/ui/AstroImage";
import { HeaderPattern } from "@/components/ui/HeaderPattern";
import { ServiceIcon } from "@/components/ui/ServiceIcon";

const PUJA_SERVICES: PujaService[] = [
  {
    id: "puja-1",
    name: "Ganesh Puja",
    description: "Remove obstacles and bring success in all endeavors",
    deity: "Lord Ganesha",
    duration: "1 hour",
    price: 501,
    benefits: ["Removes obstacles", "Brings success", "Enhances wisdom", "Protects from negative energies"]
  },
  {
    id: "puja-2",
    name: "Lakshmi Puja",
    description: "Attract wealth, prosperity, and abundance",
    deity: "Goddess Lakshmi",
    duration: "1.5 hours",
    price: 1001,
    benefits: ["Financial prosperity", "Wealth accumulation", "Business growth", "Removes financial obstacles"]
  },
  {
    id: "puja-3",
    name: "Shani Puja",
    description: "Pacify Shani dosha and reduce negative effects",
    deity: "Lord Shani",
    duration: "2 hours",
    price: 1501,
    benefits: ["Reduces Shani dosha", "Removes delays", "Brings stability", "Protects from malefic effects"]
  },
  {
    id: "puja-4",
    name: "Mangal Puja",
    description: "Remedies for Manglik dosha and marriage issues",
    deity: "Lord Mangal (Mars)",
    duration: "1.5 hours",
    price: 2001,
    benefits: ["Removes Manglik dosha", "Harmonious marriage", "Reduces conflicts", "Enhances relationships"]
  },
  {
    id: "puja-5",
    name: "Rahu-Ketu Puja",
    description: "Neutralize negative effects of Rahu and Ketu",
    deity: "Rahu & Ketu",
    duration: "2 hours",
    price: 1801,
    benefits: ["Neutralizes Rahu-Ketu effects", "Spiritual growth", "Removes illusions", "Brings clarity"]
  },
  {
    id: "puja-6",
    name: "Navagraha Puja",
    description: "Worship all nine planets for overall well-being",
    deity: "All Nine Planets",
    duration: "3 hours",
    price: 2501,
    benefits: ["Overall planetary balance", "Complete protection", "Harmony in life", "All-round prosperity"]
  }
];

export default function PujaPage() {
  const [services] = useState<PujaService[]>(PUJA_SERVICES);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", "Ganesh", "Lakshmi", "Shani", "Mangal", "Rahu-Ketu", "Navagraha"];

  const filteredServices = selectedCategory === "all"
    ? services
    : services.filter(s => s.name.includes(selectedCategory));

  function handleBookPuja(service: PujaService, e?: React.MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    e?.stopPropagation();
    alert(`Booking ${service.name} for ₹${service.price}. Payment integration ready!`);
  }

  return (
    <div className="grid gap-6">
      {/* Header with pattern - Indian spiritual theme */}
      <div className="rounded-3xl bg-gradient-to-r from-saffron-500 via-amber-500 to-orange-500 text-white p-6 lg:p-8 mb-6 shadow-lg relative overflow-hidden">
        <HeaderPattern />
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-4 left-4 text-5xl">🕉️</div>
          <div className="absolute top-4 right-4 text-5xl">ॐ</div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-4xl">🪷</div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Online Puja Services (पूजा सेवाएं)</h1>
          <p className="text-white/90 text-base max-w-3xl">
            Book online puja services performed by expert priests. Get live streaming, prasad delivery, and detailed puja reports.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              selectedCategory === cat
                ? "bg-gradient-to-r from-saffron-500 via-amber-500 to-orange-500 text-white shadow-lg"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {cat === "all" ? "All Pujas" : cat}
          </button>
        ))}
      </div>

      {/* Puja Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          // Deity-specific visual configurations with meaningful icons and colors
          const deityVisuals: Record<string, { icon: string; gradient: string; emoji: string }> = {
            "Ganesh": { 
              icon: "🐘", 
              gradient: "from-orange-100 via-amber-50 to-yellow-50", 
              emoji: "🕉️" 
            },
            "Lakshmi": { 
              icon: "🪙", 
              gradient: "from-yellow-100 via-gold-50 to-amber-50", 
              emoji: "💰" 
            },
            "Shani": { 
              icon: "🪐", 
              gradient: "from-slate-100 via-gray-50 to-blue-50", 
              emoji: "⚫" 
            },
            "Mangal": { 
              icon: "🔥", 
              gradient: "from-red-100 via-orange-50 to-amber-50", 
              emoji: "🔴" 
            },
            "Rahu": { 
              icon: "🌑", 
              gradient: "from-indigo-100 via-purple-50 to-slate-50", 
              emoji: "🌙" 
            },
            "Ketu": { 
              icon: "🌑", 
              gradient: "from-indigo-100 via-purple-50 to-slate-50", 
              emoji: "🌙" 
            },
            "Navagraha": { 
              icon: "⭐", 
              gradient: "from-purple-100 via-indigo-50 to-blue-50", 
              emoji: "🌟" 
            }
          };
          
          const deityKey = service.name.includes("Ganesh") ? "Ganesh" :
                           service.name.includes("Lakshmi") ? "Lakshmi" :
                           service.name.includes("Shani") ? "Shani" :
                           service.name.includes("Mangal") ? "Mangal" :
                           (service.name.includes("Rahu") || service.name.includes("Ketu")) ? "Rahu" :
                           service.name.includes("Navagraha") ? "Navagraha" : "Ganesh";
          const visual = deityVisuals[deityKey] || deityVisuals["Ganesh"];
          
          return (
            <Card key={service.id} className="hover:shadow-xl transition-all overflow-hidden group">
              <div className="relative">
                <div className={`w-full h-48 relative overflow-hidden bg-gradient-to-br ${visual.gradient} flex items-center justify-center`}>
                  {/* Deity icon */}
                  <div className="text-center z-10">
                    <div className="text-7xl mb-2">{visual.icon}</div>
                    <div className="text-xs font-semibold text-slate-700 bg-white/80 px-3 py-1 rounded-full">
                      {service.deity}
                    </div>
                  </div>
                  {/* Spiritual pattern overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-3 left-3 text-4xl">{visual.emoji}</div>
                    <div className="absolute top-3 right-3 text-4xl">ॐ</div>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-3xl">🕉️</div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-2 left-2 text-2xl">📿</div>
                    <div className="absolute top-2 right-2 text-2xl">🪔</div>
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <ServiceIcon service={service.deity.split(" ")[0]} size="md" className="!bg-white/90 backdrop-blur-sm" />
                </div>
                {/* Overlay with deity name */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <div className="text-xs font-semibold text-white">{service.deity}</div>
                </div>
              </div>
              <CardHeader eyebrow="🕉️ Puja Service" title={service.name} subtitle={service.deity} />
              <CardContent className="grid gap-4">
                <p className="text-sm text-slate-700">{service.description}</p>
              
              <div className="flex items-center gap-2 text-sm">
                <Badge tone="indigo">⏱️ {service.duration}</Badge>
                <Badge tone="amber">💰 ₹{service.price}</Badge>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">Benefits:</div>
                <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
                  {service.benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <Button type="button" onClick={(e) => handleBookPuja(service, e)} className="w-full">
                  📿 Book Puja - ₹{service.price}
                </Button>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-saffron-50 to-white border-saffron-200/60">
        <CardHeader eyebrow="✨ What&apos;s Included" title="Complete Puja Package" />
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📹</span>
              <div>
                <div className="font-semibold text-slate-900">Live Streaming</div>
                <div className="text-slate-600">Watch puja live from anywhere</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📦</span>
              <div>
                <div className="font-semibold text-slate-900">Prasad Delivery</div>
                <div className="text-slate-600">Receive blessed prasad at your doorstep</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📄</span>
              <div>
                <div className="font-semibold text-slate-900">Detailed Report</div>
                <div className="text-slate-600">Get complete puja report and photos</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

