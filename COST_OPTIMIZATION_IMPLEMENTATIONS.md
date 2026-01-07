# 💰 Cost Optimization Implementations

This document outlines specific optimizations implemented to reduce costs.

---

## ✅ Implemented Optimizations

### 1. Report Caching (`lib/reportCache.ts`)

**Problem**: Regenerating the same reports repeatedly wastes AI API costs.

**Solution**: Cache reports based on birth details with appropriate TTLs:
- Life Summary: 7 days
- Marriage/Career: 30 days
- Year Analysis: 1 day
- Decision Support: 1 hour (or disabled)

**Cost Savings**: 
- Reduces repeat requests by ~70-90%
- Estimated savings: $10-50/month depending on traffic

**Usage**:
```typescript
import { getCachedReport, setCachedReport, generateCacheKey } from '@/lib/reportCache';

// Before generating report
const cacheKey = generateCacheKey(reportType, input);
const cached = getCachedReport(cacheKey);

if (cached) {
  return cached.content; // Skip API call
}

// After generating report
const report = await generateReport(...);
setCachedReport(cacheKey, report, reportType, estimatedCost);
```

**Next Step**: Integrate into `lib/reportGenerator.ts`

---

### 2. AI Usage Tracking (`lib/usageTracker.ts`)

**Problem**: No visibility into AI API costs.

**Solution**: Track all AI API calls with token counts and costs.

**Features**:
- Automatic cost calculation based on provider/model
- Logs usage to file for monitoring scripts
- Supports OpenAI and Anthropic

**Usage**:
```typescript
import { trackUsage, parseOpenAIUsage } from '@/lib/usageTracker';

const response = await fetch('https://api.openai.com/...');
const data = await response.json();
const usage = parseOpenAIUsage(data);

await trackUsage({
  provider: 'openai',
  model: 'gpt-4o',
  promptTokens: usage.promptTokens,
  completionTokens: usage.completionTokens,
  reportType: 'marriage-timing',
});
```

**Next Step**: Integrate into `lib/reportGenerator.ts`

---

### 3. Monitoring Scripts

**Scripts Created**:
- `scripts/monitor-ai-usage.js` - Track AI costs with alerts
- `scripts/cost-tracker.js` - Monthly cost tracking and reporting
- `scripts/monitor-all-services.js` - Comprehensive service monitoring

**Usage**:
```bash
# Daily monitoring
node scripts/monitor-all-services.js

# Monthly cost report
node scripts/cost-tracker.js 1 2025 --update

# AI usage monitoring
node scripts/monitor-ai-usage.js
```

---

## 🚀 Recommended Next Steps

### High Priority (Immediate Impact)

1. **Integrate Caching** (1-2 hours)
   - Add caching to `lib/reportGenerator.ts`
   - Test cache hit/miss rates
   - Monitor cost savings

2. **Integrate Usage Tracking** (1 hour)
   - Add tracking to all AI API calls
   - Verify logs are being written
   - Set up alerts

3. **Increase Report Prices** (15 minutes)
   - Update `lib/payments.ts`
   - Change from AU$0.50 to AU$5-10
   - Update pricing display

### Medium Priority (This Week)

4. **Implement Rate Limiting** (2-3 hours)
   - Prevent abuse
   - Reduce unnecessary API calls
   - Use Vercel Edge Config or Upstash Redis

5. **Prompt Optimization** (3-4 hours)
   - Reduce token usage per report
   - Test prompt variations
   - Monitor cost per report

6. **Database Query Optimization** (2 hours)
   - Optimize Supabase queries
   - Reduce bandwidth usage
   - Add indexes where needed

### Low Priority (This Month)

7. **Move to Redis for Caching** (4 hours)
   - Replace in-memory cache
   - Better performance at scale
   - Persistent cache across deployments

8. **Implement Report Pre-generation** (8 hours)
   - Pre-generate popular reports
   - Background job to refresh cache
   - Reduce real-time generation

9. **Cost Analytics Dashboard** (8 hours)
   - Visual dashboard for costs
   - Trend analysis
   - Cost per user/report metrics

---

## 📊 Expected Cost Savings

### With Current Optimizations:
- **Caching**: 70-90% reduction in repeat requests = **$10-50/month**
- **Usage Tracking**: Better visibility = **Prevents overages**

### With All Optimizations:
- **Caching**: $10-50/month
- **Prompt Optimization**: 20-30% token reduction = **$5-20/month**
- **Rate Limiting**: 10-20% reduction in abuse = **$2-10/month**
- **Query Optimization**: 10-20% bandwidth reduction = **Prevents upgrade**

**Total Potential Savings**: **$27-80/month** or prevent **$25-200/month** in upgrades

---

## 🔧 Integration Guide

### Step 1: Integrate Caching into Report Generator

Edit `lib/reportGenerator.ts`:

```typescript
import { getCachedReport, setCachedReport, generateCacheKey, shouldCache } from './reportCache';
import { trackUsage, parseOpenAIUsage, parseAnthropicUsage } from './usageTracker';

async function generateWithOpenAI(prompt: string, reportType: string, input: any): Promise<string> {
  // Check cache first
  if (shouldCache(reportType)) {
    const cacheKey = generateCacheKey(reportType, input);
    const cached = getCachedReport(cacheKey);
    if (cached) {
      return cached.content;
    }
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    // ... existing code
  });

  const data = await response.json();
  
  // Track usage
  const usage = parseOpenAIUsage(data);
  await trackUsage({
    provider: 'openai',
    model: 'gpt-4o',
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    reportType,
  });

  const content = data.choices[0]?.message?.content || "";
  
  // Cache result
  if (shouldCache(reportType)) {
    const cost = calculateCost('openai', 'gpt-4o', usage.promptTokens, usage.completionTokens);
    const cacheKey = generateCacheKey(reportType, input);
    setCachedReport(cacheKey, content, reportType, cost);
  }

  return content;
}
```

### Step 2: Update Prices

Edit `lib/payments.ts`:

```typescript
export const REPORT_PRICES: Record<ReportPrice["reportType"], ReportPrice> = {
  "marriage-timing": {
    reportType: "marriage-timing",
    amount: 500, // Changed from 50 to 500 (AU$5.00)
    currency: "aud",
    // ...
  },
  // Update all other report prices similarly
};
```

### Step 3: Set Up Monitoring

```bash
# Run setup script
bash scripts/setup-monitoring.sh

# Test monitoring
node scripts/monitor-all-services.js

# Set up monthly tracking
node scripts/cost-tracker.js 1 2025 --update
```

---

## 📈 Monitoring Dashboard

Create a simple dashboard to view:
- Daily AI costs
- Cache hit rates
- Cost per report
- Monthly trends

(Implementation coming soon - use scripts for now)

---

## 🎯 Success Metrics

Track these metrics to measure optimization success:

1. **Cache Hit Rate**: Target >70%
2. **Cost per Report**: Target <$0.02
3. **Monthly AI Costs**: Track trend (should decrease with caching)
4. **Total Monthly Costs**: Compare month-over-month

---

**Last Updated**: January 2025  
**Status**: Partially Implemented - Ready for Integration

