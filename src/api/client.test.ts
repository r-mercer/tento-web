import { beforeEach, describe, expect, it, vi } from "vitest";

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
  storageMock,
  refreshSessionTokenMock,
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
    storageMock: {
      getAccessToken: vi.fn(),
    },
    refreshSessionTokenMock: vi.fn(),
  };
});

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => apiClientMock),
  },
}));

vi.mock("../utils/storage", () => ({
  storage: storageMock,
}));

vi.mock("../utils/token-refresh", () => ({
  refreshSessionToken: () => refreshSessionTokenMock(),
}));

import "./client";

describe("api client interceptors", () => {
  beforeEach(() => {
    storageMock.getAccessToken.mockReset();
    refreshSessionTokenMock.mockReset();
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

  it("retries request after shared refresh succeeds", async () => {
    refreshSessionTokenMock.mockResolvedValue("new-access-token");

    const error = {
      response: { status: 401 },
      config: { headers: {} as Record<string, string> },
    };

    await interceptorState.responseRejected?.(error);

    expect(refreshSessionTokenMock).toHaveBeenCalledTimes(1);
    expect(error.config.headers.Authorization).toBe("Bearer new-access-token");
    expect(apiClientMock).toHaveBeenCalledWith(error.config);
  });

  it("rejects when shared refresh fails on 401", async () => {
    refreshSessionTokenMock.mockRejectedValue(new Error("refresh failed"));

    const error = {
      response: { status: 401 },
      config: { headers: {} as Record<string, string> },
    };

    await expect(interceptorState.responseRejected?.(error)).rejects.toThrow(
      "refresh failed",
    );
    expect(refreshSessionTokenMock).toHaveBeenCalledTimes(1);
  });

  it("rejects non-401 responses without refresh flow", async () => {
    const error = {
      response: { status: 500 },
      config: { headers: {} as Record<string, string> },
    };

    await expect(interceptorState.responseRejected?.(error)).rejects.toBe(error);
    expect(refreshSessionTokenMock).not.toHaveBeenCalled();
  });
});
