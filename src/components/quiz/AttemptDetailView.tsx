import {
  Button,
  Title1,
  Title2,
  Body1,
  Badge,
  Spinner,
  MessageBar,
  MessageBarBody,
  Card,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { useQuizAttempt } from "../../hooks/api/useQuizAttempts";
import { QuestionResultCard } from "./QuestionResultCard";
import { LAYOUT, TYPOGRAPHY } from "../../styles/layoutRhythm";

interface AttemptDetailViewProps {
  attemptId: string;
  onBack: () => void;
}

const useStyles = makeStyles({
  loading: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  page: {
    ...shorthands.padding(LAYOUT.pagePadding),
    maxWidth: LAYOUT.maxWidth.content,
    ...shorthands.margin(0, "auto"),
  },
  backButton: { ...shorthands.margin(0, 0, tokens.spacingVerticalM, 0) },
  header: {
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.headerBottom.compact, 0),
  },
  title: { ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.titleBottom, 0) },
  mutedText: { color: TYPOGRAPHY.mutedForeground },
  summaryCard: {
    ...shorthands.padding(tokens.spacingHorizontalL),
    ...shorthands.margin(0, 0, tokens.spacingVerticalL, 0),
  },
  summaryContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreTitle: {
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.titleBottomCompact, 0),
  },
  scorePercent: { color: tokens.colorBrandForeground1 },
  questionsTitle: {
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.sectionBottom, 0),
  },
  resultsList: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  footer: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
    ...shorthands.margin(tokens.spacingVerticalXXL, 0, 0, 0),
    ...shorthands.padding(tokens.spacingVerticalL, 0, 0, 0),
    ...shorthands.borderTop("1px", "solid", tokens.colorNeutralStroke1),
  },
});

export function AttemptDetailView({
  attemptId,
  onBack,
}: AttemptDetailViewProps) {
  const styles = useStyles();
  const { data: reviewData, isLoading, error } = useQuizAttempt(attemptId);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner size="small" />
        <Body1>Loading attempt details...</Body1>
      </div>
    );
  }

  if (error) {
    return (
      <MessageBar intent="error">
        <MessageBarBody>
          Failed to load attempt details. Please try again.
        </MessageBarBody>
      </MessageBar>
    );
  }

  if (!reviewData) {
    return (
      <MessageBar intent="warning">
        <MessageBarBody>Attempt not found.</MessageBarBody>
      </MessageBar>
    );
  }

  const { attempt, quiz, question_results } = reviewData;
  const percentage = Math.round(
    (attempt.points_earned / attempt.total_possible) * 100,
  );

  return (
    <div className={styles.page}>
      <Button
        appearance="outline"
        onClick={onBack}
        className={styles.backButton}
      >
        ← Back to Attempts
      </Button>

      <div className={styles.header}>
        <Title1 className={styles.title}>{quiz.name} - Attempt Review</Title1>
        <Body1 className={styles.mutedText}>
          Attempt #{attempt.attempt_number} •{" "}
          {new Date(attempt.submitted_at).toLocaleDateString()}
        </Body1>
      </div>

      <Card className={styles.summaryCard}>
        <div className={styles.summaryContent}>
          <div>
            <Title2 className={styles.scoreTitle}>
              Score: {attempt.points_earned}/{attempt.total_possible}
            </Title2>
            <Title1 className={styles.scorePercent}>{percentage}%</Title1>
          </div>
          <Badge
            appearance="filled"
            color={attempt.passed ? "success" : "danger"}
            size="large"
          >
            {attempt.passed ? "Passed" : "Failed"}
          </Badge>
        </div>
      </Card>

      <div>
        <Title2 className={styles.questionsTitle}>
          Questions ({question_results.length})
        </Title2>

        <div className={styles.resultsList}>
          {question_results.map((result) => {
            const question = quiz.questions?.find(
              (q) => q.id === result.question_id,
            );
            if (!question) return null;

            return (
              <QuestionResultCard
                key={result.question_id}
                question={question}
                result={result}
              />
            );
          })}
        </div>
      </div>

      <div className={styles.footer}>
        <Button appearance="outline" onClick={onBack}>
          ← Back to Attempts
        </Button>
      </div>
    </div>
  );
}
