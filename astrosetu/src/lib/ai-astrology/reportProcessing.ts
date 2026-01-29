import type { ReportType } from "@/lib/ai-astrology/types";

const MIN_STALE_PROCESSING_MS = 10 * 60 * 1000;

function getMaxProcessingMs(reportType: ReportType): number {
  switch (reportType) {
    case "life-summary":
      return 2 * 60 * 1000;
    case "year-analysis":
      return 4 * 60 * 1000;
    case "full-life":
    case "major-life-phase":
      return 6 * 60 * 1000;
    default:
      return 4 * 60 * 1000;
  }
}

function parseIsoToMs(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : null;
}

function getProcessingTimeoutMs(reportType: ReportType): number {
  return Math.max(getMaxProcessingMs(reportType), MIN_STALE_PROCESSING_MS);
}

export function isProcessingStale(params: { updatedAtIso?: string | null; reportType?: ReportType }): boolean {
  const updatedMs = parseIsoToMs(params.updatedAtIso);
  if (!updatedMs || !params.reportType) return false;
  return Date.now() - updatedMs > getProcessingTimeoutMs(params.reportType);
}

