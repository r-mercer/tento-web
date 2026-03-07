import { Link } from "react-router-dom";
import { Title1, Body1 } from "@fluentui/react-components";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../utils/constants";
import { pageStyles } from "../styles/pageStyles";

export function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const styles = pageStyles();

  return (
    <main id="content" className={styles.pageBase}>
      <Title1>Tento - Home</Title1>
      {isAuthenticated ? (
        <div>
          <Body1>Welcome, {user?.username}!</Body1>
          <Body1>Email: {user?.email}</Body1>
          <Link to={ROUTES.DASHBOARD}>Go to Dashboard</Link>
        </div>
      ) : (
        <div>
          <Body1>Please login to continue</Body1>
          <Link to={ROUTES.LOGIN}>Login with GitHub</Link>
        </div>
      )}
    </main>
  );
}
