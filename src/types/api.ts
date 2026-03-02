// ============================================================================
// Authentication Types
// ============================================================================

export interface AuthResponse {
  token: string;
  refresh_token: string;
  id: string;
  username: string;
  email: string;
  role: "admin" | "user";
  full_name?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  token: string;
  refresh_token: string;
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  github_id?: string;
  role: "admin" | "user";
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  full_name?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  full_name?: string;
  role?: "admin" | "user";
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  role: "admin" | "user";
  created_at: string;
  updated_at: string;
}

export interface UsersListResponse {
  users: UserResponse[];
  total: number;
}

// ============================================================================
// Quiz Types
// ============================================================================

export type QuizStatus = "Draft" | "Pending" | "Ready" | "Complete";
export type QuizQuestionType = "Single" | "Multi" | "Bool";

export interface QuizQuestionOption {
  id: string;
  text: string;
  correct?: boolean; // Only in results view (quiz_for_results)
  explanation?: string; // Only in results view
}

export interface QuizQuestion {
  id: string;
  title: string;
  description: string;
  questionType: QuizQuestionType;
  options: QuizQuestionOption[];
  optionCount: number;
  order: number;
  topic: string;
  createdAt?: string;
  modifiedAt?: string;
}

export interface Quiz {
  id: string;
  name: string;
  createdByUserId: string;
  title?: string;
  description?: string;
  questionCount: number;
  requiredScore: number;
  attemptLimit: number;
  topic?: string;
  status: QuizStatus;
  questions?: QuizQuestion[];
  url: string;
  createdAt?: string;
  modifiedAt?: string;
}

export interface CreateQuizDraftRequest {
  name: string;
  created_by_user_id: string;
  question_count: number;
  required_score: number;
  attempt_limit: number;
  url: string;
}

// For quiz taking (answers hidden)
export interface QuizQuestionOptionForTaking {
  id: string;
  text: string;
  // No 'correct' or 'explanation'
}

export interface QuizQuestionForTaking {
  id: string;
  title: string;
  description: string;
  questionType: QuizQuestionType;
  options: QuizQuestionOptionForTaking[];
  optionCount: number;
  order: number;
  topic: string;
  createdAt?: string;
}

export interface QuizForTaking {
  id: string;
  name: string;
  title?: string;
  description?: string;
  question_count: number;
  required_score: number;
  topic?: string;
  status: QuizStatus;
  questions?: QuizQuestionForTaking[];
  url: string;
  created_at?: string;
}

// ============================================================================
// Quiz Attempt Types
// ============================================================================

export interface QuizAttemptResponse {
  id: string;
  quizId: string;
  pointsEarned: number;
  totalPossible: number;
  requiredScore: number;
  passed: boolean;
  attemptNumber: number;
  submittedAt: string;
}

export interface QuestionAttemptDetail {
  questionId: string;
  userSelectedOptionIds: string[];
  correctOptionIds: string[];
  isCorrect: boolean;
  pointsEarned: number;
  explanation: string;
}

export interface QuizAttemptReview {
  attempt: QuizAttemptResponse;
  quiz: Quiz;
  questionResults: QuestionAttemptDetail[];
}

// ============================================================================
// Quiz Submission
// ============================================================================

export interface QuestionAnswerSubmission {
  questionId: string;
  selectedOptionIds: string[];
}

export interface SubmitQuizAttemptPayload {
  quizId: string;
  answers: QuestionAnswerSubmission[];
}

// ============================================================================
// GraphQL Types
// ============================================================================

export interface GraphQLError {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: string[];
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

// ============================================================================
// API Error Types
// ============================================================================

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface PaginationMetadata {
  offset: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}
