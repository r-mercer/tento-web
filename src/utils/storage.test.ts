import { describe, expect, it } from "vitest";
import { storage } from "./storage";
import { STORAGE_KEYS } from "./constants";

function createJwt(expSecondsFromNow: number): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expSecondsFromNow }),
  );
  return `${header}.${payload}.sig`;
}

describe("storage utils", () => {
  it("stores and retrieves access token", () => {
    storage.setAccessToken("access-123");

    expect(storage.getAccessToken()).toBe("access-123");
  });

  it("stores token expiration when jwt has exp", () => {
    storage.setAccessToken(createJwt(3600));

    const tokenExpiration = storage.getTokenExpiration();
    expect(tokenExpiration).not.toBeNull();
    expect(tokenExpiration).toBeGreaterThan(Date.now());
  });

  it("stores and retrieves refresh token", () => {
    storage.setRefreshToken("refresh-123");

    expect(storage.getRefreshToken()).toBe("refresh-123");
  });

  it("stores and parses user payload", () => {
    const user = {
      id: "user-1",
      username: "riley",
      email: "riley@example.com",
      role: "user",
    };

    storage.setUser(user);

    expect(storage.getUser<typeof user>()).toEqual(user);
  });

  it("returns null for malformed user JSON", () => {
    window.localStorage.setItem(STORAGE_KEYS.USER, "{bad-json");

    expect(storage.getUser()).toBeNull();
  });

  it("clear removes auth and user storage", () => {
    storage.setTokens("access-123", "refresh-123");
    storage.setUser({ id: "user-1" });

    storage.clear();

    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
    expect(storage.getUser()).toBeNull();
    expect(storage.getTokenExpiration()).toBeNull();
  });
});
