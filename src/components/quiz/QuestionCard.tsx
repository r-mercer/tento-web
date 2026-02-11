import styles from './quiz.module.css';
import { OptionComponent } from './OptionComponent';
import type { QuizQuestionForTaking, QuizQuestion } from '../../types/api';

interface QuestionCardProps {
  question: QuizQuestionForTaking | QuizQuestion;
  userAnswerIds: string[];
  isSubmitted: boolean;
  onAnswerChange: (optionId: string, isChecked?: boolean) => void;
}

/**
 * Question card component that displays a question and its options
 */
export function QuestionCard({
  question,
  userAnswerIds,
  isSubmitted,
  onAnswerChange,
}: QuestionCardProps) {
  const options = question.options || [];

  return (
    <div className={styles.questionCard}>
      <h2 className={styles.questionCardTitle}>{question.title}</h2>
      {question.description && (
        <p className={styles.questionCardDescription}>{question.description}</p>
      )}
      <div className={styles.questionCardOptions}>
        {options.map((option) => (
          <OptionComponent
            key={option.id}
            questionType={question.question_type}
            option={option}
            isSelected={userAnswerIds.includes(option.id)}
            isSubmitted={isSubmitted}
            onChange={onAnswerChange}
          />
        ))}
      </div>
    </div>
  );
}
