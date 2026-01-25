import type { ReportSection, ReportType } from "./types";

export type Thresholds = {
  strictMinWords: number;
  degradedMinWords: number;
  minSections: number;
};

const THRESHOLDS: Record<ReportType, Thresholds> = {
  "life-summary": { strictMinWords: 700, degradedMinWords: 400, minSections: 4 },
  "marriage-timing": { strictMinWords: 800, degradedMinWords: 600, minSections: 6 },
  "career-money": { strictMinWords: 800, degradedMinWords: 550, minSections: 6 },
  "full-life": { strictMinWords: 900, degradedMinWords: 650, minSections: 4 },
  "year-analysis": { strictMinWords: 900, degradedMinWords: 650, minSections: 4 },
  "major-life-phase": { strictMinWords: 1000, degradedMinWords: 750, minSections: 6 },
  "decision-support": { strictMinWords: 700, degradedMinWords: 500, minSections: 6 },
  "daily-guidance": { strictMinWords: 400, degradedMinWords: 250, minSections: 3 },
};

export function getThresholds(reportType: ReportType): Thresholds {
  return THRESHOLDS[reportType] || { strictMinWords: 600, degradedMinWords: 350, minSections: 4 };
}

export function countWordsFromText(text: string = ""): number {
  return text
    .replace(/\n/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function countWordsFromSections(sections: ReportSection[] = []): number {
  return sections.reduce((sum, section) => {
    const content = section.content || "";
    const bullets = section.bullets?.join(" ") || "";
    return sum + countWordsFromText(content) + countWordsFromText(bullets);
  }, 0);
}

