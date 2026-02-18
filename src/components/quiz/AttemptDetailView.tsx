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
} from "@fluentui/react-components";
import { useQuizAttempt } from "../../hooks/api/useQuizAttempts";
import { QuestionResultCard } from "./QuestionResultCard";

interface AttemptDetailViewProps {
  attemptId: string;
  onBack: () => void;
}

export function AttemptDetailView({ attemptId, onBack }: AttemptDetailViewProps) {
  const { data: reviewData, isLoading, error } = useQuizAttempt(attemptId);

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Spinner size="small" />
        <Body1>Loading attempt details...</Body1>
      </div>
    );
  }

  if (error) {
    return (
      <MessageBar intent="error">
        <MessageBarBody>Failed to load attempt details. Please try again.</MessageBarBody>
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
  const percentage = Math.round((attempt.points_earned / attempt.total_possible) * 100);

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <Button appearance="outline" onClick={onBack} style={{ marginBottom: "1rem" }}>
        ← Back to Attempts
      </Button>

      <div style={{ marginBottom: "1.5rem" }}>
        <Title1 style={{ marginBottom: "0.5rem" }}>{quiz.name} - Attempt Review</Title1>
        <Body1 style={{ color: "var(--color-text-secondary)" }}>
          Attempt #{attempt.attempt_number} • {new Date(attempt.submitted_at).toLocaleDateString()}
        </Body1>
      </div>

      <Card style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Title2 style={{ marginBottom: "0.25rem" }}>
              Score: {attempt.points_earned}/{attempt.total_possible}
            </Title2>
            <Title1 style={{ color: "var(--color-primary)" }}>{percentage}%</Title1>
          </div>
          <Badge appearance="filled" color={attempt.passed ? "success" : "danger"} size="large">
            {attempt.passed ? "Passed" : "Failed"}
          </Badge>
        </div>
      </Card>

      <div>
        <Title2 style={{ marginBottom: "1rem" }}>Questions ({question_results.length})</Title2>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {question_results.map((result) => {
            const question = quiz.questions?.find((q) => q.id === result.question_id);
            if (!question) return null;

            return (
              <QuestionResultCard key={result.question_id} question={question} result={result} />
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginTop: "2rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <Button appearance="outline" onClick={onBack}>
          ← Back to Attempts
        </Button>
      </div>
    </div>
  );
}
