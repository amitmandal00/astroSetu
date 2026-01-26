import type { ReportType } from "./types";

export const ALL_REPORT_TYPES: ReportType[] = [
  "life-summary",
  "marriage-timing",
  "career-money",
  "full-life",
  "year-analysis",
  "major-life-phase",
  "decision-support",
];

export const DISABLED_REPORT_TYPES = new Set<ReportType>([
]);

export const AVAILABLE_REPORT_TYPES = ALL_REPORT_TYPES.filter(
  (type) => !DISABLED_REPORT_TYPES.has(type)
);

export function isReportTypeEnabled(type: ReportType): boolean {
  return !DISABLED_REPORT_TYPES.has(type);
}

