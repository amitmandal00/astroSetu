"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type RemedyEvent = {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "puja" | "fast" | "charity" | "gemstone" | "mantra";
  planet: string;
  priority: "high" | "medium" | "low";
};

// Mock remedy calendar data
const generateRemedyCalendar = (): RemedyEvent[] => {
  const today = new Date();
  const events: RemedyEvent[] = [];
  
  // Generate events for next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Add some remedy events based on day of week and date
    if (i % 7 === 0) {
      // Weekly puja on Sundays
      events.push({
        id: `puja-${i}`,
        date: date.toISOString().split('T')[0],
        title: "Weekly Puja for Shani",
        description: "Perform Shani puja for peace and prosperity",
        type: "puja",
        planet: "Saturn",
        priority: "high",
      });
    }
    
    if (i % 5 === 0) {
      // Fast on specific days
      events.push({
        id: `fast-${i}`,
        date: date.toISOString().split('T')[0],
        title: "Fasting Day",
        description: "Observe fast for health and spiritual growth",
        type: "fast",
        planet: "Moon",
        priority: "medium",
      });
    }
    
    if (i === 0 || i === 15) {
      // Charity on new moon and full moon
      events.push({
        id: `charity-${i}`,
        date: date.toISOString().split('T')[0],
        title: "Charity Day",
        description: "Donate to needy for positive karma",
        type: "charity",
        planet: "Jupiter",
        priority: "high",
      });
    }
  }
  
  return events;
};

export default function RemediesCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const events = generateRemedyCalendar();
  
  const getTypeColor = (type: RemedyEvent["type"]): "neutral" | "green" | "red" | "amber" | "indigo" => {
    const colors: Record<RemedyEvent["type"], "neutral" | "green" | "red" | "amber" | "indigo"> = {
      puja: "indigo",
      fast: "amber",
      charity: "green",
      gemstone: "amber",
      mantra: "indigo",
    };
    return colors[type];
  };
  
  const getPriorityColor = (priority: RemedyEvent["priority"]): "neutral" | "green" | "red" | "amber" | "indigo" => {
    const colors: Record<RemedyEvent["priority"], "neutral" | "green" | "red" | "amber" | "indigo"> = {
      high: "red",
      medium: "amber",
      low: "neutral",
    };
    return colors[priority];
  };
  
  const selectedEvents = selectedDate 
    ? events.filter(e => e.date === selectedDate)
    : events.slice(0, 10); // Show next 10 events
  
  const groupedByDate = selectedEvents.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, RemedyEvent[]>);
  
  return (
    <div className="grid gap-6">
      <Card className="shadow-xl">
        <CardHeader
          eyebrow="📅 Remedies Calendar"
          title="Personalized Remedy Schedule"
          subtitle="Track and schedule your astrological remedies"
          icon="📅"
        />
        <CardContent className="space-y-6">
          {/* Calendar View */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-slate-600 py-2">
                {day}
              </div>
            ))}
            {/* Calendar days would go here - simplified for MVP */}
          </div>
          
          {/* Upcoming Remedies */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 text-lg">Upcoming Remedies</h3>
            <div className="space-y-4">
              {Object.entries(groupedByDate).map(([date, dateEvents]) => (
                <div key={date} className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="font-semibold text-slate-900 mb-3">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="space-y-3">
                    {dateEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 rounded-lg bg-white border-2 border-slate-200 hover:border-purple-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge tone={getTypeColor(event.type)} className="font-bold">
                                {event.type.toUpperCase()}
                              </Badge>
                              <Badge tone="indigo" className="text-xs">
                                {event.planet}
                              </Badge>
                              <Badge tone={getPriorityColor(event.priority)} className="text-xs">
                                {event.priority.toUpperCase()} Priority
                              </Badge>
                            </div>
                            <h4 className="font-bold text-slate-900 mb-1">{event.title}</h4>
                            <p className="text-sm text-slate-700">{event.description}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button variant="secondary" className="text-xs px-3 py-1.5">
                            Mark Complete
                          </Button>
                          <Button variant="ghost" className="text-xs px-3 py-1.5">
                            Remind Me
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Info Box */}
          <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-200">
            <div className="text-sm text-amber-800">
              <div className="font-semibold mb-2">💡 About Remedies Calendar</div>
              <p>
                This calendar helps you track personalized astrological remedies based on your Kundli. 
                Complete remedies on suggested dates for maximum benefit. You can customize and add your own remedies.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
