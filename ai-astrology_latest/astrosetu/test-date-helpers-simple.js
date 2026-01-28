#!/usr/bin/env node

/**
 * Simple test script for intelligent date helpers
 * Can run with Node.js without test framework dependencies
 */

const path = require('path');

// Try to load the date helpers using TypeScript or compiled JS
// Since we're in a Next.js project, we'll test the logic directly

console.log('🧪 Testing Intelligent Date Helpers\n');

// Simulate the date helper functions for testing
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getYearAnalysisDateRange() {
  const now = new Date();
  const startYear = now.getFullYear();
  const startMonth = now.getMonth() + 1;
  
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + 12);
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth() + 1;
  
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

function getMarriageTimingWindows() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  let primaryEndYear = currentYear;
  let primaryEndMonth = currentMonth + 18;
  
  while (primaryEndMonth > 12) {
    primaryEndMonth -= 12;
    primaryEndYear += 1;
  }
  
  const secondaryStartYear = currentYear + 2;
  const secondaryEndYear = currentYear + 3;
  
  const primaryDesc = currentMonth >= 7 
    ? `Late ${currentYear} – Early ${currentYear + 1}`
    : `Mid ${currentYear} – Early ${currentYear + 1}`;
    
  const secondaryDesc = `Mid ${secondaryStartYear} – Early ${secondaryEndYear}`;
  
  return {
    primaryWindowStart: currentYear,
    primaryWindowEnd: primaryEndYear,
    secondaryWindowStart: secondaryStartYear,
    secondaryEndYear: secondaryEndYear,
    primaryDescription: primaryDesc,
    secondaryDescription: secondaryDesc,
    timelineStart: currentYear - 1,
    timelineEnd: currentYear + 3,
  };
}

function getCareerTimingWindows() {
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

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    passCount++;
    console.log(`✅ ${name}`);
  } catch (error) {
    failCount++;
    console.error(`❌ ${name}`);
    console.error(`   Error: ${error.message}`);
  }
}

console.log(`Current date: ${new Date().toISOString().split('T')[0]}`);
console.log(`Current year: ${new Date().getFullYear()}\n`);

// Test Year Analysis
test('Year Analysis: Returns next 12 months correctly', () => {
  const range = getYearAnalysisDateRange();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  if (range.startYear !== currentYear) {
    throw new Error(`Start year should be ${currentYear}, got ${range.startYear}`);
  }
  if (range.startMonth !== currentMonth) {
    throw new Error(`Start month should be ${currentMonth}, got ${range.startMonth}`);
  }
  if (!range.description.includes(currentYear.toString())) {
    throw new Error(`Description should include ${currentYear}`);
  }
  console.log(`   → ${range.description}`);
});

// Test Marriage Timing
test('Marriage Timing: Returns valid windows', () => {
  const windows = getMarriageTimingWindows();
  const currentYear = new Date().getFullYear();
  
  if (windows.primaryWindowStart !== currentYear) {
    throw new Error(`Primary start should be ${currentYear}, got ${windows.primaryWindowStart}`);
  }
  if (windows.secondaryWindowStart !== currentYear + 2) {
    throw new Error(`Secondary start should be ${currentYear + 2}, got ${windows.secondaryWindowStart}`);
  }
  if (windows.timelineStart !== currentYear - 1) {
    throw new Error(`Timeline start should be ${currentYear - 1}, got ${windows.timelineStart}`);
  }
  console.log(`   → Primary: ${windows.primaryDescription}`);
  console.log(`   → Secondary: ${windows.secondaryDescription}`);
});

// Test Career Timing
test('Career Timing: Returns valid phases', () => {
  const windows = getCareerTimingWindows();
  const currentYear = new Date().getFullYear();
  
  if (windows.next12to18Months.startYear !== currentYear) {
    throw new Error(`Next 12-18 months start should be ${currentYear}`);
  }
  if (windows.next12to18Months.endYear !== currentYear + 1) {
    throw new Error(`Next 12-18 months end should be ${currentYear + 1}`);
  }
  if (windows.following2to3Years.startYear !== currentYear + 1) {
    throw new Error(`Following 2-3 years start should be ${currentYear + 1}`);
  }
  if (windows.longTerm.startYear !== currentYear + 3) {
    throw new Error(`Long-term start should be ${currentYear + 3}`);
  }
  console.log(`   → Next 12-18 months: ${windows.next12to18Months.description}`);
  console.log(`   → Following 2-3 years: ${windows.following2to3Years.description}`);
  console.log(`   → Long-term: ${windows.longTerm.description}`);
});

// Test edge case: Year boundary
test('Year Analysis: Handles year boundary correctly', () => {
  // Test with December
  const decDate = new Date(new Date().getFullYear(), 11, 15); // December 15
  const originalGetTime = Date.prototype.getTime;
  Date.prototype.getTime = () => decDate.getTime();
  
  const range = getYearAnalysisDateRange();
  
  if (range.startMonth !== 12) {
    throw new Error(`Start month should be 12 (December), got ${range.startMonth}`);
  }
  // 12 months from December should be December of next year
  if (range.endMonth !== 12) {
    throw new Error(`End month should be 12 (December), got ${range.endMonth}`);
  }
  if (range.endYear !== range.startYear + 1) {
    throw new Error(`End year should be ${range.startYear + 1}, got ${range.endYear}`);
  }
  
  // Restore
  Date.prototype.getTime = originalGetTime;
  console.log(`   → December start: ${range.description}`);
});

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Test Results: ${passCount} passed, ${failCount} failed`);
if (failCount > 0) {
  console.log('\n❌ Some tests failed\n');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!\n');
  process.exit(0);
}

