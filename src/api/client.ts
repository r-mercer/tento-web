import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, ENDPOINTS } from "../utils/constants";
import { storage } from "../utils/storage";
import { authEvents } from "../utils/auth-events";
import type { RefreshTokenResponse } from "../types/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(callback: (token: string) => void): void {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string): void {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getAccessToken();

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

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

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
      authEvents.emit("session-expired", { reason: "no-refresh-token" });
      return Promise.reject(error);
    }

    try {
      const response = await axios.post<RefreshTokenResponse>(
        `${API_BASE_URL}${ENDPOINTS.AUTH_REFRESH}`,
        { refresh_token: refreshToken }
      );

      const { token: newAccessToken, refresh_token: newRefreshToken } = response.data;

      storage.setTokens(newAccessToken, newRefreshToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      onTokenRefreshed(newAccessToken);
      isRefreshing = false;
      authEvents.emit("token-refreshed");

      return apiClient(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      authEvents.emit("session-expired", { reason: "refresh-failed" });
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
