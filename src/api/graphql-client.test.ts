import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  storageMock,
  authEventsMock,
  refreshSessionTokenMock,
  graphqlClientMock,
} = vi.hoisted(() => {
  const graphqlClientMock = {
    request: vi.fn(),
    requestConfig: {
      headers: {} as Record<string, string>,
      requestMiddleware: vi.fn(),
      responseMiddleware: vi.fn(),
    },
  };

  return {
    storageMock: {
      getAccessToken: vi.fn(),
    },
    authEventsMock: {
      emit: vi.fn(),
    },
    refreshSessionTokenMock: vi.fn(),
    graphqlClientMock,
  };
});

vi.mock("graphql-request", () => ({
  GraphQLClient: vi.fn(() => graphqlClientMock),
}));

vi.mock("../utils/storage", () => ({
  storage: storageMock,
}));

vi.mock("../utils/auth-events", () => ({
  authEvents: authEventsMock,
}));

vi.mock("../utils/token-refresh", () => ({
  refreshSessionToken: () => refreshSessionTokenMock(),
}));

import { executeGraphQLQuery } from "./graphql-client";

describe("executeGraphQLQuery", () => {
  beforeEach(() => {
    storageMock.getAccessToken.mockReset();
    authEventsMock.emit.mockReset();
    refreshSessionTokenMock.mockReset();
    graphqlClientMock.request.mockReset();
    graphqlClientMock.requestConfig.headers = {};
  });

  it("makes successful request without refresh", async () => {
    const mockData = { quiz: { id: "1" } };
    graphqlClientMock.request.mockResolvedValue(mockData);

    const result = await executeGraphQLQuery("{ quiz(id: \"1\") { id } }");

    expect(result).toBe(mockData);
    expect(graphqlClientMock.request).toHaveBeenCalledTimes(1);
    expect(refreshSessionTokenMock).not.toHaveBeenCalled();
    expect(authEventsMock.emit).not.toHaveBeenCalled();
  });

  it("retries request after token refresh on 401", async () => {
    refreshSessionTokenMock.mockResolvedValue("new-access-token");
    
    const mockData = { quiz: { id: "1" } };
    graphqlClientMock.request
      .mockRejectedValueOnce({ response: { status: 401 } })
      .mockResolvedValueOnce(mockData);

    const result = await executeGraphQLQuery("{ quiz(id: \"1\") { id } }");

    expect(refreshSessionTokenMock).toHaveBeenCalledTimes(1);
    expect(graphqlClientMock.request).toHaveBeenCalledTimes(2);
    expect(result).toBe(mockData);
    expect(authEventsMock.emit).not.toHaveBeenCalled();
  });

  it("emits session-expired when refresh fails after 401", async () => {
    refreshSessionTokenMock.mockRejectedValue(new Error("refresh failed"));
    
    const error = { response: { status: 401 } };
    graphqlClientMock.request.mockRejectedValueOnce(error);

    await expect(
      executeGraphQLQuery("{ quiz(id: \"1\") { id } }")
    ).rejects.toEqual(error);

    expect(refreshSessionTokenMock).toHaveBeenCalledTimes(1);
    expect(graphqlClientMock.request).toHaveBeenCalledTimes(1);
    expect(authEventsMock.emit).toHaveBeenCalledWith("session-expired", {
      reason: "graphql-auth-error",
    });
  });

  it("emits session-expired when GraphQL returns UNAUTHENTICATED error and refresh fails", async () => {
    refreshSessionTokenMock.mockRejectedValue(new Error("refresh failed"));
    
    const error = {
      errors: [{ extensions: { code: "UNAUTHENTICATED" }, message: "Unauthorized" }],
    };
    graphqlClientMock.request.mockRejectedValueOnce(error);

    await expect(
      executeGraphQLQuery("{ quiz(id: \"1\") { id } }")
    ).rejects.toEqual(error);

    expect(refreshSessionTokenMock).toHaveBeenCalledTimes(1);
    expect(authEventsMock.emit).toHaveBeenCalledWith("session-expired", {
      reason: "graphql-auth-error",
    });
  });

  it("retries request after token refresh on UNAUTHENTICATED error", async () => {
    refreshSessionTokenMock.mockResolvedValue("new-access-token");
    
    const mockData = { quiz: { id: "1" } };
    const authError = {
      errors: [{ extensions: { code: "UNAUTHENTICATED" }, message: "Unauthorized" }],
    };
    graphqlClientMock.request
      .mockRejectedValueOnce(authError)
      .mockResolvedValueOnce(mockData);

    const result = await executeGraphQLQuery("{ quiz(id: \"1\") { id } }");

    expect(refreshSessionTokenMock).toHaveBeenCalledTimes(1);
    expect(graphqlClientMock.request).toHaveBeenCalledTimes(2);
    expect(result).toBe(mockData);
    expect(authEventsMock.emit).not.toHaveBeenCalled();
  });

  it("does not attempt refresh on non-auth errors (500)", async () => {
    const error = { response: { status: 500 } };
    graphqlClientMock.request.mockRejectedValueOnce(error);

    await expect(
      executeGraphQLQuery("{ quiz(id: \"1\") { id } }")
    ).rejects.toEqual(error);

    expect(refreshSessionTokenMock).not.toHaveBeenCalled();
    expect(authEventsMock.emit).not.toHaveBeenCalled();
  });

  it("does not attempt refresh twice on repeated 401", async () => {
    refreshSessionTokenMock.mockResolvedValue("new-access-token");
    
    const error = { response: { status: 401 } };
    graphqlClientMock.request.mockRejectedValue(error);

    await expect(
      executeGraphQLQuery("{ quiz(id: \"1\") { id } }")
    ).rejects.toEqual(error);

    expect(refreshSessionTokenMock).toHaveBeenCalledTimes(1);
    expect(graphqlClientMock.request).toHaveBeenCalledTimes(2);
  });
});
