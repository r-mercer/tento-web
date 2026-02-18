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
    <div style={{ padding: "2rem" }}>
      <p>Authenticating...</p>
    </div>
  );
}

function DashboardPage() {
  const { user, logout } = useAuth();
  const { data: quizzes, isLoading, error } = useUserQuizzes(user?.id || "");

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 0.5rem 0" }}>Dashboard</h1>
          <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
            Welcome, {user?.username}!
          </p>
        </div>
        <button
          onClick={logout}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "var(--color-error, #ef4444)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          Logout
        </button>
      </div>

      <div
        style={{
          marginTop: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "400px",
          marginBottom: "3rem",
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
            transition: "opacity 0.2s",
          }}
        >
          + Create New Quiz
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
            fontWeight: "600",
            transition: "border-color 0.2s",
          }}
        >
          View All Quizzes
        </a>
      </div>

      {/* Recent Quizzes Section */}
      <div>
        <h2>Your Recent Quizzes</h2>

        {isLoading && (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Loading quizzes...
            </p>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "var(--color-error-bg, #fee)",
              color: "var(--color-error, #c00)",
              borderRadius: "8px",
              marginBottom: "1rem",
            }}
          >
            <p>Error loading quizzes. Please try again later.</p>
          </div>
        )}

        {!isLoading && quizzes && quizzes.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1rem",
            }}
          >
            {quizzes.slice(0, 3).map((quiz: any) => (
              <div
                key={quiz.id}
                style={{
                  padding: "1.5rem",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 0.25rem 0" }}>{quiz.name}</h3>
                  {quiz.title && (
                    <p
                      style={{
                        margin: 0,
                        color: "var(--color-text-secondary)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {quiz.title}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <span>📝 {quiz.question_count} questions</span>
                  <span>✓ {quiz.required_score} to pass</span>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <span
                    style={{
                      padding: "0.25rem 0.5rem",
                      backgroundColor:
                        quiz.status === "Ready"
                          ? "var(--color-success-bg, #efe)"
                          : quiz.status === "Draft"
                            ? "var(--color-warning-bg, #ffe)"
                            : "var(--color-info-bg, #eef)",
                      color:
                        quiz.status === "Ready"
                          ? "var(--color-success, #060)"
                          : quiz.status === "Draft"
                            ? "var(--color-warning, #880)"
                            : "var(--color-info, #008)",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                    }}
                  >
                    {quiz.status}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <a
                    href={ROUTES.QUIZ_TAKE(quiz.id)}
                    style={{
                      flex: 1,
                      padding: "0.5rem 1rem",
                      backgroundColor: "var(--color-primary)",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      textAlign: "center",
                      transition: "opacity 0.2s",
                    }}
                  >
                    Take Quiz
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : !isLoading && (!quizzes || quizzes.length === 0) ? (
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
        ) : null}
      </div>
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
  const { data: quizzes, isLoading, error } = useUserQuizzes(user?.id || "");

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 style={{ margin: 0 }}>My Quizzes</h1>
        <a
          href={ROUTES.QUIZ_CREATE}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "var(--color-primary)",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "600",
            transition: "opacity 0.2s",
          }}
        >
          + Create Quiz
        </a>
      </div>

      {isLoading && (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              padding: "1rem",
              color: "var(--color-text-secondary)",
            }}
          >
            <p style={{ marginBottom: "0.5rem" }}>Loading quizzes...</p>
            <p style={{ fontSize: "0.85rem", margin: 0 }}>
              This may take a moment...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "var(--color-error-bg, #fee)",
            color: "var(--color-error, #c00)",
            borderRadius: "8px",
            marginBottom: "1rem",
            border: "1px solid var(--color-error, #c00)",
          }}
        >
          <strong>Error loading quizzes</strong>
          <p style={{ margin: "0.5rem 0 0 0" }}>
            {error instanceof Error
              ? error.message
              : "Failed to load quizzes. Please try again."}
          </p>
        </div>
      )}

      {!isLoading && quizzes && quizzes.length > 0 ? (
        <div>
          <p
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: "1.5rem",
            }}
          >
            You have {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {quizzes.map((quiz: any) => (
              <div
                key={quiz.id}
                style={{
                  padding: "1.5rem",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.1)";
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "var(--color-border)";
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: "0 0 0.25rem 0",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                    }}
                  >
                    {quiz.name}
                  </h3>
                  {quiz.title && (
                    <p
                      style={{
                        margin: 0,
                        color: "var(--color-text-secondary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      {quiz.title}
                    </p>
                  )}
                  {quiz.description && (
                    <p
                      style={{
                        margin: "0.5rem 0 0 0",
                        color: "var(--color-text-secondary)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {quiz.description}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    fontSize: "0.9rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: "0.75rem" }}>Questions</p>
                    <p style={{ margin: "0.25rem 0 0 0", fontWeight: "600" }}>
                      {quiz.question_count}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.75rem" }}>Pass Score</p>
                    <p style={{ margin: "0.25rem 0 0 0", fontWeight: "600" }}>
                      {quiz.required_score}%
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.75rem" }}>Attempts</p>
                    <p style={{ margin: "0.25rem 0 0 0", fontWeight: "600" }}>
                      {quiz.attempt_limit}
                    </p>
                  </div>
                  {quiz.topic && (
                    <div>
                      <p style={{ margin: 0, fontSize: "0.75rem" }}>Topic</p>
                      <p style={{ margin: "0.25rem 0 0 0", fontWeight: "600" }}>
                        {quiz.topic}
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      backgroundColor:
                        quiz.status === "Ready"
                          ? "var(--color-success-bg, #efe)"
                          : quiz.status === "Draft"
                            ? "var(--color-warning-bg, #ffe)"
                            : quiz.status === "Complete"
                              ? "var(--color-info-bg, #eef)"
                              : "var(--color-border)",
                      color:
                        quiz.status === "Ready"
                          ? "var(--color-success, #060)"
                          : quiz.status === "Draft"
                            ? "var(--color-warning, #880)"
                            : quiz.status === "Complete"
                              ? "var(--color-info, #008)"
                              : "var(--color-text-primary)",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {quiz.status}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginTop: "auto",
                  }}
                >
                  <a
                    href={ROUTES.QUIZ_TAKE(quiz.id)}
                    style={{
                      flex: 1,
                      padding: "0.75rem 1rem",
                      backgroundColor: "var(--color-primary)",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      textAlign: "center",
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    Take Quiz
                  </a>
                  <a
                    href={ROUTES.QUIZ_HISTORY(quiz.id)}
                    style={{
                      flex: 1,
                      padding: "0.75rem 1rem",
                      backgroundColor: "transparent",
                      color: "var(--color-primary)",
                      textDecoration: "none",
                      borderRadius: "6px",
                      border: "1px solid var(--color-primary)",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      textAlign: "center",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--color-primary)";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--color-primary)";
                    }}
                  >
                    History
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !isLoading && (!quizzes || quizzes.length === 0) ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            backgroundColor: "var(--color-surface)",
            borderRadius: "8px",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2 style={{ color: "var(--color-text-secondary)" }}>
            No quizzes yet
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: "1rem",
            }}
          >
            Create your first quiz to get started!
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
              transition: "opacity 0.2s",
            }}
          >
            Create Your First Quiz
          </a>
        </div>
      ) : null}
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
