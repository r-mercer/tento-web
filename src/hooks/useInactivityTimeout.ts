import { useEffect } from "react";
import { authEvents } from "../utils/auth-events";

export function useInactivityTimeout(timeoutMinutes: number = 30, isAuthenticated: boolean = false): void {
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeout: ReturnType<typeof setTimeout>;

    const handleActivity = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        authEvents.emit("session-expired", { reason: "inactivity" });
      }, timeoutMinutes * 60 * 1000);
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];

    events.forEach((event) => window.addEventListener(event, handleActivity, true));
    handleActivity();

    return () => {
      clearTimeout(timeout);
      events.forEach((event) => window.removeEventListener(event, handleActivity, true));
    };
  }, [isAuthenticated, timeoutMinutes]);
}
