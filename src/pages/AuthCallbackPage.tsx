import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Title2, Body1, Spinner } from "@fluentui/react-components";
import { useAuth } from "../hooks/useAuth";
import { handleGithubCallback } from "../api/auth";
import { ROUTES } from "../utils/constants";
import { pageStyles } from "../styles/pageStyles";

export function AuthCallbackPage() {
  const styles = pageStyles();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      navigate(ROUTES.LOGIN);
      return;
    }

    const authenticate = async () => {
      try {
        const response = await handleGithubCallback(code);

        login(response.token, response.refresh_token, {
          id: response.id,
          username: response.username,
          email: response.email,
        });

        navigate(ROUTES.DASHBOARD);
      } catch (error) {
        console.error("Authentication failed:", error);
        navigate(ROUTES.LOGIN);
      }
    };

    authenticate();
  }, [searchParams, navigate, login]);

  return (
    <main
      id="content"
      className={`${styles.pageBase} ${styles.centeredColumn}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner size="large" />
      <Title2>Authenticating with GitHub...</Title2>
      <Body1 style={{ color: "var(--colorNeutralForeground2)" }}>
        Please wait while we verify your credentials
      </Body1>
    </main>
  );
}
