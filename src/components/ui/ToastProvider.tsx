import React, { createContext, useCallback, useContext, useState } from "react";
import { MessageBar } from "@fluentui/react-components";

type Toast = {
  id: number;
  type: "success" | "error" | "info";
  message: string;
};

const ToastContext = createContext<{
  push: (t: Omit<Toast, "id">) => void;
}>({ push: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const toast: Toast = { id, ...t };
    setToasts((s) => [...s, toast]);
    setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div
        style={{
          position: "fixed",
          right: 16,
          top: 16,
          zIndex: 9999,
          width: 360,
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ marginBottom: 8 }}>
            <MessageBar
              intent={
                t.type === "success"
                  ? "success"
                  : t.type === "error"
                  ? "error"
                  : "info"
              }
            >
              {t.message}
            </MessageBar>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  const push = ctx.push;
  return {
    success: (message: string) => push({ type: "success", message }),
    error: (message: string) => push({ type: "error", message }),
    info: (message: string) => push({ type: "info", message }),
  };
}

export default ToastProvider;
