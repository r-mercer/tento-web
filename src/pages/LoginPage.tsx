import { Title1, Button } from "@fluentui/react-components";
import { GH_CLIENT_ID, GH_REDIRECT_URI } from "../utils/constants";
import { pageStyles } from "../styles/pageStyles";

export function LoginPage() {
  const styles = pageStyles();
  const handleLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GH_CLIENT_ID}&redirect_uri=${encodeURIComponent(GH_REDIRECT_URI || "")}&scope=read:user user:email`;
    window.location.href = githubAuthUrl;
  };

  return (
    <main className={`${styles.pageBase} ${styles.pageMax560}`}>
      <Title1>Login</Title1>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacingVerticalM)", marginTop: "var(--spacingVerticalM)" }}>
        <Button appearance="primary" onClick={handleLogin}>
          Login with GitHub
        </Button>
      </div>
    </main>
  );
}
