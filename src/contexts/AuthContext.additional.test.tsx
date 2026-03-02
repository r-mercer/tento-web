import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
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

// Test component with login capability
function AuthProbeWithLogin() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogin = () => {
    login("access-token", "refresh-token", {
      id: "new-user",
      username: "newuser",
      email: "new@example.com",
      role: "admin",
    });
  };

  return (
    <div>
      <div data-testid="auth-state">
        {isAuthenticated ? "authenticated" : "anonymous"}
      </div>
      <div data-testid="username">{user?.username ?? ""}</div>
      <div data-testid="email">{user?.email ?? ""}</div>
      <div data-testid="role">{user?.role ?? ""}</div>
      <div data-testid="user-id">{user?.id ?? ""}</div>
      <button onClick={handleLogin}>login</button>
      <button onClick={logout} disabled={!isAuthenticated}>
        logout
      </button>
    </div>
  );
}

// Test component that expects useAuth to throw when outside provider
function AuthProbeOutsideProvider() {
  try {
    useAuth();
    return <div data-testid="error">Should have thrown</div>;
  } catch (error) {
    return <div data-testid="error">{error instanceof Error ? error.message : "Error"}</div>;
  }
}

function renderWithProvider() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AuthProbeWithLogin />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("AuthContext - Additional Tests", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  describe("login function", () => {
    it("sets tokens and user data on login", () => {
      renderWithProvider();

      expect(screen.getByTestId("auth-state")).toHaveTextContent("anonymous");

      fireEvent.click(screen.getByRole("button", { name: "login" }));

      expect(screen.getByTestId("auth-state")).toHaveTextContent("authenticated");
      expect(screen.getByTestId("username")).toHaveTextContent("newuser");
      expect(screen.getByTestId("email")).toHaveTextContent("new@example.com");
      expect(screen.getByTestId("role")).toHaveTextContent("admin");
      expect(screen.getByTestId("user-id")).toHaveTextContent("new-user");

      // Verify storage
      expect(window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe("access-token");
      expect(window.localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBe("refresh-token");
      expect(window.localStorage.getItem(STORAGE_KEYS.USER)).toContain("newuser");
    });

    it("handles partial user data with defaults when only required fields provided", () => {
      // Directly test login function with minimal data
      const TestProbeWithPartialLogin = () => {
        const { login, user } = useAuth();
        
        const handleLogin = () => {
          login("token", "refresh", { id: "1" }); // Only id provided
        };
        
        return (
          <div>
            <div data-testid="username">{user?.username ?? ""}</div>
            <div data-testid="role">{user?.role ?? ""}</div>
            <button onClick={handleLogin}>partial-login</button>
          </div>
        );
      };
      
      render(
        <MemoryRouter>
          <AuthProvider>
            <TestProbeWithPartialLogin />
          </AuthProvider>
        </MemoryRouter>,
      );
      
      fireEvent.click(screen.getByRole("button", { name: "partial-login" }));
      
      // Should use defaults for missing fields
      expect(screen.getByTestId("username")).toHaveTextContent("");
      expect(screen.getByTestId("role")).toHaveTextContent("user"); // default role
    });
  });

  describe("logout function", () => {
    it("logs out without calling API when no refresh token", async () => {
      // Set up authenticated state via login
      window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, createJwt(3600));
      window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({
        id: "user-1",
        username: "testuser",
        email: "test@example.com",
        role: "user",
      }));
      // Note: No refresh token set

      renderWithProvider();
      expect(screen.getByTestId("auth-state")).toHaveTextContent("authenticated");

      fireEvent.click(screen.getByRole("button", { name: "logout" }));

      expect(screen.getByTestId("auth-state")).toHaveTextContent("anonymous");
      expect(mockLogoutApi).not.toHaveBeenCalled();
    });

    it("clears all storage on logout", async () => {
      window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, createJwt(3600));
      window.localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, "refresh-123");
      window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({
        id: "user-1",
        username: "testuser",
        role: "user",
      }));

      renderWithProvider();
      fireEvent.click(screen.getByRole("button", { name: "logout" }));

      expect(window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
      expect(window.localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBeNull();
      expect(window.localStorage.getItem(STORAGE_KEYS.USER)).toBeNull();
    });

    it("emits logout event on logout", async () => {
      const emitSpy = vi.spyOn(authEvents, "emit");
      
      // First login
      window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, createJwt(3600));
      window.localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, "refresh-123");
      window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({
        id: "user-1",
        username: "testuser",
        role: "user",
      }));

      renderWithProvider();
      
      // Then logout
      fireEvent.click(screen.getByRole("button", { name: "logout" }));
      
      expect(emitSpy).toHaveBeenCalledWith("logout");
      
      emitSpy.mockRestore();
    });
  });

  describe("session-expired event", () => {
    it("clears storage and user on session expired", async () => {
      window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, createJwt(3600));
      window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({
        id: "user-1",
        username: "testuser",
        role: "user",
      }));

      renderWithProvider();
      
      act(() => {
        authEvents.emit("session-expired", { reason: "token expired" });
      });

      // Storage should be cleared
      expect(window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
      expect(window.localStorage.getItem(STORAGE_KEYS.USER)).toBeNull();
      // User should be logged out
      expect(screen.getByTestId("auth-state")).toHaveTextContent("anonymous");
    });
  });

  describe("useAuth outside provider", () => {
    it("throws error when used outside AuthProvider", () => {
      const renderResult = render(
        <MemoryRouter>
          <AuthProbeOutsideProvider />
        </MemoryRouter>,
      );

      expect(screen.getByTestId("error")).toHaveTextContent(
        "useAuth must be used within an AuthProvider",
      );
    });
  });

  describe("initial state with no storage", () => {
    it("starts anonymous with no tokens", () => {
      renderWithProvider();

      expect(screen.getByTestId("auth-state")).toHaveTextContent("anonymous");
      expect(screen.getByTestId("username")).toHaveTextContent("");
    });

    it("starts anonymous with only user in storage but no token", () => {
      window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({
        id: "user-1",
        username: "orphan",
        role: "user",
      }));

      renderWithProvider();

      expect(screen.getByTestId("auth-state")).toHaveTextContent("anonymous");
    });
  });

  describe("isAuthenticated computed value", () => {
    it("returns false when user is null", () => {
      renderWithProvider();
      expect(screen.getByTestId("auth-state")).toHaveTextContent("anonymous");
    });

    it("returns true when user exists", () => {
      window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, createJwt(3600));
      window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({
        id: "user-1",
        username: "testuser",
        role: "user",
      }));

      renderWithProvider();
      expect(screen.getByTestId("auth-state")).toHaveTextContent("authenticated");
    });
  });

  describe("isLoading state", () => {
    it("is false initially", () => {
      const TestProbe = () => {
        const { isLoading } = useAuth();
        return <div data-testid="loading">{isLoading.toString()}</div>;
      };

      render(
        <MemoryRouter>
          <AuthProvider>
            <TestProbe />
          </AuthProvider>
        </MemoryRouter>,
      );

      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
  });
});
