import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Body1, Spinner } from "@fluentui/react-components";
import { ROUTES } from "../../utils/constants";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          padding: "clamp(1rem, 3vw, 2.5rem)",
          display: "flex",
          alignItems: "center",
          gap: "var(--spacingHorizontalM)",
        }}
        role="status"
        aria-live="polite"
      >
        <Spinner size="small" />
        <Body1>Loading...</Body1>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}
