#!/usr/bin/env node

/**
 * AI Usage Monitor
 * Tracks OpenAI and Anthropic API usage and sends alerts when thresholds are exceeded
 * 
 * Usage: node scripts/monitor-ai-usage.js
 * Run daily via cron: 0 9 * * * node /path/to/scripts/monitor-ai-usage.js
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Alert thresholds (USD)
  OPENAI_DAILY_WARNING: 5,
  OPENAI_DAILY_CRITICAL: 10,
  OPENAI_MONTHLY_WARNING: 50,
  OPENAI_MONTHLY_CRITICAL: 100,
  
  ANTHROPIC_DAILY_WARNING: 5,
  ANTHROPIC_DAILY_CRITICAL: 10,
  ANTHROPIC_MONTHLY_WARNING: 50,
  ANTHROPIC_MONTHLY_CRITICAL: 100,
  
  // Storage file for tracking usage
  USAGE_FILE: path.join(__dirname, '../data/ai-usage-tracker.json'),
  
  // Email alerts (optional - requires email service)
  ALERT_EMAIL: process.env.ALERT_EMAIL || null,
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

/**
 * Load usage data from file
 */
function loadUsageData() {
  const dir = path.dirname(CONFIG.USAGE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(CONFIG.USAGE_FILE)) {
    return {
      openai: { daily: [], monthly: [] },
      anthropic: { daily: [], monthly: [] },
    };
  }
  
  try {
    return JSON.parse(fs.readFileSync(CONFIG.USAGE_FILE, 'utf8'));
  } catch (error) {
    console.error('Error loading usage data:', error);
    return {
      openai: { daily: [], monthly: [] },
      anthropic: { daily: [], monthly: [] },
    };
  }
}

/**
 * Save usage data to file
 */
function saveUsageData(data) {
  fs.writeFileSync(CONFIG.USAGE_FILE, JSON.stringify(data, null, 2));
}

/**
 * Fetch OpenAI usage from API
 */
async function fetchOpenAIUsage() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  
  try {
    // Note: OpenAI doesn't have a direct usage API in the same way
    // This would need to be tracked via your own logs or billing API
    // For now, we'll track based on application logs
    const today = new Date().toISOString().split('T')[0];
    const usageFile = path.join(__dirname, '../logs/openai-usage.log');
    
    if (fs.existsSync(usageFile)) {
      const logs = fs.readFileSync(usageFile, 'utf8').split('\n');
      const todayLogs = logs.filter(line => line.includes(today));
      // Parse logs to extract costs (implementation depends on log format)
      // This is a placeholder - implement based on your logging structure
      return { daily: 0, monthly: 0 };
    }
    
    return { daily: 0, monthly: 0 };
  } catch (error) {
    console.error('Error fetching OpenAI usage:', error);
    return null;
  }
}

/**
 * Fetch Anthropic usage from API
 */
async function fetchAnthropicUsage() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }
  
  try {
    // Similar to OpenAI - track via application logs
    // Anthropic billing API access may require enterprise plan
    return { daily: 0, monthly: 0 };
  } catch (error) {
    console.error('Error fetching Anthropic usage:', error);
    return null;
  }
}

/**
 * Calculate daily and monthly totals
 */
function calculateTotals(usageData, provider) {
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  const dailyTotal = usageData[provider].daily
    .filter(entry => entry.date === today)
    .reduce((sum, entry) => sum + entry.cost, 0);
  
  const monthlyTotal = usageData[provider].monthly
    .filter(entry => entry.month === thisMonth)
    .reduce((sum, entry) => sum + entry.cost, 0);
  
  return { dailyTotal, monthlyTotal };
}

/**
 * Check thresholds and generate alerts
 */
function checkThresholds(provider, dailyTotal, monthlyTotal) {
  const alerts = [];
  
  const thresholds = provider === 'openai' 
    ? {
        dailyWarning: CONFIG.OPENAI_DAILY_WARNING,
        dailyCritical: CONFIG.OPENAI_DAILY_CRITICAL,
        monthlyWarning: CONFIG.OPENAI_MONTHLY_WARNING,
        monthlyCritical: CONFIG.OPENAI_MONTHLY_CRITICAL,
      }
    : {
        dailyWarning: CONFIG.ANTHROPIC_DAILY_WARNING,
        dailyCritical: CONFIG.ANTHROPIC_DAILY_CRITICAL,
        monthlyWarning: CONFIG.ANTHROPIC_MONTHLY_WARNING,
        monthlyCritical: CONFIG.ANTHROPIC_MONTHLY_CRITICAL,
      };
  
  if (dailyTotal >= thresholds.dailyCritical) {
    alerts.push({
      level: 'critical',
      type: 'daily',
      message: `🚨 CRITICAL: ${provider.toUpperCase()} daily spend is $${dailyTotal.toFixed(2)} (threshold: $${thresholds.dailyCritical})`,
    });
  } else if (dailyTotal >= thresholds.dailyWarning) {
    alerts.push({
      level: 'warning',
      type: 'daily',
      message: `⚠️ WARNING: ${provider.toUpperCase()} daily spend is $${dailyTotal.toFixed(2)} (threshold: $${thresholds.dailyWarning})`,
    });
  }
  
  if (monthlyTotal >= thresholds.monthlyCritical) {
    alerts.push({
      level: 'critical',
      type: 'monthly',
      message: `🚨 CRITICAL: ${provider.toUpperCase()} monthly spend is $${monthlyTotal.toFixed(2)} (threshold: $${thresholds.monthlyCritical})`,
    });
  } else if (monthlyTotal >= thresholds.monthlyWarning) {
    alerts.push({
      level: 'warning',
      type: 'monthly',
      message: `⚠️ WARNING: ${provider.toUpperCase()} monthly spend is $${monthlyTotal.toFixed(2)} (threshold: $${thresholds.monthlyWarning})`,
    });
  }
  
  return alerts;
}

/**
 * Print usage report
 */
function printReport(provider, dailyTotal, monthlyTotal, alerts) {
  const color = provider === 'openai' ? colors.blue : colors.green;
  console.log(`\n${color}=== ${provider.toUpperCase()} Usage Report ===${colors.reset}`);
  console.log(`Daily Total:  $${dailyTotal.toFixed(2)}`);
  console.log(`Monthly Total: $${monthlyTotal.toFixed(2)}`);
  
  if (alerts.length > 0) {
    console.log(`\n${colors.yellow}Alerts:${colors.reset}`);
    alerts.forEach(alert => {
      const color = alert.level === 'critical' ? colors.red : colors.yellow;
      console.log(`${color}${alert.message}${colors.reset}`);
    });
  } else {
    console.log(`${colors.green}✅ All thresholds within limits${colors.reset}`);
  }
}

/**
 * Main monitoring function
 */
async function main() {
  console.log(`${colors.blue}AI Usage Monitor${colors.reset}`);
  console.log(`Started at: ${new Date().toISOString()}\n`);
  
  const usageData = loadUsageData();
  
  // Check OpenAI
  if (process.env.OPENAI_API_KEY) {
    const openaiUsage = await fetchOpenAIUsage();
    if (openaiUsage) {
      const { dailyTotal, monthlyTotal } = calculateTotals(usageData, 'openai');
      const alerts = checkThresholds('openai', dailyTotal, monthlyTotal);
      printReport('openai', dailyTotal, monthlyTotal, alerts);
    } else {
      console.log(`${colors.yellow}⚠️ OpenAI API key found but usage tracking not configured${colors.reset}`);
    }
  }
  
  // Check Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    const anthropicUsage = await fetchAnthropicUsage();
    if (anthropicUsage) {
      const { dailyTotal, monthlyTotal } = calculateTotals(usageData, 'anthropic');
      const alerts = checkThresholds('anthropic', dailyTotal, monthlyTotal);
      printReport('anthropic', dailyTotal, monthlyTotal, alerts);
    } else {
      console.log(`${colors.yellow}⚠️ Anthropic API key found but usage tracking not configured${colors.reset}`);
    }
  }
  
  console.log(`\n${colors.blue}Note: For accurate usage tracking, implement logging in your AI report generation code.${colors.reset}`);
  console.log(`See: lib/reportGenerator.ts - Add cost tracking after each API call.`);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = { main, loadUsageData, saveUsageData };

