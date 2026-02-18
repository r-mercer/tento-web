import styles from "./quiz.module.css";
import { RadioGroup, Radio, Checkbox } from "@fluentui/react-components";
import type { QuizQuestionForTaking, QuizQuestion } from "../../types/api";

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

  // Single choice and Bool questions use RadioGroup (radio-like)
  if (
    question.question_type === "Single" ||
    question.question_type === "Bool"
  ) {
    const selectedValue =
      userAnswerIds.length > 0 ? userAnswerIds[0] : undefined;

    return (
      <div className={styles.questionCard}>
        <h2 className={styles.questionCardTitle}>{question.title}</h2>
        {question.description && (
          <p className={styles.questionCardDescription}>
            {question.description}
          </p>
        )}
        <div className={styles.questionCardOptions}>
          <RadioGroup
            value={selectedValue}
            onChange={(_, data) => {
              if (!isSubmitted && data.value) onAnswerChange(data.value);
            }}
            disabled={isSubmitted}
          >
            {options.map((option) => (
              <Radio key={option.id} value={option.id} label={option.text} />
            ))}
          </RadioGroup>
        </div>
      </div>
    );
  }

  // Multi-choice uses checkboxes per option
  return (
    <div className={styles.questionCard}>
      <h2 className={styles.questionCardTitle}>{question.title}</h2>
      {question.description && (
        <p className={styles.questionCardDescription}>{question.description}</p>
      )}
      <div className={styles.questionCardOptions}>
        {options.map((option) => (
          <div key={option.id} style={{ marginBottom: 8 }}>
            <Checkbox
              label={option.text}
              checked={userAnswerIds.includes(option.id)}
              onChange={(_, checked) =>
                !isSubmitted && onAnswerChange(option.id, !!checked)
              }
              disabled={isSubmitted}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
