#!/usr/bin/env node

/**
 * Test script for intelligent date helpers
 * Verifies that all date window calculations work correctly
 */

// Mock Date for consistent testing
const originalDate = Date;

// Simulate current date as January 15, 2026 for testing
const mockDate = new Date('2026-01-15T12:00:00Z');
global.Date = jest.fn(() => mockDate);
global.Date.now = jest.fn(() => mockDate.getTime());
global.Date.parse = originalDate.parse;

// Import the date helpers
const { 
  getDateContext,
  getYearAnalysisDateRange,
  getMarriageTimingWindows,
  getCareerTimingWindows,
  getMajorLifePhaseWindows,
  getQuarters,
  formatDateRange
} = require('./src/lib/ai-astrology/dateHelpers');

let testCount = 0;
let passCount = 0;
let failCount = 0;

function test(name, fn) {
  testCount++;
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

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      message || 
      `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

console.log('🧪 Testing Intelligent Date Helpers\n');
console.log('Current test date: January 15, 2026\n');

// Test 1: Date Context
test('getDateContext returns correct current date info', () => {
  const context = getDateContext();
  assert(context.currentYear === 2026, 'Current year should be 2026');
  assert(context.currentMonth === 1, 'Current month should be 1 (January)');
  assert(context.isoDate === '2026-01-15', 'ISO date should match');
});

// Test 2: Year Analysis Date Range
test('getYearAnalysisDateRange returns next 12 months correctly', () => {
  const range = getYearAnalysisDateRange();
  
  assert(range.startYear === 2026, 'Start year should be 2026');
  assert(range.startMonth === 1, 'Start month should be January (1)');
  assert(range.endYear === 2027, 'End year should be 2027');
  assert(range.endMonth === 1, 'End month should be January (1) - 12 months from start');
  assert(
    range.description === 'January 2026 - January 2027',
    `Description should be 'January 2026 - January 2027', got '${range.description}'`
  );
  assert(range.startDate === '2026-01-01', 'Start date should be 2026-01-01');
});

// Test 3: Marriage Timing Windows
test('getMarriageTimingWindows returns correct primary and secondary windows', () => {
  const windows = getMarriageTimingWindows();
  
  assert(windows.primaryWindowStart === 2026, 'Primary window start year should be 2026');
  assert(windows.primaryWindowEnd >= 2026, 'Primary window end year should be 2026 or 2027');
  assert(windows.secondaryWindowStart === 2028, 'Secondary window start year should be 2028');
  assert(windows.secondaryWindowEnd === 2029, 'Secondary window end year should be 2029');
  assert(
    windows.primaryDescription.includes('2026') || windows.primaryDescription.includes('2027'),
    'Primary description should include 2026 or 2027'
  );
  assert(
    windows.secondaryDescription.includes('2028') && windows.secondaryDescription.includes('2029'),
    'Secondary description should include 2028 and 2029'
  );
  assert(windows.timelineStart === 2025, 'Timeline start should be 2025');
  assert(windows.timelineEnd === 2029, 'Timeline end should be 2029');
});

// Test 4: Career Timing Windows
test('getCareerTimingWindows returns correct career phases', () => {
  const windows = getCareerTimingWindows();
  
  assert(windows.next12to18Months.startYear === 2026, 'Next 12-18 months start should be 2026');
  assert(windows.next12to18Months.endYear === 2027, 'Next 12-18 months end should be 2027');
  assert(windows.next12to18Months.description === '2026–2027', 'Description should be 2026–2027');
  
  assert(windows.following2to3Years.startYear === 2027, 'Following 2-3 years start should be 2027');
  assert(windows.following2to3Years.endYear === 2029, 'Following 2-3 years end should be 2029');
  assert(windows.following2to3Years.description === '2027–2029', 'Description should be 2027–2029');
  
  assert(windows.longTerm.startYear === 2029, 'Long-term start should be 2029');
  assert(windows.longTerm.endYear === 2031, 'Long-term end should be 2031');
  assert(windows.longTerm.description === '2029–2031', 'Description should be 2029–2031');
  
  assert(windows.timelineStart === 2025, 'Timeline start should be 2025');
  assert(windows.timelineEnd === 2031, 'Timeline end should be 2031');
});

// Test 5: Major Life Phase Windows
test('getMajorLifePhaseWindows returns 5-year window correctly', () => {
  const windows = getMajorLifePhaseWindows();
  
  assert(windows.startYear === 2026, 'Start year should be 2026');
  assert(windows.endYear === 2030, 'End year should be 2030 (5-year window)');
  assert(windows.description === '2026–2030', 'Description should be 2026–2030');
  assert(windows.yearByYear.length === 5, 'Should have 5 years');
  assertEqual(windows.yearByYear, [2026, 2027, 2028, 2029, 2030], 'Year array should match');
});

// Test 6: Quarters
test('getQuarters returns correct quarter information', () => {
  const quarters = getQuarters();
  
  assert(quarters.q1.name === 'Q1', 'Q1 name should be Q1');
  assert(quarters.q1.months === 'Jan–Mar', 'Q1 months should be Jan–Mar');
  assert(quarters.q2.name === 'Q2', 'Q2 name should be Q2');
  assert(quarters.q2.months === 'Apr–Jun', 'Q2 months should be Apr–Jun');
  assert(quarters.q3.name === 'Q3', 'Q3 name should be Q3');
  assert(quarters.q3.months === 'Jul–Sep', 'Q3 months should be Jul–Sep');
  assert(quarters.q4.name === 'Q4', 'Q4 name should be Q4');
  assert(quarters.q4.months === 'Oct–Dec', 'Q4 months should be Oct–Dec');
});

// Test 7: Format Date Range
test('formatDateRange formats date ranges correctly', () => {
  assert(formatDateRange(2026, 2027) === '2026–2027', 'Simple year range');
  assert(formatDateRange(2026, 2026, 1, 12) === 'Jan 2026 – Dec 2026', 'Same year with months');
  assert(formatDateRange(2026, 2026) === '2026', 'Same year');
});

// Test 8: Edge case - Year boundary (December 2026)
test('Year Analysis handles December correctly', () => {
  // Reset mock to December 2026
  const decDate = new Date('2026-12-15T12:00:00Z');
  global.Date = jest.fn(() => decDate);
  global.Date.now = jest.fn(() => decDate.getTime());
  
  // Re-import to get fresh date
  delete require.cache[require.resolve('./src/lib/ai-astrology/dateHelpers')];
  const { getYearAnalysisDateRange: getRangeDec } = require('./src/lib/ai-astrology/dateHelpers');
  const range = getRangeDec();
  
  assert(range.startYear === 2026, 'Start year should be 2026');
  assert(range.startMonth === 12, 'Start month should be December (12)');
  assert(range.endYear === 2027, 'End year should be 2027');
  assert(range.endMonth === 12, 'End month should be December (12) - 12 months later');
  
  // Restore original mock
  global.Date = jest.fn(() => mockDate);
  global.Date.now = jest.fn(() => mockDate.getTime());
});

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Test Results: ${passCount}/${testCount} passed`);
if (failCount > 0) {
  console.log(`❌ ${failCount} test(s) failed\n`);
  process.exit(1);
} else {
  console.log(`✅ All tests passed!\n`);
  process.exit(0);
}

