// ============================================================================
// Authentication Types
// ============================================================================

export interface AuthResponse {
  token: string;
  refresh_token: string;
  username: string;
  email: string;
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
  avatar_url?: string;
  role: 'admin' | 'user';
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
  role?: 'admin' | 'user';
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'user';
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

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateQuizRequest {
  title: string;
  description?: string;
  questions: Omit<QuizQuestion, 'id'>[];
}

export interface UpdateQuizRequest {
  title?: string;
  description?: string;
  questions?: QuizQuestion[];
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
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
