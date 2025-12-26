/**
 * Types for AI Astrology Platform
 */

export type AIAstrologyInput = {
  name: string;
  dob: string; // YYYY-MM-DD
  tob: string; // HH:MM
  place: string;
  gender?: "Male" | "Female";
  latitude?: number;
  longitude?: number;
  timezone?: string;
};

export type ReportType = "life-summary" | "marriage-timing" | "career-money" | "full-life" | "daily-guidance";

export type AIReport = {
  id: string;
  userId?: string;
  reportType: ReportType;
  input: AIAstrologyInput;
  generatedAt: string;
  content: ReportContent;
  isPaid: boolean;
  paymentId?: string;
};

export type ReportContent = {
  title: string;
  sections: ReportSection[];
  summary?: string;
  keyInsights?: string[];
  timeWindows?: TimeWindow[];
  recommendations?: Recommendation[];
};

export type ReportSection = {
  title: string;
  content: string;
  bullets?: string[];
  subsections?: ReportSection[];
};

export type TimeWindow = {
  title: string;
  startDate?: string;
  endDate?: string;
  description: string;
  actions?: string[];
  avoidActions?: string[];
};

export type Recommendation = {
  category: string;
  items: string[];
  priority?: "High" | "Medium" | "Low";
};

export type SubscriptionTier = "free" | "premium";

export type Subscription = {
  userId: string;
  tier: SubscriptionTier;
  status: "active" | "cancelled" | "expired";
  startDate: string;
  endDate?: string;
  stripeSubscriptionId?: string;
};

export type DailyGuidance = {
  date: string;
  input: AIAstrologyInput;
  todayGoodFor: string[];
  avoidToday: string[];
  actions: string[];
  planetaryInfluence: string;
  guidance: string;
};

