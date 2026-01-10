# Report Generation Time Breakdown

**Last Updated:** 2026-01-10  
**Based on:** Code analysis and configured timeouts

## Overview

This document provides a comprehensive breakdown of average time taken for report generation across different phases and report types.

---

## Report Generation Phases

All reports go through these phases:

1. **Kundli API Call** - Fetching birth chart data from Prokerala API
2. **Dosha Analysis** (optional) - Fetching dosha analysis for specific reports
3. **Prompt Generation** - Creating AI prompt with astrological data
4. **AI Content Generation** - OpenAI API call to generate report content
5. **Response Parsing** - Parsing and structuring the AI response

---

## Time Breakdown by Report Type

### 1. Free Life Summary Report
**Total Expected Time:** ~15-30 seconds  
**Server Timeout:** 65 seconds  
**Client Timeout:** 70 seconds

| Phase | Average Time | Range |
|-------|-------------|-------|
| Kundli API Call | 2-5 seconds | 1-8 seconds |
| Prompt Generation | < 1 second | < 1 second |
| AI Content Generation | 10-20 seconds | 8-25 seconds |
| Response Parsing | < 1 second | < 1 second |
| **Total** | **15-30 seconds** | **12-35 seconds** |

**Notes:**
- Uses 1000 max tokens (optimized for speed)
- No dosha analysis required
- Fastest report type

---

### 2. Marriage Timing Report
**Total Expected Time:** ~20-40 seconds  
**Server Timeout:** 60 seconds  
**Client Timeout:** 65 seconds

| Phase | Average Time | Range |
|-------|-------------|-------|
| Kundli API Call | 2-5 seconds | 1-8 seconds |
| Dosha Analysis | 3-7 seconds | 2-10 seconds |
| Prompt Generation | < 1 second | < 1 second |
| AI Content Generation | 12-25 seconds | 10-30 seconds |
| Response Parsing | < 1 second | < 1 second |
| **Total** | **20-40 seconds** | **15-50 seconds** |

**Notes:**
- Requires dosha analysis for manglik status
- Uses 1800 max tokens
- Includes timing windows calculation

---

### 3. Career & Money Report
**Total Expected Time:** ~18-35 seconds  
**Server Timeout:** 60 seconds  
**Client Timeout:** 65 seconds

| Phase | Average Time | Range |
|-------|-------------|-------|
| Kundli API Call | 2-5 seconds | 1-8 seconds |
| Prompt Generation | < 1 second | < 1 second |
| AI Content Generation | 12-25 seconds | 10-30 seconds |
| Response Parsing | < 1 second | < 1 second |
| **Total** | **18-35 seconds** | **15-40 seconds** |

**Notes:**
- No dosha analysis required
- Uses 1800 max tokens
- Focused on career and financial insights

---

### 4. Year Analysis Report
**Total Expected Time:** ~20-40 seconds  
**Server Timeout:** 60 seconds  
**Client Timeout:** 65 seconds

| Phase | Average Time | Range |
|-------|-------------|-------|
| Kundli API Call | 2-5 seconds | 1-8 seconds |
| Prompt Generation | 1-2 seconds | 1-3 seconds |
| AI Content Generation | 15-30 seconds | 12-35 seconds |
| Response Parsing | < 1 second | < 1 second |
| **Total** | **20-40 seconds** | **18-45 seconds** |

**Notes:**
- Uses dynamic date calculations for future months
- Uses 1800 max tokens
- Includes quarterly breakdown calculations

---

### 5. Full Life Report (Complex)
**Total Expected Time:** ~35-70 seconds  
**Server Timeout:** 90 seconds  
**Client Timeout:** 100 seconds

| Phase | Average Time | Range |
|-------|-------------|-------|
| Kundli API Call | 2-5 seconds | 1-8 seconds |
| Dosha Analysis | 3-7 seconds | 2-10 seconds |
| Prompt Generation | 1-2 seconds | 1-3 seconds |
| AI Content Generation | 25-55 seconds | 20-65 seconds |
| Response Parsing | 1-2 seconds | 1-3 seconds |
| **Total** | **35-70 seconds** | **30-85 seconds** |

**Notes:**
- Most comprehensive report
- Uses 2200 max tokens (complex report)
- Includes dosha analysis
- Longest generation time

---

### 6. 3-5 Year Strategic Life Phase Report (Complex)
**Total Expected Time:** ~35-70 seconds  
**Server Timeout:** 90 seconds  
**Client Timeout:** 100 seconds

| Phase | Average Time | Range |
|-------|-------------|-------|
| Kundli API Call | 2-5 seconds | 1-8 seconds |
| Prompt Generation | 2-3 seconds | 2-4 seconds |
| AI Content Generation | 25-55 seconds | 20-65 seconds |
| Response Parsing | 1-2 seconds | 1-3 seconds |
| **Total** | **35-70 seconds** | **30-85 seconds** |

**Notes:**
- Complex multi-year analysis
- Uses 2200 max tokens
- Dynamic date windows calculation (5-year window)
- Year-by-year breakdown

---

### 7. Decision Support Report
**Total Expected Time:** ~20-40 seconds  
**Server Timeout:** 60 seconds  
**Client Timeout:** 65 seconds

| Phase | Average Time | Range |
|-------|-------------|-------|
| Kundli API Call | 2-5 seconds | 1-8 seconds |
| Prompt Generation | 1-2 seconds | 1-3 seconds |
| AI Content Generation | 12-25 seconds | 10-30 seconds |
| Response Parsing | < 1 second | < 1 second |
| **Total** | **20-40 seconds** | **18-45 seconds** |

**Notes:**
- Uses 1800 max tokens
- Includes decision context analysis
- Timing-based recommendations

---

## Phase-by-Phase Breakdown

### Phase 1: Kundli API Call (Prokerala)
**Average:** 2-5 seconds  
**Range:** 1-8 seconds  
**Affected By:**
- Prokerala API response time
- Network latency
- Server load

**Reports Using:**
- All report types

---

### Phase 2: Dosha Analysis (Prokerala)
**Average:** 3-7 seconds  
**Range:** 2-10 seconds  
**Affected By:**
- Prokerala API response time
- Network latency
- Server load

**Reports Using:**
- Marriage Timing Report
- Full Life Report

---

### Phase 3: Prompt Generation
**Average:** < 1 second  
**Range:** < 1-3 seconds  
**Affected By:**
- Data processing complexity
- Date calculations (for some reports)
- Prompt template size

**Breakdown by Report:**
- Simple reports (Life Summary, Career): < 1 second
- Date-based reports (Year Analysis, Life Phase): 1-2 seconds
- Complex reports (Full Life): 1-2 seconds

---

### Phase 4: AI Content Generation (OpenAI)
**Average:** 12-55 seconds (varies by report type)  
**Range:** 8-65 seconds  
**Affected By:**
- Token count (max_tokens)
- OpenAI API response time
- Prompt complexity
- Network latency
- OpenAI server load

**Breakdown by Token Count:**
- 1000 tokens (Free reports): 10-20 seconds
- 1800 tokens (Regular paid): 12-30 seconds
- 2200 tokens (Complex reports): 25-55 seconds

**Retry Behavior:**
- Max retries: 3
- Retry delays: 3-15 seconds (exponential backoff)
- Rate limit handling: Automatic with retry-after header

---

### Phase 5: Response Parsing
**Average:** < 1 second  
**Range:** < 1-3 seconds  
**Affected By:**
- Response size
- Parsing complexity

---

## Bundle Reports

For bundle reports (2-3 reports), generation happens sequentially:

| Bundle Type | Reports Included | Estimated Total Time |
|-------------|------------------|---------------------|
| Any 2 Reports | 2 selected reports | 40-80 seconds |
| All 3 Reports | 3 reports | 60-120 seconds |
| Life Decision Pack | Marriage + Career + Year Analysis | 60-115 seconds |

**Bundle Generation:**
- Reports generated one after another
- Progress tracked per report
- Timeout: 120 seconds (client-side) for bundles

---

## Timeout Configuration

### Server-Side Timeouts
| Report Type | Timeout | Configuration |
|-------------|---------|---------------|
| Free Reports (life-summary) | 65 seconds | `REPORT_GENERATION_TIMEOUT` |
| Regular Paid Reports | 60 seconds | `REPORT_GENERATION_TIMEOUT` |
| Complex Reports (full-life, major-life-phase) | 90 seconds | `REPORT_GENERATION_TIMEOUT` |

### Client-Side Timeouts
| Report Type | Timeout | Configuration |
|-------------|---------|---------------|
| Free Reports | 70 seconds | `clientTimeout` |
| Regular Paid Reports | 65 seconds | `clientTimeout` |
| Complex Reports | 100 seconds | `clientTimeout` |
| Bundle Reports | 120 seconds | `clientTimeout` |

**Note:** Client timeout is slightly longer than server timeout to avoid premature timeout errors.

---

## Performance Optimization

### Implemented Optimizations:
1. **Token Optimization:**
   - Free reports: 1000 tokens (reduced from 1200)
   - Regular reports: 1800 tokens
   - Complex reports: 2200 tokens (reduced from 2500)

2. **Retry Strategy:**
   - Faster retry waits (3-15 seconds vs 10-50 seconds)
   - Shorter max retry delays
   - Better rate limit handling

3. **Timeout Management:**
   - Optimized timeouts per report type
   - Client-side timeout buffer
   - Graceful timeout handling

4. **Parallel Operations:**
   - Prompt generation during API calls where possible
   - Efficient data extraction

---

## Typical User Experience

### Best Case Scenario:
- Fast network, low API latency
- **Free Report:** ~12-15 seconds
- **Regular Paid:** ~15-20 seconds
- **Complex Report:** ~30-40 seconds

### Average Scenario:
- Normal network, moderate API latency
- **Free Report:** ~20-25 seconds
- **Regular Paid:** ~25-30 seconds
- **Complex Report:** ~50-60 seconds

### Worst Case Scenario:
- Slow network, high API latency, rate limits
- **Free Report:** ~35-50 seconds
- **Regular Paid:** ~40-55 seconds
- **Complex Report:** ~70-85 seconds

---

## Monitoring & Logging

All phases are logged with timestamps:
- `[generateXReport] getKundli completed in Xms`
- `[generateXReport] getDoshaAnalysis completed in Xms` (if applicable)
- `[generateXReport] AI content generated in Xms`
- `[generateXReport] Report generation complete in Xms (Kundli: Xms, Dosha: Xms, AI: Xms)`

**OpenAI Call Tracking:**
- Duration tracked per call
- Retry count tracked
- Token usage tracked
- Success/failure tracked

---

## Recommendations

1. **For Users:**
   - Expect 15-30 seconds for simple reports
   - Expect 35-70 seconds for complex reports
   - Bundle reports take proportionally longer

2. **For Monitoring:**
   - Track average times per report type
   - Alert if times exceed expected ranges
   - Monitor OpenAI API response times

3. **For Optimization:**
   - Continue optimizing token counts
   - Consider caching Kundli results
   - Parallel processing for bundles (future enhancement)

---

*This breakdown is based on code analysis, configured timeouts, and expected performance. Actual times may vary based on network conditions, API response times, and system load.*

