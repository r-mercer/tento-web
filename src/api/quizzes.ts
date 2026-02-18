import apiClient from './client';
import { ENDPOINTS } from '../utils/constants';
import { graphqlClient } from './graphql-client';
import * as usersApi from './users';
import {
  ALL_QUIZZES_QUERY,
  GET_QUIZ_QUERY,
  USER_QUIZZES_QUERY,
  QUIZ_FOR_TAKING_QUERY,
  QUIZ_FOR_RESULTS_QUERY,
  QUIZ_ATTEMPTS_QUERY,
  QUIZ_ATTEMPT_QUERY,
  SUBMIT_QUIZ_ATTEMPT_MUTATION,
  UPDATE_QUIZ_MUTATION,
} from './graphql-queries';
import type {
  Quiz,
  QuizForTaking,
  QuizAttemptResponse,
  QuizAttemptReview,
  SubmitQuizAttemptPayload,
  PaginatedResponse,
  CreateQuizDraftRequest,
} from '../types/api';

export async function getAllQuizzes(): Promise<Quiz[]> {
  const response = await graphqlClient.request<{ quizzes: Quiz[] }>(
    ALL_QUIZZES_QUERY
  );
  return response.quizzes;
}

export async function getQuiz(id: string): Promise<Quiz> {
  const response = await graphqlClient.request<{ quiz: Quiz }>(
    GET_QUIZ_QUERY,
    { id }
  );
  return response.quiz;
}

export async function getUserQuizzes(userId: string): Promise<Quiz[]> {
  // If userId looks like a username (not UUID and not 24-char ObjectId hex),
  // resolve it via the REST users endpoint to obtain the canonical id.
  const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
  const isObjectId = (s: string) => /^[0-9a-f]{24}$/i.test(s);

  let effectiveId = userId;
  if (userId && !isUuid(userId) && !isObjectId(userId)) {
    try {
      const user = await usersApi.getUser(userId);
      effectiveId = user.id;
    } catch {
      effectiveId = userId;
    }
  }

  const response = await graphqlClient.request<{ userQuizzes: Quiz[] }>(
    USER_QUIZZES_QUERY,
    { userId: effectiveId }
  );
  return response.userQuizzes;
}

export async function createQuizDraft(data: CreateQuizDraftRequest): Promise<Quiz> {
  const response = await apiClient.post<Quiz>(ENDPOINTS.QUIZ_DRAFTS, data);
  return response.data;
}

// export async function updateQuiz(id: string, data: UpdateQuizRequest): Promise<Quiz> {
//   const response = await apiClient.put<Quiz>(ENDPOINTS.QUIZ(id), data);
//   return response.data;
// }

export async function deleteQuiz(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.QUIZ(id));
}
export async function getQuizForTaking(id: string): Promise<QuizForTaking> {
  const response = await graphqlClient.request<{ quizForTaking: QuizForTaking }>(
    QUIZ_FOR_TAKING_QUERY,
    { id }
  );
  return response.quizForTaking;
}

export async function getQuizForResults(id: string): Promise<Quiz> {
  const response = await graphqlClient.request<{ quizForResults: Quiz }>(
    QUIZ_FOR_RESULTS_QUERY,
    { id }
  );
  return response.quizForResults;
}

export async function getQuizAttempts(
  quizId?: string,
  limit: number = 10,
  offset: number = 0
): Promise<PaginatedResponse<QuizAttemptResponse>> {
  const response = await graphqlClient.request<{
    quizAttempts: PaginatedResponse<QuizAttemptResponse>;
  }>(QUIZ_ATTEMPTS_QUERY, {
    quizId,
    offset,
    limit,
  });
  return response.quizAttempts;
}

export async function getQuizAttempt(
  attemptId: string
): Promise<QuizAttemptReview> {
  const response = await graphqlClient.request<{ quizAttempt: QuizAttemptReview }>(
    QUIZ_ATTEMPT_QUERY,
    { attemptId }
  );
  return response.quizAttempt;
}

export async function submitQuizAttempt(
  payload: SubmitQuizAttemptPayload
): Promise<QuizAttemptResponse> {
  const response = await graphqlClient.request<{
    submitQuizAttempt: QuizAttemptResponse;
  }>(SUBMIT_QUIZ_ATTEMPT_MUTATION, {
    input: payload,
  });
  return response.submitQuizAttempt;
}

export async function updateQuiz(input: unknown): Promise<Quiz> {
  const response = await graphqlClient.request<{ updateQuiz: Quiz }>(
    UPDATE_QUIZ_MUTATION,
    { input }
  );
  return response.updateQuiz;
}
