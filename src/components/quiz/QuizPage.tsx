import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { QuizForm } from "./QuizForm";
import {
  Body1,
  MessageBar,
  MessageBarBody,
  Spinner,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import type { QuizAttemptResponse } from "../../types/api";
import { LAYOUT } from "../../styles/layoutRhythm";

const useStyles = makeStyles({
  page: { ...shorthands.padding(LAYOUT.pagePadding) },
  loading: {
    ...shorthands.padding(LAYOUT.pagePadding),
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
});

export function QuizPage() {
  const styles = useStyles();
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();

  if (!id) {
    return (
      <main className={styles.page}>
        <MessageBar intent="error" aria-live="assertive">
          <MessageBarBody>Quiz not found</MessageBarBody>
        </MessageBar>
      </main>
    );
  }

  if (authLoading) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        <Spinner size="small" />
        <Body1>Loading...</Body1>
      </div>
    );
  }

  if (!user) {
    return (
      <main className={styles.page}>
        <MessageBar intent="warning" aria-live="assertive">
          <MessageBarBody>Please log in to take this quiz</MessageBarBody>
        </MessageBar>
      </main>
    );
  }

  const handleAttemptComplete = (attempt: QuizAttemptResponse) => {
    console.log("Quiz attempt completed:", attempt);
  };

  return <QuizForm quizId={id} onAttemptComplete={handleAttemptComplete} />;
}
