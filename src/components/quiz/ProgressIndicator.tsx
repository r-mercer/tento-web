import styles from './quiz.module.css';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  answered: number;
}

/**
 * Displays quiz progress with question counter and visual progress bar
 */
export function ProgressIndicator({ current, total, answered }: ProgressIndicatorProps) {
  const percentage = (current / total) * 100;

  return (
    <div className={styles.progressIndicator}>
      <div className={styles.progressLabel}>
        Question {current} of {total} ({answered} answered)
      </div>
      <div className={styles.progressBar}>
        <div
          className={styles.progressBarFill}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
