import { useState, type KeyboardEvent } from "react";
import { useQuizAttempts } from "../../hooks/api/useQuizAttempts";
import {
  Button,
  Badge,
  Body1,
  Text,
  MessageBar,
  MessageBarBody,
  Card,
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { TYPOGRAPHY } from "../../styles/layoutRhythm";

interface QuizAttemptsListProps {
  quizId: string;
  onSelectAttempt: (attemptId: string) => void;
  selectedAttemptId?: string;
}

const useStyles = makeStyles({
  loading: {
    display: "flex",
    flexDirection: "column",
    gap: TYPOGRAPHY.spacing.subtitleTop,
  },
  empty: {
    textAlign: "center",
    ...shorthands.padding(tokens.spacingHorizontalL),
  },
  mutedText: { color: TYPOGRAPHY.mutedForeground },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: TYPOGRAPHY.spacing.subtitleTop,
  },
  card: {
    ...shorthands.padding(tokens.spacingHorizontalM),
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardInteractive: {
    ...shorthands.outline("2px", "solid", "transparent"),
    outlineOffset: "2px",
    ":focus-visible": {
      outlineColor: tokens.colorStrokeFocus2,
    },
  },
  cardSelected: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  cardHeading: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.titleBottomCompact, 0),
  },
  scoreText: {
    ...shorthands.margin(0, 0, 0, tokens.spacingHorizontalS),
  },
  pager: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    ...shorthands.margin(tokens.spacingVerticalL, 0, 0, 0),
    ...shorthands.padding(TYPOGRAPHY.spacing.sectionBottom, 0, 0, 0),
    ...shorthands.borderTop("1px", "solid", tokens.colorNeutralStroke1),
  },
  pagerActions: {
    display: "flex",
    gap: tokens.spacingHorizontalS,
  },
  loadingCard: {
    ...shorthands.padding(tokens.spacingHorizontalM),
    minHeight: "88px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: TYPOGRAPHY.spacing.subtitleTop,
  },
  skeletonLine: {
    height: "12px",
    width: "100%",
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  },
  skeletonLineShort: {
    height: "12px",
    width: "45%",
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
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

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    attemptId: string,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectAttempt(attemptId);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className={styles.loadingCard} aria-hidden="true">
            <div className={styles.skeletonLineShort} />
            <div className={styles.skeletonLine} />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <MessageBar intent="error" aria-live="assertive">
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
            onKeyDown={(event) => handleCardKeyDown(event, attempt.id)}
            role="button"
            tabIndex={0}
            aria-label={`Open details for attempt ${attempt.attemptNumber}`}
            aria-pressed={selectedAttemptId === attempt.id}
            className={mergeClasses(
              styles.card,
              styles.cardInteractive,
              selectedAttemptId === attempt.id && styles.cardSelected,
            )}
          >
            <div>
              <div className={styles.cardHeading}>
                <Text weight="semibold">Attempt #{attempt.attemptNumber}</Text>
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
                  {attempt.pointsEarned}/{attempt.totalPossible} points
                </Text>
                <Text size={200} className={styles.scoreText}>
                  (
                  {Math.round(
                    (attempt.pointsEarned / attempt.totalPossible) * 100,
                  )}
                  %)
                </Text>
              </div>
            </div>
            <Text size={200}>
              {new Date(attempt.submittedAt).toLocaleDateString(undefined, {
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
