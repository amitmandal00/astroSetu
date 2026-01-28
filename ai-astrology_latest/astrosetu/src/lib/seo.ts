/**
 * SEO Utility Functions
 * Helper functions for generating SEO metadata
 */

import type { Metadata } from "next";

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  url?: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
}

const BASE_URL = "https://www.mindveda.net";
const DEFAULT_IMAGE = `${BASE_URL}/icon-512.png`;

/**
 * Generate comprehensive metadata for a page
 */
export function generateSEOMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    url,
    image = DEFAULT_IMAGE,
    type = "website" as "website" | "article",
    noindex = false,
  } = config;

  const fullTitle = title.includes("|") ? title : `${title} | AstroSetu`;
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;

  return {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    openGraph: {
      type,
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: "AstroSetu",
      images: [
        {
          url: image,
          width: 512,
          height: 512,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: !noindex,
      follow: !noindex,
    },
  };
}

/**
 * Common SEO keywords for astrology-related pages
 */
export const ASTROLOGY_KEYWORDS = [
  "astrology",
  "horoscope",
  "kundli",
  "birth chart",
  "AI astrology",
  "online astrology",
  "astrology predictions",
];

/**
 * Generate keywords for specific report types
 */
export function getReportKeywords(reportType: string): string[] {
  const baseKeywords = [...ASTROLOGY_KEYWORDS];
  
  const reportTypeKeywords: Record<string, string[]> = {
    "marriage-timing": ["marriage timing", "wedding date", "compatibility", "marriage predictions"],
    "career-money": ["career astrology", "job predictions", "financial astrology", "money predictions"],
    "full-life": ["life predictions", "complete horoscope", "full life report"],
    "year-analysis": ["yearly horoscope", "annual predictions", "year forecast"],
    "major-life-phase": ["life phase", "long-term predictions", "strategic planning"],
    "decision-support": ["decision astrology", "guidance", "life decisions"],
  };

  return [
    ...baseKeywords,
    ...(reportTypeKeywords[reportType] || []),
  ];
}

