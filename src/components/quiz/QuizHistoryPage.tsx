import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { QuizAttemptsList } from './QuizAttemptsList';
import { AttemptDetailView } from './AttemptDetailView';
import styles from './quiz.module.css';

/**
 * Page-level container for quiz attempt history viewing
 * Handles routing for quiz/:id/history mode
 */
export function QuizHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | undefined>();

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
          Please log in to view attempt history
        </div>
      </div>
    );
  }

  // Show detail view if an attempt is selected
  if (selectedAttemptId) {
    return (
      <AttemptDetailView
        attemptId={selectedAttemptId}
        onBack={() => setSelectedAttemptId(undefined)}
      />
    );
  }

  // Show list view
  return (
    <div className={styles.quizForm}>
      <div className={styles.quizFormContainer}>
        <div className={styles.quizFormHeader}>
          <h1 className={styles.quizFormTitle}>Quiz Attempt History</h1>
          <p className={styles.quizFormDescription}>
            View all your attempts and detailed results for this quiz
          </p>
        </div>

        <QuizAttemptsList
          quizId={id}
          onSelectAttempt={setSelectedAttemptId}
          selectedAttemptId={selectedAttemptId}
        />
      </div>
    </div>
  );
}
