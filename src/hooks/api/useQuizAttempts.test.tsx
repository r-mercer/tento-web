import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useQuizForTaking, useQuizForResults, useQuizAttempts, useQuizAttempt, useSubmitQuizAttempt } from "./useQuizAttempts";
import * as quizzesApi from "../../api/quizzes";

// Mock the API module
vi.mock("../../api/quizzes", () => ({
  getQuizForTaking: vi.fn(),
  getQuizForResults: vi.fn(),
  getQuizAttempts: vi.fn(),
  getQuizAttempt: vi.fn(),
  submitQuizAttempt: vi.fn(),
}));

// Mock useAuth to provide user context
vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "user-1", username: "testuser", email: "test@example.com", role: "user" },
    isAuthenticated: true,
  }),
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

describe("useQuizForTaking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches quiz for taking (without answers)", async () => {
    const mockQuiz = {
      id: "quiz-1",
      name: "Test Quiz",
      status: "Ready",
      question_count: 10,
      questions: [
        {
          id: "q1",
          title: "Question 1",
          description: "What is 2+2?",
          questionType: "Single",
          options: [
            { id: "o1", text: "3" },
            { id: "o2", text: "4" },
          ],
          optionCount: 2,
          order: 1,
          topic: "math",
        },
      ],
    };

    vi.mocked(quizzesApi.getQuizForTaking).mockResolvedValue(mockQuiz);

    const { result } = renderHook(() => useQuizForTaking("quiz-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockQuiz);
    expect(quizzesApi.getQuizForTaking).toHaveBeenCalledWith("quiz-1");
  });

  it("does not fetch when id is empty", () => {
    const { result } = renderHook(() => useQuizForTaking(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });
});

describe("useQuizForResults", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches quiz for results (with answers)", async () => {
    const mockQuiz = {
      id: "quiz-1",
      name: "Test Quiz",
      status: "Complete",
      questionCount: 10,
      questions: [
        {
          id: "q1",
          title: "Question 1",
          description: "What is 2+2?",
          questionType: "Single",
          options: [
            { id: "o1", text: "3", correct: false },
            { id: "o2", text: "4", correct: true, explanation: "2+2=4" },
          ],
          optionCount: 2,
          order: 1,
          topic: "math",
        },
      ],
    };

    vi.mocked(quizzesApi.getQuizForResults).mockResolvedValue(mockQuiz);

    const { result } = renderHook(() => useQuizForResults("quiz-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockQuiz);
    expect(quizzesApi.getQuizForResults).toHaveBeenCalledWith("quiz-1");
  });

  it("respects enabled parameter", () => {
    const { result } = renderHook(() => useQuizForResults("quiz-1", false), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });
});

describe("useQuizAttempts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches user's quiz attempts", async () => {
    const mockAttempts = {
      data: [
        {
          id: "attempt-1",
          quizId: "quiz-1",
          pointsEarned: 80,
          totalPossible: 100,
          requiredScore: 70,
          passed: true,
          attemptNumber: 1,
          submittedAt: "2024-01-01T00:00:00Z",
        },
      ],
      pagination: {
        offset: 0,
        limit: 10,
        total: 1,
      },
    };

    vi.mocked(quizzesApi.getQuizAttempts).mockResolvedValue(mockAttempts);

    const { result } = renderHook(() => useQuizAttempts("quiz-1", 10, 0), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockAttempts);
    expect(quizzesApi.getQuizAttempts).toHaveBeenCalledWith("quiz-1", 10, 0);
  });

  it("fetches all attempts when quizId is undefined", async () => {
    const mockAttempts = {
      data: [],
      pagination: {
        offset: 0,
        limit: 10,
        total: 0,
      },
    };

    vi.mocked(quizzesApi.getQuizAttempts).mockResolvedValue(mockAttempts);

    const { result } = renderHook(() => useQuizAttempts(undefined, 10, 0), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(quizzesApi.getQuizAttempts).toHaveBeenCalledWith(undefined, 10, 0);
  });

  it("handles pagination parameters", async () => {
    const mockAttempts = {
      data: [],
      pagination: { offset: 20, limit: 5, total: 0 },
    };

    vi.mocked(quizzesApi.getQuizAttempts).mockResolvedValue(mockAttempts);

    const { result } = renderHook(() => useQuizAttempts("quiz-1", 5, 20), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(quizzesApi.getQuizAttempts).toHaveBeenCalledWith("quiz-1", 5, 20);
  });
});

describe("useQuizAttempt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches single attempt with details", async () => {
    const mockAttempt = {
      attempt: {
        id: "attempt-1",
        quizId: "quiz-1",
        pointsEarned: 80,
        totalPossible: 100,
        requiredScore: 70,
        passed: true,
        attemptNumber: 1,
        submittedAt: "2024-01-01T00:00:00Z",
      },
      quiz: {
        id: "quiz-1",
        name: "Test Quiz",
        status: "Complete",
        questionCount: 10,
      },
      questionResults: [
        {
          questionId: "q1",
          userSelectedOptionIds: ["o2"],
          correctOptionIds: ["o2"],
          isCorrect: true,
          pointsEarned: 10,
          explanation: "Correct!",
        },
      ],
    };

    vi.mocked(quizzesApi.getQuizAttempt).mockResolvedValue(mockAttempt);

    const { result } = renderHook(() => useQuizAttempt("attempt-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockAttempt);
    expect(quizzesApi.getQuizAttempt).toHaveBeenCalledWith("attempt-1");
  });

  it("respects enabled parameter", () => {
    const { result } = renderHook(() => useQuizAttempt("attempt-1", false), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });
});

describe("useSubmitQuizAttempt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits quiz attempt and invalidates queries", async () => {
    const mockResponse = {
      id: "attempt-1",
      quizId: "quiz-1",
      pointsEarned: 80,
      totalPossible: 100,
      requiredScore: 70,
      passed: true,
      attemptNumber: 1,
      submittedAt: "2024-01-01T00:00:00Z",
    };

    vi.mocked(quizzesApi.submitQuizAttempt).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useSubmitQuizAttempt(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      quizId: "quiz-1",
      answers: [
        { questionId: "q1", selectedOptionIds: ["o2"] },
      ],
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(quizzesApi.submitQuizAttempt).toHaveBeenCalledWith({
      quizId: "quiz-1",
      answers: [{ questionId: "q1", selectedOptionIds: ["o2"] }],
    });
  });

  it("handles submission error", async () => {
    const error = new Error("Failed to submit attempt");
    vi.mocked(quizzesApi.submitQuizAttempt).mockRejectedValue(error);

    const { result } = renderHook(() => useSubmitQuizAttempt(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      quizId: "quiz-1",
      answers: [],
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
