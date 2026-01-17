import { describe, it, expect } from "vitest";
import { isSafeReturnTo } from "@/lib/ai-astrology/returnToValidation";

describe("isSafeReturnTo", () => {
  it("allows valid /ai-astrology/* paths", () => {
    expect(isSafeReturnTo("/ai-astrology/preview")).toBe(true);
    expect(isSafeReturnTo("/ai-astrology/subscription")).toBe(true);
    expect(isSafeReturnTo("/ai-astrology/input")).toBe(true);
  });

  it("allows querystrings", () => {
    expect(isSafeReturnTo("/ai-astrology/preview?session_id=123")).toBe(true);
    expect(isSafeReturnTo("/ai-astrology/subscription?canceled=1")).toBe(true);
    expect(isSafeReturnTo("/ai-astrology/input?reportType=year-analysis")).toBe(true);
  });

  it("blocks external URLs", () => {
    expect(isSafeReturnTo("https://evil.com")).toBe(false);
    expect(isSafeReturnTo("http://evil.com")).toBe(false);
    expect(isSafeReturnTo("//evil.com")).toBe(false);
  });

  it("blocks protocol-relative URLs", () => {
    expect(isSafeReturnTo("//example.com/phishing")).toBe(false);
  });

  it("blocks encoded protocol variants", () => {
    expect(isSafeReturnTo("/ai-astrology/preview%3A%2F%2Fevil.com")).toBe(false);
    expect(isSafeReturnTo("/ai-astrology/preview%2F%2Fevil.com")).toBe(false);
  });

  it("blocks paths outside /ai-astrology/", () => {
    expect(isSafeReturnTo("/admin/sensitive")).toBe(false);
    expect(isSafeReturnTo("/api/secret")).toBe(false);
    expect(isSafeReturnTo("/")).toBe(false);
  });

  it("handles empty/null/undefined", () => {
    expect(isSafeReturnTo("")).toBe(false);
    expect(isSafeReturnTo(null as any)).toBe(false);
    expect(isSafeReturnTo(undefined as any)).toBe(false);
  });
});

