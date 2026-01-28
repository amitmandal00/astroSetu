/**
 * API Batch Request Handler
 * Groups multiple API calls together to reduce network overhead
 * Inspired by AstroSage batch optimization patterns
 */

type PendingRequest<T> = {
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  timestamp: number;
};

type BatchConfig = {
  maxWaitTime: number; // Max time to wait for batching (ms)
  maxBatchSize: number; // Max requests per batch
};

// Pending request queues per endpoint
const pendingRequests = new Map<string, PendingRequest<any>[]>();
const batchTimers = new Map<string, NodeJS.Timeout>();

const DEFAULT_CONFIG: BatchConfig = {
  maxWaitTime: 50, // 50ms - quick enough for UX
  maxBatchSize: 5, // Batch up to 5 similar requests
};

/**
 * Batch API requests together
 * Similar requests within a short window are batched
 */
export async function batchRequest<T>(
  endpoint: string,
  params: Record<string, any>,
  requestFn: (params: Record<string, any>) => Promise<T>,
  config: Partial<BatchConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // For now, return immediately - batching can be added later if needed
  // This is a placeholder for future optimization
  return requestFn(params);
  
  // Future implementation:
  // 1. Check if there are pending requests for this endpoint
  // 2. If yes, add to batch and wait
  // 3. If no, create new batch and set timer
  // 4. When timer fires or batch is full, execute all at once
  // 5. Resolve all promises with results
}

/**
 * Request deduplication
 * Prevents duplicate API calls for the same parameters
 */
const inFlightRequests = new Map<string, Promise<any>>();

export async function deduplicateRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  // Check if request is already in flight
  const existing = inFlightRequests.get(key);
  if (existing) {
    console.log(`[API] Deduplicating request: ${key}`);
    return existing;
  }
  
  // Create new request
  const promise = requestFn().finally(() => {
    // Remove from in-flight after completion
    inFlightRequests.delete(key);
  });
  
  inFlightRequests.set(key, promise);
  return promise;
}

/**
 * Clear in-flight requests (for testing/debugging)
 */
export function clearInFlightRequests(): void {
  inFlightRequests.clear();
}

/**
 * Get in-flight request count
 */
export function getInFlightCount(): number {
  return inFlightRequests.size;
}

