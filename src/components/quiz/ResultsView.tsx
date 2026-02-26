import {
  Card,
  Title2,
  Title1,
  Body1,
  Button,
  Badge,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import type { QuizAttemptResponse, Quiz } from "../../types/api";
import { LAYOUT, TYPOGRAPHY } from "../../styles/layoutRhythm";

interface ResultsViewProps {
  attempt: QuizAttemptResponse;
  quiz: Quiz;
  onRetake: () => void;
  onReview: () => void;
}

const useStyles = makeStyles({
  card: {
    ...shorthands.padding(LAYOUT.pagePadding),
    textAlign: "center",
    maxWidth: LAYOUT.maxWidth.resultCard,
    ...shorthands.margin(0, "auto"),
  },
  subtitle: {
    color: TYPOGRAPHY.mutedForeground,
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.subtitleBottom, 0),
  },
  score: {
    color: tokens.colorBrandForeground2,
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.titleBottom, 0),
  },
  percentage: {
    color: TYPOGRAPHY.mutedForeground,
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.subtitleBottom, 0),
  },
  badge: {
    ...shorthands.margin(0, 0, tokens.spacingVerticalXL, 0),
  },
  actions: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
    justifyContent: "center",
    flexWrap: "wrap",
  },
});

export function ResultsView({
  attempt,
  quiz,
  onRetake,
  onReview,
}: ResultsViewProps) {
  const styles = useStyles();
  const percentage = Math.round(
    (attempt.points_earned / attempt.total_possible) * 100,
  );
  const isPassed = attempt.passed;
  const canRetake = attempt.attempt_number < quiz.attempt_limit;

  return (
    <Card
      className={styles.card}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <Title2 className={styles.subtitle}>Quiz Complete!</Title2>

      <Title1
        className={styles.score}
        aria-label={`You scored ${attempt.points_earned} out of ${attempt.total_possible} points`}
      >
        {attempt.points_earned}/{attempt.total_possible}
      </Title1>

      <Body1 className={styles.percentage}>{percentage}%</Body1>

      <Badge
        appearance="filled"
        color={isPassed ? "success" : "danger"}
        size="large"
        className={styles.badge}
        aria-label={
          isPassed
            ? `Congratulations! You passed with ${percentage}%`
            : `You did not pass. You scored ${percentage}%. Required: ${quiz.required_score}%`
        }
      >
        {isPassed ? "Passed" : "Failed"}
      </Badge>

      <div className={styles.actions}>
        <Button
          appearance="primary"
          onClick={onRetake}
          disabled={!canRetake}
          title={!canRetake ? "Attempt limit reached" : "Retake this quiz"}
        >
          Retake Quiz
        </Button>
        <Button appearance="outline" onClick={onReview}>
          Review Answers
        </Button>
      </div>
    </Card>
  );
}
