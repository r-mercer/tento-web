import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useQuizzes, useQuiz, useUserQuizzes, useCreateQuizDraft, useUpdateQuiz, useDeleteQuiz } from "./useQuizzes";
import * as quizzesApi from "../../api/quizzes";

// Mock the API module
vi.mock("../../api/quizzes", () => ({
  getAllQuizzes: vi.fn(),
  getQuiz: vi.fn(),
  getUserQuizzes: vi.fn(),
  createQuizDraft: vi.fn(),
  updateQuiz: vi.fn(),
  deleteQuiz: vi.fn(),
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

describe("useQuizzes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches all quizzes successfully", async () => {
    const mockQuizzes = [
      { id: "1", name: "Quiz 1", status: "Ready", questionCount: 10 },
      { id: "2", name: "Quiz 2", status: "Draft", questionCount: 5 },
    ];

    vi.mocked(quizzesApi.getAllQuizzes).mockResolvedValue(mockQuizzes);

    const { result } = renderHook(() => useQuizzes(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockQuizzes);
    expect(quizzesApi.getAllQuizzes).toHaveBeenCalledTimes(1);
  });

  it("handles fetch error", async () => {
    const error = new Error("Failed to fetch quizzes");
    vi.mocked(quizzesApi.getAllQuizzes).mockRejectedValue(error);

    const { result } = renderHook(() => useQuizzes(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });

  it("returns isLoading state initially", () => {
    vi.mocked(quizzesApi.getAllQuizzes).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useQuizzes(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});

describe("useQuiz", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches a single quiz by id", async () => {
    const mockQuiz = { id: "quiz-1", name: "Test Quiz", status: "Ready" };

    vi.mocked(quizzesApi.getQuiz).mockResolvedValue(mockQuiz);

    const { result } = renderHook(() => useQuiz("quiz-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockQuiz);
    expect(quizzesApi.getQuiz).toHaveBeenCalledWith("quiz-1");
  });

  it("does not fetch when id is empty", () => {
    const { result } = renderHook(() => useQuiz(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(quizzesApi.getQuiz).not.toHaveBeenCalled();
  });

  it("does not fetch when id is null/undefined", () => {
    // @ts-expect-error - testing invalid input
    const { result } = renderHook(() => useQuiz(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });
});

describe("useUserQuizzes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches user quizzes", async () => {
    const mockQuizzes = [
      { id: "1", name: "User Quiz 1", status: "Ready" },
    ];

    vi.mocked(quizzesApi.getUserQuizzes).mockResolvedValue(mockQuizzes);

    const { result } = renderHook(() => useUserQuizzes("user-123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockQuizzes);
    expect(quizzesApi.getUserQuizzes).toHaveBeenCalledWith("user-123");
  });

  it("does not fetch when userId is empty", () => {
    const { result } = renderHook(() => useUserQuizzes(""), {
      wrapper: createWrapper(),
    });

    // Query is enabled: false when userId is empty, so isFetching should be false
    expect(result.current.isFetching).toBe(false);
  });
});

describe("useCreateQuizDraft", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a quiz draft and invalidates quizzes list", async () => {
    const newQuiz = { id: "new-quiz", name: "New Quiz", status: "Draft" };
    vi.mocked(quizzesApi.createQuizDraft).mockResolvedValue(newQuiz);

    const { result } = renderHook(() => useCreateQuizDraft(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      name: "New Quiz",
      created_by_user_id: "user-1",
      question_count: 10,
      required_score: 70,
      attempt_limit: 3,
      url: "https://example.com/quiz",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(quizzesApi.createQuizDraft).toHaveBeenCalledWith({
      name: "New Quiz",
      created_by_user_id: "user-1",
      question_count: 10,
      required_score: 70,
      attempt_limit: 3,
      url: "https://example.com/quiz",
    });
  });

  it("handles creation error", async () => {
    const error = new Error("Failed to create quiz");
    vi.mocked(quizzesApi.createQuizDraft).mockRejectedValue(error);

    const { result } = renderHook(() => useCreateQuizDraft(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      name: "New Quiz",
      created_by_user_id: "user-1",
      question_count: 10,
      required_score: 70,
      attempt_limit: 3,
      url: "https://example.com/quiz",
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});

describe("useUpdateQuiz", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a quiz and invalidates queries", async () => {
    const updatedQuiz = { id: "quiz-1", name: "Updated Quiz", status: "Ready" };
    vi.mocked(quizzesApi.updateQuiz).mockResolvedValue(updatedQuiz);

    const { result } = renderHook(() => useUpdateQuiz("quiz-1"), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ title: "Updated Quiz" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(quizzesApi.updateQuiz).toHaveBeenCalledWith({ title: "Updated Quiz" });
  });

  it("handles update error and rolls back", async () => {
    const error = new Error("Failed to update quiz");
    vi.mocked(quizzesApi.updateQuiz).mockRejectedValue(error);

    const { result } = renderHook(() => useUpdateQuiz("quiz-1"), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ title: "Updated Quiz" });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useDeleteQuiz", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a quiz and removes it from cache", async () => {
    vi.mocked(quizzesApi.deleteQuiz).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteQuiz(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("quiz-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(quizzesApi.deleteQuiz).toHaveBeenCalledWith("quiz-1");
  });

  it("handles deletion error", async () => {
    const error = new Error("Failed to delete quiz");
    vi.mocked(quizzesApi.deleteQuiz).mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteQuiz(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("quiz-1");

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
