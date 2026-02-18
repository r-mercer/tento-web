import styles from "./quiz.module.css";
import { ExplanationCard } from "./ExplanationCard";
import { Button } from '@fluentui/react-components';

interface BooleanOptionProps {
  option: {
    id: string;
    text: string; // Will be "True" or "False"
    correct?: boolean;
    explanation?: string;
  };
  isSelected: boolean;
  isSubmitted: boolean;
  onChange: (optionId: string) => void;
}

/**
 * Boolean (True/False) option component
 */
export function BooleanOption({
  option,
  isSelected,
  isSubmitted,
  onChange,
}: BooleanOptionProps) {
  const isCorrect = option.correct ?? false;
  const showExplanation = isSubmitted && (isSelected || isCorrect);

  let buttonClassName = styles.booleanButton;
  if (isSelected) buttonClassName += ` ${styles["booleanButton--selected"]}`;

  return (
    <div>
      <Button
        className={buttonClassName}
        onClick={() => !isSubmitted && onChange(option.id)}
        disabled={isSubmitted}
        aria-pressed={isSelected}
      >
        {option.text}
      </Button>
      <ExplanationCard
        explanation={option.explanation}
        isCorrect={isCorrect}
        isVisible={showExplanation}
      />
    </div>
  );
}
