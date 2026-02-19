import { useEffect } from "react";
import { authEvents } from "../utils/auth-events";
import { storage } from "../utils/storage";
import * as usersApi from "../api/users";

export function useSessionValidation(intervalMinutes: number = 5, isAuthenticated: boolean = false): void {
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
