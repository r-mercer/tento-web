import { STORAGE_KEYS } from './constants';
import { getTokenExpiration } from './jwt';

export const storage = {
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  setAccessToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    
    const expiresAt = getTokenExpiration(token);
    if (expiresAt) {
      this.setTokenExpiration(expiresAt);
    }
  },

  removeAccessToken(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  removeRefreshToken(): void {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  },

  clearTokens(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
    this.removeTokenExpiration();
  },

  getTokenExpiration(): number | null {
    const expiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRATION);
    return expiresAt ? parseInt(expiresAt, 10) : null;
  },

  setTokenExpiration(expiresAt: number): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRATION, expiresAt.toString());
  },

  removeTokenExpiration(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRATION);
  },

  getUser<T>(): T | null {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData) as T;
    } catch {
      return null;
    }
  },

  setUser<T>(user: T): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  removeUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  clear(): void {
    this.clearTokens();
    this.removeUser();
  },
};
