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
export function parseEnvBoolean(envVar: string | undefined): boolean {
  if (!envVar) return false;
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

  // CRITICAL: Test users (isTestUserForAccess) should get REAL reports by default
  // This aligns with the goal: "only prod test users can access reports/payments" → they should get real reports
  // MOCK_MODE can still override if explicitly set to true (for explicit testing scenarios)
  const shouldUseRealModeForTestUser = isTestUserForAccess && !mockModeEnv;

  // Calculate shouldUseRealMode: forceRealMode OR env var OR test user priority
  const shouldUseRealMode =
    forceRealMode ||
    allowRealForTestSessions ||
    forceRealReportsEnv ||
    shouldUseRealModeForTestUser;

  // Calculate mockMode:
  // - If MOCK_MODE is explicitly true → always mock
  // - If test session AND not using real mode → mock
  // - Otherwise → real mode
  const mockMode = mockModeEnv || (isTestSession && !shouldUseRealMode);

  return {
    shouldUseRealMode,
    mockMode,
  };
}

