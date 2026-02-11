import apiClient from './client';
import { ENDPOINTS } from '../utils/constants';
import type { AuthResponse, RefreshTokenRequest, RefreshTokenResponse } from '../types/api';

// ============================================================================
// Auth API Functions
// ============================================================================

/**
 * Handle GitHub OAuth callback
 */
export async function handleGithubCallback(code: string): Promise<AuthResponse> {
  const response = await apiClient.get<AuthResponse>(ENDPOINTS.AUTH_GITHUB_CALLBACK, {
    params: { code },
  });
  return response.data;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse> {
  const response = await apiClient.post<RefreshTokenResponse>(
    ENDPOINTS.AUTH_REFRESH,
    { refresh_token: refreshToken } as RefreshTokenRequest
  );
  return response.data;
}
