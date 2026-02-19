import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { storage } from "../utils/storage";
import { authEvents } from "../utils/auth-events";
import { isTokenExpired, getTimeUntilExpiry } from "../utils/jwt";
import { useInactivityTimeout } from "../hooks/useInactivityTimeout";
import { useSessionValidation } from "../hooks/useSessionValidation";
import { refreshAccessToken, logout as apiLogout } from "../api/auth";
import { ROUTES } from "../utils/constants";
import type { User } from "../types/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, refreshToken: string, userData: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    const token = storage.getAccessToken();
    const storedUser = storage.getUser<User>();
    
    if (token && isTokenExpired(token)) {
      storage.clear();
      return null;
    }
    
    return token && storedUser ? storedUser : null;
  });
  
  const [isLoading] = useState(false);
  const navigate = useNavigate();

  useInactivityTimeout(30);
  useSessionValidation(5);

  useEffect(() => {
    const unsubscribe = authEvents.on("session-expired", () => {
      storage.clear();
      setUser(null);
      navigate(ROUTES.LOGIN, { replace: true });
    });

    return unsubscribe;
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const checkAndRefreshToken = async () => {
      const token = storage.getAccessToken();
      if (!token) return;

      const timeUntilExpiry = getTimeUntilExpiry(token);
      const buffer = 5 * 60 * 1000;

      if (timeUntilExpiry > 0 && timeUntilExpiry <= buffer) {
        try {
          const refreshToken = storage.getRefreshToken();
          if (!refreshToken) {
            authEvents.emit("session-expired", { reason: "no-refresh-token" });
            return;
          }

          const response = await refreshAccessToken(refreshToken);
          storage.setTokens(response.token, response.refresh_token);
          authEvents.emit("token-refreshed");
        } catch {
          authEvents.emit("session-expired", { reason: "refresh-failed" });
        }
      }
    };

    const interval = setInterval(checkAndRefreshToken, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const login = useCallback((token: string, refreshToken: string, userData: Partial<User>) => {
    storage.setTokens(token, refreshToken);

    const fullUser: User = {
      id: userData.id || "",
      username: userData.username || "",
      email: userData.email || "",
      full_name: userData.full_name,
      github_id: userData.github_id,
      role: userData.role || "user",
      created_at: userData.created_at || new Date().toISOString(),
      updated_at: userData.updated_at || new Date().toISOString(),
    };

    storage.setUser(fullUser);
    setUser(fullUser);
  }, []);

  const logout = useCallback(() => {
    const refreshToken = storage.getRefreshToken();
    
    storage.clear();
    setUser(null);
    authEvents.emit("logout");
    
    if (refreshToken) {
      apiLogout(refreshToken).catch(() => {
        // Silently ignore errors - token may already be invalid
      });
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
