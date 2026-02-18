import { useState } from "react";
import { useQuizAttempts } from "../../hooks/api/useQuizAttempts";
import {
  Button,
  Badge,
  Body1,
  Text,
  Spinner,
  MessageBar,
  MessageBarBody,
  Card,
} from "@fluentui/react-components";

interface QuizAttemptsListProps {
  quizId: string;
  onSelectAttempt: (attemptId: string) => void;
  selectedAttemptId?: string;
}

export function QuizAttemptsList({
  quizId,
  onSelectAttempt,
  selectedAttemptId,
}: QuizAttemptsListProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const limit = 10;
  const offset = currentPage * limit;

  const { data: attemptsData, isLoading, error } = useQuizAttempts(quizId, limit, offset);

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Spinner size="small" />
        <Body1>Loading attempts...</Body1>
      </div>
    );
  }

  if (error) {
    return (
      <MessageBar intent="error">
        <MessageBarBody>Failed to load attempts. Please try again.</MessageBarBody>
      </MessageBar>
    );
  }

  if (!attemptsData || attemptsData.data.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "1.5rem" }}>
        <Body1 style={{ color: "var(--color-text-secondary)" }}>
          No attempts yet. Start by taking the quiz!
        </Body1>
      </div>
    );
  }

  const { data: attempts, pagination } = attemptsData;
  const totalPages = Math.ceil(pagination.total / limit);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPreviousPage = currentPage > 0;

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {attempts.map((attempt) => (
          <Card
            key={attempt.id}
            onClick={() => onSelectAttempt(attempt.id)}
            style={{
              padding: "1rem",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor:
                selectedAttemptId === attempt.id ? "var(--color-primary)" : undefined,
              color: selectedAttemptId === attempt.id ? "white" : undefined,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                <Text weight="semibold">Attempt #{attempt.attempt_number}</Text>
                <Badge
                  appearance="filled"
                  color={attempt.passed ? "success" : "danger"}
                  size="small"
                >
                  {attempt.passed ? "Passed" : "Failed"}
                </Badge>
              </div>
              <div>
                <Text weight="semibold">
                  {attempt.points_earned}/{attempt.total_possible} points
                </Text>
                <Text size={200} style={{ marginLeft: "0.5rem" }}>
                  ({Math.round((attempt.points_earned / attempt.total_possible) * 100)}%)
                </Text>
              </div>
            </div>
            <Text size={200}>
              {new Date(attempt.submitted_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </Card>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "1.5rem",
          paddingTop: "1rem",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <Text size={200} style={{ color: "var(--color-text-secondary)" }}>
          Showing {offset + 1}-{Math.min(offset + limit, pagination.total)} of {pagination.total} attempts
        </Text>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            appearance="outline"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!hasPreviousPage}
          >
            Previous
          </Button>
          <Button
            appearance="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!hasNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
