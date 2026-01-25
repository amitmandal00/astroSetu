# API Keys Setup Guide for AI Astrology

## 🎯 Overview

To enable AI report generation, you need to configure either OpenAI or Anthropic API keys. This guide walks you through the entire process.

---

## 📋 Step-by-Step Guide

### Option A: Using OpenAI (Recommended)

#### Step 1: Get OpenAI API Key

1. **Go to OpenAI Platform**
   - Visit: https://platform.openai.com/
   - Sign in or create an account

2. **Navigate to API Keys**
   - Click on your profile (top right)
   - Select "API keys" from the menu
   - Or go directly to: https://platform.openai.com/api-keys

3. **Create New API Key**
   - Click "Create new secret key"
   - Give it a name (e.g., "AstroSetu Production")
   - **IMPORTANT:** Copy the key immediately - you won't see it again!
   - Format: `sk-...` (starts with `sk-`)

4. **Set Usage Limits (Recommended)**
   - Go to "Usage" → "Usage limits"
   - Set monthly spending limits to prevent unexpected charges
   - Recommended: Start with $50-100/month limit

#### Step 2: Add to Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project (astroSetu)

2. **Navigate to Settings**
   - Click on your project
   - Go to "Settings" tab
   - Click "Environment Variables" in the left sidebar

3. **Add the API Key**
   - Click "Add New"
   - **Key:** `OPENAI_API_KEY`
   - **Value:** `sk-...` (paste your OpenAI API key)
   - **Environment:** Select all (Production, Preview, Development)
   - Click "Save"

4. **Verify**
   - You should see `OPENAI_API_KEY` in the list
   - Make sure it's enabled for all environments

#### Step 3: Redeploy

1. **Trigger Redeployment**
   - Go to "Deployments" tab
   - Click "..." on the latest deployment
   - Select "Redeploy"
   - OR push a new commit to trigger auto-deploy

2. **Wait for Deployment**
   - Monitor the deployment logs
   - Wait for "Ready" status

---

### Option B: Using Anthropic (Claude)

#### Step 1: Get Anthropic API Key

1. **Go to Anthropic Console**
   - Visit: https://console.anthropic.com/
   - Sign in or create an account

2. **Navigate to API Keys**
   - Click "API Keys" in the left sidebar
   - Or go directly to: https://console.anthropic.com/settings/keys

3. **Create New API Key**
   - Click "Create Key"
   - Give it a name (e.g., "AstroSetu Production")
   - **IMPORTANT:** Copy the key immediately
   - Format: `sk-ant-...` (starts with `sk-ant-`)

4. **Set Usage Limits (Recommended)**
   - Go to "Billing" → "Usage Limits"
   - Set monthly spending limits
   - Recommended: Start with $50-100/month limit

#### Step 2: Add to Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Navigate to Settings**
   - Go to "Settings" → "Environment Variables"

3. **Add the API Key**
   - Click "Add New"
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-...` (paste your Anthropic API key)
   - **Environment:** Select all (Production, Preview, Development)
   - Click "Save"

4. **Verify**
   - You should see `ANTHROPIC_API_KEY` in the list

#### Step 3: Redeploy

- Same as OpenAI steps above

---

## 🔍 Verification Steps

### Step 1: Check Environment Variables

1. In Vercel Dashboard → Settings → Environment Variables
2. Verify you see either:
   - `OPENAI_API_KEY` (if using OpenAI)
   - OR `ANTHROPIC_API_KEY` (if using Anthropic)
3. Make sure it's enabled for all environments

### Step 2: Test on Deployed Site

1. **Go to AI Astrology Section**
   - Visit: `https://your-site.vercel.app/ai-astrology`
   - Click "Get Your Reading" or "Get Free Life Summary"

2. **Fill Out the Form**
   - Name: Test User
   - Date of Birth: 1990-01-15
   - Time of Birth: 14:30
   - Place: Delhi (select from autocomplete)

3. **Submit and Check**
   - If API keys are configured: Report should generate
   - If not configured: You'll see "AI service is temporarily unavailable"

### Step 3: Check Vercel Logs

1. **Go to Vercel Dashboard**
   - Click on your project
   - Go to "Logs" tab

2. **Look for Errors**
   - If you see "No AI API key configured": Keys not set correctly
   - If you see API errors: Check key validity
   - If you see successful requests: Keys are working!

---

## 🧪 Testing Your Configuration

### Quick Test Script

1. **Test Free Life Summary**
   ```
   URL: /ai-astrology/input?reportType=life-summary
   Expected: Report generates successfully
   ```

2. **Check Network Tab**
   - Open browser DevTools → Network tab
   - Look for `/api/ai-astrology/generate-report`
   - Status should be `200` (not `503`)

3. **Verify Report Content**
   - Report should have actual content (not error message)
   - Should see sections like "Summary", "Personality Traits", etc.

---

## 💰 Cost Management

### OpenAI Pricing (as of Dec 2024)
- **GPT-4 Turbo:** ~$0.01 per 1K input tokens, ~$0.03 per 1K output tokens
- **Estimated cost per report:** $0.10 - $0.50 (depending on length)
- **Recommended limit:** $50-100/month to start

### Anthropic Pricing (as of Dec 2024)
- **Claude 3 Sonnet:** ~$0.003 per 1K input tokens, ~$0.015 per 1K output tokens
- **Estimated cost per report:** $0.05 - $0.30 (depending on length)
- **Recommended limit:** $50-100/month to start

### Setting Usage Limits

**OpenAI:**
1. Go to https://platform.openai.com/usage
2. Set "Hard limit" to your desired monthly spend
3. Set "Soft limit" (warning threshold)

**Anthropic:**
1. Go to https://console.anthropic.com/settings/billing
2. Set monthly spending limit
3. Enable email alerts

---

## 🔒 Security Best Practices

1. **Never Commit API Keys**
   - ✅ Keys are in Vercel environment variables (secure)
   - ❌ Never put keys in code or commit to git
   - ✅ Keys are automatically excluded from builds

2. **Use Different Keys for Environments**
   - Production: Production API key
   - Preview: Test API key (if available)
   - Development: Test API key

3. **Rotate Keys Regularly**
   - Rotate every 3-6 months
   - Or immediately if key is compromised

4. **Monitor Usage**
   - Check API usage daily initially
   - Set up alerts for unusual activity
   - Review costs weekly

---

## 🐛 Troubleshooting

### Issue: "AI service is temporarily unavailable"

**Possible Causes:**
1. API key not set in Vercel
2. API key incorrect/expired
3. Environment variable name wrong
4. Deployment didn't pick up new variables

**Solutions:**
1. Verify key exists in Vercel → Settings → Environment Variables
2. Check key name matches exactly: `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
3. Redeploy after adding keys
4. Check Vercel logs for specific error messages

### Issue: API Rate Limit Errors

**Cause:** Too many requests too quickly

**Solutions:**
1. Implement request throttling (already in code)
2. Add retry logic with exponential backoff
3. Upgrade API plan if needed

### Issue: High Costs

**Solutions:**
1. Set usage limits immediately
2. Review which reports are most expensive
3. Optimize prompts to reduce token usage
4. Consider caching reports for same inputs

---

## 📊 Monitoring Setup

### Recommended Monitoring

1. **Vercel Logs**
   - Monitor for API errors
   - Check response times
   - Watch for 503 errors

2. **API Provider Dashboards**
   - OpenAI: https://platform.openai.com/usage
   - Anthropic: https://console.anthropic.com/settings/billing
   - Monitor usage and costs daily initially

3. **Error Tracking** (Optional but Recommended)
   - Set up Sentry or similar
   - Track API failures
   - Monitor user-reported errors

---

## ✅ Checklist

Before going live:

- [ ] API key obtained (OpenAI or Anthropic)
- [ ] API key added to Vercel environment variables
- [ ] Key enabled for all environments (Production, Preview, Development)
- [ ] Usage limits set (recommended: $50-100/month)
- [ ] Application redeployed
- [ ] Test report generation works
- [ ] Check Vercel logs - no API errors
- [ ] Monitor first few reports for costs
- [ ] Set up usage alerts

---

## 🚀 Quick Start Commands

### For OpenAI:
```bash
# 1. Get key from https://platform.openai.com/api-keys
# 2. Add to Vercel:
#    Key: OPENAI_API_KEY
#    Value: sk-...
# 3. Redeploy
```

### For Anthropic:
```bash
# 1. Get key from https://console.anthropic.com/settings/keys
# 2. Add to Vercel:
#    Key: ANTHROPIC_API_KEY
#    Value: sk-ant-...
# 3. Redeploy
```

---

## 📞 Support

### If You Need Help:

1. **OpenAI Support**
   - Docs: https://platform.openai.com/docs
   - Support: https://help.openai.com/

2. **Anthropic Support**
   - Docs: https://docs.anthropic.com/
   - Support: support@anthropic.com

3. **Vercel Support**
   - Docs: https://vercel.com/docs
   - Support: https://vercel.com/support

---

## 🎯 Next Steps After Configuration

1. ✅ Test report generation
2. ✅ Monitor costs for first week
3. ✅ Adjust usage limits if needed
4. ✅ Set up error alerts
5. ✅ Test payment flows
6. ✅ Go live!

---

**Last Updated:** December 27, 2025  
**Status:** Ready for configuration

