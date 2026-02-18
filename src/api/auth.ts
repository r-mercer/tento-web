import apiClient from './client';
import { ENDPOINTS, GH_REDIRECT_URI } from '../utils/constants';
import type { AuthResponse, RefreshTokenRequest, RefreshTokenResponse } from '../types/api';

export async function handleGithubCallback(code: string): Promise<AuthResponse> {
  const response = await apiClient.get<AuthResponse>(ENDPOINTS.AUTH_GITHUB_CALLBACK, {
    params: { code, redirect_uri: GH_REDIRECT_URI },
  });
  return response.data;
}

export async function refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse> {
  const response = await apiClient.post<RefreshTokenResponse>(
    ENDPOINTS.AUTH_REFRESH,
    { refresh_token: refreshToken } as RefreshTokenRequest
  );
  return response.data;
}
