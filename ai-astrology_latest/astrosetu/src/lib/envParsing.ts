/**
 * Environment Variable Parsing Utilities
 * Case-insensitive parsing for boolean environment variables
 * 
 * Treats "true", "TRUE", "True", "1" as true
 * All other values (including undefined, "false", "0", "") are treated as false
 */

/**
 * Case-insensitive environment variable parser
 * Treats "true", "TRUE", "True", "1" as true
 * All other values (including undefined, "false", "0", "") are treated as false
 * 
 * @param envVar - Environment variable value (string | undefined)
 * @returns true if envVar is "true" or "1" (case-insensitive), false otherwise
 */
export function parseEnvBoolean(envVar: string | undefined, defaultValue = false): boolean {
  if (envVar === undefined || envVar === null) return defaultValue;
  const normalized = String(envVar).toLowerCase().trim();
  return normalized === "true" || normalized === "1";
}

/**
 * Calculate mock mode based on test session, test user, and environment variables
 * 
 * Rules:
 * 1. If isTestUserForAccess === true (prod test user), default to REAL mode even for test_session_*
 *    unless MOCK_MODE is explicitly true (allows override for explicit testing)
 * 2. For non-test-users with test_session_*: use mock unless ALLOW_REAL_FOR_TEST_SESSIONS=true
 * 3. MOCK_MODE=true overrides everything (explicit dev/demo mode)
 * 4. Environment variables are parsed case-insensitively (true/TRUE/True/1 all work)
 * 
 * @param params - Configuration parameters
 * @returns Object with shouldUseRealMode and mockMode flags
 */
export function calculateReportMode(params: {
  isTestSession: boolean;
  isTestUserForAccess: boolean;
  forceRealMode: boolean;
  allowRealForTestSessions: boolean;
  mockModeEnv: boolean;
  forceRealReportsEnv: boolean;
}): {
  shouldUseRealMode: boolean;
  mockMode: boolean;
} {
  const {
    isTestSession,
    isTestUserForAccess,
    forceRealMode,
    allowRealForTestSessions,
    mockModeEnv,
    forceRealReportsEnv,
  } = params;

  // Rule 1: MOCK_MODE=true overrides everything (highest priority)
  if (mockModeEnv) {
    return { shouldUseRealMode: false, mockMode: true };
  }

  // Rule 2: Test users (isTestUserForAccess) should get REAL reports by default
  // This aligns with the goal: "only prod test users can access reports/payments" → they should get real reports
  // This takes priority over test_session_* detection
  if (isTestUserForAccess) {
    return { shouldUseRealMode: true, mockMode: false };
  }

  // Rule 3: forceRealMode (from request body/query) always forces real mode
  if (forceRealMode) {
    return { shouldUseRealMode: true, mockMode: false };
  }

  // Rule 4: For test sessions (test_session_*), use mock unless ALLOW_REAL_FOR_TEST_SESSIONS=true
  if (isTestSession) {
    if (allowRealForTestSessions) {
      return { shouldUseRealMode: true, mockMode: false };
    } else {
      return { shouldUseRealMode: false, mockMode: true };
    }
  }

  // Rule 5: FORCE_REAL_REPORTS env var (global override for non-test sessions/users)
  if (forceRealReportsEnv) {
    return { shouldUseRealMode: true, mockMode: false };
  }

  // Default: real mode if none of the mock conditions are met
  return { shouldUseRealMode: true, mockMode: false };
}

