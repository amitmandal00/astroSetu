#!/usr/bin/env node

/**
 * Monthly Cost Tracker
 * Tracks and reports monthly costs across all services
 * 
 * Usage: node scripts/cost-tracker.js [month] [year]
 * Example: node scripts/cost-tracker.js 1 2025
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');

// Configuration
const COST_DATA_FILE = path.join(__dirname, '../data/monthly-costs.json');

// Service base costs (fixed monthly)
const BASE_COSTS = {
  cursor: 60, // Pro+ plan
  supabase: 0, // Free tier (update if on paid)
  resend: 0, // Free tier (update if on paid)
  vercel: 0, // Free tier (update if on paid)
  sentry: 0, // Free tier (update if on paid)
};

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Load cost data
 */
function loadCostData() {
  const dir = path.dirname(COST_DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(COST_DATA_FILE)) {
    return {};
  }
  
  try {
    return JSON.parse(fs.readFileSync(COST_DATA_FILE, 'utf8'));
  } catch (error) {
    console.error('Error loading cost data:', error);
    return {};
  }
}

/**
 * Save cost data
 */
function saveCostData(data) {
  fs.writeFileSync(COST_DATA_FILE, JSON.stringify(data, null, 2));
}

/**
 * Get or initialize month data
 */
function getMonthData(data, month, year) {
  const key = `${year}-${String(month).padStart(2, '0')}`;
  if (!data[key]) {
    data[key] = {
      month,
      year,
      services: { ...BASE_COSTS },
      variable: {
        stripe: 0,
        razorpay: 0,
        openai: 0,
        anthropic: 0,
        prokerala: 0,
      },
      notes: [],
      updatedAt: new Date().toISOString(),
    };
  }
  return data[key];
}

/**
 * Display cost report
 */
function displayReport(monthData, month, year) {
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
  
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  Monthly Cost Report: ${monthName} ${year}${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);
  
  // Fixed costs
  console.log(`${colors.yellow}Fixed Monthly Costs:${colors.reset}`);
  let totalFixed = 0;
  Object.entries(monthData.services).forEach(([service, cost]) => {
    if (cost > 0) {
      console.log(`  ${service.padEnd(15)} $${cost.toFixed(2)}`);
      totalFixed += cost;
    }
  });
  console.log(`  ${'─'.repeat(30)}`);
  console.log(`  ${'Total Fixed'.padEnd(15)} ${colors.green}$${totalFixed.toFixed(2)}${colors.reset}\n`);
  
  // Variable costs
  console.log(`${colors.yellow}Variable Costs (Pay-per-use):${colors.reset}`);
  let totalVariable = 0;
  Object.entries(monthData.variable).forEach(([service, cost]) => {
    if (cost > 0) {
      console.log(`  ${service.padEnd(15)} $${cost.toFixed(2)}`);
      totalVariable += cost;
    } else {
      console.log(`  ${service.padEnd(15)} ${colors.green}$0.00${colors.reset}`);
    }
  });
  console.log(`  ${'─'.repeat(30)}`);
  console.log(`  ${'Total Variable'.padEnd(15)} ${colors.green}$${totalVariable.toFixed(2)}${colors.reset}\n`);
  
  // Grand total
  const grandTotal = totalFixed + totalVariable;
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`  ${colors.blue}Grand Total:${colors.reset} ${colors.green}$${grandTotal.toFixed(2)}${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);
  
  // Notes
  if (monthData.notes && monthData.notes.length > 0) {
    console.log(`${colors.yellow}Notes:${colors.reset}`);
    monthData.notes.forEach(note => {
      console.log(`  • ${note}`);
    });
    console.log();
  }
  
  // Recommendations
  console.log(`${colors.yellow}Recommendations:${colors.reset}`);
  
  if (totalVariable > totalFixed * 2) {
    console.log(`  ⚠️  Variable costs are high - consider optimization`);
  }
  
  if (monthData.variable.stripe > 0 && monthData.variable.stripe / grandTotal > 0.1) {
    console.log(`  ⚠️  Stripe fees are >10% of total costs - consider increasing prices`);
  }
  
  if (monthData.variable.openai + monthData.variable.anthropic > 50) {
    console.log(`  ⚠️  AI costs are high - implement caching and prompt optimization`);
  }
  
  if (grandTotal > 300) {
    console.log(`  ⚠️  Total costs exceed $300 - review all services for optimization opportunities`);
  }
  
  if (totalVariable === 0) {
    console.log(`  ✅ No variable costs recorded - verify all pay-per-use services are tracked`);
  }
  
  console.log();
}

/**
 * Interactive update mode
 */
function interactiveUpdate(monthData) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    console.log(`${colors.blue}Enter costs for variable services (press Enter to skip):${colors.reset}\n`);
    
    const services = Object.keys(monthData.variable);
    let index = 0;
    
    function askNext() {
      if (index >= services.length) {
        rl.close();
        resolve();
        return;
      }
      
      const service = services[index];
      rl.question(`  ${service.padEnd(15)} $`, (answer) => {
        const cost = parseFloat(answer) || 0;
        monthData.variable[service] = cost;
        monthData.updatedAt = new Date().toISOString();
        index++;
        askNext();
      });
    }
    
    askNext();
  });
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const now = new Date();
  const month = args[0] ? parseInt(args[0]) : now.getMonth() + 1;
  const year = args[1] ? parseInt(args[1]) : now.getFullYear();
  
  const data = loadCostData();
  const monthData = getMonthData(data, month, year);
  
  // Check if update mode
  if (args.includes('--update') || args.includes('-u')) {
    interactiveUpdate(monthData).then(() => {
      saveCostData(data);
      displayReport(monthData, month, year);
    });
  } else {
    displayReport(monthData, month, year);
    console.log(`${colors.cyan}To update costs, run: node scripts/cost-tracker.js ${month} ${year} --update${colors.reset}\n`);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { loadCostData, saveCostData, getMonthData, displayReport };

