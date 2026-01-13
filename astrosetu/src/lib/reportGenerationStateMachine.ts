/**
 * Report Generation State Machine
 * 
 * Defines explicit states and legal transitions for report generation.
 * Prevents invalid state changes and race conditions.
 */

export type ReportGenerationStatus =
  | 'idle'
  | 'verifying'
  | 'generating'
  | 'polling'
  | 'completed'
  | 'failed'
  | 'timeout';

export interface ReportGenerationState {
  status: ReportGenerationStatus;
  reportId: string | null;
  error: string | null;
  startTime: number | null;
}

/**
 * Legal state transitions
 */
const LEGAL_TRANSITIONS: Record<ReportGenerationStatus, ReportGenerationStatus[]> = {
  idle: ['verifying', 'generating', 'idle'], // Allow idle->idle for reset
  verifying: ['generating', 'polling', 'completed', 'failed', 'timeout'], // Allow verifying->completed for immediate completion
  generating: ['polling', 'completed', 'failed', 'timeout'],
  polling: ['completed', 'failed', 'timeout'],
  completed: ['idle'], // Can only go to idle (user action required to retry)
  failed: ['idle'], // Can only go to idle (user action required to retry)
  timeout: ['idle'], // Can only go to idle (user action required to retry)
};

/**
 * Check if a state transition is legal
 */
export function isLegalTransition(
  from: ReportGenerationStatus,
  to: ReportGenerationStatus
): boolean {
  return LEGAL_TRANSITIONS[from].includes(to);
}

/**
 * Create initial state
 */
export function createInitialState(): ReportGenerationState {
  return {
    status: 'idle',
    reportId: null,
    error: null,
    startTime: null,
  };
}

/**
 * Transition to a new state (with validation)
 */
export function transitionState(
  currentState: ReportGenerationState,
  newStatus: ReportGenerationStatus,
  updates?: Partial<Omit<ReportGenerationState, 'status'>>
): ReportGenerationState {
  // Validate transition
  if (!isLegalTransition(currentState.status, newStatus)) {
    console.warn(
      `[STATE MACHINE] Illegal transition from ${currentState.status} to ${newStatus}`
    );
    return currentState; // Don't transition
  }

  return {
    ...currentState,
    status: newStatus,
    ...updates,
  };
}

