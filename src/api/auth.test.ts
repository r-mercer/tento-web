import { beforeEach, describe, expect, it, vi } from "vitest";
import { ENDPOINTS, GH_REDIRECT_URI } from "../utils/constants";
import {
  handleGithubCallback,
  logout,
  refreshAccessToken,
} from "./auth";

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock("./client", () => ({
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

describe("auth api", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
  });

  it("returns parsed auth payload from github callback", async () => {
    const authPayload = {
      token: "access-token",
      refresh_token: "refresh-token",
      user: {
        id: "user-1",
        username: "riley",
        email: "riley@example.com",
        role: "user",
      },
    };

    mockGet.mockResolvedValue({ data: authPayload });

    const result = await handleGithubCallback("github-code");

    expect(mockGet).toHaveBeenCalledWith(ENDPOINTS.AUTH_GITHUB_CALLBACK, {
      params: { code: "github-code", redirect_uri: GH_REDIRECT_URI },
    });
    expect(result).toEqual(authPayload);
  });

  it("posts refresh token and returns new tokens", async () => {
    const refreshed = {
      token: "new-access-token",
      refresh_token: "new-refresh-token",
    };

    mockPost.mockResolvedValue({ data: refreshed });

    const result = await refreshAccessToken("refresh-123");

    expect(mockPost).toHaveBeenCalledWith(ENDPOINTS.AUTH_REFRESH, {
      refresh_token: "refresh-123",
    });
    expect(result).toEqual(refreshed);
  });

  it("propagates logout API failures", async () => {
    const error = new Error("network down");
    mockPost.mockRejectedValue(error);

    await expect(logout("refresh-123")).rejects.toThrow("network down");
    expect(mockPost).toHaveBeenCalledWith(ENDPOINTS.AUTH_LOGOUT, {
      refresh_token: "refresh-123",
    });
  });
});
