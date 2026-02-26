import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { QuizAttemptsList } from "./QuizAttemptsList";
import { AttemptDetailView } from "./AttemptDetailView";
import {
  Body1,
  Title1,
  makeStyles,
  mergeClasses,
  shorthands,
} from "@fluentui/react-components";
import { LAYOUT, TYPOGRAPHY } from "../../styles/layoutRhythm";

const useStyles = makeStyles({
  simplePage: { ...shorthands.padding(LAYOUT.pagePadding) },
  page: {
    ...shorthands.padding(LAYOUT.pagePadding),
    maxWidth: LAYOUT.maxWidth.content,
    ...shorthands.margin(0, "auto"),
  },
  header: {
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.headerBottom.standard, 0),
  },
  subtitle: {
    color: TYPOGRAPHY.mutedForeground,
    display: "block",
    ...shorthands.margin(TYPOGRAPHY.spacing.subtitleTop, 0, 0, 0),
  },
});

export function QuizHistoryPage() {
  const styles = useStyles();
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const [selectedAttemptId, setSelectedAttemptId] = useState<
    string | undefined
  >();

  if (!id) {
    return (
      <div className={styles.simplePage}>
        <Body1>Quiz not found</Body1>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className={styles.simplePage}>
        <Body1>Loading...</Body1>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.simplePage}>
        <Body1>Please log in to view attempt history</Body1>
      </div>
    );
  }

  if (selectedAttemptId) {
    return (
      <AttemptDetailView
        attemptId={selectedAttemptId}
        onBack={() => setSelectedAttemptId(undefined)}
      />
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Title1>Quiz Attempt History</Title1>
        <Body1 className={mergeClasses(styles.subtitle)}>
          View all your attempts and detailed results for this quiz
        </Body1>
      </div>

      <QuizAttemptsList
        quizId={id}
        onSelectAttempt={setSelectedAttemptId}
        selectedAttemptId={selectedAttemptId}
      />
    </div>
  );
}
