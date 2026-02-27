import { beforeEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL, ENDPOINTS } from "./constants";

const { axiosPostMock, storageMock, authEventsMock } = vi.hoisted(() => ({
  axiosPostMock: vi.fn(),
  storageMock: {
    getRefreshToken: vi.fn(),
    setTokens: vi.fn(),
  },
  authEventsMock: {
    emit: vi.fn(),
  },
}));

vi.mock("axios", () => ({
  default: {
    post: (...args: unknown[]) => axiosPostMock(...args),
  },
}));

vi.mock("./storage", () => ({
  storage: storageMock,
}));

vi.mock("./auth-events", () => ({
  authEvents: authEventsMock,
}));

import { refreshSessionToken } from "./token-refresh";

describe("refreshSessionToken", () => {
  beforeEach(() => {
    axiosPostMock.mockReset();
    storageMock.getRefreshToken.mockReset();
    storageMock.setTokens.mockReset();
    authEventsMock.emit.mockReset();
  });

  it("emits session-expired when no refresh token exists", async () => {
    storageMock.getRefreshToken.mockReturnValue(null);

    await expect(refreshSessionToken()).rejects.toThrow(
      "No refresh token available",
    );

    expect(authEventsMock.emit).toHaveBeenCalledWith("session-expired", {
      reason: "no-refresh-token",
    });
    expect(axiosPostMock).not.toHaveBeenCalled();
  });

  it("refreshes token, stores tokens, and emits token-refreshed", async () => {
    storageMock.getRefreshToken.mockReturnValue("refresh-123");
    axiosPostMock.mockResolvedValue({
      data: {
        token: "new-access-token",
        refresh_token: "new-refresh-token",
      },
    });

    const token = await refreshSessionToken();

    expect(token).toBe("new-access-token");
    expect(axiosPostMock).toHaveBeenCalledWith(
      `${API_BASE_URL}${ENDPOINTS.AUTH_REFRESH}`,
      { refresh_token: "refresh-123" },
    );
    expect(storageMock.setTokens).toHaveBeenCalledWith(
      "new-access-token",
      "new-refresh-token",
    );
    expect(authEventsMock.emit).toHaveBeenCalledWith("token-refreshed");
  });

  it("shares one in-flight refresh across concurrent callers", async () => {
    storageMock.getRefreshToken.mockReturnValue("refresh-123");

    let resolveRefresh: (value: {
      data: { token: string; refresh_token: string };
    }) => void = () => undefined;
    const pendingRefresh = new Promise((resolve) => {
      resolveRefresh = resolve;
    });

    axiosPostMock.mockReturnValue(pendingRefresh);

    const first = refreshSessionToken();
    const second = refreshSessionToken();

    expect(axiosPostMock).toHaveBeenCalledTimes(1);

    resolveRefresh({
      data: {
        token: "new-access-token",
        refresh_token: "new-refresh-token",
      },
    });

    await expect(first).resolves.toBe("new-access-token");
    await expect(second).resolves.toBe("new-access-token");
  });

  it("emits session-expired when refresh request fails", async () => {
    storageMock.getRefreshToken.mockReturnValue("refresh-123");
    axiosPostMock.mockRejectedValue(new Error("network"));

    await expect(refreshSessionToken()).rejects.toThrow(
      "Failed to refresh access token",
    );

    expect(authEventsMock.emit).toHaveBeenCalledWith("session-expired", {
      reason: "refresh-failed",
    });
  });
});
