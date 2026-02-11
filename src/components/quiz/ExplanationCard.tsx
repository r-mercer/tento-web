import styles from './quiz.module.css';

interface ExplanationCardProps {
  explanation?: string;
  isCorrect?: boolean;
  isVisible: boolean;
}

/**
 * Displays explanation for a question after submission
 */
export function ExplanationCard({ explanation, isCorrect, isVisible }: ExplanationCardProps) {
  if (!isVisible || !explanation) {
    return null;
  }

  const icon = isCorrect ? '✓' : '✗';
  const label = isCorrect ? 'Correct!' : 'Incorrect';

  return (
    <div className={styles.explanationCard}>
      <div className={styles.explanationLabel}>
        <span>{icon}</span>
        {label}
      </div>
      <p className={styles.explanationText}>{explanation}</p>
    </div>
  );
}
