/**
 * Date Helpers for AI Astrology Reports
 * Provides intelligent date calculations for different report types
 */

/**
 * Get date context for reports
 * Returns current date, year, and intelligent date ranges
 */
export function getDateContext() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentDate = now.getDate();

  return {
    currentDate: now,
    currentYear,
    currentMonth,
    currentDay: currentDate,
    // ISO date string for easy use
    isoDate: now.toISOString().split('T')[0], // YYYY-MM-DD
  };
}

/**
 * Get Year Analysis date range (next 12 months from current date)
 * Example: If today is Jan 15, 2026 → covers Jan 2026 - Dec 2026
 */
export function getYearAnalysisDateRange(): {
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  description: string; // "January 2026 - December 2026"
} {
  const now = new Date();
  const startYear = now.getFullYear();
  const startMonth = now.getMonth() + 1; // 1-12
  
  // Calculate end date (12 months from now)
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + 12);
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth() + 1; // 1-12
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const startDateStr = `${startYear}-${String(startMonth).padStart(2, '0')}-01`;
  const endDateStr = `${endYear}-${String(endMonth).padStart(2, '0')}-${new Date(endYear, endMonth, 0).getDate()}`;
  
  const description = `${monthNames[startMonth - 1]} ${startYear} - ${monthNames[endMonth - 1]} ${endYear}`;
  
  return {
    startYear,
    startMonth,
    endYear,
    endMonth,
    startDate: startDateStr,
    endDate: endDateStr,
    description,
  };
}

/**
 * Get marriage timing windows (relative to current date)
 * Returns primary and secondary windows in next 2-3 years
 */
export function getMarriageTimingWindows(): {
  primaryWindowStart: number; // Year
  primaryWindowEnd: number;
  secondaryWindowStart: number;
  secondaryWindowEnd: number;
  primaryDescription: string; // "Late 2026 – Early 2027"
  secondaryDescription: string; // "Mid 2028 – Early 2029"
  timelineStart: number;
  timelineEnd: number;
} {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  // Primary window: 6-18 months from now
  const primaryStartYear = currentYear;
  const primaryStartMonth = currentMonth;
  let primaryEndYear = currentYear;
  let primaryEndMonth = currentMonth + 18;
  
  // Adjust if end month exceeds 12
  while (primaryEndMonth > 12) {
    primaryEndMonth -= 12;
    primaryEndYear += 1;
  }
  
  // Secondary window: 2-3 years from now
  const secondaryStartYear = currentYear + 2;
  const secondaryEndYear = currentYear + 3;
  
  const primaryDesc = currentMonth >= 7 
    ? `Late ${currentYear} – Early ${currentYear + 1}`
    : `Mid ${currentYear} – Early ${currentYear + 1}`;
    
  const secondaryDesc = `Mid ${secondaryStartYear} – Early ${secondaryEndYear}`;
  
  return {
    primaryWindowStart: primaryStartYear,
    primaryWindowEnd: primaryEndYear,
    secondaryWindowStart: secondaryStartYear,
    secondaryWindowEnd: secondaryEndYear,
    primaryDescription: primaryDesc,
    secondaryDescription: secondaryDesc,
    timelineStart: currentYear - 1,
    timelineEnd: currentYear + 3,
  };
}

/**
 * Get career timing windows (relative to current date)
 */
export function getCareerTimingWindows(): {
  next12to18Months: { startYear: number; endYear: number; description: string };
  following2to3Years: { startYear: number; endYear: number; description: string };
  longTerm: { startYear: number; endYear: number; description: string };
  timelineStart: number;
  timelineEnd: number;
} {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  return {
    next12to18Months: {
      startYear: currentYear,
      endYear: currentYear + 1,
      description: `${currentYear}–${currentYear + 1}`,
    },
    following2to3Years: {
      startYear: currentYear + 1,
      endYear: currentYear + 3,
      description: `${currentYear + 1}–${currentYear + 3}`,
    },
    longTerm: {
      startYear: currentYear + 3,
      endYear: currentYear + 5,
      description: `${currentYear + 3}–${currentYear + 5}`,
    },
    timelineStart: currentYear - 1,
    timelineEnd: currentYear + 5,
  };
}

/**
 * Get major life phase windows (3-5 year outlook)
 */
export function getMajorLifePhaseWindows(): {
  startYear: number;
  endYear: number;
  description: string; // "2026-2030"
  yearByYear: number[]; // [2026, 2027, 2028, 2029, 2030]
} {
  const now = new Date();
  const currentYear = now.getFullYear();
  const startYear = currentYear;
  const endYear = currentYear + 4; // 5-year window
  
  const yearByYear: number[] = [];
  for (let year = startYear; year <= endYear; year++) {
    yearByYear.push(year);
  }
  
  return {
    startYear,
    endYear,
    description: `${startYear}–${endYear}`,
    yearByYear,
  };
}

/**
 * Get quarters for current year analysis
 */
export function getQuarters(): {
  q1: { name: string; months: string; description: string };
  q2: { name: string; months: string; description: string };
  q3: { name: string; months: string; description: string };
  q4: { name: string; months: string; description: string };
} {
  return {
    q1: {
      name: 'Q1',
      months: 'Jan–Mar',
      description: 'Q1: January–March',
    },
    q2: {
      name: 'Q2',
      months: 'Apr–Jun',
      description: 'Q2: April–June',
    },
    q3: {
      name: 'Q3',
      months: 'Jul–Sep',
      description: 'Q3: July–September',
    },
    q4: {
      name: 'Q4',
      months: 'Oct–Dec',
      description: 'Q4: October–December',
    },
  };
}

/**
 * Format date range description for prompts
 */
export function formatDateRange(startYear: number, endYear: number, startMonth?: number, endMonth?: number): string {
  if (startYear === endYear && startMonth && endMonth) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[startMonth - 1]} ${startYear} – ${monthNames[endMonth - 1]} ${endYear}`;
  }
  if (startYear === endYear) {
    return `${startYear}`;
  }
  return `${startYear}–${endYear}`;
}

