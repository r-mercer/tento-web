import apiClient from './client';
import { ENDPOINTS } from '../utils/constants';
import type { Quiz, CreateQuizRequest, UpdateQuizRequest } from '../types/api';

// ============================================================================
// Quiz API Functions
// ============================================================================

/**
 * Get all quizzes
 */
export async function getAllQuizzes(): Promise<Quiz[]> {
  const response = await apiClient.get<Quiz[]>(ENDPOINTS.QUIZZES);
  return response.data;
}

/**
 * Get a single quiz by ID
 */
export async function getQuiz(id: string): Promise<Quiz> {
  const response = await apiClient.get<Quiz>(ENDPOINTS.QUIZ(id));
  return response.data;
}

/**
 * Create a new quiz
 */
export async function createQuiz(data: CreateQuizRequest): Promise<Quiz> {
  const response = await apiClient.post<Quiz>(ENDPOINTS.QUIZZES, data);
  return response.data;
}

/**
 * Update a quiz by ID
 */
export async function updateQuiz(id: string, data: UpdateQuizRequest): Promise<Quiz> {
  const response = await apiClient.put<Quiz>(ENDPOINTS.QUIZ(id), data);
  return response.data;
}

/**
 * Delete a quiz by ID
 */
export async function deleteQuiz(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.QUIZ(id));
}
