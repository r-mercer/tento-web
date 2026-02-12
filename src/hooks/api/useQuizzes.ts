import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import * as quizzesApi from '../../api/quizzes';
import type { CreateQuizDraftRequest, Quiz } from '../../types/api';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get all quizzes
 */
export function useQuizzes() {
  return useQuery({
    queryKey: queryKeys.quizzes,
    queryFn: quizzesApi.getAllQuizzes,
  });
}

/**
 * Get a single quiz by ID
 */
export function useQuiz(id: string) {
  return useQuery({
    queryKey: queryKeys.quiz(id),
    queryFn: () => quizzesApi.getQuiz(id),
    enabled: !!id,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new quiz draft
 */
export function useCreateQuizDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuizDraftRequest) => quizzesApi.createQuizDraft(data),
    onSuccess: () => {
      // Invalidate quizzes list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes });
    },
  });
}

/**
 * Update a quiz
 * TODO: Uncomment when quiz update API is ready
 */
// export function useUpdateQuiz(id: string) {
//   const queryClient = useQueryClient();
//
//   return useMutation({
//     mutationFn: (data: UpdateQuizRequest) => quizzesApi.updateQuiz(id, data),
//     onSuccess: (updatedQuiz: Quiz) => {
//       // Update quiz in cache
//       queryClient.setQueryData(queryKeys.quiz(id), updatedQuiz);
//       
//       // Invalidate quizzes list to refetch
//       queryClient.invalidateQueries({ queryKey: queryKeys.quizzes });
//     },
//   });
// }

/**
 * Delete a quiz
 */
export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quizzesApi.deleteQuiz(id),
    onSuccess: (_, deletedId: string) => {
      // Remove quiz from cache
      queryClient.removeQueries({ queryKey: queryKeys.quiz(deletedId) });
      
      // Invalidate quizzes list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes });
    },
  });
}
