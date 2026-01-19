/**
 * Report Table of Contents Component
 * Sticky navigation for long reports with smooth scroll
 */

"use client";

import { useState, useEffect, useRef } from "react";
import type { ReportContent, ReportType } from "@/lib/ai-astrology/types";

interface ReportTableOfContentsProps {
  content: ReportContent;
  reportType: ReportType;
}

export function ReportTableOfContents({ content, reportType }: ReportTableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate section IDs and TOC items
  const getTocItems = () => {
    const items: Array<{ id: string; label: string; level: number }> = [];

    // Add Executive Summary if present
    if (content.executiveSummary) {
      items.push({ id: "executive-summary", label: "Executive Summary", level: 1 });
    }

    // Add regular summary if present (and not executive summary)
    if (content.summary && !content.executiveSummary) {
      items.push({ id: "summary", label: "Summary", level: 1 });
    }

    // Add sections
    content.sections?.forEach((section, idx) => {
      // Skip summary sections (already in TOC)
      const isSummarySection = section.title.toLowerCase().includes("summary");
      if (isSummarySection) return;

      // Create clean section ID
      const sectionId = `section-${idx}`;
      const cleanTitle = section.title.replace(/- Key Insight/gi, "").trim();
      items.push({ id: sectionId, label: cleanTitle, level: 1 });
    });

    // Add Key Insights if present
    if (content.keyInsights && content.keyInsights.length > 0) {
      items.push({ id: "key-insights", label: "Key Insights", level: 1 });
    }

    // Add Download PDF link
    items.push({ id: "download-pdf", label: "Download PDF", level: 1 });

    return items;
  };

  const tocItems = getTocItems();

  // Set up intersection observer to highlight active section
  useEffect(() => {
    if (!content || tocItems.length === 0) {
      setIsVisible(false);
      return;
    }

    // Show TOC when content is loaded (only on desktop/large screens)
    setIsVisible(true);

    // Create intersection observer
    const observerOptions = {
      root: null,
      rootMargin: "-100px 0px -66% 0px", // Trigger when section is 100px from top
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe all sections
    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [content, tocItems.length]);

  // Smooth scroll to section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Account for sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(id);
    } else if (id === "download-pdf") {
      // If download-pdf element not found, scroll to top of page where download button is
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!isVisible || tocItems.length === 0) return null;

  return (
    <div className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 z-30 w-64 pointer-events-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-purple-200 shadow-lg p-4 max-h-[70vh] overflow-y-auto">
        <h3 className="text-sm font-bold text-purple-900 mb-3 sticky top-0 bg-white/95 pb-2 border-b border-purple-100">
          📑 Table of Contents
        </h3>
        <nav className="space-y-1">
          {tocItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`block w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors ${
                activeSection === item.id
                  ? "bg-purple-100 text-purple-900 font-semibold"
                  : "text-slate-600 hover:bg-purple-50 hover:text-purple-700"
              }`}
              style={{ paddingLeft: `${item.level * 8 + 8}px` }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

