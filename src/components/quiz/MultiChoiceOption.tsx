import styles from './quiz.module.css';
import { ExplanationCard } from './ExplanationCard';

interface MultiChoiceOptionProps {
  option: {
    id: string;
    text: string;
    correct?: boolean;
    explanation?: string;
  };
  isSelected: boolean;
  isSubmitted: boolean;
  onChange: (optionId: string, isChecked: boolean) => void;
}

/**
 * Multi-choice option component using checkbox
 */
export function MultiChoiceOption({
  option,
  isSelected,
  isSubmitted,
  onChange,
}: MultiChoiceOptionProps) {
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
        onClick={() => !isSubmitted && onChange(option.id, !isSelected)}
      >
        <input
          type="checkbox"
          className={styles.optionInput}
          checked={isSelected}
          onChange={(e) => !isSubmitted && onChange(option.id, e.target.checked)}
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
