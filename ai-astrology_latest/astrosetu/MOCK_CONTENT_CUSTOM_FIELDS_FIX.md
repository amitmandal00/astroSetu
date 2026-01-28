# Mock Content Stripping - Custom Fields Fix

## Issue
Mock content like "(mock data)" was appearing in custom fields (timeWindows, recommendations, phaseBreakdown, etc.) because the mock content guard only checked standard fields (summary, sections).

## Root Cause
`mockContentGuard.ts` was only checking:
- `summary`, `executiveSummary`
- `keyInsights`
- `sections` (title, content, bullets)

But NOT checking custom fields:
- `timeWindows[]` (description, title, actions)
- `recommendations[]` (category, items)
- `phaseBreakdown[]` (theme, majorInfluences, focusAreas)
- `majorTransitions[]` (description, preparation)
- `longTermOpportunities[]` (description, actionItems)
- `decisionOptions[]` (option, considerations)
- `phaseTheme`, `yearTheme`, `decisionContext`, `recommendedTiming`, `factorsToConsider`
- `quarterlyBreakdown[]`, `bestPeriods[]`, `cautionPeriods[]`

## Fix Applied

### 1. Added "(mock data)" to MOCK_INDICATORS
- Added `"(mock data)"`, `"mock data"`, and `"mock report"` to the list

### 2. Enhanced `reportContainsMockContent()`
- Now checks all custom fields for mock content
- Ensures validation catches mock content in any field

### 3. Enhanced `stripMockContent()`
- Added comprehensive cleaning for all custom fields:
  - Removes "(mock data)" and "mock data" text from all fields
  - Filters out items/windows/transitions that contain mock content
  - Cleans nested arrays (actions, items, considerations, etc.)

## Custom Fields Now Cleaned

### Career & Money / Marriage Timing
- `timeWindows[]`: title, description, actions, avoidActions
- `recommendations[]`: category, items

### Major Life Phase
- `phaseTheme`: theme text
- `phaseBreakdown[]`: year, theme, focusAreas, majorInfluences
- `majorTransitions[]`: timeframe, description, preparation
- `longTermOpportunities[]`: category, timeframe, description, actionItems

### Decision Support
- `decisionContext`: context text
- `decisionOptions[]`: option, timeframe, considerations
- `recommendedTiming`: timing text
- `factorsToConsider[]`: factor strings

### Year Analysis
- `yearTheme`: theme text
- `quarterlyBreakdown[]`: focusTheme, careerMoneyTone, relationshipFocus
- `bestPeriods[]`: focus, description
- `cautionPeriods[]`: focus, description

## Expected Result
- All "(mock data)" text removed from custom fields
- Mock windows/transitions/options filtered out completely
- Clean, production-ready custom fields in all reports

## Testing
After deployment, verify:
- [ ] Career & Money reports have clean timeWindows and recommendations
- [ ] Major Life Phase reports have clean phaseBreakdown, majorTransitions, longTermOpportunities
- [ ] Decision Support reports have clean decisionOptions, recommendedTiming, factorsToConsider
- [ ] No "(mock data)" text appears anywhere in production reports

