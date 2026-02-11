import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { QuizForm } from './QuizForm';
import styles from './quiz.module.css';
import type { QuizAttemptResponse } from '../../types/api';

/**
 * Page-level container for quiz viewing and taking
 * Handles routing for quiz/:id/take mode
 */
export function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();

  if (!id) {
    return (
      <div className={styles.quizForm}>
        <div className={styles.errorMessage}>Quiz not found</div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className={styles.quizForm}>
        <div className={styles.loadingSpinner}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.quizForm}>
        <div className={styles.errorMessage}>
          Please log in to take this quiz
        </div>
      </div>
    );
  }

  const handleAttemptComplete = (attempt: QuizAttemptResponse) => {
    console.log('Quiz attempt completed:', attempt);
    // Could navigate to history page or show additional UI here
  };

  return (
    <QuizForm
      quizId={id}
      onAttemptComplete={handleAttemptComplete}
    />
  );
}
