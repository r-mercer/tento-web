import { useAuth } from "../hooks/useAuth";
import { useUserQuizzes } from "../hooks/api/useQuizzes";
import { formatPassThreshold } from "../utils/quizScoring";
import { ROUTES } from "../utils/constants";
import { pageStyles } from "../styles/pageStyles";
import { QuizCardSkeleton } from "../components/ui/QuizCardSkeleton";
import { AppCard } from "../components/ui/AppCard";
import {
  Title1,
  Title2,
  Title3,
  Body1,
  Body2,
  Text,
  Button,
  Badge,
  MessageBar,
  MessageBarBody,
} from "@fluentui/react-components";
import type { QuizStatus } from "../types/api";

const statusColors: Record<QuizStatus, "success" | "warning" | "important" | "informative" | "subtle" | "danger"> = {
  Ready: "success",
  Draft: "warning",
  Complete: "informative",
  Pending: "danger",
};

function getStatusBadgeColor(status: QuizStatus) {
  return statusColors[status] || "subtle";
}

export function QuizzesPage() {
  const styles = pageStyles();
  const { user } = useAuth();
  const { data: quizzes, isLoading, error } = useUserQuizzes(user?.id || "");

  return (
    <main
      id="content"
      className={`${styles.pageBase} ${styles.pageMax1200}`}
      aria-labelledby="quizzes-page-title"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--spacingHorizontalS)",
          marginBottom: "var(--spacingVerticalXL)",
        }}
      >
        <Title1 id="quizzes-page-title">My Quizzes</Title1>
        <Button appearance="primary" as="a" href={ROUTES.QUIZ_CREATE}>
          + Create Quiz
        </Button>
      </div>

      {isLoading && <QuizCardSkeleton count={6} />}

      {error && (
        <MessageBar intent="error" style={{ marginBottom: "var(--spacingVerticalM)" }} aria-live="assertive">
          <MessageBarBody>
            <strong>Error loading quizzes</strong>
            <br />
            {error instanceof Error ? error.message : "Failed to load quizzes. Please try again."}
          </MessageBarBody>
        </MessageBar>
      )}

      {!isLoading && quizzes && quizzes.length > 0 ? (
        <div>
          <Body1 style={{ color: "var(--colorNeutralForeground2)", display: "block", marginBottom: "var(--spacingVerticalL)" }}>
            You have {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""}
          </Body1>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fill, minmax(320px, 1fr))`,
              gap: "var(--spacingHorizontalL)",
            }}
          >
            {quizzes.map((quiz) => {
              const passThreshold = formatPassThreshold(quiz.requiredScore, quiz.questionCount);
              return (
                <AppCard
                  key={quiz.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--spacingVerticalM)",
                  }}
                >
                  <div>
                    <Title3 style={{ marginBottom: "var(--spacingVerticalXS)" }}>{quiz.name}</Title3>
                    {quiz.title && (
                      <Body2 style={{ color: "var(--colorNeutralForeground2)", display: "block", marginTop: "var(--spacingVerticalXXS)" }}>
                        {quiz.title}
                      </Body2>
                    )}
                    {quiz.description && (
                      <Body2 style={{ color: "var(--colorNeutralForeground2)", display: "block", marginTop: "var(--spacingVerticalXS)" }}>
                        {quiz.description}
                      </Body2>
                    )}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(auto-fit, minmax(140px, 1fr))`,
                      gap: "var(--spacingHorizontalM)",
                      fontSize: "var(--fontSizeBase300)",
                      color: "var(--colorNeutralForeground2)",
                    }}
                  >
                    <div>
                      <Text size={200}>Questions</Text>
                      <Text weight="semibold" style={{ display: "block", marginTop: "var(--spacingVerticalXXS)" }}>
                        {quiz.questionCount}
                      </Text>
                    </div>
                    <div>
                      <Text size={200}>Pass Score</Text>
                      <Text weight="semibold" style={{ display: "block", marginTop: "var(--spacingVerticalXXS)" }}>
                        {passThreshold}
                      </Text>
                    </div>
                    <div>
                      <Text size={200}>Attempts</Text>
                      <Text weight="semibold" style={{ display: "block", marginTop: "var(--spacingVerticalXXS)" }}>
                        {quiz.attemptLimit}
                      </Text>
                    </div>
                    {quiz.topic && (
                      <div>
                        <Text size={200}>Topic</Text>
                        <Text weight="semibold" style={{ display: "block", marginTop: "var(--spacingVerticalXXS)" }}>
                          {quiz.topic}
                        </Text>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "var(--spacingHorizontalS)" }}>
                    <Badge appearance="filled" color={getStatusBadgeColor(quiz.status)}>
                      {quiz.status}
                    </Badge>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "var(--spacingHorizontalS)",
                      marginTop: "auto",
                    }}
                  >
                    <Button appearance="primary" as="a" href={ROUTES.QUIZ_TAKE(quiz.id)} style={{ flex: 1 }}>
                      Take Quiz
                    </Button>
                    <Button appearance="outline" as="a" href={ROUTES.QUIZ_EDIT(quiz.id)} style={{ flex: 1 }}>
                      Edit
                    </Button>
                    <Button appearance="outline" as="a" href={ROUTES.QUIZ_HISTORY(quiz.id)} style={{ flex: 1 }}>
                      History
                    </Button>
                  </div>
                </AppCard>
              );
            })}
          </div>
        </div>
      ) : !isLoading && (!quizzes || quizzes.length === 0) ? (
        <AppCard style={{ textAlign: "center", padding: "var(--spacingHorizontalXXL)" }}>
          <Title2 style={{ color: "var(--colorNeutralForeground2)", marginBottom: "var(--spacingVerticalM)" }}>
            No quizzes yet
          </Title2>
          <Body1 style={{ color: "var(--colorNeutralForeground2)", display: "block", marginBottom: "var(--spacingVerticalM)" }}>
            Create your first quiz to get started!
          </Body1>
          <Button appearance="primary" as="a" href={ROUTES.QUIZ_CREATE}>
            Create Your First Quiz
          </Button>
        </AppCard>
      ) : null}
    </main>
  );
}
