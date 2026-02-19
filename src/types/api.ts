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
  question_type: QuizQuestionType;
  options: QuizQuestionOption[];
  option_count: number;
  order: number;
  topic: string;
  created_at?: string;
  modified_at?: string;
}

export interface Quiz {
  id: string;
  name: string;
  created_by_user_id: string;
  title?: string;
  description?: string;
  question_count: number;
  required_score: number;
  attempt_limit: number;
  topic?: string;
  status: QuizStatus;
  questions?: QuizQuestion[];
  url: string;
  created_at?: string;
  modified_at?: string;
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
  question_type: QuizQuestionType;
  options: QuizQuestionOptionForTaking[];
  option_count: number;
  order: number;
  topic: string;
  created_at?: string;
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
  quiz_id: string;
  points_earned: number;
  total_possible: number;
  passed: boolean;
  attempt_number: number;
  submitted_at: string;
}

export interface QuestionAttemptDetail {
  question_id: string;
  user_selected_option_ids: string[];
  correct_option_ids: string[];
  is_correct: boolean;
  points_earned: number;
  explanation: string;
}

export interface QuizAttemptReview {
  attempt: QuizAttemptResponse;
  quiz: Quiz; // Full quiz with answers
  question_results: QuestionAttemptDetail[];
}

// ============================================================================
// Quiz Submission
// ============================================================================

export interface QuestionAnswerSubmission {
  question_id: string;
  selected_option_ids: string[];
}

export interface SubmitQuizAttemptPayload {
  quiz_id: string;
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
