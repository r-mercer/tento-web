import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useUserQuizzes } from "./hooks/api/useQuizzes";
import { ROUTES, GH_CLIENT_ID, GH_REDIRECT_URI } from "./utils/constants";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { handleGithubCallback } from "./api/auth";
import { GraphQLPlaygroundPage } from "./pages/GraphQLPlaygroundPage";
import { CreateQuizPage } from "./pages/CreateQuizPage";
import { EditQuizPage } from "./pages/EditQuizPage";
import { ToastProvider } from "./components/ui/ToastProvider";
import { QuizPage, QuizHistoryPage } from "./components/quiz";
import { AppCard } from "./components/ui/AppCard";
import {
  FluentProvider,
  Title1,
  Title2,
  Title3,
  Body1,
  Body2,
  Text,
  Button,
  Link,
  Spinner,
  Badge,
  MessageBar,
  MessageBarBody,
} from "@fluentui/react-components";
import { lightTheme, darkTheme } from "./styles/fluentTheme";
import { useTheme } from "./contexts/ThemeContext";
import type { Quiz, QuizStatus } from "./types/api";

function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <Title1>Tento - Home</Title1>
      {isAuthenticated ? (
        <div>
          <Body1>Welcome, {user?.username}!</Body1>
          <Body1>Email: {user?.email}</Body1>
          <Link href={ROUTES.DASHBOARD}>Go to Dashboard</Link>
        </div>
      ) : (
        <div>
          <Body1>Please login to continue</Body1>
          <Link href={ROUTES.LOGIN}>Login with GitHub</Link>
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
      <Title1>Login</Title1>
      <Button appearance="primary" onClick={handleLogin}>
        Login with GitHub
      </Button>
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
    <div style={{ padding: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
      <Spinner size="small" />
      <Body1>Authenticating...</Body1>
    </div>
  );
}

function getStatusBadgeColor(status: QuizStatus): "success" | "warning" | "important" | "informative" | "subtle" {
  switch (status) {
    case "Ready":
      return "success";
    case "Draft":
      return "warning";
    case "Complete":
      return "informative";
    default:
      return "subtle";
  }
}

function QuizCard({ quiz }: { quiz: Quiz }) {
  return (
    <AppCard style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <Title3 style={{ marginBottom: "0.25rem" }}>{quiz.name}</Title3>
        {quiz.title && (
          <Body2 style={{ color: "var(--color-text-secondary)" }}>
            {quiz.title}
          </Body2>
        )}
      </div>

      <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
        <Text>{quiz.question_count} questions</Text>
        <Text>{quiz.required_score} to pass</Text>
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Badge
          appearance="filled"
          color={getStatusBadgeColor(quiz.status)}
        >
          {quiz.status}
        </Badge>
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Button
          appearance="primary"
          as="a"
          href={ROUTES.QUIZ_TAKE(quiz.id)}
          style={{ flex: 1 }}
        >
          Take Quiz
        </Button>
        <Button
          appearance="outline"
          as="a"
          href={ROUTES.QUIZ_EDIT(quiz.id)}
        >
          Edit
        </Button>
      </div>
    </AppCard>
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
          <Title1 style={{ marginBottom: "0.5rem" }}>Dashboard</Title1>
          <Body1 style={{ color: "var(--color-text-secondary)" }}>
            Welcome, {user?.username}!
          </Body1>
        </div>
        <Button appearance="subtle" onClick={logout}>
          Logout
        </Button>
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
        <Button
          appearance="primary"
          as="a"
          href={ROUTES.QUIZ_CREATE}
          size="large"
        >
          + Create New Quiz
        </Button>

        <Button
          appearance="outline"
          as="a"
          href={ROUTES.QUIZZES}
          size="large"
        >
          View All Quizzes
        </Button>
      </div>

      <div>
        <Title2>Your Recent Quizzes</Title2>

        {isLoading && (
          <div style={{ padding: "2rem", textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
            <Spinner size="small" />
            <Body1 style={{ color: "var(--color-text-secondary)" }}>
              Loading quizzes...
            </Body1>
          </div>
        )}

        {error && (
          <MessageBar intent="error" style={{ marginBottom: "1rem" }}>
            <MessageBarBody>Error loading quizzes. Please try again later.</MessageBarBody>
          </MessageBar>
        )}

        {!isLoading && quizzes && quizzes.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1rem",
            }}
          >
            {quizzes.slice(0, 3).map((quiz: Quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        ) : !isLoading && (!quizzes || quizzes.length === 0) ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <Body1
              style={{
                color: "var(--color-text-secondary)",
                marginBottom: "1rem",
                display: "block",
              }}
            >
              No quizzes yet. Create your first quiz to get started!
            </Body1>
            <Button
              appearance="primary"
              as="a"
              href={ROUTES.QUIZ_CREATE}
            >
              Create Your First Quiz
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function UsersPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <Title1>Users</Title1>
      <Body1>Users list coming soon...</Body1>
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
        <Title1>My Quizzes</Title1>
        <Button appearance="primary" as="a" href={ROUTES.QUIZ_CREATE}>
          + Create Quiz
        </Button>
      </div>

      {isLoading && (
        <div style={{ padding: "2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <Spinner size="small" />
          <Body1 style={{ color: "var(--color-text-secondary)" }}>
            Loading quizzes...
          </Body1>
          <Body2 style={{ color: "var(--color-text-secondary)" }}>
            This may take a moment...
          </Body2>
        </div>
      )}

      {error && (
        <MessageBar intent="error" style={{ marginBottom: "1rem" }}>
          <MessageBarBody>
            <strong>Error loading quizzes</strong>
            <br />
            {error instanceof Error
              ? error.message
              : "Failed to load quizzes. Please try again."}
          </MessageBarBody>
        </MessageBar>
      )}

      {!isLoading && quizzes && quizzes.length > 0 ? (
        <div>
          <Body1
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: "1.5rem",
              display: "block",
            }}
          >
            You have {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""}
          </Body1>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {quizzes.map((quiz: Quiz) => (
              <AppCard
                key={quiz.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                  cursor: "pointer",
                }}
              >
                <div>
                  <Title3 style={{ marginBottom: "0.25rem" }}>{quiz.name}</Title3>
                  {quiz.title && (
                    <Body2 style={{ color: "var(--color-text-secondary)" }}>
                      {quiz.title}
                    </Body2>
                  )}
                  {quiz.description && (
                    <Body2
                      style={{
                        color: "var(--color-text-secondary)",
                        marginTop: "0.5rem",
                      }}
                    >
                      {quiz.description}
                    </Body2>
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
                    <Text size={200}>Questions</Text>
                    <Text weight="semibold" style={{ display: "block", marginTop: "0.25rem" }}>
                      {quiz.question_count}
                    </Text>
                  </div>
                  <div>
                    <Text size={200}>Pass Score</Text>
                    <Text weight="semibold" style={{ display: "block", marginTop: "0.25rem" }}>
                      {quiz.required_score}%
                    </Text>
                  </div>
                  <div>
                    <Text size={200}>Attempts</Text>
                    <Text weight="semibold" style={{ display: "block", marginTop: "0.25rem" }}>
                      {quiz.attempt_limit}
                    </Text>
                  </div>
                  {quiz.topic && (
                    <div>
                      <Text size={200}>Topic</Text>
                      <Text weight="semibold" style={{ display: "block", marginTop: "0.25rem" }}>
                        {quiz.topic}
                      </Text>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Badge
                    appearance="filled"
                    color={getStatusBadgeColor(quiz.status)}
                  >
                    {quiz.status}
                  </Badge>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginTop: "auto",
                  }}
                >
                  <Button
                    appearance="primary"
                    as="a"
                    href={ROUTES.QUIZ_TAKE(quiz.id)}
                    style={{ flex: 1 }}
                  >
                    Take Quiz
                  </Button>
                  <Button
                    appearance="outline"
                    as="a"
                    href={ROUTES.QUIZ_EDIT(quiz.id)}
                    style={{ flex: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    appearance="outline"
                    as="a"
                    href={ROUTES.QUIZ_HISTORY(quiz.id)}
                    style={{ flex: 1 }}
                  >
                    History
                  </Button>
                </div>
              </AppCard>
            ))}
          </div>
        </div>
      ) : !isLoading && (!quizzes || quizzes.length === 0) ? (
        <AppCard style={{ textAlign: "center", padding: "3rem" }}>
          <Title2 style={{ color: "var(--color-text-secondary)" }}>
            No quizzes yet
          </Title2>
          <Body1
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: "1rem",
              display: "block",
            }}
          >
            Create your first quiz to get started!
          </Body1>
          <Button appearance="primary" as="a" href={ROUTES.QUIZ_CREATE}>
            Create Your First Quiz
          </Button>
        </AppCard>
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
    return (
      <div style={{ padding: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
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

// ============================================================================
// App Component
// ============================================================================

function App() {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? darkTheme : lightTheme;

  return (
    <FluentProvider theme={theme}>
      <ToastProvider>
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
            path="/quizzes/:id/edit"
            element={
              <ProtectedRoute>
                <EditQuizPage />
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
      </ToastProvider>
    </FluentProvider>
  );
}

export default App;
