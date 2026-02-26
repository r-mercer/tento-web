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
import {
  QuizPage,
  QuizHistoryPage,
  QuizErrorBoundary,
} from "./components/quiz";
import { AppCard } from "./components/ui/AppCard";
import { Navbar } from "./components/ui/Navbar";
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
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { lightTheme, darkTheme } from "./styles/fluentTheme";
import { LAYOUT, TYPOGRAPHY } from "./styles/layoutRhythm";
import { useTheme } from "./contexts/ThemeContext";
import type { Quiz, QuizStatus } from "./types/api";

const useStyles = makeStyles({
  pageBase: {
    ...shorthands.padding(LAYOUT.pagePadding),
    ...shorthands.margin(0, "auto"),
  },
  pageMax560: { maxWidth: LAYOUT.maxWidth.narrow },
  pageMax900: { maxWidth: LAYOUT.maxWidth.hero },
  pageMax1200: { maxWidth: LAYOUT.maxWidth.wide },
  pageMax800: { maxWidth: LAYOUT.maxWidth.content },
  centeredColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: tokens.spacingVerticalM,
    minHeight: "100vh",
    justifyContent: "center",
  },
  mutedText: { color: TYPOGRAPHY.mutedForeground },
  sectionTitle: {
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.titleBottom, 0),
  },
  quizCard: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  quizMeta: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
    fontSize: tokens.fontSizeBase200,
    color: TYPOGRAPHY.mutedForeground,
  },
  row: { display: "flex", gap: tokens.spacingHorizontalS },
  grow: { flex: 1 },
  dashboardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalM,
    ...shorthands.margin(0, 0, tokens.spacingVerticalXXL, 0),
  },
  dashboardActions: {
    ...shorthands.margin(
      tokens.spacingVerticalL,
      0,
      tokens.spacingVerticalXXL,
      0,
    ),
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
    maxWidth: LAYOUT.maxWidth.dashboardActions,
    width: "100%",
  },
  loadingCenterRow: {
    ...shorthands.padding(LAYOUT.pagePadding),
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
  },
  loadingCenterCol: {
    ...shorthands.padding(LAYOUT.pagePadding),
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: tokens.spacingVerticalXS,
  },
  messageBarBottom: { ...shorthands.margin(0, 0, tokens.spacingVerticalM, 0) },
  recentGrid: {
    display: "grid",
    gridTemplateColumns: `repeat(auto-fill, minmax(${LAYOUT.grid.recentCardMin}, 1fr))`,
    gap: tokens.spacingHorizontalL,
  },
  emptyCenter: {
    textAlign: "center",
    ...shorthands.padding(tokens.spacingHorizontalXXL),
  },
  blockText: {
    display: "block",
    ...shorthands.margin(0, 0, tokens.spacingVerticalM, 0),
  },
  usersPlaceholder: { ...shorthands.margin(tokens.spacingVerticalS, 0, 0, 0) },
  quizzesHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalS,
    ...shorthands.margin(0, 0, tokens.spacingVerticalXL, 0),
  },
  quizzesSummary: {
    color: TYPOGRAPHY.mutedForeground,
    display: "block",
    ...shorthands.margin(0, 0, tokens.spacingVerticalL, 0),
  },
  quizzesGrid: {
    display: "grid",
    gridTemplateColumns: `repeat(auto-fill, minmax(${LAYOUT.grid.quizCardMin}, 1fr))`,
    gap: tokens.spacingHorizontalL,
  },
  quizzesCard: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    cursor: "pointer",
  },
  quizDescription: {
    color: TYPOGRAPHY.mutedForeground,
    ...shorthands.margin(TYPOGRAPHY.spacing.subtitleTop, 0, 0, 0),
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: `repeat(auto-fit, minmax(${LAYOUT.grid.statMin}, 1fr))`,
    gap: tokens.spacingHorizontalM,
    fontSize: tokens.fontSizeBase300,
    color: TYPOGRAPHY.mutedForeground,
  },
  statValue: {
    display: "block",
    ...shorthands.margin(tokens.spacingVerticalXXS, 0, 0, 0),
  },
  quizActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalS,
    marginTop: "auto",
  },
  emptyCard: {
    textAlign: "center",
    ...shorthands.padding(tokens.spacingHorizontalXXL),
  },
  protectedLoading: {
    ...shorthands.padding(LAYOUT.pagePadding),
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
  },
});

function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const styles = useStyles();

  return (
    <div className={mergeClasses(styles.pageBase, styles.pageMax900)}>
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
  const styles = useStyles();
  const handleLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GH_CLIENT_ID}&redirect_uri=${encodeURIComponent(GH_REDIRECT_URI || "")}&scope=read:user user:email`;
    window.location.href = githubAuthUrl;
  };

  return (
    <div className={mergeClasses(styles.pageBase, styles.pageMax560)}>
      <Title1>Login</Title1>
      <Button appearance="primary" onClick={handleLogin}>
        Login with GitHub
      </Button>
    </div>
  );
}

function AuthCallbackPage() {
  const styles = useStyles();
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
    <div className={mergeClasses(styles.pageBase, styles.centeredColumn)}>
      <Spinner size="large" />
      <Title2>Authenticating with GitHub...</Title2>
      <Body1 className={styles.mutedText}>
        Please wait while we verify your credentials
      </Body1>
    </div>
  );
}

function getStatusBadgeColor(
  status: QuizStatus,
): "success" | "warning" | "important" | "informative" | "subtle" {
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
  const styles = useStyles();
  return (
    <AppCard className={styles.quizCard}>
      <div>
        <Title3 className={styles.sectionTitle}>{quiz.name}</Title3>
        {quiz.title && <Body2 className={styles.mutedText}>{quiz.title}</Body2>}
      </div>

      <div className={styles.quizMeta}>
        <Text>{quiz.question_count} questions</Text>
        <Text>{quiz.required_score} to pass</Text>
      </div>

      <div className={styles.row}>
        <Badge appearance="filled" color={getStatusBadgeColor(quiz.status)}>
          {quiz.status}
        </Badge>
      </div>

      <div className={styles.row}>
        <Button
          appearance="primary"
          as="a"
          href={ROUTES.QUIZ_TAKE(quiz.id)}
          className={styles.grow}
        >
          Take Quiz
        </Button>
        <Button appearance="outline" as="a" href={ROUTES.QUIZ_EDIT(quiz.id)}>
          Edit
        </Button>
      </div>
    </AppCard>
  );
}

function DashboardPage() {
  const styles = useStyles();
  const { user, logout } = useAuth();
  const { data: quizzes, isLoading, error } = useUserQuizzes(user?.id || "");

  return (
    <div className={mergeClasses(styles.pageBase, styles.pageMax1200)}>
      <div className={styles.dashboardHeader}>
        <div>
          <Title1 className={styles.sectionTitle}>Dashboard</Title1>
          <Body1 className={styles.mutedText}>Welcome, {user?.username}!</Body1>
        </div>
        <Button appearance="subtle" onClick={logout}>
          Logout
        </Button>
      </div>

      <div className={styles.dashboardActions}>
        <Button
          appearance="primary"
          as="a"
          href={ROUTES.QUIZ_CREATE}
          size="large"
        >
          + Create New Quiz
        </Button>

        <Button appearance="outline" as="a" href={ROUTES.QUIZZES} size="large">
          View All Quizzes
        </Button>
      </div>

      <div>
        <Title2>Your Recent Quizzes</Title2>

        {isLoading && (
          <div className={styles.loadingCenterRow}>
            <Spinner size="small" />
            <Body1 className={styles.mutedText}>Loading quizzes...</Body1>
          </div>
        )}

        {error && (
          <MessageBar intent="error" className={styles.messageBarBottom}>
            <MessageBarBody>
              Error loading quizzes. Please try again later.
            </MessageBarBody>
          </MessageBar>
        )}

        {!isLoading && quizzes && quizzes.length > 0 ? (
          <div className={styles.recentGrid}>
            {quizzes.slice(0, 3).map((quiz: Quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        ) : !isLoading && (!quizzes || quizzes.length === 0) ? (
          <div className={styles.emptyCenter}>
            <Body1 className={mergeClasses(styles.mutedText, styles.blockText)}>
              No quizzes yet. Create your first quiz to get started!
            </Body1>
            <Button appearance="primary" as="a" href={ROUTES.QUIZ_CREATE}>
              Create Your First Quiz
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function UsersPage() {
  const styles = useStyles();
  return (
    <div className={mergeClasses(styles.pageBase, styles.pageMax1200)}>
      <Title1>Users</Title1>
      <Body1 className={styles.usersPlaceholder}>
        Users list coming soon...
      </Body1>
    </div>
  );
}

function QuizzesPage() {
  const styles = useStyles();
  const { user } = useAuth();
  const { data: quizzes, isLoading, error } = useUserQuizzes(user?.id || "");

  return (
    <div className={mergeClasses(styles.pageBase, styles.pageMax1200)}>
      <div className={styles.quizzesHeader}>
        <Title1>My Quizzes</Title1>
        <Button appearance="primary" as="a" href={ROUTES.QUIZ_CREATE}>
          + Create Quiz
        </Button>
      </div>

      {isLoading && (
        <div className={styles.loadingCenterCol}>
          <Spinner size="small" />
          <Body1 className={styles.mutedText}>Loading quizzes...</Body1>
          <Body2 className={styles.mutedText}>This may take a moment...</Body2>
        </div>
      )}

      {error && (
        <MessageBar intent="error" className={styles.messageBarBottom}>
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
          <Body1 className={styles.quizzesSummary}>
            You have {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""}
          </Body1>
          <div className={styles.quizzesGrid}>
            {quizzes.map((quiz: Quiz) => (
              <AppCard key={quiz.id} className={styles.quizzesCard}>
                <div>
                  <Title3 className={styles.sectionTitle}>{quiz.name}</Title3>
                  {quiz.title && (
                    <Body2 className={styles.mutedText}>{quiz.title}</Body2>
                  )}
                  {quiz.description && (
                    <Body2 className={styles.quizDescription}>
                      {quiz.description}
                    </Body2>
                  )}
                </div>

                <div className={styles.statsGrid}>
                  <div>
                    <Text size={200}>Questions</Text>
                    <Text weight="semibold" className={styles.statValue}>
                      {quiz.question_count}
                    </Text>
                  </div>
                  <div>
                    <Text size={200}>Pass Score</Text>
                    <Text weight="semibold" className={styles.statValue}>
                      {quiz.required_score}%
                    </Text>
                  </div>
                  <div>
                    <Text size={200}>Attempts</Text>
                    <Text weight="semibold" className={styles.statValue}>
                      {quiz.attempt_limit}
                    </Text>
                  </div>
                  {quiz.topic && (
                    <div>
                      <Text size={200}>Topic</Text>
                      <Text weight="semibold" className={styles.statValue}>
                        {quiz.topic}
                      </Text>
                    </div>
                  )}
                </div>

                <div className={styles.row}>
                  <Badge
                    appearance="filled"
                    color={getStatusBadgeColor(quiz.status)}
                  >
                    {quiz.status}
                  </Badge>
                </div>

                <div className={styles.quizActions}>
                  <Button
                    appearance="primary"
                    as="a"
                    href={ROUTES.QUIZ_TAKE(quiz.id)}
                    className={styles.grow}
                  >
                    Take Quiz
                  </Button>
                  <Button
                    appearance="outline"
                    as="a"
                    href={ROUTES.QUIZ_EDIT(quiz.id)}
                    className={styles.grow}
                  >
                    Edit
                  </Button>
                  <Button
                    appearance="outline"
                    as="a"
                    href={ROUTES.QUIZ_HISTORY(quiz.id)}
                    className={styles.grow}
                  >
                    History
                  </Button>
                </div>
              </AppCard>
            ))}
          </div>
        </div>
      ) : !isLoading && (!quizzes || quizzes.length === 0) ? (
        <AppCard className={styles.emptyCard}>
          <Title2 className={styles.mutedText}>No quizzes yet</Title2>
          <Body1 className={mergeClasses(styles.mutedText, styles.blockText)}>
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
  const styles = useStyles();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={styles.protectedLoading}>
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
        <Navbar />
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
                <QuizErrorBoundary>
                  <QuizPage />
                </QuizErrorBoundary>
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
                <QuizErrorBoundary>
                  <QuizHistoryPage />
                </QuizErrorBoundary>
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
