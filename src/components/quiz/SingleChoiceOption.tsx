import styles from './quiz.module.css';
import { ExplanationCard } from './ExplanationCard';

interface SingleChoiceOptionProps {
  option: {
    id: string;
    text: string;
    correct?: boolean;
    explanation?: string;
  };
  isSelected: boolean;
  isSubmitted: boolean;
  onChange: (optionId: string) => void;
}

/**
 * Single choice option component using radio button
 */
export function SingleChoiceOption({
  option,
  isSelected,
  isSubmitted,
  onChange,
}: SingleChoiceOptionProps) {
  const isCorrect = option.correct ?? false;
  const showExplanation = isSubmitted && (isSelected || isCorrect);

  let optionClassName = styles.option;
  if (isSelected) optionClassName += ` ${styles['option--selected']}`;
  if (isSubmitted && isCorrect) optionClassName += ` ${styles['option--correct']}`;
  if (isSubmitted && isSelected && !isCorrect) optionClassName += ` ${styles['option--incorrect']}`;
  if (isSubmitted) optionClassName += ` ${styles['option--disabled']}`;

  return (
    <div>
      <label
        className={optionClassName}
        onClick={() => !isSubmitted && onChange(option.id)}
      >
        <input
          type="radio"
          className={styles.optionInput}
          checked={isSelected}
          onChange={() => !isSubmitted && onChange(option.id)}
          disabled={isSubmitted}
        />
        <div className={styles.optionContent}>
          <p className={styles.optionText}>{option.text}</p>
        </div>
      </label>
      <ExplanationCard
        explanation={option.explanation}
        isCorrect={isCorrect}
        isVisible={showExplanation}
      />
    </div>
  );
}
