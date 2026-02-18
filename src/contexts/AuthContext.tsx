import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { storage } from '../utils/storage';
import type { User } from '../types/api';

// ============================================================================
// Auth Context Types
// ============================================================================

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, refreshToken: string, userData: Partial<User>) => void;
  logout: () => void;
}

// ============================================================================
// Auth Context
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Auth Provider
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage on mount
  useEffect(() => {
    const initializeAuth = () => {
      const token = storage.getAccessToken();
      const storedUser = storage.getUser<User>();

      if (token && storedUser) {
        setUser(storedUser);
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token: string, refreshToken: string, userData: Partial<User>) => {
    // Store tokens
    storage.setTokens(token, refreshToken);

    // Create user object with defaults
    const fullUser: User = {
      id: userData.id || '',
      username: userData.username || '',
      email: userData.email || '',
      full_name: userData.full_name,
      github_id: userData.github_id,
      avatar_url: userData.avatar_url,
      role: userData.role || 'user',
      created_at: userData.created_at || new Date().toISOString(),
      updated_at: userData.updated_at || new Date().toISOString(),
    };

    // Store user data
    storage.setUser(fullUser);
    setUser(fullUser);
  };

  const logout = () => {
    storage.clear();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// useAuth Hook
// ============================================================================

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
