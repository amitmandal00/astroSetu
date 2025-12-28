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

export type ReportType = "life-summary" | "marriage-timing" | "career-money" | "full-life" | "year-analysis" | "daily-guidance";

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
  executiveSummary?: string; // Executive summary for Full Life Report
  keyInsights?: string[];
  timeWindows?: TimeWindow[];
  recommendations?: Recommendation[];
  reportId?: string; // Unique report ID
  generatedAt?: string; // Timestamp
  // Year Analysis specific fields
  yearTheme?: string;
  quarterlyBreakdown?: QuarterlyBreakdown[];
  bestPeriods?: Period[];
  cautionPeriods?: Period[];
  focusAreasByMonth?: MonthlyFocus[];
  yearScorecard?: Scorecard;
  confidenceLevel?: number; // 1-10
};

export type QuarterlyBreakdown = {
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  focusTheme: string;
  careerMoneyTone: string;
  relationshipFocus: string;
  energyLevel: "low" | "moderate" | "high";
};

export type Period = {
  months: string[];
  focus: string;
  description: string;
};

export type MonthlyFocus = {
  month: string;
  focus: string;
};

export type Scorecard = {
  career: number; // 1-5 stars
  relationships: number;
  money: number;
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

