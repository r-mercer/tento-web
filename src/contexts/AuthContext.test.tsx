import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { authEvents } from "../utils/auth-events";
import { STORAGE_KEYS } from "../utils/constants";

const mockLogoutApi = vi.fn().mockResolvedValue(undefined);

vi.mock("../api/auth", async () => {
  const actual =
    await vi.importActual<typeof import("../api/auth")>("../api/auth");
  return {
    ...actual,
    logout: (refreshToken: string) => mockLogoutApi(refreshToken),
  };
});

vi.mock("../hooks/useInactivityTimeout", () => ({
  useInactivityTimeout: () => undefined,
}));

vi.mock("../hooks/useSessionValidation", () => ({
  useSessionValidation: () => undefined,
}));

function createJwt(expSecondsFromNow: number): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expSecondsFromNow }),
  );
  return `${header}.${payload}.sig`;
}

function AuthProbe() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      <div data-testid="auth-state">
        {isAuthenticated ? "authenticated" : "anonymous"}
      </div>
      <div data-testid="username">{user?.username ?? ""}</div>
      <button onClick={logout}>logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("AuthContext", () => {
  it("restores authenticated user from valid stored token", () => {
    window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, createJwt(3600));
    window.localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify({
        id: "user-1",
        username: "riley",
        email: "riley@example.com",
        role: "user",
      }),
    );

    renderWithProvider();

    expect(screen.getByTestId("auth-state")).toHaveTextContent("authenticated");
    expect(screen.getByTestId("username")).toHaveTextContent("riley");
  });

  it("clears auth state when session-expired event is emitted", () => {
    window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, createJwt(3600));
    window.localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify({
        id: "user-1",
        username: "riley",
        email: "riley@example.com",
        role: "user",
      }),
    );

    renderWithProvider();
    expect(screen.getByTestId("auth-state")).toHaveTextContent("authenticated");

    act(() => {
      authEvents.emit("session-expired", { reason: "test" });
    });

    expect(screen.getByTestId("auth-state")).toHaveTextContent("anonymous");
    expect(window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.USER)).toBeNull();
  });

  it("logs out and clears storage, calling logout API when refresh token exists", async () => {
    window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, createJwt(3600));
    window.localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, "refresh-123");
    window.localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify({
        id: "user-1",
        username: "riley",
        email: "riley@example.com",
        role: "user",
      }),
    );

    renderWithProvider();

    fireEvent.click(screen.getByRole("button", { name: "logout" }));

    expect(screen.getByTestId("auth-state")).toHaveTextContent("anonymous");
    expect(window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.USER)).toBeNull();
    expect(mockLogoutApi).toHaveBeenCalledWith("refresh-123");
  });
});
