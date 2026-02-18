import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryClient";
import * as quizzesApi from "../../api/quizzes";
import type { CreateQuizDraftRequest, Quiz, QuizQuestion } from "../../types/api";

interface UpdateQuizVariables {
  id?: string;
  title?: string;
  description?: string;
  questions?: Array<{
    id: string;
    title?: string;
    description?: string;
    options?: Array<{ id: string; text: string }>;
  }>;
}

interface MutationContext {
  previous: Quiz | undefined;
}

export function useQuizzes() {
  return useQuery({
    queryKey: queryKeys.quizzes,
    queryFn: quizzesApi.getAllQuizzes,
  });
}

export function useQuiz(id: string) {
  return useQuery({
    queryKey: queryKeys.quiz(id),
    queryFn: () => quizzesApi.getQuiz(id),
    enabled: !!id,
  });
}

export function useUserQuizzes(userId: string) {
  return useQuery({
    queryKey: queryKeys.userQuizzes(userId),
    queryFn: () => quizzesApi.getUserQuizzes(userId),
    enabled: !!userId,
  });
}

export function useCreateQuizDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuizDraftRequest) => quizzesApi.createQuizDraft(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes });
    },
  });
}

export function useUpdateQuiz(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateQuizVariables) => quizzesApi.updateQuiz(data),
    onMutate: async (newData: UpdateQuizVariables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.quiz(id) });
      const previous = queryClient.getQueryData<Quiz>(queryKeys.quiz(id));

      let optimistic: Quiz | undefined = previous;
      if (previous) {
        optimistic = { ...previous, ...newData } as Quiz;

        if (previous.questions && newData.questions) {
          const byId = new Map<string, QuizQuestion>(
            previous.questions.map((q) => [q.id, q])
          );
          optimistic.questions = newData.questions.map((nq) => {
            const existing = byId.get(nq.id);
            if (!existing) return nq as QuizQuestion;

            const mergedOptions = existing.options.map((opt) => {
              const patchedOpt = nq.options?.find((o) => o.id === opt.id);
              return patchedOpt ? { ...opt, ...patchedOpt } : opt;
            });
            return {
              ...existing,
              ...nq,
              options: mergedOptions.length ? mergedOptions : existing.options,
            } as QuizQuestion;
          });
        }
      }

      queryClient.setQueryData(queryKeys.quiz(id), optimistic);
      return { previous } as MutationContext;
    },
    onError: (_err, _newData, context: MutationContext | undefined) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.quiz(id), context.previous);
      }
    },
    onSuccess: (updatedQuiz: Quiz) => {
      queryClient.setQueryData(queryKeys.quiz(id), updatedQuiz);
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quiz(id) });
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: string) => quizzesApi.deleteQuiz(quizId),
    onSuccess: (_, deletedId: string) => {
      queryClient.removeQueries({ queryKey: queryKeys.quiz(deletedId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes });
    },
  });
}
