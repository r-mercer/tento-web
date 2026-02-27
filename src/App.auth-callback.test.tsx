import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ROUTES } from "./utils/constants";
import { AuthCallbackPage } from "./App";

const {
  mockNavigate,
  mockLogin,
  mockHandleGithubCallback,
  mockSearchParamsGet,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockLogin: vi.fn(),
  mockHandleGithubCallback: vi.fn(),
  mockSearchParamsGet: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [{ get: mockSearchParamsGet }],
  };
});

vi.mock("./hooks/useAuth", () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    isLoading: false,
    user: null,
    logout: vi.fn(),
  }),
}));

vi.mock("./api/auth", async () => {
  const actual =
    await vi.importActual<typeof import("./api/auth")>("./api/auth");
  return {
    ...actual,
    handleGithubCallback: (code: string) => mockHandleGithubCallback(code),
  };
});

vi.mock("./contexts/ThemeContext", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

describe("AuthCallbackPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockLogin.mockReset();
    mockHandleGithubCallback.mockReset();
    mockSearchParamsGet.mockReset();
  });

  it("redirects to login when code is missing", async () => {
    mockSearchParamsGet.mockReturnValue(null);

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN);
    });
    expect(mockHandleGithubCallback).not.toHaveBeenCalled();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("authenticates and navigates to dashboard when callback succeeds", async () => {
    mockSearchParamsGet.mockReturnValue("github-code");
    mockHandleGithubCallback.mockResolvedValue({
      token: "access-123",
      refresh_token: "refresh-123",
      id: "user-1",
      username: "riley",
      email: "riley@example.com",
    });

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mockHandleGithubCallback).toHaveBeenCalledWith("github-code");
    });
    expect(mockLogin).toHaveBeenCalledWith("access-123", "refresh-123", {
      id: "user-1",
      username: "riley",
      email: "riley@example.com",
    });
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
    expect(
      screen.getByText("Authenticating with GitHub..."),
    ).toBeInTheDocument();
  });

  it("redirects to login when callback authentication fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    mockSearchParamsGet.mockReturnValue("github-code");
    mockHandleGithubCallback.mockRejectedValue(new Error("oauth failed"));

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN);
    });
    expect(mockLogin).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
