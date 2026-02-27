import { describe, expect, it, vi } from "vitest";
import {
  decodeJWT,
  getTimeUntilExpiry,
  getTokenExpiration,
  isTokenExpired,
} from "./jwt";

function createJwt(expSecondsFromNow: number): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expSecondsFromNow }),
  );
  return `${header}.${payload}.sig`;
}

describe("jwt utils", () => {
  it("decodes valid jwt payload", () => {
    const token = createJwt(3600);

    const decoded = decodeJWT(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.exp).toBeTypeOf("number");
  });

  it("returns null for invalid jwt", () => {
    expect(decodeJWT("not-a-jwt")).toBeNull();
  });

  it("computes expiration in milliseconds", () => {
    const token = createJwt(3600);

    const expiration = getTokenExpiration(token);

    expect(expiration).not.toBeNull();
    expect(expiration).toBeGreaterThan(Date.now());
  });

  it("treats malformed token as expired", () => {
    expect(isTokenExpired("invalid")).toBe(true);
  });

  it("respects expiration buffer", () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
    const expSeconds = Math.floor((Date.now() + 5000) / 1000);
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ exp: expSeconds }));
    const token = `${header}.${payload}.sig`;

    expect(isTokenExpired(token, 6000)).toBe(true);
    expect(isTokenExpired(token, 1000)).toBe(false);

    nowSpy.mockRestore();
  });

  it("returns non-negative time until expiry", () => {
    const token = createJwt(1);
    expect(getTimeUntilExpiry(token)).toBeGreaterThanOrEqual(0);
    expect(getTimeUntilExpiry("invalid")).toBe(0);
  });
});
