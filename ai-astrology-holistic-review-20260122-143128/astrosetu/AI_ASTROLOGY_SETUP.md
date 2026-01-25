# AI Astrology Platform - Setup Guide

## Overview

The AI Astrology platform is a fully autonomous, AI-powered astrology report generation system. It's completely separate from the existing AstroSetu features and follows a "vending machine" model: Input → AI → Output → Payment → Done.

## Environment Variables Required

To use the AI Astrology platform, you need to configure at least one AI service:

### Option 1: OpenAI (Recommended)

Add to `.env.local`:
```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

### Option 2: Anthropic Claude

Add to `.env.local`:
```bash
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
```

Get your API key from: https://console.anthropic.com/

### Note
- You only need ONE of the above (OpenAI or Anthropic)
- The system will use OpenAI if both are configured
- If neither is configured, the API will return an error

## Features

### 1. Free Life Summary
- **Route**: `/ai-astrology/input` (default)
- **Cost**: FREE
- **Includes**: Personality overview, strengths, areas for growth, major life themes
- **Purpose**: Hook users to purchase detailed reports

### 2. Marriage Timing Report ($29)
- **Route**: `/ai-astrology/input?report=marriage-timing`
- **Cost**: $29
- **Includes**: Ideal marriage windows, delay causes, compatibility indicators, remedies

### 3. Career & Money Report ($29)
- **Route**: `/ai-astrology/input?report=career-money`
- **Cost**: $29
- **Includes**: Best career fields, job change timing, money growth phases, financial guidance

### 4. Full Life Report ($49)
- **Route**: `/ai-astrology/input?report=full-life`
- **Cost**: $49
- **Includes**: Everything in Marriage & Career reports plus comprehensive analysis

### 5. Premium Subscription ($9.99/month)
- **Route**: `/ai-astrology/subscription`
- **Cost**: $9.99/month
- **Includes**: Daily personalized guidance, "Today is good for...", "Avoid today..."

## How It Works

1. **User Input** (`/ai-astrology/input`)
   - User enters birth details (name, DOB, TOB, place, gender)
   - Form validates inputs and resolves coordinates

2. **Report Generation** (`/ai-astrology/preview`)
   - Fetches astrological data from Prokerala API
   - Generates AI report using configured AI service (OpenAI/Anthropic)
   - Displays formatted report

3. **Payment** (For paid reports)
   - User clicks "Get Report" → Redirected to payment
   - After payment → Report is unlocked

4. **PDF Download** (Coming soon)
   - User can download branded PDF of their report

## Architecture

```
User Input
  ↓
/api/ai-astrology/generate-report
  ↓
reportGenerator.ts
  ├─ Fetch astrology data (Prokerala API)
  ├─ Generate AI prompt (prompts.ts)
  ├─ Call AI service (OpenAI/Anthropic)
  └─ Parse & format response
  ↓
Preview Page (displays report)
```

## Testing

1. **Without AI API Key**:
   - Navigate to `/ai-astrology/input`
   - Fill form and submit
   - Should see error: "AI service not configured"

2. **With OpenAI API Key**:
   - Add `OPENAI_API_KEY` to `.env.local`
   - Restart dev server
   - Navigate to `/ai-astrology/input`
   - Fill form and submit
   - Should generate and display Life Summary report

3. **With Anthropic API Key**:
   - Add `ANTHROPIC_API_KEY` to `.env.local`
   - Restart dev server
   - Navigate to `/ai-astrology/input`
   - Fill form and submit
   - Should generate and display Life Summary report

## Current Status

✅ **Completed**:
- Landing page (`/ai-astrology`)
- Input form (`/ai-astrology/input`)
- Preview page (`/ai-astrology/preview`)
- AI report generation API
- Report generator with OpenAI/Anthropic support
- Prompt templates for all report types
- Free Life Summary generation

⚠️ **Pending** (Next Steps):
- Stripe payment integration
- PDF report generation
- Subscription feature
- Paid report unlock logic

## Monetization Model

| Product | Price | Status |
|---------|-------|--------|
| Life Summary | FREE | ✅ Available |
| Marriage Timing Report | $29 | ⚠️ Needs payment |
| Career & Money Report | $29 | ⚠️ Needs payment |
| Full Life Report | $49 | ⚠️ Needs payment |
| Premium Subscription | $9.99/month | ⚠️ Needs implementation |

## Next Steps

1. **Payment Integration** (Priority 1)
   - Set up Stripe account
   - Create checkout session API
   - Handle payment success/failure
   - Unlock reports after payment

2. **PDF Generation** (Priority 2)
   - Server-side PDF generation
   - Branded template (8-12 pages)
   - Download functionality

3. **Subscription Feature** (Priority 3)
   - Subscription management
   - Daily guidance generation
   - Subscription dashboard

---

**Last Updated**: January 2025

