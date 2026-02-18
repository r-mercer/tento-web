import { useState } from "react";
import { DefaultButton } from "@fluentui/react";
import styles from "./quiz.module.css";
import { useQuizAttempts } from "../../hooks/api/useQuizAttempts";

interface QuizAttemptsListProps {
  quizId: string;
  onSelectAttempt: (attemptId: string) => void;
  selectedAttemptId?: string;
}

/**
 * Displays paginated list of quiz attempts for a specific quiz
 */
export function QuizAttemptsList({
  quizId,
  onSelectAttempt,
  selectedAttemptId,
}: QuizAttemptsListProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const limit = 10;
  const offset = currentPage * limit;

  const {
    data: attemptsData,
    isLoading,
    error,
  } = useQuizAttempts(quizId, limit, offset);

  if (isLoading) {
    return <div className={styles.loadingSpinner}>Loading attempts...</div>;
  }

  if (error) {
    return (
      <div className={styles.errorMessage}>
        Failed to load attempts. Please try again.
      </div>
    );
  }

  if (!attemptsData || attemptsData.data.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "var(--spacing-lg)" }}>
        <p style={{ color: "var(--color-text-secondary)" }}>
          No attempts yet. Start by taking the quiz!
        </p>
      </div>
    );
  }

  const { data: attempts, pagination } = attemptsData;
  const totalPages = Math.ceil(pagination.total / limit);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPreviousPage = currentPage > 0;

  return (
    <div>
      <div className={styles.attemptsList}>
        {attempts.map((attempt) => (
          <div
            key={attempt.id}
            className={styles.attemptsListItem}
            onClick={() => onSelectAttempt(attempt.id)}
            style={{
              backgroundColor:
                selectedAttemptId === attempt.id
                  ? "var(--color-primary)"
                  : "inherit",
              color: selectedAttemptId === attempt.id ? "white" : "inherit",
              cursor: "pointer",
            }}
          >
            <div>
              <div className={styles.attemptScore}>
                <span style={{ marginRight: "var(--spacing-md)" }}>
                  Attempt #{attempt.attempt_number}
                </span>
                <span
                  style={{
                    display: "inline-block",
                    padding: "var(--spacing-xs) var(--spacing-sm)",
                    borderRadius: "var(--border-radius-sm)",
                    backgroundColor: attempt.passed
                      ? "var(--color-success)"
                      : "var(--color-error)",
                    color: "white",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  {attempt.passed ? "Passed" : "Failed"}
                </span>
              </div>
              <div style={{ marginTop: "var(--spacing-sm)" }}>
                <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  {attempt.points_earned}/{attempt.total_possible} points
                </span>
                <span
                  style={{
                    marginLeft: "var(--spacing-md)",
                    fontSize: "var(--font-size-sm)",
                  }}
                >
                  (
                  {Math.round(
                    (attempt.points_earned / attempt.total_possible) * 100,
                  )}
                  %)
                </span>
              </div>
            </div>
            <div className={styles.attemptDate}>
              {new Date(attempt.submitted_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "var(--spacing-lg)",
          padding: "var(--spacing-md)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-secondary)",
          }}
        >
          Showing {offset + 1}-{Math.min(offset + limit, pagination.total)} of{" "}
          {pagination.total} attempts
        </div>
        <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
          <DefaultButton
            className={`${styles.button} ${styles["button--secondary"]}`}
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!hasPreviousPage}
            type="button"
          >
            Previous
          </DefaultButton>
          <DefaultButton
            className={`${styles.button} ${styles["button--secondary"]}`}
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!hasNextPage}
            type="button"
          >
            Next
          </DefaultButton>
        </div>
      </div>
    </div>
  );
}
