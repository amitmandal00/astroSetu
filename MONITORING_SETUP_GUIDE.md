# 🔔 Monitoring & Alert Setup Guide

**Purpose**: Set up monitoring alerts for all subscription services to avoid unexpected costs.

---

## 📋 Quick Setup Checklist

- [ ] Supabase usage alerts
- [ ] Resend email usage alerts
- [ ] OpenAI/Anthropic usage alerts
- [ ] Stripe transaction monitoring
- [ ] Vercel bandwidth/function monitoring
- [ ] Sentry error volume alerts
- [ ] Prokerala API usage tracking
- [ ] Custom cost tracking dashboard

---

## 1. Supabase Monitoring

### Setup Steps:
1. Go to Supabase Dashboard → Settings → Usage
2. Enable email alerts for:
   - Database size > 400 MB (80% of 500 MB free tier)
   - Bandwidth > 1.6 GB (80% of 2 GB free tier)
   - Active users > 40,000 (80% of 50,000 limit)

### SQL Query to Check Current Usage:
```sql
-- Database size (run in Supabase SQL Editor)
SELECT 
  pg_size_pretty(pg_database_size(current_database())) as database_size;

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Alert Thresholds:
- ⚠️ Warning: 400 MB database / 1.6 GB bandwidth
- 🚨 Critical: 475 MB database / 1.9 GB bandwidth

---

## 2. Resend Email Monitoring

### Setup Steps:
1. Go to Resend Dashboard → Settings → Alerts
2. Set up alerts for:
   - Email count > 2,400/month (80% of 3,000 free tier)
   - Daily emails > 80/day (80% of 100/day limit)

### API Call to Check Usage:
```bash
# Add to your monitoring script
curl -X GET "https://api.resend.com/emails?limit=1" \
  -H "Authorization: Bearer $RESEND_API_KEY"
```

### Alert Thresholds:
- ⚠️ Warning: 2,400 emails/month or 80/day
- 🚨 Critical: 2,850 emails/month or 95/day

---

## 3. OpenAI/Anthropic Usage Monitoring

### OpenAI Dashboard:
1. Go to https://platform.openai.com/usage
2. Set up usage alerts:
   - Daily spend > $5
   - Monthly spend > $50 (for low traffic)
   - Monthly spend > $200 (for medium traffic)

### Anthropic Dashboard:
1. Go to https://console.anthropic.com/settings/usage
2. Set up usage alerts:
   - Daily spend > $5
   - Monthly spend > $50

### Code Implementation:
See `scripts/monitor-ai-usage.js` for automated tracking.

### Alert Thresholds:
- ⚠️ Warning: $50/month or $5/day
- 🚨 Critical: $100/month or $10/day

---

## 4. Stripe Transaction Monitoring

### Dashboard Setup:
1. Go to Stripe Dashboard → Settings → Email notifications
2. Enable:
   - Daily payment summary
   - Weekly payment summary
   - Failed payment alerts
   - Refund alerts

### Cost Monitoring:
- Set alert if transaction fees > 10% of revenue
- Monitor failed payments (indicates issues)

### API Monitoring:
Stripe automatically tracks all transactions. Review monthly:
- Total transaction fees
- Failed payment rate
- Refund rate

---

## 5. Vercel Monitoring

### Dashboard Setup:
1. Go to Vercel Dashboard → Settings → Notifications
2. Enable email alerts for:
   - Bandwidth > 80 GB (80% of 100 GB free tier)
   - Function executions > 80/day (80% of 100/day limit)

### Alert Thresholds:
- ⚠️ Warning: 80 GB bandwidth or 80 function executions/day
- 🚨 Critical: 95 GB bandwidth or 95 function executions/day

---

## 6. Sentry Error Monitoring

### Dashboard Setup:
1. Go to Sentry Dashboard → Settings → Alerts
2. Set up alerts for:
   - Error count > 4,000/month (80% of 5,000 free tier)
   - Critical errors (any severity:error or severity:fatal)

### Alert Thresholds:
- ⚠️ Warning: 4,000 errors/month
- 🚨 Critical: 4,750 errors/month or any critical error spike

---

## 7. Prokerala API Monitoring

### Manual Tracking:
Prokerala doesn't have built-in alerts. Track via:
1. Check dashboard weekly: https://www.prokerala.com/account/api.php
2. Monitor API response times
3. Track error rates

### Code Implementation:
See `scripts/monitor-prokerala-usage.js` for automated tracking.

---

## 8. Custom Cost Tracking Dashboard

### Implementation:
Use the `scripts/cost-tracker.js` script to create a monthly cost report.

### Track:
- Total monthly spend
- Cost per service
- Cost per user/report (if applicable)
- Trend analysis

---

## 🚀 Automated Monitoring Script

See `scripts/monitor-all-services.js` for a comprehensive monitoring solution that checks all services and sends alerts.

---

## 📧 Alert Configuration

### Recommended Alert Channels:
1. **Email**: Primary alerts for all services
2. **Slack/Discord**: Optional for team notifications
3. **SMS**: Critical alerts only (if available)

### Alert Frequency:
- **Daily**: Cost tracking, critical errors
- **Weekly**: Usage summaries, trend analysis
- **Monthly**: Full cost report, optimization recommendations

---

## ⚡ Quick Action Items

1. **Today**: Set up Supabase, Resend, OpenAI/Anthropic alerts (15 min)
2. **This Week**: Implement automated monitoring script (1 hour)
3. **This Month**: Set up cost tracking dashboard (2 hours)

---

**Next Steps**: See the implementation scripts in the `scripts/` directory.

