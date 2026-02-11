import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import * as quizzesApi from '../../api/quizzes';
import type { SubmitQuizAttemptPayload } from '../../types/api';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get quiz for taking (without answers)
 */
export function useQuizForTaking(id: string) {
  return useQuery({
    queryKey: queryKeys.quizForTaking(id),
    queryFn: () => quizzesApi.getQuizForTaking(id),
    enabled: !!id,
  });
}

/**
 * Get quiz for results (with answers)
 */
export function useQuizForResults(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.quizForResults(id),
    queryFn: () => quizzesApi.getQuizForResults(id),
    enabled: !!id && enabled,
  });
}

/**
 * Get user's quiz attempts with pagination
 */
export function useQuizAttempts(
  quizId?: string,
  limit: number = 10,
  offset: number = 0
) {
  return useQuery({
    queryKey: queryKeys.quizAttempts(quizId, offset, limit),
    queryFn: () => quizzesApi.getQuizAttempts(quizId, limit, offset),
  });
}

/**
 * Get single attempt with detailed results
 */
export function useQuizAttempt(attemptId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.quizAttempt(attemptId),
    queryFn: () => quizzesApi.getQuizAttempt(attemptId),
    enabled: !!attemptId && enabled,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Submit quiz attempt
 */
export function useSubmitQuizAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitQuizAttemptPayload) =>
      quizzesApi.submitQuizAttempt(payload),
    onSuccess: (_, payload) => {
      // Invalidate attempts list for this quiz
      queryClient.invalidateQueries({
        queryKey: queryKeys.quizAttempts(payload.quiz_id),
      });
    },
  });
}
