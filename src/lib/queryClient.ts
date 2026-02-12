import { QueryClient } from '@tanstack/react-query';

// ============================================================================
// React Query Client Configuration
// ============================================================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes
      staleTime: 1000 * 60 * 5,
      
      // Cache time: 10 minutes
      gcTime: 1000 * 60 * 10,
      
      // Retry failed requests once
      retry: 1,
      
      // Don't refetch on window focus by default
      refetchOnWindowFocus: false,
      
      // Don't refetch on mount by default
      refetchOnMount: false,
      
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

// ============================================================================
// Query Keys
// ============================================================================

export const queryKeys = {
  // Users
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  
  // Quizzes
  quizzes: ['quizzes'] as const,
  quiz: (id: string) => ['quizzes', id] as const,
  userQuizzes: (userId: string) => ['users', userId, 'quizzes'] as const,
  quizForTaking: (id: string) => ['quizzes', id, 'taking'] as const,
  quizForResults: (id: string) => ['quizzes', id, 'results'] as const,
  
  // Quiz Attempts
  quizAttempts: (quizId?: string, offset: number = 0, limit: number = 10) =>
    ['quizzes', quizId || 'all', 'attempts', offset, limit] as const,
  quizAttempt: (attemptId: string) => ['attempts', attemptId] as const,
  
  // Auth
  currentUser: ['auth', 'currentUser'] as const,
} as const;
