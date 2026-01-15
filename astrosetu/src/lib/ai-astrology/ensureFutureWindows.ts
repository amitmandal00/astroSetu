/**
 * ensureFutureWindows (server-side)
 *
 * Centralized guardrail to ensure timing predictions/windows never point to the past.
 *
 * This is intentionally conservative:
 * - Structured date windows are shifted forward until they are not in the past.
 * - Timing-related strings have past years (20xx) normalized to >= currentYear.
 * - If we still detect past years in timing surfaces, we replace those timing strings with a safe forward-looking fallback.
 *
 * IMPORTANT:
 * - This should run after parsing LLM output and before saving/rendering.
 * - It should also run when loading stored reports for rendering (to protect old reports).
 */

import type { ReportContent, ReportSection, ReportType, TimeWindow, Transition, Opportunity, DecisionOption, PhaseBreakdown, Period } from "./types";

const DEFAULT_TIMEZONE = "Australia/Melbourne";

type NowContext = {
  now: Date;
  timeZone: string;
  isoDate: string; // YYYY-MM-DD in timeZone
  currentYear: number;
  currentMonthName: string; // "January"
};

function getNowContext(opts?: { now?: Date; timeZone?: string }): NowContext {
  const timeZone = opts?.timeZone || DEFAULT_TIMEZONE;
  const now = opts?.now || new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = Number(parts.find((p) => p.type === "year")?.value || now.getFullYear());
  const month = Number(parts.find((p) => p.type === "month")?.value || now.getMonth() + 1);
  const day = Number(parts.find((p) => p.type === "day")?.value || now.getDate());

  const isoDate = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const monthName = new Intl.DateTimeFormat("en-US", { timeZone, month: "long" }).format(now);

  return {
    now,
    timeZone,
    isoDate,
    currentYear: year,
    currentMonthName: monthName,
  };
}

function parseIsoDateToUTC(dateStr: string): Date | null {
  // Accept YYYY-MM-DD or full ISO. For YYYY-MM-DD, JS parses as UTC midnight.
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addYearsToIsoDate(dateStr: string, years: number): string {
  // Works for YYYY-MM-DD; preserves month/day as much as possible.
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return dateStr;
  const y = Number(m[1]) + years;
  const mo = Number(m[2]);
  const da = Number(m[3]);
  const lastDay = new Date(y, mo, 0).getDate(); // mo is 1-12, Date month is 0-based but using (y, mo, 0) gives last day of mo
  const safeDay = Math.min(da, lastDay);
  return `${String(y).padStart(4, "0")}-${String(mo).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
}

function normalizePastYearsInText(text: string, currentYear: number): string {
  // Normalize any 20xx year that is < currentYear.
  // Also handles ranges like 2024-2028 by shifting both ends forward to preserve duration.
  let out = text;

  // Range first: 2024-2028 / 2024–2028
  out = out.replace(/\b(20\d{2})\s*[–-]\s*(20\d{2})\b/g, (full, a, b) => {
    const start = Number(a);
    const end = Number(b);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return full;
    if (start >= currentYear) return full;
    const delta = currentYear - start;
    return `${start + delta}–${end + delta}`;
  });

  // Single years: 2023
  out = out.replace(/\b(20\d{2})\b/g, (full, y) => {
    const year = Number(y);
    if (!Number.isFinite(year)) return full;
    if (year >= currentYear) return full;
    return String(currentYear);
  });

  return out;
}

function isTimingSectionTitle(title: string): boolean {
  const t = (title || "").toLowerCase();
  return (
    t.includes("timing") ||
    t.includes("window") ||
    t.includes("best period") ||
    t.includes("best timing") ||
    t.includes("recommended timing") ||
    t.includes("when to") ||
    t.includes("periods to avoid") ||
    t.includes("timeframe")
  );
}

function sanitizeTimeWindow(win: TimeWindow, ctx: NowContext): TimeWindow {
  const today = parseIsoDateToUTC(ctx.isoDate);
  if (!today) return win;

  let start = win.startDate ? parseIsoDateToUTC(win.startDate) : null;
  let end = win.endDate ? parseIsoDateToUTC(win.endDate) : null;

  // Normalize timing-related text fields.
  const description = win.description ? normalizePastYearsInText(win.description, ctx.currentYear) : win.description;
  const title = win.title ? normalizePastYearsInText(win.title, ctx.currentYear) : win.title;

  if (!start && !end) {
    return { ...win, title, description };
  }

  // If only one bound exists, use it for shifting checks.
  if (!start && end) start = end;
  if (!end && start) end = start;
  if (!start || !end) return { ...win, title, description };

  // Shift whole window forward by +1 year until it is not fully in the past.
  while (end.getTime() < today.getTime()) {
    if (win.startDate) win.startDate = addYearsToIsoDate(win.startDate, 1);
    if (win.endDate) win.endDate = addYearsToIsoDate(win.endDate, 1);
    start = win.startDate ? parseIsoDateToUTC(win.startDate) : start;
    end = win.endDate ? parseIsoDateToUTC(win.endDate) : end;
    if (!start || !end) break;
  }

  // If it overlaps today, clamp start forward.
  if (start && start.getTime() < today.getTime() && end && end.getTime() >= today.getTime() && win.startDate) {
    win.startDate = ctx.isoDate;
  }

  return { ...win, title, description };
}

function sanitizeSection(section: ReportSection, ctx: NowContext): ReportSection {
  const title = section.title;
  const shouldSanitize = isTimingSectionTitle(title);

  const content = shouldSanitize ? normalizePastYearsInText(section.content || "", ctx.currentYear) : section.content;
  const bullets = shouldSanitize && section.bullets
    ? section.bullets.map((b) => normalizePastYearsInText(b, ctx.currentYear))
    : section.bullets;

  const subsections = section.subsections?.map((s) => sanitizeSection(s, ctx));
  return { ...section, content, bullets, subsections };
}

function sanitizeTimeframeLike(obj: { timeframe?: string } | null | undefined, ctx: NowContext) {
  if (!obj || !obj.timeframe) return obj;
  return { ...obj, timeframe: normalizePastYearsInText(obj.timeframe, ctx.currentYear) };
}

function sanitizePhaseYearLabel(yearLabel: string, ctx: NowContext): string {
  // Example: "Year 1 (2024)" → "Year 1 (2026)"
  return normalizePastYearsInText(yearLabel, ctx.currentYear);
}

function containsPast20xx(text: string, currentYear: number): boolean {
  const years = text.match(/\b20\d{2}\b/g) || [];
  return years.some((y) => Number(y) < currentYear);
}

function hasPastYearsInTimingSurfaces(content: ReportContent, ctx: NowContext): boolean {
  const timingTexts: string[] = [];

  if (content.recommendedTiming) timingTexts.push(content.recommendedTiming);
  if (content.timeWindows) {
    for (const w of content.timeWindows) {
      if (w.title) timingTexts.push(w.title);
      if (w.description) timingTexts.push(w.description);
      if (w.startDate) timingTexts.push(w.startDate);
      if (w.endDate) timingTexts.push(w.endDate);
    }
  }

  for (const sec of content.sections || []) {
    if (isTimingSectionTitle(sec.title)) {
      timingTexts.push(sec.content || "");
      (sec.bullets || []).forEach((b) => timingTexts.push(b));
    }
  }

  // Major life phase labels & timeframes
  (content.phaseBreakdown || []).forEach((p) => timingTexts.push(p.year));
  (content.majorTransitions || []).forEach((t) => timingTexts.push(t.timeframe));
  (content.longTermOpportunities || []).forEach((o) => timingTexts.push(o.timeframe));
  (content.decisionOptions || []).forEach((d) => d.timeframe && timingTexts.push(d.timeframe));

  return timingTexts.some((t) => containsPast20xx(t, ctx.currentYear));
}

export function ensureFutureWindows(
  reportType: ReportType,
  content: ReportContent,
  opts?: { now?: Date; timeZone?: string }
): ReportContent {
  const ctx = getNowContext(opts);

  const nextTimingFallback = `Timing windows start from ${ctx.currentMonthName} ${ctx.currentYear} onward.`;

  // Clone and sanitize.
  const sanitized: ReportContent = {
    ...content,
    // Normalize top-level timing-ish strings
    summary: content.summary ? normalizePastYearsInText(content.summary, ctx.currentYear) : content.summary,
    yearTheme: content.yearTheme ? normalizePastYearsInText(content.yearTheme, ctx.currentYear) : content.yearTheme,
    phaseTheme: content.phaseTheme ? normalizePastYearsInText(content.phaseTheme, ctx.currentYear) : content.phaseTheme,
    phaseYears: content.phaseYears ? normalizePastYearsInText(content.phaseYears, ctx.currentYear) : content.phaseYears,
    recommendedTiming: content.recommendedTiming
      ? normalizePastYearsInText(content.recommendedTiming, ctx.currentYear)
      : content.recommendedTiming,

    // Sections (timing sections only)
    sections: (content.sections || []).map((s) => sanitizeSection(s, ctx)),

    // Structured windows
    timeWindows: content.timeWindows ? content.timeWindows.map((w) => sanitizeTimeWindow({ ...w }, ctx)) : content.timeWindows,

    // Major Life Phase & Opportunity fields
    phaseBreakdown: content.phaseBreakdown
      ? content.phaseBreakdown.map((p: PhaseBreakdown) => ({ ...p, year: sanitizePhaseYearLabel(p.year, ctx) }))
      : content.phaseBreakdown,
    majorTransitions: content.majorTransitions
      ? content.majorTransitions.map((t: Transition) => sanitizeTimeframeLike(t, ctx) as Transition)
      : content.majorTransitions,
    longTermOpportunities: content.longTermOpportunities
      ? content.longTermOpportunities.map((o: Opportunity) => sanitizeTimeframeLike(o, ctx) as Opportunity)
      : content.longTermOpportunities,

    // Decision support
    decisionOptions: content.decisionOptions
      ? content.decisionOptions.map((d: DecisionOption) => sanitizeTimeframeLike(d, ctx) as DecisionOption)
      : content.decisionOptions,

    // Year analysis periods (description may contain years)
    bestPeriods: content.bestPeriods
      ? content.bestPeriods.map((p: Period) => ({
          ...p,
          focus: normalizePastYearsInText(p.focus, ctx.currentYear),
          description: normalizePastYearsInText(p.description, ctx.currentYear),
        }))
      : content.bestPeriods,
    cautionPeriods: content.cautionPeriods
      ? content.cautionPeriods.map((p: Period) => ({
          ...p,
          focus: normalizePastYearsInText(p.focus, ctx.currentYear),
          description: normalizePastYearsInText(p.description, ctx.currentYear),
        }))
      : content.cautionPeriods,
  };

  // Final guardrail: if timing surfaces still contain past years, replace with safe forward-only fallback.
  if (hasPastYearsInTimingSurfaces(sanitized, ctx)) {
    return {
      ...sanitized,
      recommendedTiming: reportType === "decision-support" ? nextTimingFallback : sanitized.recommendedTiming,
      sections: (sanitized.sections || []).map((s) => {
        if (!isTimingSectionTitle(s.title)) return s;
        return {
          ...s,
          content: nextTimingFallback,
          bullets: undefined,
        };
      }),
      timeWindows: sanitized.timeWindows
        ? sanitized.timeWindows.map((w) => ({
            ...w,
            description: nextTimingFallback,
            startDate: w.startDate && parseIsoDateToUTC(w.startDate) && parseIsoDateToUTC(w.startDate)!.getTime() < parseIsoDateToUTC(ctx.isoDate)!.getTime()
              ? ctx.isoDate
              : w.startDate,
          }))
        : sanitized.timeWindows,
      phaseYears: sanitized.phaseYears ? normalizePastYearsInText(sanitized.phaseYears, ctx.currentYear) : sanitized.phaseYears,
    };
  }

  return sanitized;
}


