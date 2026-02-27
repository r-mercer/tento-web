import axios from "axios";
import { API_BASE_URL, ENDPOINTS } from "./constants";
import { storage } from "./storage";
import { authEvents } from "./auth-events";
import type { RefreshTokenResponse } from "../types/api";

let refreshInFlight: Promise<string> | null = null;

async function performRefresh(): Promise<string> {
  const refreshToken = storage.getRefreshToken();

  if (!refreshToken) {
    authEvents.emit("session-expired", { reason: "no-refresh-token" });
    throw new Error("No refresh token available");
  }

  try {
    const response = await axios.post<RefreshTokenResponse>(
      `${API_BASE_URL}${ENDPOINTS.AUTH_REFRESH}`,
      { refresh_token: refreshToken },
    );

    const { token: newAccessToken, refresh_token: newRefreshToken } = response.data;
    storage.setTokens(newAccessToken, newRefreshToken);
    authEvents.emit("token-refreshed");
    return newAccessToken;
  } catch {
    authEvents.emit("session-expired", { reason: "refresh-failed" });
    throw new Error("Failed to refresh access token");
  }
}

export async function refreshSessionToken(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}
