/**
 * Circuit Breaker Pattern Implementation
 * Automatically switches to fallback after N failures
 * Attempts recovery after cooldown period
 */

export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening circuit
  successThreshold: number; // Number of successes in half-open to close circuit
  timeout: number; // Time in ms to wait before attempting recovery (half-open state)
  resetTimeout: number; // Time in ms before resetting failure count
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  nextAttemptTime: number | null;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5, // Open circuit after 5 failures
  successThreshold: 2, // Close circuit after 2 successes in half-open
  timeout: 60000, // Wait 60 seconds before attempting recovery
  resetTimeout: 300000, // Reset failure count after 5 minutes of no failures
};

class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private nextAttemptTime: number | null = null;
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    // Check if we should attempt the operation
    const currentState = this.state;
    if (currentState === "open") {
      const now = Date.now();
      
      // Check if cooldown period has passed
      if (this.nextAttemptTime && now >= this.nextAttemptTime) {
        this.state = "half-open";
        this.successes = 0;
        console.log("[CircuitBreaker] Moving to half-open state, attempting recovery");
      } else {
        // Circuit is open, use fallback if available
        if (fallback) {
          console.log("[CircuitBreaker] Circuit is open, using fallback");
          return fallback();
        }
        throw new Error("Circuit breaker is open. Service unavailable.");
      }
    }

    try {
      // Execute the function
      const result = await fn();
      
      // Success - update state
      this.onSuccess();
      return result;
    } catch (error) {
      // Failure - update state (this may open the circuit)
      const previousState = this.state;
      this.onFailure();
      
      // Check if circuit is now open and we have a fallback
      // Read state again after onFailure to get updated state
      const newState = this.state;
      if (newState === "open" && fallback && previousState !== "open") {
        console.log("[CircuitBreaker] Circuit opened after failure, using fallback");
        try {
          return await fallback();
        } catch (fallbackError) {
          // If fallback also fails, re-throw original error
          throw error;
        }
      }
      
      // Re-throw the error
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.lastSuccessTime = Date.now();

    if (this.state === "half-open") {
      this.successes++;
      console.log(`[CircuitBreaker] Half-open success (${this.successes}/${this.config.successThreshold})`);
      
      // If we've had enough successes, close the circuit
      if (this.successes >= this.config.successThreshold) {
        this.state = "closed";
        this.failures = 0;
        this.nextAttemptTime = null;
        console.log("[CircuitBreaker] Circuit closed after successful recovery");
      }
    } else if (this.state === "closed") {
      // Reset failure count if we've had a long period of success
      if (this.lastFailureTime) {
        const timeSinceLastFailure = Date.now() - this.lastFailureTime;
        if (timeSinceLastFailure > this.config.resetTimeout) {
          this.failures = 0;
          this.lastFailureTime = null;
        }
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    console.log(`[CircuitBreaker] Failure recorded (${this.failures}/${this.config.failureThreshold})`);

    if (this.state === "half-open") {
      // Any failure in half-open state immediately opens the circuit
      this.state = "open";
      this.nextAttemptTime = Date.now() + this.config.timeout;
      console.log("[CircuitBreaker] Circuit opened after failure in half-open state");
    } else if (this.state === "closed" && this.failures >= this.config.failureThreshold) {
      // Too many failures, open the circuit
      this.state = "open";
      this.nextAttemptTime = Date.now() + this.config.timeout;
      console.log("[CircuitBreaker] Circuit opened after reaching failure threshold");
    }
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      nextAttemptTime: this.nextAttemptTime,
    };
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.state = "closed";
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.nextAttemptTime = null;
    console.log("[CircuitBreaker] Circuit breaker manually reset");
  }

  /**
   * Check if circuit is open (service unavailable)
   */
  isOpen(): boolean {
    return this.state === "open";
  }

  /**
   * Check if circuit is closed (service available)
   */
  isClosed(): boolean {
    return this.state === "closed";
  }
}

// Circuit breakers for different services
const circuitBreakers = new Map<string, CircuitBreaker>();

/**
 * Get or create a circuit breaker for a service
 */
export function getCircuitBreaker(
  serviceName: string,
  config?: Partial<CircuitBreakerConfig>
): CircuitBreaker {
  if (!circuitBreakers.has(serviceName)) {
    circuitBreakers.set(serviceName, new CircuitBreaker(config));
  }
  return circuitBreakers.get(serviceName)!;
}

/**
 * Execute a function with circuit breaker protection
 */
export async function withCircuitBreaker<T>(
  serviceName: string,
  fn: () => Promise<T>,
  fallback?: () => Promise<T>,
  config?: Partial<CircuitBreakerConfig>
): Promise<T> {
  const breaker = getCircuitBreaker(serviceName, config);
  return breaker.execute(fn, fallback);
}

/**
 * Get circuit breaker statistics for all services
 */
export function getAllCircuitBreakerStats(): Record<string, CircuitBreakerStats> {
  const stats: Record<string, CircuitBreakerStats> = {};
  circuitBreakers.forEach((breaker, serviceName) => {
    stats[serviceName] = breaker.getStats();
  });
  return stats;
}

/**
 * Reset all circuit breakers (useful for testing or manual recovery)
 */
export function resetAllCircuitBreakers(): void {
  circuitBreakers.forEach((breaker) => breaker.reset());
}

