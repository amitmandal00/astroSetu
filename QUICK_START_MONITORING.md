# 🚀 Quick Start: Monitoring & Cost Optimization

**Time to set up**: 15-30 minutes

---

## Step 1: Initial Setup (5 minutes)

```bash
# Run the setup script
bash scripts/setup-monitoring.sh
```

This will:
- ✅ Create necessary directories (`data/`, `logs/`)
- ✅ Make scripts executable
- ✅ Set up `.gitignore` entries

---

## Step 2: Set Up Service Alerts (10 minutes)

### Immediate Actions:

1. **Supabase** (2 min)
   - Go to: https://supabase.com/dashboard → Settings → Usage
   - Note current database size and bandwidth
   - Set calendar reminder to check monthly

2. **Resend** (2 min)
   - Go to: https://resend.com/logs
   - Note current email count
   - Set calendar reminder to check weekly

3. **OpenAI** (2 min)
   - Go to: https://platform.openai.com/usage
   - Set up usage alerts: $5/day, $50/month
   - Enable billing alerts

4. **Anthropic** (2 min) - *If using*
   - Go to: https://console.anthropic.com/settings/usage
   - Set up usage alerts: $5/day, $50/month

5. **Vercel** (2 min)
   - Go to: https://vercel.com/dashboard → Settings → Notifications
   - Enable email alerts for bandwidth/function limits

---

## Step 3: Test Monitoring Scripts (5 minutes)

```bash
# Test comprehensive monitoring
node scripts/monitor-all-services.js

# Test cost tracker (shows current month)
node scripts/cost-tracker.js

# Test AI usage monitoring
node scripts/monitor-ai-usage.js
```

Expected output: Status reports for all services (most will show "manual check required" initially)

---

## Step 4: Set Up Monthly Cost Tracking (5 minutes)

```bash
# Enter your costs for January 2025
node scripts/cost-tracker.js 1 2025 --update
```

Enter costs when prompted:
- Stripe transaction fees (from Stripe dashboard)
- Razorpay fees (from Razorpay dashboard)
- OpenAI costs (from OpenAI dashboard)
- Anthropic costs (if applicable)
- Prokerala costs (if applicable)

**Repeat this monthly** - set a calendar reminder!

---

## Step 5: Integrate Optimizations (30 minutes - Optional but Recommended)

### A. Add Caching to Report Generator

This will save **$10-50/month** by preventing duplicate API calls.

**See**: `COST_OPTIMIZATION_IMPLEMENTATIONS.md` → Step 1

### B. Add Usage Tracking to Report Generator

This will give you visibility into AI costs.

**See**: `COST_OPTIMIZATION_IMPLEMENTATIONS.md` → Step 1

### C. Update Report Prices

**Critical**: Current AU$0.50 price has 63% Stripe fee overhead!

**Quick Fix**:
```typescript
// In ai-astrology-test-package/lib/payments.ts
// Change amount from 50 to 500 (AU$0.50 → AU$5.00)
amount: 500, // was: 50
```

---

## 📅 Ongoing Maintenance

### Daily (Automated - Optional)
Set up cron job:
```bash
# Add to crontab (crontab -e)
0 9 * * * cd /path/to/project && node scripts/monitor-all-services.js >> logs/monitoring.log 2>&1
```

### Weekly
- Check Resend email volume
- Review error logs

### Monthly
- Run cost tracker: `node scripts/cost-tracker.js [month] [year] --update`
- Review all service dashboards
- Check if any free tier limits are being approached

---

## 🎯 Success Checklist

After setup, you should have:

- [ ] All service dashboards bookmarked
- [ ] Monitoring scripts tested and working
- [ ] Monthly cost tracking set up for current month
- [ ] Calendar reminders set for monthly reviews
- [ ] (Optional) Caching integrated - saves $10-50/month
- [ ] (Optional) Usage tracking integrated - provides visibility
- [ ] Report prices updated - reduces fee overhead

---

## 📊 Expected Results

### Before Optimization:
- **No visibility** into costs
- **No alerts** when approaching limits
- **Duplicate API calls** wasting money
- **High fee overhead** from low prices

### After Optimization:
- ✅ **Full visibility** via monitoring scripts
- ✅ **Early warnings** before hitting limits
- ✅ **70-90% reduction** in duplicate API calls (with caching)
- ✅ **Reduced fee overhead** (with price updates)

---

## 🆘 Troubleshooting

### Scripts not running?
```bash
# Check Node.js version (needs Node 14+)
node --version

# Install dependencies
npm install

# Check script permissions
ls -la scripts/
```

### No data in cost tracker?
- That's normal for first run!
- Enter costs manually via `--update` flag
- Scripts will track automatically going forward (once integrated)

### Caching not working?
- See `COST_OPTIMIZATION_IMPLEMENTATIONS.md` for integration steps
- Make sure to import and use caching functions in report generator

---

## 📚 Next Steps

1. **Review Detailed Guides**:
   - `MONITORING_SETUP_GUIDE.md` - Detailed alert setup
   - `COST_OPTIMIZATION_IMPLEMENTATIONS.md` - Code optimizations
   - `SUBSCRIPTION_COST_ANALYSIS.md` - Full cost breakdown

2. **Implement Optimizations** (When Ready):
   - Start with caching (biggest savings)
   - Then usage tracking (visibility)
   - Finally prompt optimization (long-term)

3. **Set Up Automation**:
   - Cron jobs for daily monitoring
   - Calendar reminders for monthly reviews
   - Slack/Discord notifications (optional)

---

## ✅ Quick Win: Update Prices Now (2 minutes)

**This alone will save you money immediately!**

Edit `ai-astrology-test-package/lib/payments.ts`:

```typescript
// Change ALL report prices from 50 to 500 (AU$0.50 → AU$5.00)
amount: 500, // was: 50
```

This reduces Stripe fee overhead from 63% to ~6%! 🎉

---

**Questions?** Review the detailed guides or check the scripts' comments for more info.

