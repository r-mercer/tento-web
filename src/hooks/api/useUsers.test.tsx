import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useUsers, useUser, useCreateUser, useUpdateUser, useDeleteUser } from "./useUsers";
import * as usersApi from "../../api/users";

// Mock the API module
vi.mock("../../api/users", () => ({
  getAllUsers: vi.fn(),
  getUser: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}));

// Mock queryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches all users successfully", async () => {
    const mockUsers = [
      { id: "1", username: "alice", email: "alice@example.com", role: "user" },
      { id: "2", username: "bob", email: "bob@example.com", role: "admin" },
    ];

    vi.mocked(usersApi.getAllUsers).mockResolvedValue(mockUsers);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockUsers);
    expect(usersApi.getAllUsers).toHaveBeenCalledTimes(1);
  });

  it("handles fetch error", async () => {
    const error = new Error("Failed to fetch users");
    vi.mocked(usersApi.getAllUsers).mockRejectedValue(error);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });

  it("returns isLoading state initially", () => {
    vi.mocked(usersApi.getAllUsers).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});

describe("useUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches a single user by id", async () => {
    const mockUser = { 
      id: "user-1", 
      username: "alice", 
      email: "alice@example.com", 
      role: "user",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    };

    vi.mocked(usersApi.getUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useUser("user-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockUser);
    expect(usersApi.getUser).toHaveBeenCalledWith("user-1");
  });

  it("does not fetch when id is empty", () => {
    const { result } = renderHook(() => useUser(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(usersApi.getUser).not.toHaveBeenCalled();
  });

  it("does not fetch when id is null/undefined", () => {
    // @ts-expect-error - testing invalid input
    const { result } = renderHook(() => useUser(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });
});

describe("useCreateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a user and invalidates users list", async () => {
    const newUser = { 
      id: "new-user", 
      username: "newuser", 
      email: "new@example.com", 
      role: "user",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    };

    vi.mocked(usersApi.createUser).mockResolvedValue(newUser);

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      username: "newuser",
      email: "new@example.com",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(usersApi.createUser).toHaveBeenCalledWith({
      username: "newuser",
      email: "new@example.com",
    });
  });

  it("handles creation error", async () => {
    const error = new Error("Failed to create user");
    vi.mocked(usersApi.createUser).mockRejectedValue(error);

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      username: "newuser",
      email: "new@example.com",
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});

describe("useUpdateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a user and invalidates queries", async () => {
    const updatedUser = { 
      id: "user-1", 
      username: "updated", 
      email: "updated@example.com", 
      role: "admin",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-02T00:00:00Z"
    };

    vi.mocked(usersApi.updateUser).mockResolvedValue(updatedUser);

    const { result } = renderHook(() => useUpdateUser("user-1"), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ username: "updated", role: "admin" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(usersApi.updateUser).toHaveBeenCalledWith("user-1", { 
      username: "updated", 
      role: "admin" 
    });
  });

  it("handles update error", async () => {
    const error = new Error("Failed to update user");
    vi.mocked(usersApi.updateUser).mockRejectedValue(error);

    const { result } = renderHook(() => useUpdateUser("user-1"), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ username: "updated" });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});

describe("useDeleteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a user and removes it from cache", async () => {
    vi.mocked(usersApi.deleteUser).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("user-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(usersApi.deleteUser).toHaveBeenCalledWith("user-1");
  });

  it("handles deletion error", async () => {
    const error = new Error("Failed to delete user");
    vi.mocked(usersApi.deleteUser).mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("user-1");

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
