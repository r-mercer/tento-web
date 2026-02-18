import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import * as quizzesApi from '../../api/quizzes';
import type { CreateQuizDraftRequest } from '../../types/api';

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

/**
 * Get all quizzes owned by a specific user
 */
export function useUserQuizzes(userId: string) {
  return useQuery({
    queryKey: queryKeys.userQuizzes(userId),
    queryFn: () => quizzesApi.getUserQuizzes(userId),
    enabled: !!userId,
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

export function useUpdateQuiz(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: unknown) => quizzesApi.updateQuiz(data),
    onMutate: async (newData: any) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.quiz(id) });
      const previous = queryClient.getQueryData(queryKeys.quiz(id));

      // Build an optimistic version by shallow-merging fields
      let optimistic = previous as any;
      if (previous) {
        optimistic = { ...previous, ...newData };

        // If questions are included, merge per-question and per-option text
        if (previous.questions && newData.questions) {
          const byId = new Map((previous.questions as any[]).map((q) => [q.id, q]));
          optimistic.questions = newData.questions.map((nq: any) => {
            const existing = byId.get(nq.id) || {};
            const mergedOptions = (existing.options || []).map((opt: any) => {
              const patchedOpt = (nq.options || []).find((o: any) => o.id === opt.id);
              return patchedOpt ? { ...opt, ...patchedOpt } : opt;
            });
            return { ...existing, ...nq, options: mergedOptions.length ? mergedOptions : existing.options } as any;
          });
        }
      }

      queryClient.setQueryData(queryKeys.quiz(id), optimistic);
      return { previous };
    },
    onError: (_err, _newData, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.quiz(id), context.previous);
      }
    },
    onSuccess: (updatedQuiz: any) => {
      queryClient.setQueryData(queryKeys.quiz(id), updatedQuiz);
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quiz(id) });
    },
  });
}

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
