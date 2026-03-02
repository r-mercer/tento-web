import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { storage } from "../utils/storage";

function Probe() {
  const { user, isAuthenticated } = useAuth();
  return (
    <div>
      <div data-testid="auth">{isAuthenticated ? "auth" : "anon"}</div>
      <div data-testid="role">{user?.role ?? "none"}</div>
    </div>
  );
}

function renderWithAuth() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("AuthContext role handling", () => {
  beforeEach(() => {
    storage.clear();
    vi.clearAllMocks();
  });

  it("starts anonymous when no token", () => {
    renderWithAuth();
    expect(screen.getByTestId("auth")).toHaveTextContent("anon");
    expect(screen.getByTestId("role")).toHaveTextContent("none");
  });

  it("restores admin role from storage", () => {
    // construct a simple unsigned JWT with a future exp so the provider treats it as valid
    const futureExp = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now
    const header = JSON.stringify({ alg: "none", typ: "JWT" });
    const payload = JSON.stringify({ exp: futureExp });
    const toBase64Url = (str: string) =>
      Buffer.from(str)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    const token = `${toBase64Url(header)}.${toBase64Url(payload)}.`;
    storage.setTokens(token, "refresh");
    storage.setUser({
      id: "1",
      username: "admin",
      email: "admin@example.com",
      role: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    renderWithAuth();

    expect(screen.getByTestId("auth")).toHaveTextContent("auth");
    expect(screen.getByTestId("role")).toHaveTextContent("admin");
  });
});
