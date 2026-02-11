import { STORAGE_KEYS } from './constants';

// ============================================================================
// Token Storage
// ============================================================================

export const storage = {
  /**
   * Get access token from localStorage
   */
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Set access token in localStorage
   */
  setAccessToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  /**
   * Remove access token from localStorage
   */
  removeAccessToken(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Set refresh token in localStorage
   */
  setRefreshToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  /**
   * Remove refresh token from localStorage
   */
  removeRefreshToken(): void {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Set both access and refresh tokens
   */
  setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  },

  /**
   * Remove both access and refresh tokens
   */
  clearTokens(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
  },

  /**
   * Get user data from localStorage
   */
  getUser<T>(): T | null {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData) as T;
    } catch {
      return null;
    }
  },

  /**
   * Set user data in localStorage
   */
  setUser<T>(user: T): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  /**
   * Remove user data from localStorage
   */
  removeUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  /**
   * Clear all stored data
   */
  clear(): void {
    this.clearTokens();
    this.removeUser();
  },
};
