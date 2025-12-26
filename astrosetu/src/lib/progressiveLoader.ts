/**
 * Progressive Loading Utilities
 * Show basic info first, then load detailed data progressively
 * Inspired by AstroSage/AstroTalk UX patterns
 */

export type ProgressiveResult<T, P = Partial<T>> = {
  basic: P; // Quick preview data
  full: T;  // Complete data
  isComplete: boolean;
};

/**
 * Create a progressive loader that returns basic data immediately
 * and then enhances it with full data
 */
export async function createProgressiveLoader<T, P extends Partial<T>>(
  basicData: P | (() => Promise<P>),
  fullDataLoader: () => Promise<T>,
  mergeFn?: (basic: P, full: T) => T
): Promise<ProgressiveResult<T, P>> {
  // Get basic data (sync or async)
  const basic = typeof basicData === 'function' 
    ? await basicData() 
    : basicData;

  // Load full data in background
  const fullPromise = fullDataLoader();

  // Return immediately with basic data
  const result: ProgressiveResult<T, P> = {
    basic,
    full: basic as T, // Initial state - basic data as full
    isComplete: false,
  };

  // Enhance with full data when ready
  fullPromise
    .then((full) => {
      result.full = mergeFn ? mergeFn(basic, full) : full;
      result.isComplete = true;
    })
    .catch((error) => {
      console.error('[ProgressiveLoader] Failed to load full data:', error);
      // Keep basic data on error
    });

  return result;
}

/**
 * Stream progressive updates
 */
export class ProgressiveStream<T> {
  private basicData: Partial<T> | null = null;
  private fullData: T | null = null;
  private listeners: Array<(data: Partial<T> | T, isComplete: boolean) => void> = [];
  private isLoading = false;

  async load(
    basicLoader: () => Promise<Partial<T>>,
    fullLoader: () => Promise<T>
  ): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      // Load basic data first
      this.basicData = await basicLoader();
      this.notify(this.basicData, false);

      // Load full data
      this.fullData = await fullLoader();
      this.notify(this.fullData, true);
    } catch (error) {
      console.error('[ProgressiveStream] Load error:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  subscribe(listener: (data: Partial<T> | T, isComplete: boolean) => void): () => void {
    this.listeners.push(listener);

    // Send current data if available
    if (this.basicData) {
      listener(this.basicData, !this.fullData);
    }
    if (this.fullData) {
      listener(this.fullData, true);
    }

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(data: Partial<T> | T, isComplete: boolean): void {
    this.listeners.forEach(listener => {
      try {
        listener(data, isComplete);
      } catch (error) {
        console.error('[ProgressiveStream] Listener error:', error);
      }
    });
  }

  getCurrent(): Partial<T> | T | null {
    return this.fullData || this.basicData;
  }

  isComplete(): boolean {
    return this.fullData !== null;
  }
}

