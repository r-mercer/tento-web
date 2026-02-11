// ============================================================================
// API Configuration
// ============================================================================

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ============================================================================
// GitHub OAuth Configuration
// ============================================================================

export const GH_CLIENT_ID = import.meta.env.VITE_GH_CLIENT_ID;
export const GH_REDIRECT_URI = import.meta.env.VITE_GH_REDIRECT_URI || 'http://localhost:5173/auth/callback';

// ============================================================================
// API Endpoints
// ============================================================================

export const ENDPOINTS = {
  // Auth
  AUTH_GITHUB_CALLBACK: '/auth/github/callback',
  AUTH_REFRESH: '/auth/refresh',
  
  // Users
  USERS: '/api/users',
  USER: (id: string) => `/api/users/${id}`,
  
  // Quizzes
  QUIZZES: '/api/quizzes',
  QUIZ: (id: string) => `/api/quizzes/${id}`,
  
  // GraphQL
  GRAPHQL: '/graphql',
  GRAPHQL_PLAYGROUND: '/playground',
} as const;

// ============================================================================
// Route Paths
// ============================================================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  AUTH_CALLBACK: '/auth/callback',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  USER_DETAIL: (id: string) => `/users/${id}`,
  QUIZZES: '/quizzes',
  QUIZ_DETAIL: (id: string) => `/quizzes/${id}`,
  PROFILE: '/profile',
} as const;

// ============================================================================
// Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'tento_access_token',
  REFRESH_TOKEN: 'tento_refresh_token',
  USER: 'tento_user',
} as const;

// ============================================================================
// HTTP Configuration
// ============================================================================

export const HTTP_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 1,
  RETRY_DELAY: 1000, // 1 second
} as const;
