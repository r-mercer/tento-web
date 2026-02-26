import React, { createContext, useCallback, useContext, useState } from "react";
import {
  MessageBar,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";

type Toast = {
  id: number;
  type: "success" | "error" | "info";
  message: string;
};

const ToastContext = createContext<{
  push: (t: Omit<Toast, "id">) => void;
}>({ push: () => {} });

const useStyles = makeStyles({
  container: {
    position: "fixed",
    top: tokens.spacingVerticalM,
    right: tokens.spacingHorizontalM,
    zIndex: 9999,
    width: "min(360px, calc(100vw - 2rem))",
  },
  item: {
    ...shorthands.margin(0, 0, tokens.spacingVerticalXS, 0),
  },
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const styles = useStyles();
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
      <div className={styles.container}>
        {toasts.map((t) => (
          <div key={t.id} className={styles.item}>
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

// eslint-disable-next-line react-refresh/only-export-components
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
