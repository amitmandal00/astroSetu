# Report Length Analysis - Career & Money, Major Life Phase, Decision Support

## Issue Summary
Reports for `career-money`, `major-life-phase`, and `decision-support` are appearing too short. They show custom fields (timeWindows, recommendations, phaseBreakdown, etc.) but lack comprehensive standard sections.

## Current State

### What's Working ✅
- Custom fields are rendering correctly:
  - **Career & Money**: Summary, Time Windows, Recommendations
  - **Major Life Phase**: Summary, Phase Breakdown, Major Transitions, Long-term Opportunities
  - **Decision Support**: Summary, Decision Options, Recommended Timing, Factors to Consider

### What's Missing ❌
- **Standard sections** from `content.sections` array are minimal or empty
- Reports rely heavily on custom fields but lack detailed analysis sections
- Other report types (Year Analysis, Marriage Timing) have both custom fields AND comprehensive sections

## Root Cause Analysis

### 1. Report Structure
Reports have two types of content:
- **Custom Fields**: Structured data (timeWindows, recommendations, etc.) - ✅ Showing
- **Standard Sections**: AI-generated detailed analysis sections - ❌ Minimal/Empty

### 2. Parsing Logic
The `parseAIResponse` function in `reportGenerator.ts` creates sections from AI markdown response:
- Parses headers (`#`, numbered lists, etc.)
- Creates sections array
- If AI doesn't generate many sections, reports appear short

### 3. AI Prompt Templates
Prompts in `prompts.ts` use `AI_PROMPT_TEMPLATES["v1.0"]`:
- Need to verify if prompts request enough detailed sections
- May need to enhance prompts to explicitly request 5-8 detailed analysis sections

## Comparison with Other Reports

### Year Analysis Report (Good Example)
- ✅ Custom fields: yearTheme, quarterlyBreakdown, bestPeriods, cautionPeriods
- ✅ Standard sections: Year Overview, Monthly Highlights, Planetary Influences, etc.
- **Result**: Comprehensive, detailed report

### Career & Money Report (Current Issue)
- ✅ Custom fields: timeWindows, recommendations
- ❌ Standard sections: Minimal or missing
- **Result**: Appears short despite custom fields

## Recommended Solutions

### Option 1: Enhance AI Prompts (Recommended)
**Action**: Update prompt templates to explicitly request 5-8 detailed sections:
- Career Momentum Analysis
- Financial Growth Patterns
- Best Career Directions
- Money Management Guidance
- Strategic Timing Insights
- Planetary Influences on Career
- Long-term Financial Planning
- Action Items & Next Steps

**Files to modify**:
- `src/lib/ai-astrology/prompts.ts` - Check `AI_PROMPT_TEMPLATES["v1.0"].careerMoney`
- Similar updates for `majorLifePhase` and `decisionSupport`

### Option 2: Add Fallback Sections
**Action**: If AI generates < 3 sections, add default sections with guidance:
- "Detailed Analysis" section
- "Planetary Influences" section
- "Action Items" section

**Files to modify**:
- `src/lib/ai-astrology/reportGenerator.ts` - `parseAIResponse` function

### Option 3: Hybrid Approach (Best)
1. **Enhance prompts** to request more sections
2. **Add validation** to ensure minimum 4-5 sections
3. **Add fallback** if sections are still minimal

## Next Steps

1. **Review AI Prompt Templates**:
   - Check `AI_PROMPT_TEMPLATES["v1.0"].careerMoney`
   - Check `AI_PROMPT_TEMPLATES["v1.0"].majorLifePhase`
   - Check `AI_PROMPT_TEMPLATES["v1.0"].decisionSupport`
   - Ensure they explicitly request 5-8 detailed sections

2. **Test Report Generation**:
   - Generate test reports for all three types
   - Verify sections array has 5+ sections
   - Check if custom fields are still populated

3. **Add Minimum Section Validation**:
   - In `parseAIResponse`, ensure minimum 4-5 sections
   - Add fallback sections if needed

4. **Update Preview Page** (if needed):
   - Ensure all sections are displayed
   - Check if any sections are being filtered out

## Files to Review

1. `src/lib/ai-astrology/prompts.ts` - Prompt templates
2. `src/lib/ai-astrology/reportGenerator.ts` - `parseAIResponse` function
3. `src/app/ai-astrology/preview/page.tsx` - Section rendering logic

## Expected Outcome

After fixes:
- **Career & Money**: 5-8 detailed sections + custom fields = comprehensive report
- **Major Life Phase**: 5-8 detailed sections + custom fields = comprehensive report
- **Decision Support**: 5-8 detailed sections + custom fields = comprehensive report

Reports should match the depth and detail of Year Analysis and Marriage Timing reports.

