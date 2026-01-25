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
  // Optional field used for decision-support (stored/persisted for async processing)
  decisionContext?: string;
};

export type ReportType = "life-summary" | "marriage-timing" | "career-money" | "full-life" | "year-analysis" | "major-life-phase" | "decision-support" | "daily-guidance";

/**
 * Explicit generation result states (ChatGPT Payment Safety Recommendation)
 * Used to classify failures and determine retry vs cancel behavior
 */
export type GenerationResultState = "SUCCESS" | "RETRYABLE_FAILURE" | "FATAL_FAILURE";

export type GenerationResult = {
  state: GenerationResultState;
  error?: string;
  errorCode?: string;
  canRetry?: boolean; // Explicit flag for retry eligibility
  retryCount?: number; // Current retry attempt number
  maxRetries?: number; // Maximum retries allowed
};

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
  quality?: "HIGH" | "MEDIUM" | "LOW"; // CRITICAL FIX (ChatGPT Feedback): Quality marker for delivered reports
  // Year Analysis specific fields
  yearTheme?: string;
  quarterlyBreakdown?: QuarterlyBreakdown[];
  bestPeriods?: Period[];
  cautionPeriods?: Period[];
  focusAreasByMonth?: MonthlyFocus[];
  yearScorecard?: Scorecard;
  confidenceLevel?: number; // 1-10
  // Major Life Phase specific fields
  phaseTheme?: string;
  phaseYears?: string; // e.g., "2024-2028"
  phaseBreakdown?: PhaseBreakdown[];
  majorTransitions?: Transition[];
  longTermOpportunities?: Opportunity[];
  // Decision Support specific fields
  decisionContext?: string;
  decisionOptions?: DecisionOption[];
  recommendedTiming?: string;
  factorsToConsider?: string[];
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

export type PhaseBreakdown = {
  year: string; // e.g., "Year 1 (2024)", "Year 2 (2025)"
  theme: string;
  focusAreas: string[];
  majorInfluences: string;
};

export type Transition = {
  type: "career" | "relationships" | "finances" | "health" | "education" | "other";
  timeframe: string; // e.g., "2025-2026"
  description: string;
  preparation?: string[];
};

export type Opportunity = {
  category: string;
  timeframe: string;
  description: string;
  actionItems?: string[];
};

export type DecisionOption = {
  option: string;
  astrologicalAlignment: "high" | "medium" | "low";
  timeframe?: string;
  considerations?: string[];
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
  todayGoodFor: string[]; // Deprecated - kept for backward compatibility
  avoidToday: string[]; // Deprecated - kept for backward compatibility
  actions: string[]; // Deprecated - kept for backward compatibility
  planetaryInfluence: string; // Deprecated - kept for backward compatibility
  guidance: string; // Monthly theme (2-3 lines summary + 1 short paragraph)
  // Enhanced structure for monthly outlook
  focusAreas?: {
    mindset: string; // 1-2 sentences
    work: string; // 1-2 sentences
    relationships: string; // 1-2 sentences
    energy: string; // 1-2 sentences
  };
  helpfulThisMonth?: string[]; // Array of "Do" items (1-2 sentences each)
  beMindfulOf?: string[]; // Array of "Avoid" items (1-2 sentences each)
  reflectionPrompt?: string; // 1 question for reflection
};

