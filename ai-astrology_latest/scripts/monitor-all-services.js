#!/usr/bin/env node

/**
 * Comprehensive Service Monitor
 * Checks all services and sends consolidated alerts
 * 
 * Usage: node scripts/monitor-all-services.js
 * Run daily via cron: 0 9 * * * node /path/to/scripts/monitor-all-services.js
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');

// Import other monitoring modules
const { loadUsageData } = require('./monitor-ai-usage');
const { loadCostData } = require('./cost-tracker');

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Check Supabase usage (requires manual dashboard check)
 */
function checkSupabase() {
  return {
    service: 'Supabase',
    status: 'info',
    message: '⚠️ Manual check required - Visit Supabase Dashboard → Settings → Usage',
    thresholds: {
      database: '400 MB / 500 MB (80%)',
      bandwidth: '1.6 GB / 2 GB (80%)',
      users: '40,000 / 50,000 (80%)',
    },
    action: 'Check dashboard: https://supabase.com/dashboard',
  };
}

/**
 * Check Resend usage
 */
async function checkResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      service: 'Resend',
      status: 'warning',
      message: 'API key not configured',
    };
  }
  
  try {
    // Note: Resend API doesn't provide usage stats directly
    // You'd need to track this in your application
    return {
      service: 'Resend',
      status: 'info',
      message: '⚠️ Manual tracking required - Check Resend Dashboard',
      thresholds: {
        monthly: '2,400 / 3,000 emails (80%)',
        daily: '80 / 100 emails (80%)',
      },
      action: 'Check dashboard: https://resend.com/logs',
    };
  } catch (error) {
    return {
      service: 'Resend',
      status: 'error',
      message: `Error checking: ${error.message}`,
    };
  }
}

/**
 * Check Vercel usage
 */
function checkVercel() {
  return {
    service: 'Vercel',
    status: 'info',
    message: '⚠️ Manual check required - Visit Vercel Dashboard → Usage',
    thresholds: {
      bandwidth: '80 GB / 100 GB (80%)',
      functions: '80 / 100 executions/day (80%)',
    },
    action: 'Check dashboard: https://vercel.com/dashboard',
  };
}

/**
 * Check Sentry usage
 */
function checkSentry() {
  return {
    service: 'Sentry',
    status: 'info',
    message: '⚠️ Manual check required - Visit Sentry Dashboard',
    thresholds: {
      errors: '4,000 / 5,000 errors/month (80%)',
    },
    action: 'Check dashboard: https://sentry.io',
  };
}

/**
 * Check Stripe transactions (requires API access)
 */
function checkStripe() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    return {
      service: 'Stripe',
      status: 'warning',
      message: 'API key not configured',
    };
  }
  
  return {
    service: 'Stripe',
    status: 'info',
    message: '⚠️ Check Stripe Dashboard for transaction fees',
    action: 'Check dashboard: https://dashboard.stripe.com',
    note: 'Monitor: Transaction fees should be <10% of revenue',
  };
}

/**
 * Check AI usage
 */
function checkAIUsage() {
  const usageData = loadUsageData();
  
  const alerts = [];
  
  if (process.env.OPENAI_API_KEY) {
    // Calculate from usage data (would need actual implementation)
    alerts.push({
      service: 'OpenAI',
      status: 'info',
      message: 'Configure usage tracking in monitor-ai-usage.js',
    });
  }
  
  if (process.env.ANTHROPIC_API_KEY) {
    alerts.push({
      service: 'Anthropic',
      status: 'info',
      message: 'Configure usage tracking in monitor-ai-usage.js',
    });
  }
  
  return alerts;
}

/**
 * Generate consolidated report
 */
async function generateReport() {
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  Service Monitoring Report${colors.reset}`);
  console.log(`${colors.blue}  ${new Date().toISOString()}${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);
  
  const checks = [
    checkSupabase(),
    await checkResend(),
    checkVercel(),
    checkSentry(),
    checkStripe(),
    ...checkAIUsage(),
  ];
  
  const statusCounts = {
    ok: 0,
    warning: 0,
    error: 0,
    info: 0,
  };
  
  checks.forEach(check => {
    const statusColor = {
      ok: colors.green,
      warning: colors.yellow,
      error: colors.red,
      info: colors.blue,
    }[check.status] || colors.reset;
    
    console.log(`${statusColor}[${check.status.toUpperCase()}]${colors.reset} ${check.service}`);
    console.log(`  ${check.message}`);
    
    if (check.thresholds) {
      Object.entries(check.thresholds).forEach(([key, value]) => {
        console.log(`    ${key}: ${value}`);
      });
    }
    
    if (check.action) {
      console.log(`  ${colors.cyan}→${colors.reset} ${check.action}`);
    }
    
    if (check.note) {
      console.log(`  ${colors.yellow}Note:${colors.reset} ${check.note}`);
    }
    
    console.log();
    
    statusCounts[check.status] = (statusCounts[check.status] || 0) + 1;
  });
  
  // Summary
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}Summary:${colors.reset}`);
  console.log(`  ${colors.green}OK:${colors.reset}      ${statusCounts.ok}`);
  console.log(`  ${colors.blue}Info:${colors.reset}     ${statusCounts.info}`);
  console.log(`  ${colors.yellow}Warning:${colors.reset}  ${statusCounts.warning}`);
  console.log(`  ${colors.red}Error:${colors.reset}     ${statusCounts.error}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);
  
  // Recommendations
  if (statusCounts.warning > 0 || statusCounts.error > 0) {
    console.log(`${colors.yellow}⚠️ Action Required:${colors.reset}`);
    console.log(`  - Review services with warnings or errors`);
    console.log(`  - Check dashboards for detailed usage information`);
    console.log(`  - Consider upgrading or optimizing services\n`);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    await generateReport();
  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateReport };

