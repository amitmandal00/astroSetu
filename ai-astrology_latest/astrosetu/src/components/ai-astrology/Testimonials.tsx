"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TESTIMONIALS, type Testimonial } from "@/lib/ai-astrology/testimonials";

interface TestimonialsProps {
  maxDisplay?: number;
  showAll?: boolean;
  reportType?: string;
}

export function Testimonials({ maxDisplay = 3, showAll = false, reportType }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Filter testimonials if reportType is provided
  const filteredTestimonials = reportType
    ? TESTIMONIALS.filter(t => 
        t.reportType.toLowerCase().includes(reportType.toLowerCase()) ||
        reportType.toLowerCase().includes(t.reportType.toLowerCase())
      )
    : TESTIMONIALS;
  
  const displayedTestimonials = showAll 
    ? filteredTestimonials 
    : filteredTestimonials.slice(0, maxDisplay);
  
  const testimonialsToShow = showAll 
    ? displayedTestimonials 
    : displayedTestimonials.slice(currentIndex, currentIndex + maxDisplay);

  const renderStars = (rating: number) => {
    return "⭐".repeat(rating);
  };

  const nextTestimonials = () => {
    if (!showAll && currentIndex + maxDisplay < displayedTestimonials.length) {
      setCurrentIndex(currentIndex + maxDisplay);
    }
  };

  const prevTestimonials = () => {
    if (currentIndex > 0) {
      setCurrentIndex(Math.max(0, currentIndex - maxDisplay));
    }
  };

  const canGoNext = !showAll && currentIndex + maxDisplay < displayedTestimonials.length;
  const canGoPrev = currentIndex > 0;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
          What Our Users Say
        </h2>
        <p className="text-slate-600 text-lg">
          Real feedback from users who&apos;ve used our AI-powered astrology reports
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
          <span className="text-2xl">⭐⭐⭐⭐⭐</span>
          <span className="font-semibold text-slate-700">4.9/5</span>
          <span className="text-slate-400">•</span>
          <span>{TESTIMONIALS.length}+ Verified Reviews</span>
        </div>
      </div>

      {/* Testimonials Grid/Carousel */}
      <div className="relative">
        <div className={`grid ${showAll ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-3'} gap-6`}>
          {testimonialsToShow.map((testimonial) => (
            <Card key={testimonial.id} className="cosmic-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-slate-800">{testimonial.name}</h3>
                      {testimonial.verified && (
                        <Badge className="bg-green-100 text-green-700 text-xs px-2 py-0.5">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{testimonial.location}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-3">
                  <div className="text-lg mb-1">{renderStars(testimonial.rating)}</div>
                  <p className="text-xs text-slate-500">{testimonial.date}</p>
                </div>

                {/* Report Type Badge */}
                <Badge className="mb-4 text-xs bg-purple-100 text-purple-700">
                  {testimonial.reportType}
                </Badge>

                {/* Testimonial Text */}
                <p className="text-slate-700 leading-relaxed text-sm italic">
                  &quot;{testimonial.text}&quot;
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation Arrows (only if not showAll) */}
        {!showAll && displayedTestimonials.length > maxDisplay && (
          <>
            {canGoPrev && (
              <button
                onClick={prevTestimonials}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-slate-50 transition-colors"
                aria-label="Previous testimonials"
              >
                <span className="text-2xl">←</span>
              </button>
            )}
            {canGoNext && (
              <button
                onClick={nextTestimonials}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-slate-50 transition-colors"
                aria-label="Next testimonials"
              >
                <span className="text-2xl">→</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Dots Indicator (only if not showAll) */}
      {!showAll && displayedTestimonials.length > maxDisplay && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(displayedTestimonials.length / maxDisplay) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * maxDisplay)}
              className={`w-2 h-2 rounded-full transition-colors ${
                Math.floor(currentIndex / maxDisplay) === index
                  ? "bg-purple-600"
                  : "bg-slate-300"
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Trust Message */}
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500">
          All testimonials are from verified customers who purchased our reports.
        </p>
      </div>
    </div>
  );
}

