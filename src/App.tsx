import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useUserQuizzes } from "./hooks/api/useQuizzes";
import { ROUTES, GH_CLIENT_ID, GH_REDIRECT_URI } from "./utils/constants";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { handleGithubCallback } from "./api/auth";
import { GraphQLPlaygroundPage } from "./pages/GraphQLPlaygroundPage";
import { CreateQuizPage } from "./pages/CreateQuizPage";
import { QuizPage, QuizHistoryPage } from "./components/quiz";

function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Tento - Home</h1>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.username}!</p>
          <p>Email: {user?.email}</p>
          <a href={ROUTES.DASHBOARD}>Go to Dashboard</a>
        </div>
      ) : (
        <div>
          <p>Please login to continue</p>
          <a href={ROUTES.LOGIN}>Login with GitHub</a>
        </div>
      )}
    </div>
  );
}

function LoginPage() {
  const handleLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GH_CLIENT_ID}&redirect_uri=${encodeURIComponent(GH_REDIRECT_URI || "")}&scope=read:user user:email`;
    window.location.href = githubAuthUrl;
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Login</h1>
      <button onClick={handleLogin}>Login with GitHub</button>
    </div>
  );
}

function AuthCallbackPage() {
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
    <div style={{ padding: "2rem" }}>
      <p>Authenticating...</p>
    </div>
  );
}

function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.username}!</p>

      <div
        style={{
          marginTop: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "400px",
        }}
      >
        <a
          href={ROUTES.QUIZ_CREATE}
          style={{
            padding: "1rem",
            backgroundColor: "var(--color-primary)",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "600",
          }}
        >
          Create New Quiz
        </a>

        <a
          href={ROUTES.QUIZZES}
          style={{
            padding: "1rem",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-primary)",
            textDecoration: "none",
            borderRadius: "8px",
            textAlign: "center",
            border: "2px solid var(--color-border)",
          }}
        >
          View All Quizzes
        </a>
      </div>

      <button onClick={logout} style={{ marginTop: "2rem" }}>
        Logout
      </button>
    </div>
  );
}

function UsersPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Users</h1>
      <p>Users list coming soon...</p>
    </div>
  );
}

function QuizzesPage() {
  const { user } = useAuth();
  const { data: quizzes, isLoading } = useUserQuizzes(user?.id || "");

  if (isLoading) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>Loading quizzes...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1>My Quizzes</h1>
        <a
          href={ROUTES.QUIZ_CREATE}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "var(--color-primary)",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "600",
          }}
        >
          Create Quiz
        </a>
      </div>

      {quizzes && quizzes.length > 0 ? (
        <div style={{ display: "grid", gap: "1rem" }}>
          {quizzes.map((quiz: any) => (
            <div
              key={quiz.id}
              style={{
                padding: "1.5rem",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
              }}
            >
              <h3 style={{ margin: "0 0 0.5rem 0" }}>{quiz.name}</h3>
              <p
                style={{
                  margin: "0 0 1rem 0",
                  color: "var(--color-text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                {quiz.question_count} questions • Passing score:{" "}
                {quiz.required_score} • Status: {quiz.status}
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <a
                  href={ROUTES.QUIZ_TAKE(quiz.id)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "var(--color-primary)",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                  }}
                >
                  Take Quiz
                </a>
                <a
                  href={ROUTES.QUIZ_HISTORY(quiz.id)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "transparent",
                    color: "var(--color-text-primary)",
                    textDecoration: "none",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.9rem",
                  }}
                >
                  View History
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: "1rem",
            }}
          >
            No quizzes yet. Create your first quiz to get started!
          </p>
          <a
            href={ROUTES.QUIZ_CREATE}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "var(--color-primary)",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: "600",
              display: "inline-block",
            }}
          >
            Create Your First Quiz
          </a>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Protected Route Component
// ============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}

// ============================================================================
// App Component
// ============================================================================

function App() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallbackPage />} />

      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.USERS}
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.QUIZZES}
        element={
          <ProtectedRoute>
            <QuizzesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.QUIZ_CREATE}
        element={
          <ProtectedRoute>
            <CreateQuizPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/quizzes/:id/take"
        element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/quizzes/:id/history"
        element={
          <ProtectedRoute>
            <QuizHistoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.GRAPHQL_PLAYGROUND}
        element={
          <ProtectedRoute>
            <GraphQLPlaygroundPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
