import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

const { mockUseAuth, mockUseUserQuizzes } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockUseUserQuizzes: vi.fn(),
}));

vi.mock("./hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("./hooks/api/useQuizzes", () => ({
  useUserQuizzes: () => mockUseUserQuizzes(),
}));

vi.mock("./contexts/ThemeContext", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

describe("Protected routes", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseUserQuizzes.mockReset();
  });

  it("shows loading state while auth resolution is in progress", async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Loading...")).toBeInTheDocument();
  });

  it("redirects unauthenticated users from dashboard to login", async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("button", { name: "Login with GitHub" }),
    ).toBeInTheDocument();
  });

  it("renders dashboard for authenticated users without redirecting to login", async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "user-1",
        username: "riley",
        email: "riley@example.com",
        role: "user",
      },
      login: vi.fn(),
      logout: vi.fn(),
    });

    mockUseUserQuizzes.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Welcome, riley!")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Login with GitHub" }),
    ).not.toBeInTheDocument();
  });
});
