/**
 * Usage Tracker
 * Tracks AI API usage and costs for monitoring
 */

interface UsageEntry {
  provider: 'openai' | 'anthropic';
  model: string;
  promptTokens: number;
  completionTokens: number;
  cost: number;
  timestamp: string;
  reportType?: string;
}

interface UsageStats {
  daily: UsageEntry[];
  monthly: UsageEntry[];
}

// Pricing per 1M tokens (as of Jan 2025)
const PRICING = {
  openai: {
    'gpt-4o': {
      input: 2.50, // $2.50 per 1M tokens
      output: 10.00, // $10.00 per 1M tokens
    },
    'gpt-4': {
      input: 30.00,
      output: 60.00,
    },
    'gpt-3.5-turbo': {
      input: 0.50,
      output: 1.50,
    },
  },
  anthropic: {
    'claude-3-opus-20240229': {
      input: 15.00,
      output: 75.00,
    },
    'claude-3-sonnet-20240229': {
      input: 3.00,
      output: 15.00,
    },
    'claude-3-haiku-20240307': {
      input: 0.25,
      output: 1.25,
    },
  },
};

/**
 * Calculate cost based on tokens and provider
 */
export function calculateCost(
  provider: 'openai' | 'anthropic',
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const providerPricing = PRICING[provider];
  if (!providerPricing[model]) {
    console.warn(`Unknown model pricing: ${provider}/${model}, using default`);
    return 0;
  }

  const pricing = providerPricing[model];
  const inputCost = (promptTokens / 1_000_000) * pricing.input;
  const outputCost = (completionTokens / 1_000_000) * pricing.output;
  
  return inputCost + outputCost;
}

/**
 * Track usage entry
 */
export async function trackUsage(entry: Omit<UsageEntry, 'timestamp' | 'cost'> & { cost?: number }) {
  const cost = entry.cost ?? calculateCost(
    entry.provider,
    entry.model,
    entry.promptTokens,
    entry.completionTokens
  );

  const usageEntry: UsageEntry = {
    ...entry,
    cost,
    timestamp: new Date().toISOString(),
  };

  // In production, save to database or file
  // For now, log to console and optionally save to file
  if (process.env.NODE_ENV === 'development') {
    console.log('[Usage Tracker]', JSON.stringify(usageEntry));
  }

  // Save to file for monitoring script to read
  if (typeof window === 'undefined') {
    // Server-side only
    try {
      const fs = require('fs');
      const path = require('path');
      const logFile = path.join(process.cwd(), 'logs', 'ai-usage.log');
      const logDir = path.dirname(logFile);
      
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      fs.appendFileSync(logFile, JSON.stringify(usageEntry) + '\n');
    } catch (error) {
      // Ignore file system errors in production
      console.error('[Usage Tracker] Failed to save:', error);
    }
  }

  return usageEntry;
}

/**
 * Parse OpenAI API response to extract usage
 */
export function parseOpenAIUsage(response: any): {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
} {
  const usage = response.usage || {};
  return {
    promptTokens: usage.prompt_tokens || 0,
    completionTokens: usage.completion_tokens || 0,
    totalTokens: usage.total_tokens || 0,
  };
}

/**
 * Parse Anthropic API response to extract usage
 */
export function parseAnthropicUsage(response: any): {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
} {
  const usage = response.usage || {};
  return {
    promptTokens: usage.input_tokens || 0,
    completionTokens: usage.output_tokens || 0,
    totalTokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
  };
}

/**
 * Get daily usage summary
 */
export async function getDailyUsage(provider?: 'openai' | 'anthropic'): Promise<{
  count: number;
  totalCost: number;
  totalTokens: number;
}> {
  // This would read from database or log file
  // For now, return placeholder
  return {
    count: 0,
    totalCost: 0,
    totalTokens: 0,
  };
}

/**
 * Get monthly usage summary
 */
export async function getMonthlyUsage(provider?: 'openai' | 'anthropic'): Promise<{
  count: number;
  totalCost: number;
  totalTokens: number;
}> {
  // This would read from database or log file
  // For now, return placeholder
  return {
    count: 0,
    totalCost: 0,
    totalTokens: 0,
  };
}

