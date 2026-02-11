import styles from './quiz.module.css';
import type { QuestionAttemptDetail, QuizQuestion } from '../../types/api';

interface QuestionResultCardProps {
  question: QuizQuestion;
  result: QuestionAttemptDetail;
}

/**
 * Displays detailed results for a single question in an attempt
 */
export function QuestionResultCard({ question, result }: QuestionResultCardProps) {
  const correctOptions = question.options?.filter((opt) => opt.correct) || [];
  const userSelectedOptions = question.options?.filter((opt) =>
    result.user_selected_option_ids.includes(opt.id)
  ) || [];

  return (
    <div className={styles.questionCard}>
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <h3 className={styles.questionCardTitle}>{question.title}</h3>
        {question.description && (
          <p className={styles.questionCardDescription}>{question.description}</p>
        )}
      </div>

      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <p style={{ marginBottom: 'var(--spacing-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
            Your Answer{userSelectedOptions.length > 1 ? 's' : ''}:
          </p>
          {userSelectedOptions.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)' }}>
              {userSelectedOptions.map((opt) => (
                <li key={opt.id} style={{ color: 'var(--color-text-primary)' }}>
                  {opt.text}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>No answer selected</p>
          )}
        </div>

        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <p style={{ marginBottom: 'var(--spacing-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
            Correct Answer{correctOptions.length > 1 ? 's' : ''}:
          </p>
          <ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)' }}>
            {correctOptions.map((opt) => (
              <li key={opt.id} style={{ color: 'var(--color-success)' }}>
                {opt.text}
              </li>
            ))}
          </ul>
        </div>

        {result.explanation && (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderLeft: '4px solid var(--color-primary)',
              borderRadius: 'var(--border-radius-md)',
              padding: 'var(--spacing-md)',
            }}
          >
            <p
              style={{
                margin: '0 0 var(--spacing-sm) 0',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-primary)',
              }}
            >
              Explanation
            </p>
            <p style={{ margin: 0, color: 'var(--color-text-primary)' }}>
              {result.explanation}
            </p>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 'var(--spacing-md)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-block',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              borderRadius: 'var(--border-radius-md)',
              backgroundColor: result.is_correct
                ? 'var(--color-success)'
                : 'var(--color-error)',
              color: 'white',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            {result.is_correct ? 'Correct' : 'Incorrect'}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
            {result.points_earned}/{result.points_earned > 0 ? '1' : '1'} point
          </p>
        </div>
      </div>
    </div>
  );
}
