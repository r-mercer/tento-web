import styles from './quiz.module.css';
import { useQuizAttempt } from '../../hooks/api/useQuizAttempts';
import { QuestionResultCard } from './QuestionResultCard';

interface AttemptDetailViewProps {
  attemptId: string;
  onBack: () => void;
}

/**
 * Displays detailed breakdown of a single quiz attempt with all question results
 */
export function AttemptDetailView({ attemptId, onBack }: AttemptDetailViewProps) {
  const { data: reviewData, isLoading, error } = useQuizAttempt(attemptId);

  if (isLoading) {
    return (
      <div className={styles.loadingSpinner}>
        Loading attempt details...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorMessage}>
        Failed to load attempt details. Please try again.
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className={styles.errorMessage}>
        Attempt not found.
      </div>
    );
  }

  const { attempt, quiz, question_results } = reviewData;
  const percentage = Math.round((attempt.points_earned / attempt.total_possible) * 100);

  return (
    <div className={styles.quizForm}>
      <div className={styles.quizFormContainer}>
        {/* Header */}
        <div className={styles.quizFormHeader}>
          <button
            className={`${styles.button} ${styles['button--secondary']}`}
            onClick={onBack}
            type="button"
            style={{ marginBottom: 'var(--spacing-md)' }}
          >
            ← Back to Attempts
          </button>
          <h1 className={styles.quizFormTitle}>{quiz.name} - Attempt Review</h1>
          <p className={styles.quizFormDescription}>
            Attempt #{attempt.attempt_number} • {new Date(attempt.submitted_at).toLocaleDateString()}
          </p>
        </div>

        {/* Summary Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-md)',
            padding: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-lg)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: 'var(--font-size-lg)' }}>
                Score: {attempt.points_earned}/{attempt.total_possible}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-primary)',
                }}
              >
                {percentage}%
              </p>
            </div>
            <span
              style={{
                display: 'inline-block',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                borderRadius: 'var(--border-radius-md)',
                backgroundColor: attempt.passed ? 'var(--color-success)' : 'var(--color-error)',
                color: 'white',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              {attempt.passed ? 'Passed' : 'Failed'}
            </span>
          </div>
        </div>

        {/* Questions Results */}
        <div>
          <h2 style={{ marginTop: 0, marginBottom: 'var(--spacing-lg)' }}>
            Questions ({question_results.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {question_results.map((result) => {
              const question = quiz.questions?.find((q) => q.id === result.question_id);
              if (!question) return null;

              return (
                <QuestionResultCard
                  key={result.question_id}
                  question={question}
                  result={result}
                />
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
            marginTop: 'var(--spacing-xl)',
            paddingTop: 'var(--spacing-lg)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <button
            className={`${styles.button} ${styles['button--secondary']}`}
            onClick={onBack}
            type="button"
          >
            ← Back to Attempts
          </button>
        </div>
      </div>
    </div>
  );
}
