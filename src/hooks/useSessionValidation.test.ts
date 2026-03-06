import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

const { authEventsMock, storageMock } = vi.hoisted(() => ({
  authEventsMock: {
    emit: vi.fn(),
  },
  storageMock: {
    getUser: vi.fn(),
  },
}));

const usersApiMock = vi.hoisted(() => ({
  getUser: vi.fn(),
}));

vi.mock("../utils/auth-events", () => ({
  authEvents: authEventsMock,
}));

vi.mock("../utils/storage", () => ({
  storage: storageMock,
}));

vi.mock("../api/users", () => usersApiMock);

import { useSessionValidation } from "./useSessionValidation";

describe("useSessionValidation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    storageMock.getUser.mockReturnValue({ id: "user-123" });
    usersApiMock.getUser.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not emit session-expired on successful validation", async () => {
    usersApiMock.getUser.mockResolvedValue({ id: "user-123" });

    const { unmount } = renderHook(() => useSessionValidation(5, true));

    await act(async () => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    expect(usersApiMock.getUser).toHaveBeenCalled();
    expect(authEventsMock.emit).not.toHaveBeenCalled();
    
    unmount();
  });

  it("does not emit session-expired on network errors", async () => {
    usersApiMock.getUser.mockRejectedValue(new Error("Network error"));

    const { unmount } = renderHook(() => useSessionValidation(5, true));

    await act(async () => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    expect(usersApiMock.getUser).toHaveBeenCalled();
    expect(authEventsMock.emit).not.toHaveBeenCalled();
    
    unmount();
  });

  it("does not emit session-expired on server errors (500)", async () => {
    const err = new AxiosError("Server error");
    err.response = { status: 500, data: null, statusText: "", headers: {}, config: {} as InternalAxiosRequestConfig } as AxiosResponse;
    usersApiMock.getUser.mockRejectedValue(err);

    const { unmount } = renderHook(() => useSessionValidation(5, true));

    await act(async () => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    expect(usersApiMock.getUser).toHaveBeenCalled();
    expect(authEventsMock.emit).not.toHaveBeenCalled();
    
    unmount();
  });

  it("emits session-expired on 401 auth failure", async () => {
    const err = new AxiosError("Unauthorized");
    err.response = { status: 401, data: null, statusText: "", headers: {}, config: {} as InternalAxiosRequestConfig } as AxiosResponse;
    usersApiMock.getUser.mockRejectedValue(err);

    const { unmount } = renderHook(() => useSessionValidation(5, true));

    await act(async () => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    expect(usersApiMock.getUser).toHaveBeenCalled();
    expect(authEventsMock.emit).toHaveBeenCalledWith("session-expired", {
      reason: "validation-failed",
    });
    
    unmount();
  });

  it("emits session-expired on 403 auth failure", async () => {
    const err = new AxiosError("Forbidden");
    err.response = { status: 403, data: null, statusText: "", headers: {}, config: {} as InternalAxiosRequestConfig } as AxiosResponse;
    usersApiMock.getUser.mockRejectedValue(err);

    const { unmount } = renderHook(() => useSessionValidation(5, true));

    await act(async () => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    expect(usersApiMock.getUser).toHaveBeenCalled();
    expect(authEventsMock.emit).toHaveBeenCalledWith("session-expired", {
      reason: "validation-failed",
    });
    
    unmount();
  });

  it("does not run validation when not authenticated", () => {
    renderHook(() => useSessionValidation(5, false));

    expect(usersApiMock.getUser).not.toHaveBeenCalled();
  });

  it("does not run validation when no user id", () => {
    storageMock.getUser.mockReturnValue(null);

    renderHook(() => useSessionValidation(5, true));

    expect(usersApiMock.getUser).not.toHaveBeenCalled();
  });
});
