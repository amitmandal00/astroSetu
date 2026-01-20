import { describe, it, expect } from "vitest";
import { parseEnvBoolean, calculateReportMode } from "@/lib/envParsing";

/**
 * Unit Tests for Environment Variable Parsing and Report Mode Calculation
 * 
 * Tests case-insensitive env parsing and mock/real mode selection logic
 */
describe("envParsing", () => {
  describe("parseEnvBoolean", () => {
    it("should parse 'true' (lowercase) as true", () => {
      expect(parseEnvBoolean("true")).toBe(true);
    });

    it("should parse 'TRUE' (uppercase) as true", () => {
      expect(parseEnvBoolean("TRUE")).toBe(true);
    });

    it("should parse 'True' (mixed case) as true", () => {
      expect(parseEnvBoolean("True")).toBe(true);
    });

    it("should parse '1' as true", () => {
      expect(parseEnvBoolean("1")).toBe(true);
    });

    it("should parse 'false' as false", () => {
      expect(parseEnvBoolean("false")).toBe(false);
    });

    it("should parse 'FALSE' as false", () => {
      expect(parseEnvBoolean("FALSE")).toBe(false);
    });

    it("should parse '0' as false", () => {
      expect(parseEnvBoolean("0")).toBe(false);
    });

    it("should parse undefined as false", () => {
      expect(parseEnvBoolean(undefined)).toBe(false);
    });

    it("should parse empty string as false", () => {
      expect(parseEnvBoolean("")).toBe(false);
    });

    it("should parse whitespace-trimmed 'true' as true", () => {
      expect(parseEnvBoolean("  true  ")).toBe(true);
      expect(parseEnvBoolean("  TRUE  ")).toBe(true);
    });

    it("should parse arbitrary strings as false", () => {
      expect(parseEnvBoolean("yes")).toBe(false);
      expect(parseEnvBoolean("on")).toBe(false);
      expect(parseEnvBoolean("enabled")).toBe(false);
      expect(parseEnvBoolean("random text")).toBe(false);
    });
  });

  describe("calculateReportMode", () => {
    describe("MOCK_MODE override", () => {
      it("should use mock mode when MOCK_MODE=true, even for test users", () => {
        const result = calculateReportMode({
          isTestSession: false,
          isTestUserForAccess: true,
          forceRealMode: false,
          allowRealForTestSessions: false,
          mockModeEnv: true,
          forceRealReportsEnv: false,
        });
        expect(result.mockMode).toBe(true);
        expect(result.shouldUseRealMode).toBe(false);
      });

      it("should use mock mode when MOCK_MODE=true, even for test sessions", () => {
        const result = calculateReportMode({
          isTestSession: true,
          isTestUserForAccess: false,
          forceRealMode: false,
          allowRealForTestSessions: true,
          mockModeEnv: true,
          forceRealReportsEnv: false,
        });
        expect(result.mockMode).toBe(true);
        expect(result.shouldUseRealMode).toBe(false);
      });
    });

    describe("Test user priority", () => {
      it("should use real mode for test users even with test_session_*", () => {
        const result = calculateReportMode({
          isTestSession: true,
          isTestUserForAccess: true,
          forceRealMode: false,
          allowRealForTestSessions: false,
          mockModeEnv: false,
          forceRealReportsEnv: false,
        });
        expect(result.shouldUseRealMode).toBe(true);
        expect(result.mockMode).toBe(false);
      });

      it("should use real mode for test users without test_session_*", () => {
        const result = calculateReportMode({
          isTestSession: false,
          isTestUserForAccess: true,
          forceRealMode: false,
          allowRealForTestSessions: false,
          mockModeEnv: false,
          forceRealReportsEnv: false,
        });
        expect(result.shouldUseRealMode).toBe(true);
        expect(result.mockMode).toBe(false);
      });

      it("should NOT use real mode for test users if MOCK_MODE=true", () => {
        const result = calculateReportMode({
          isTestSession: true,
          isTestUserForAccess: true,
          forceRealMode: false,
          allowRealForTestSessions: false,
          mockModeEnv: true,
          forceRealReportsEnv: false,
        });
        expect(result.shouldUseRealMode).toBe(false);
        expect(result.mockMode).toBe(true);
      });
    });

    describe("Test session behavior", () => {
      it("should use mock mode for test sessions when ALLOW_REAL_FOR_TEST_SESSIONS=false", () => {
        const result = calculateReportMode({
          isTestSession: true,
          isTestUserForAccess: false,
          forceRealMode: false,
          allowRealForTestSessions: false,
          mockModeEnv: false,
          forceRealReportsEnv: false,
        });
        expect(result.shouldUseRealMode).toBe(false);
        expect(result.mockMode).toBe(true);
      });

      it("should use real mode for test sessions when ALLOW_REAL_FOR_TEST_SESSIONS=true", () => {
        const result = calculateReportMode({
          isTestSession: true,
          isTestUserForAccess: false,
          forceRealMode: false,
          allowRealForTestSessions: true,
          mockModeEnv: false,
          forceRealReportsEnv: false,
        });
        expect(result.shouldUseRealMode).toBe(true);
        expect(result.mockMode).toBe(false);
      });
    });

    describe("forceRealMode", () => {
      it("should use real mode when forceRealMode=true", () => {
        const result = calculateReportMode({
          isTestSession: true,
          isTestUserForAccess: false,
          forceRealMode: true,
          allowRealForTestSessions: false,
          mockModeEnv: false,
          forceRealReportsEnv: false,
        });
        expect(result.shouldUseRealMode).toBe(true);
        expect(result.mockMode).toBe(false);
      });

      it("should override MOCK_MODE when forceRealMode=true", () => {
        const result = calculateReportMode({
          isTestSession: true,
          isTestUserForAccess: false,
          forceRealMode: true,
          allowRealForTestSessions: false,
          mockModeEnv: true,
          forceRealReportsEnv: false,
        });
        // forceRealMode sets shouldUseRealMode=true, but MOCK_MODE still overrides
        expect(result.shouldUseRealMode).toBe(true);
        expect(result.mockMode).toBe(true); // MOCK_MODE still wins
      });
    });

    describe("FORCE_REAL_REPORTS", () => {
      it("should use real mode when FORCE_REAL_REPORTS=true", () => {
        const result = calculateReportMode({
          isTestSession: true,
          isTestUserForAccess: false,
          forceRealMode: false,
          allowRealForTestSessions: false,
          mockModeEnv: false,
          forceRealReportsEnv: true,
        });
        expect(result.shouldUseRealMode).toBe(true);
        expect(result.mockMode).toBe(false);
      });
    });

    describe("Normal users (non-test)", () => {
      it("should use real mode for normal users without test_session_*", () => {
        const result = calculateReportMode({
          isTestSession: false,
          isTestUserForAccess: false,
          forceRealMode: false,
          allowRealForTestSessions: false,
          mockModeEnv: false,
          forceRealReportsEnv: false,
        });
        expect(result.shouldUseRealMode).toBe(false);
        expect(result.mockMode).toBe(false); // Normal users get real mode by default
      });
    });

    describe("Combined scenarios", () => {
      it("should prioritize test user over test session", () => {
        const result = calculateReportMode({
          isTestSession: true,
          isTestUserForAccess: true,
          forceRealMode: false,
          allowRealForTestSessions: false,
          mockModeEnv: false,
          forceRealReportsEnv: false,
        });
        expect(result.shouldUseRealMode).toBe(true);
        expect(result.mockMode).toBe(false);
      });

      it("should handle multiple real mode flags", () => {
        const result = calculateReportMode({
          isTestSession: true,
          isTestUserForAccess: true,
          forceRealMode: true,
          allowRealForTestSessions: true,
          mockModeEnv: false,
          forceRealReportsEnv: true,
        });
        expect(result.shouldUseRealMode).toBe(true);
        expect(result.mockMode).toBe(false);
      });
    });
  });
});

