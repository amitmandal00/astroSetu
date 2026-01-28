import { describe, it, expect } from "vitest";
import {
  normalizeName,
  normalizeDOB,
  normalizeTime,
  normalizePlace,
  normalizeGender,
  matchAllowlist,
} from "@/lib/betaAccess";

/**
 * Unit Tests for Beta Access Normalization and Matching
 * 
 * Tests server-only normalization functions and allowlist matching
 */
describe("betaAccess", () => {
  describe("normalizeName", () => {
    it("should lowercase and collapse spaces", () => {
      expect(normalizeName("Amit Kumar Mandal")).toBe("amit kumar mandal");
      expect(normalizeName("  Ankita   Surabhi  ")).toBe("ankita surabhi");
      expect(normalizeName("TEST USER")).toBe("test user");
    });
  });

  describe("normalizeDOB", () => {
    it("should accept YYYY-MM-DD format", () => {
      expect(normalizeDOB("1984-11-26")).toBe("1984-11-26");
      expect(normalizeDOB("1988-07-01")).toBe("1988-07-01");
    });

    it("should parse dd mon yyyy format", () => {
      expect(normalizeDOB("26 Nov 1984")).toBe("1984-11-26");
      expect(normalizeDOB("01 Jul 1988")).toBe("1988-07-01");
      expect(normalizeDOB("26 november 1984")).toBe("1984-11-26");
    });

    it("should parse Date object", () => {
      expect(normalizeDOB("November 26, 1984")).toBeTruthy();
      expect(normalizeDOB("1984/11/26")).toBeTruthy();
    });

    it("should return null for invalid input", () => {
      expect(normalizeDOB("invalid")).toBeNull();
      expect(normalizeDOB("")).toBeNull();
    });
  });

  describe("normalizeTime", () => {
    it("should accept 24h format", () => {
      expect(normalizeTime("21:40")).toBe("21:40");
      expect(normalizeTime("17:58")).toBe("17:58");
      expect(normalizeTime("9:40")).toBe("09:40");
    });

    it("should parse 12h format with am/pm", () => {
      expect(normalizeTime("09:40 pm")).toBe("21:40");
      expect(normalizeTime("05:58 pm")).toBe("17:58");
      expect(normalizeTime("9:40 PM")).toBe("21:40");
      expect(normalizeTime("09:40am")).toBe("09:40");
      expect(normalizeTime("12:00 am")).toBe("00:00");
      expect(normalizeTime("12:00 pm")).toBe("12:00");
    });

    it("should return null for invalid input", () => {
      expect(normalizeTime("invalid")).toBeNull();
      expect(normalizeTime("25:00")).toBeNull();
    });
  });

  describe("normalizePlace", () => {
    it("should lowercase and collapse spaces", () => {
      expect(normalizePlace("Noamundi, Jharkhand")).toBe("noamundi, jharkhand");
      expect(normalizePlace("  Ranchi,   Jharkhand  ")).toBe("ranchi, jharkhand");
      expect(normalizePlace("Noamundi, Jharkhand, India")).toBe("noamundi, jharkhand, india");
    });
  });

  describe("normalizeGender", () => {
    it("should accept Male/Female", () => {
      expect(normalizeGender("Male")).toBe("Male");
      expect(normalizeGender("Female")).toBe("Female");
      expect(normalizeGender("male")).toBe("Male");
      expect(normalizeGender("female")).toBe("Female");
      expect(normalizeGender("M")).toBe("Male");
      expect(normalizeGender("F")).toBe("Female");
    });

    it("should return null for invalid input", () => {
      expect(normalizeGender("invalid")).toBeNull();
      expect(normalizeGender("")).toBeNull();
    });
  });

  describe("matchAllowlist", () => {
    it("should match Amit Kumar Mandal with exact details", () => {
      const input = {
        name: "Amit Kumar Mandal",
        dob: "26 Nov 1984",
        time: "09:40 pm",
        place: "Noamundi, Jharkhand",
        gender: "Male",
      };

      expect(matchAllowlist(input)).toBe(true);
    });

    it("should match Amit Kumar Mandal with different formats", () => {
      const input = {
        name: "amit kumar mandal",
        dob: "1984-11-26",
        time: "21:40",
        place: "Noamundi, Jharkhand, India",
        gender: "Male",
      };

      expect(matchAllowlist(input)).toBe(true);
    });

    it("should match Ankita Surabhi with exact details", () => {
      const input = {
        name: "Ankita Surabhi",
        dob: "01 Jul 1988",
        time: "05:58 pm",
        place: "Ranchi, Jharkhand",
        gender: "Female",
      };

      expect(matchAllowlist(input)).toBe(true);
    });

    it("should match Ankita Surabhi with different formats", () => {
      const input = {
        name: "ANKITA SURABHI",
        dob: "1988-07-01",
        time: "17:58",
        place: "Ranchi, Jharkhand, India",
        gender: "Female",
      };

      expect(matchAllowlist(input)).toBe(true);
    });

    it("should NOT match invalid user", () => {
      const input = {
        name: "Test User",
        dob: "01 Jan 1990",
        time: "12:00 pm",
        place: "Delhi",
        gender: "Male",
      };

      expect(matchAllowlist(input)).toBe(false);
    });

    it("should NOT match with wrong DOB", () => {
      const input = {
        name: "Amit Kumar Mandal",
        dob: "27 Nov 1984", // Wrong day
        time: "09:40 pm",
        place: "Noamundi, Jharkhand",
        gender: "Male",
      };

      expect(matchAllowlist(input)).toBe(false);
    });

    it("should NOT match with wrong time", () => {
      const input = {
        name: "Amit Kumar Mandal",
        dob: "26 Nov 1984",
        time: "10:40 pm", // Wrong time
        place: "Noamundi, Jharkhand",
        gender: "Male",
      };

      expect(matchAllowlist(input)).toBe(false);
    });

    it("should NOT match with wrong place", () => {
      const input = {
        name: "Amit Kumar Mandal",
        dob: "26 Nov 1984",
        time: "09:40 pm",
        place: "Delhi", // Wrong place
        gender: "Male",
      };

      expect(matchAllowlist(input)).toBe(false);
    });

    it("should NOT match with wrong gender", () => {
      const input = {
        name: "Amit Kumar Mandal",
        dob: "26 Nov 1984",
        time: "09:40 pm",
        place: "Noamundi, Jharkhand",
        gender: "Female", // Wrong gender
      };

      expect(matchAllowlist(input)).toBe(false);
    });
  });
});

