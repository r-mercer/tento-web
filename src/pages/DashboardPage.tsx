import { Title1, Title2, Body1, Button, MessageBar, MessageBarBody } from "@fluentui/react-components";
import { useAuth } from "../hooks/useAuth";
import { useUserQuizzes } from "../hooks/api/useQuizzes";
import { ROUTES } from "../utils/constants";
import { pageStyles } from "../styles/pageStyles";
import { QuizCard } from "../components/ui/QuizCard";
import { QuizCardSkeleton } from "../components/ui/QuizCardSkeleton";

export function DashboardPage() {
  const styles = pageStyles();
  const { user, logout } = useAuth();
  const { data: quizzes, isLoading, error } = useUserQuizzes(user?.id || "");

  return (
    <main
      id="content"
      className={`${styles.pageBase} ${styles.pageMax1200}`}
      aria-labelledby="dashboard-page-title"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "var(--spacingHorizontalM)",
          marginBottom: "var(--spacingVerticalXXL)",
        }}
      >
        <div>
          <Title1 id="dashboard-page-title" style={{ marginBottom: "var(--spacingVerticalXS)" }}>
            Dashboard
          </Title1>
          <Body1 style={{ color: "var(--colorNeutralForeground2)" }}>
            Welcome, {user?.username}!
          </Body1>
        </div>
        <Button appearance="subtle" onClick={logout}>
          Logout
        </Button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacingVerticalS)",
          marginBottom: "var(--spacingVerticalXXL)",
          maxWidth: "460px",
          width: "100%",
        }}
      >
        <Button appearance="primary" as="a" href={ROUTES.QUIZ_CREATE} size="large">
          + Create New Quiz
        </Button>
        <Button appearance="outline" as="a" href={ROUTES.QUIZZES} size="large">
          View All Quizzes
        </Button>
      </div>

      <section aria-labelledby="recent-quizzes-title">
        <Title2 id="recent-quizzes-title">Your Recent Quizzes</Title2>

        {isLoading && <QuizCardSkeleton count={3} />}

        {error && (
          <MessageBar intent="error" style={{ marginBottom: "var(--spacingVerticalM)" }} aria-live="assertive">
            <MessageBarBody>
              Error loading quizzes. Please try again later.
            </MessageBarBody>
          </MessageBar>
        )}

        {!isLoading && quizzes && quizzes.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fill, minmax(260px, 1fr))`,
              gap: "var(--spacingHorizontalL)",
            }}
          >
            {quizzes.slice(0, 3).map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        ) : !isLoading && (!quizzes || quizzes.length === 0) ? (
          <div style={{ textAlign: "center", padding: "var(--spacingHorizontalXXL)" }}>
            <Body1 style={{ color: "var(--colorNeutralForeground2)", display: "block", marginBottom: "var(--spacingVerticalM)" }}>
              No quizzes yet. Create your first quiz to get started!
            </Body1>
            <Button appearance="primary" as="a" href={ROUTES.QUIZ_CREATE}>
              Create Your First Quiz
            </Button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
