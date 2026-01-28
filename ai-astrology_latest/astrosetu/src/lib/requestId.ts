/**
 * Request ID Generation
 * Generates unique request IDs for tracking and logging
 */

let requestCounter = 0;

export function generateRequestId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  requestCounter = (requestCounter + 1) % 1000000;
  return `req-${timestamp}-${random}-${requestCounter.toString().padStart(6, '0')}`;
}

