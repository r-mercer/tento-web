import { Card, Title2, Title1, Body1, Button, Badge } from "@fluentui/react-components";
import type { QuizAttemptResponse, Quiz } from "../../types/api";

interface ResultsViewProps {
  attempt: QuizAttemptResponse;
  quiz: Quiz;
  onRetake: () => void;
  onReview: () => void;
}

export function ResultsView({
  attempt,
  quiz,
  onRetake,
  onReview,
}: ResultsViewProps) {
  const percentage = Math.round(
    (attempt.points_earned / attempt.total_possible) * 100,
  );
  const isPassed = attempt.passed;
  const canRetake = attempt.attempt_number < quiz.attempt_limit;

  return (
    <Card
      style={{
        padding: "2rem",
        textAlign: "center",
        maxWidth: "500px",
        margin: "0 auto",
      }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <Title2 style={{ color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
        Quiz Complete!
      </Title2>

      <Title1 
        style={{ color: "var(--color-primary)", marginBottom: "0.5rem" }}
        aria-label={`You scored ${attempt.points_earned} out of ${attempt.total_possible} points`}
      >
        {attempt.points_earned}/{attempt.total_possible}
      </Title1>

      <Body1 style={{ color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
        {percentage}%
      </Body1>

      <Badge
        appearance="filled"
        color={isPassed ? "success" : "danger"}
        size="large"
        style={{ marginBottom: "2rem" }}
        aria-label={isPassed 
          ? `Congratulations! You passed with ${percentage}%` 
          : `You did not pass. You scored ${percentage}%. Required: ${quiz.required_score}%`
        }
      >
        {isPassed ? "Passed" : "Failed"}
      </Badge>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
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
