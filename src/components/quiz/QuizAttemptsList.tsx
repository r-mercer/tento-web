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
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from "@fluentui/react-components";

interface QuizAttemptsListProps {
  quizId: string;
  onSelectAttempt: (attemptId: string) => void;
  selectedAttemptId?: string;
}

const useStyles = makeStyles({
  loading: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  empty: {
    textAlign: "center",
    ...shorthands.padding(tokens.spacingHorizontalL),
  },
  mutedText: { color: tokens.colorNeutralForeground3 },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
  },
  card: {
    ...shorthands.padding(tokens.spacingHorizontalM),
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardSelected: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  cardHeading: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    ...shorthands.margin(0, 0, tokens.spacingVerticalXXS, 0),
  },
  scoreText: {
    ...shorthands.margin(0, 0, 0, tokens.spacingHorizontalS),
  },
  pager: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    ...shorthands.margin(tokens.spacingVerticalL, 0, 0, 0),
    ...shorthands.padding(tokens.spacingVerticalM, 0, 0, 0),
    ...shorthands.borderTop("1px", "solid", tokens.colorNeutralStroke1),
  },
  pagerActions: {
    display: "flex",
    gap: tokens.spacingHorizontalS,
  },
});

export function QuizAttemptsList({
  quizId,
  onSelectAttempt,
  selectedAttemptId,
}: QuizAttemptsListProps) {
  const styles = useStyles();
  const [currentPage, setCurrentPage] = useState(0);
  const limit = 10;
  const offset = currentPage * limit;

  const {
    data: attemptsData,
    isLoading,
    error,
  } = useQuizAttempts(quizId, limit, offset);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner size="small" />
        <Body1>Loading attempts...</Body1>
      </div>
    );
  }

  if (error) {
    return (
      <MessageBar intent="error">
        <MessageBarBody>
          Failed to load attempts. Please try again.
        </MessageBarBody>
      </MessageBar>
    );
  }

  if (!attemptsData || attemptsData.data.length === 0) {
    return (
      <div className={styles.empty}>
        <Body1 className={styles.mutedText}>
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
      <div className={styles.list}>
        {attempts.map((attempt) => (
          <Card
            key={attempt.id}
            onClick={() => onSelectAttempt(attempt.id)}
            className={mergeClasses(
              styles.card,
              selectedAttemptId === attempt.id && styles.cardSelected,
            )}
          >
            <div>
              <div className={styles.cardHeading}>
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
                <Text size={200} className={styles.scoreText}>
                  (
                  {Math.round(
                    (attempt.points_earned / attempt.total_possible) * 100,
                  )}
                  %)
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

      <div className={styles.pager}>
        <Text size={200} className={styles.mutedText}>
          Showing {offset + 1}-{Math.min(offset + limit, pagination.total)} of{" "}
          {pagination.total} attempts
        </Text>
        <div className={styles.pagerActions}>
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
