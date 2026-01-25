# Cursor On-Demand Cost Spike Analysis

**Date**: 2026-01-25  
**Total On-Demand Charges**: ~$20+  
**Status**: ⚠️ **IDENTIFIED ROOT CAUSES**

---

## 📊 Cost Summary

### Recent On-Demand Usage (2026-01-25)

**Peak Period**: 03:00 - 06:00 UTC (January 25, 2026)

| Time (UTC) | Cost | Input Tokens | Output Tokens | Total Tokens | Model |
|------------|------|--------------|---------------|--------------|-------|
| 05:03:54 | **$2.82** | 2,201,911 | 10,627 | 2,211,911 | auto |
| 05:50:48 | **$1.78** | 1,370,374 | 10,706 | 1,381,080 | auto |
| 05:43:28 | **$1.77** | 1,366,536 | 9,906 | 1,376,442 | auto |
| 05:47:56 | **$1.26** | 972,822 | 7,371 | 980,193 | auto |
| 05:57:28 | **$0.91** | 699,113 | 5,586 | 704,699 | auto |
| 06:03:32 | **$1.02** | 778,351 | 7,147 | 785,498 | auto |
| 05:13:17 | **$1.09** | 846,760 | 5,309 | 852,069 | auto |
| 05:07:14 | **$0.39** | 305,090 | 972 | 306,062 | auto |
| 04:59:16 | **$0.58** | 429,895 | 7,686 | 437,581 | auto |
| 03:42:04 | **$1.47** | 939,762 | 49,133 | 988,895 | auto |
| 03:32:02 | **$1.80** | 1,417,422 | 4,671 | 1,422,093 | auto |
| 03:27:58 | **$1.03** | 788,352 | 7,175 | 795,527 | auto |
| 03:26:37 | **$0.79** | 626,474 | 1,317 | 627,791 | auto |

**Subtotal (2026-01-25)**: ~$15.50+ in On-Demand charges

---

## 🔍 Root Causes Identified

### 1. **Large Codebase Analysis** ⚠️ PRIMARY CAUSE

**Problem**: Multiple requests with **500K - 2.2M input tokens** per request

**Evidence**:
- Input tokens range from 300K to 2.2M per request
- All requests show "Max Mode: No" (so not Max Mode)
- Pattern suggests analyzing entire codebase or large file sets

**Why This Triggers On-Demand**:
- Cursor includes a monthly token allowance in subscription
- When you exceed included quota OR process very large contexts, it charges On-Demand
- Large codebase analysis (e.g., "analyze entire project") consumes massive tokens

**Cost Impact**: 
- Each 1M tokens ≈ $1.30-1.50
- Your requests: 500K-2.2M tokens each
- **10+ large requests in 3 hours = $15+**

---

### 2. **Rapid Sequential Requests** ⚠️ SECONDARY CAUSE

**Problem**: Multiple large requests within minutes of each other

**Evidence**:
- 05:03 → 05:07 → 05:13 → 05:26 → 05:27 → 05:32 → 05:42 → 05:43 → 05:47 → 05:50 → 05:57 → 06:03
- 12 requests in 1 hour
- Each consuming 300K-2.2M tokens

**Why This Matters**:
- Each request independently charges On-Demand if it exceeds quota
- No batching or optimization
- Likely iterative debugging/refactoring session

**Cost Impact**: 
- If each request exceeds included quota, all charge On-Demand
- **12 requests × $1-3 each = $12-36**

---

### 3. **High Output Token Generation** ⚠️ MINOR FACTOR

**Problem**: Some requests generate 10K-49K output tokens

**Evidence**:
- Request at 03:42:04: 49,133 output tokens (unusually high)
- Most requests: 5K-10K output tokens
- High output = longer responses = more cost

**Why This Matters**:
- Output tokens are more expensive than input tokens
- Large code generation/refactoring produces high output
- Combined with large input = expensive request

**Cost Impact**: 
- Output tokens: ~$3 per 1M tokens
- 49K output tokens ≈ $0.15 additional cost
- **Minor compared to input token costs**

---

## 💡 Solutions & Recommendations

### Immediate Actions (Prevent Future Spikes)

#### 1. **Limit Codebase Scope** ✅ HIGH PRIORITY

**Action**: Be more specific in requests

**Instead of**:
- ❌ "Analyze the entire codebase"
- ❌ "Refactor all files"
- ❌ "Review everything"

**Do**:
- ✅ "Analyze `/src/app/api` directory only"
- ✅ "Review this specific file: `route.ts`"
- ✅ "Check these 3 files for X issue"

**Expected Savings**: 70-90% reduction in token usage

---

#### 2. **Use Included Quota First** ✅ HIGH PRIORITY

**Action**: Monitor your included quota usage

**How to Check**:
1. Go to Cursor Settings → Usage
2. Check "Included" vs "On-Demand" breakdown
3. See how much included quota remains

**Strategy**:
- Use included quota for small/medium requests
- Reserve On-Demand for critical, large refactors only
- Batch small requests to stay within included quota

**Expected Savings**: Avoid On-Demand charges for routine work

---

#### 3. **Break Down Large Tasks** ✅ MEDIUM PRIORITY

**Action**: Split large refactors into smaller requests

**Example**:
- ❌ "Refactor entire authentication system" (2M tokens)
- ✅ "Refactor login component" (200K tokens)
- ✅ "Refactor auth middleware" (200K tokens)
- ✅ "Refactor session handling" (200K tokens)

**Expected Savings**: 
- Smaller requests more likely to fit in included quota
- Better error handling (one failure doesn't waste entire request)
- 50-70% cost reduction

---

#### 4. **Use File-Specific Context** ✅ MEDIUM PRIORITY

**Action**: Open only relevant files before asking questions

**Instead of**:
- ❌ Having entire project open → asking broad question

**Do**:
- ✅ Open specific file(s) → ask focused question
- ✅ Use @filename mentions to limit context
- ✅ Close unused files/tabs

**Expected Savings**: 60-80% reduction in input tokens

---

#### 5. **Monitor Usage Patterns** ✅ LOW PRIORITY

**Action**: Track when On-Demand charges occur

**How**:
- Check Cursor usage dashboard daily
- Identify patterns (time of day, type of work)
- Adjust workflow accordingly

**Expected Savings**: 
- Early detection of spikes
- Prevent runaway costs

---

## 📈 Cost Projection

### Current Pattern (If Continued)

**Assumptions**:
- 10-15 large requests per day
- Average 1M tokens per request
- All On-Demand (exceeded included quota)

**Monthly Cost**:
- 300-450 requests/month
- $1.30-1.50 per request
- **$390-675/month in On-Demand charges**

### Optimized Pattern (After Fixes)

**Assumptions**:
- 50% of requests stay within included quota
- Remaining requests: 50% smaller scope
- Average 300K tokens per request

**Monthly Cost**:
- 150-225 On-Demand requests/month
- $0.40-0.50 per request
- **$60-112/month in On-Demand charges**

**Savings**: **$330-563/month** (85% reduction)

---

## 🎯 Action Plan

### This Week
- [ ] Review Cursor usage dashboard
- [ ] Identify which requests triggered On-Demand
- [ ] Adjust workflow to use smaller scopes
- [ ] Set daily usage alerts (if available)

### This Month
- [ ] Monitor On-Demand charges weekly
- [ ] Optimize request patterns
- [ ] Document cost-saving practices
- [ ] Review included quota usage

### Long Term
- [ ] Consider upgrading subscription if On-Demand usage is consistent
- [ ] Evaluate if larger included quota is more cost-effective
- [ ] Build habits around scoped requests

---

## 📝 Notes

### Why On-Demand Charges Occur

1. **Exceeded Included Quota**: Your subscription includes a monthly token allowance. Once exceeded, all requests charge On-Demand.

2. **Large Context Windows**: Requests that analyze entire codebases consume massive tokens, quickly exhausting included quota.

3. **No Batching**: Each request is charged independently. Multiple large requests = multiple On-Demand charges.

### Understanding Token Costs

- **Input Tokens**: Code/files you send to AI (~$1.30 per 1M tokens)
- **Output Tokens**: Code/responses AI generates (~$3 per 1M tokens)
- **Cache Read**: Cached results (free or heavily discounted)

**Your Pattern**:
- High input tokens (500K-2.2M per request) = primary cost driver
- Moderate output tokens (5K-10K per request) = secondary cost
- Low cache usage = missing optimization opportunity

---

## ✅ Verification

After implementing fixes:

1. **Week 1**: Monitor daily On-Demand charges
2. **Week 2**: Compare to baseline (this week's $20)
3. **Week 3**: Adjust if needed
4. **Week 4**: Document savings

**Target**: Reduce On-Demand charges by 70-85%

---

**Created**: 2026-01-25  
**Last Updated**: 2026-01-25  
**Status**: Analysis Complete - Action Items Identified

