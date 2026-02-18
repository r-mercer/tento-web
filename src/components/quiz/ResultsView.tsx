import styles from "./quiz.module.css";
import { PrimaryButton, DefaultButton } from "@fluentui/react";
import type { QuizAttemptResponse, Quiz } from "../../types/api";

interface ResultsViewProps {
  attempt: QuizAttemptResponse;
  quiz: Quiz;
  onRetake: () => void;
  onReview: () => void;
}

/**
 * Results view displayed after quiz submission
 */
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
    <div className={styles.resultsView}>
      <div className={styles.resultsViewHeader}>
        <h2 className={styles.scoreLabel}>Quiz Complete!</h2>
        <div className={styles.scoreDisplay}>
          {attempt.points_earned}/{attempt.total_possible}
        </div>
        <div>
          {percentage}% ({percentage}%)
        </div>
        <div
          className={`${styles.statusBadge} ${
            isPassed
              ? styles["statusBadge--passed"]
              : styles["statusBadge--failed"]
          }`}
        >
          {isPassed ? "Passed" : "Failed"}
        </div>
      </div>

      <div className={styles.resultsViewActions}>
        <PrimaryButton
          className={`${styles.button} ${styles["button--primary"]}`}
          onClick={onRetake}
          disabled={!canRetake}
          title={!canRetake ? "Attempt limit reached" : "Retake this quiz"}
        >
          Retake Quiz
        </PrimaryButton>
        <DefaultButton
          className={`${styles.button} ${styles["button--secondary"]}`}
          onClick={onReview}
        >
          Review Answers
        </DefaultButton>
      </div>
    </div>
  );
}
