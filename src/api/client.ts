import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../utils/constants';
import { storage } from '../utils/storage';
import type { RefreshTokenResponse } from '../types/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getAccessToken();
    
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'none'
    });
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    console.error(`[API Error] ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`, {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // If error is not 401 or request already retried, reject immediately
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          resolve(apiClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = storage.getRefreshToken();

    if (!refreshToken) {
      isRefreshing = false;
      storage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      // Call refresh endpoint
      const response = await axios.post<RefreshTokenResponse>(
        `${API_BASE_URL}${ENDPOINTS.AUTH_REFRESH}`,
        { refresh_token: refreshToken }
      );

      const { token: newAccessToken, refresh_token: newRefreshToken } = response.data;

      // Store new tokens
      storage.setTokens(newAccessToken, newRefreshToken);

      // Update authorization header
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      // Notify all waiting requests
      onTokenRefreshed(newAccessToken);
      isRefreshing = false;

      // Retry original request
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh failed - clear tokens and redirect to login
      isRefreshing = false;
      storage.clear();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);

// ============================================================================
// Export
// ============================================================================

export default apiClient;
