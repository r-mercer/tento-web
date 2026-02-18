import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { authEvents } from "../utils/auth-events";
import { storage } from "../utils/storage";
import * as usersApi from "../api/users";

export function useSessionValidation(intervalMinutes: number = 5): void {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const validateSession = async () => {
      const user = storage.getUser<{ id: string }>();
      if (!user?.id) return;
      
      try {
        await usersApi.getUser(user.id);
      } catch {
        authEvents.emit("session-expired", { reason: "validation-failed" });
      }
    };

    const interval = setInterval(validateSession, intervalMinutes * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, intervalMinutes]);
}
