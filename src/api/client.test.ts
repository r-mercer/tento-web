import { beforeEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL, ENDPOINTS } from "../utils/constants";

type RequestInterceptor = (config: {
  headers?: Record<string, string>;
  _retry?: boolean;
}) => unknown;

type ResponseErrorInterceptor = (error: {
  response?: { status?: number };
  config: { headers?: Record<string, string>; _retry?: boolean };
}) => Promise<unknown>;

const {
  interceptorState,
  apiClientMock,
  axiosPostMock,
  storageMock,
  authEventsMock,
} = vi.hoisted(() => {
  const interceptorState: {
    requestFulfilled?: RequestInterceptor;
    responseRejected?: ResponseErrorInterceptor;
  } = {};

  const apiClientMock = Object.assign(
    vi.fn((config: { headers?: Record<string, string> }) =>
      Promise.resolve({ data: { ok: true }, config }),
    ),
    {
      interceptors: {
        request: {
          use: vi.fn((onFulfilled: RequestInterceptor) => {
            interceptorState.requestFulfilled = onFulfilled;
            return 0;
          }),
        },
        response: {
          use: vi.fn((_: unknown, onRejected: ResponseErrorInterceptor) => {
            interceptorState.responseRejected = onRejected;
            return 0;
          }),
        },
      },
    },
  );

  return {
    interceptorState,
    apiClientMock,
    axiosPostMock: vi.fn(),
    storageMock: {
      getAccessToken: vi.fn(),
      getRefreshToken: vi.fn(),
      setTokens: vi.fn(),
    },
    authEventsMock: {
      emit: vi.fn(),
    },
  };
});

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => apiClientMock),
    post: (...args: unknown[]) => axiosPostMock(...args),
  },
}));

vi.mock("../utils/storage", () => ({
  storage: storageMock,
}));

vi.mock("../utils/auth-events", () => ({
  authEvents: authEventsMock,
}));

import "./client";

describe("api client interceptors", () => {
  beforeEach(() => {
    storageMock.getAccessToken.mockReset();
    storageMock.getRefreshToken.mockReset();
    storageMock.setTokens.mockReset();
    authEventsMock.emit.mockReset();
    axiosPostMock.mockReset();
    apiClientMock.mockClear();
  });

  it("adds bearer token in request interceptor when access token exists", () => {
    storageMock.getAccessToken.mockReturnValue("access-123");
    const config = { headers: {} as Record<string, string> };

    const result = interceptorState.requestFulfilled?.(config) as {
      headers: Record<string, string>;
    };

    expect(result.headers.Authorization).toBe("Bearer access-123");
  });

  it("emits session-expired and rejects when 401 occurs without refresh token", async () => {
    storageMock.getRefreshToken.mockReturnValue(null);

    const error = {
      response: { status: 401 },
      config: { headers: {} as Record<string, string> },
    };

    await expect(interceptorState.responseRejected?.(error)).rejects.toBe(error);
    expect(authEventsMock.emit).toHaveBeenCalledWith("session-expired", {
      reason: "no-refresh-token",
    });
  });

  it("refreshes token, stores new tokens, emits token-refreshed and retries request", async () => {
    storageMock.getRefreshToken.mockReturnValue("refresh-123");
    axiosPostMock.mockResolvedValue({
      data: {
        token: "new-access-token",
        refresh_token: "new-refresh-token",
      },
    });

    const error = {
      response: { status: 401 },
      config: { headers: {} as Record<string, string> },
    };

    await interceptorState.responseRejected?.(error);

    expect(axiosPostMock).toHaveBeenCalledWith(
      `${API_BASE_URL}${ENDPOINTS.AUTH_REFRESH}`,
      { refresh_token: "refresh-123" },
    );
    expect(storageMock.setTokens).toHaveBeenCalledWith(
      "new-access-token",
      "new-refresh-token",
    );
    expect(authEventsMock.emit).toHaveBeenCalledWith("token-refreshed");
    expect(error.config.headers.Authorization).toBe("Bearer new-access-token");
    expect(apiClientMock).toHaveBeenCalledWith(error.config);
  });

  it("emits session-expired when refresh call fails", async () => {
    storageMock.getRefreshToken.mockReturnValue("refresh-123");
    axiosPostMock.mockRejectedValue(new Error("refresh failed"));

    const error = {
      response: { status: 401 },
      config: { headers: {} as Record<string, string> },
    };

    await expect(interceptorState.responseRejected?.(error)).rejects.toThrow(
      "refresh failed",
    );
    expect(authEventsMock.emit).toHaveBeenCalledWith("session-expired", {
      reason: "refresh-failed",
    });
  });

  it("rejects non-401 responses without refresh flow", async () => {
    const error = {
      response: { status: 500 },
      config: { headers: {} as Record<string, string> },
    };

    await expect(interceptorState.responseRejected?.(error)).rejects.toBe(error);
    expect(axiosPostMock).not.toHaveBeenCalled();
    expect(authEventsMock.emit).not.toHaveBeenCalled();
  });
});
