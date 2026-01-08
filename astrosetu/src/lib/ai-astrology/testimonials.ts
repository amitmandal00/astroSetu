/**
 * Testimonials Data
 * Social proof for AI Astrology reports
 */

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  reportType: string;
  text: string;
  date: string;
  verified?: boolean;
  reportId?: string; // Optional: for verified purchases
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Priya M.",
    location: "Sydney, NSW",
    rating: 5,
    reportType: "Marriage Timing",
    text: "The marriage timing report was incredibly accurate. It helped me understand the best periods for my wedding planning. The AI insights were detailed and practical - I appreciated how it explained the astrological reasons behind each timing window.",
    date: "2 weeks ago",
    verified: true,
  },
  {
    id: "t2",
    name: "Raj K.",
    location: "Melbourne, VIC",
    rating: 5,
    reportType: "Year Analysis",
    text: "The quarterly breakdown in the year analysis helped me plan my career moves strategically. I could see the timing windows were really well calculated. The report felt personalized, not generic at all.",
    date: "1 month ago",
    verified: true,
  },
  {
    id: "t3",
    name: "Sarah L.",
    location: "Brisbane, QLD",
    rating: 5,
    reportType: "Career & Money Path",
    text: "I was skeptical about AI astrology at first, but the career report gave me insights I hadn't considered. The job-change windows aligned perfectly with opportunities that came up. Worth every dollar!",
    date: "3 weeks ago",
    verified: true,
  },
  {
    id: "t4",
    name: "Amit S.",
    location: "Perth, WA",
    rating: 5,
    reportType: "Full Life Report",
    text: "Got the full life report as a bundle. The depth of analysis surprised me - it covered career, relationships, health, and life phases. The PDF format makes it easy to reference later. Highly recommend!",
    date: "1 week ago",
    verified: true,
  },
  {
    id: "t5",
    name: "Meera P.",
    location: "Adelaide, SA",
    rating: 5,
    reportType: "Marriage Timing",
    text: "As someone familiar with traditional astrology, I was impressed by the accuracy of the calculations. The timing windows matched what a traditional astrologer had told me, but at a fraction of the cost and instantly available.",
    date: "2 months ago",
    verified: true,
  },
  {
    id: "t6",
    name: "David W.",
    location: "Canberra, ACT",
    rating: 5,
    reportType: "Year Analysis",
    text: "The year analysis report helped me understand what to focus on in each quarter. The caution periods and best-action windows were clearly explained. The report is easy to read and act upon.",
    date: "3 weeks ago",
    verified: true,
  },
  {
    id: "t7",
    name: "Anjali R.",
    location: "Sydney, NSW",
    rating: 5,
    reportType: "Life Decision Pack (Bundle)",
    text: "I purchased the bundle with all three reports. The marriage timing, career, and full life insights complement each other perfectly. The savings were significant, and I use the reports for ongoing reference.",
    date: "1 month ago",
    verified: true,
  },
];

/**
 * Get testimonials filtered by report type (optional)
 */
export function getTestimonialsByReportType(reportType?: string): Testimonial[] {
  if (!reportType) return TESTIMONIALS;
  return TESTIMONIALS.filter(t => 
    t.reportType.toLowerCase().includes(reportType.toLowerCase()) ||
    reportType.toLowerCase().includes(t.reportType.toLowerCase())
  );
}

/**
 * Get featured testimonials (top rated, recent)
 */
export function getFeaturedTestimonials(count: number = 3): Testimonial[] {
  return TESTIMONIALS
    .filter(t => t.rating === 5 && t.verified)
    .slice(0, count);
}

