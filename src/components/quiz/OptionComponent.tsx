import { SingleChoiceOption } from './SingleChoiceOption';
import { MultiChoiceOption } from './MultiChoiceOption';
import { BooleanOption } from './BooleanOption';
import type { QuizQuestionType } from '../../types/api';

interface OptionComponentProps {
  questionType: QuizQuestionType;
  option: {
    id: string;
    text: string;
    correct?: boolean;
    explanation?: string;
  };
  isSelected: boolean;
  isSubmitted: boolean;
  onChange: (optionId: string, isChecked?: boolean) => void;
}

/**
 * Router component that renders the appropriate option component based on question type
 */
export function OptionComponent({
  questionType,
  option,
  isSelected,
  isSubmitted,
  onChange,
}: OptionComponentProps) {
  switch (questionType) {
    case 'Single':
      return (
        <SingleChoiceOption
          option={option}
          isSelected={isSelected}
          isSubmitted={isSubmitted}
          onChange={onChange}
        />
      );
    case 'Multi':
      return (
        <MultiChoiceOption
          option={option}
          isSelected={isSelected}
          isSubmitted={isSubmitted}
          onChange={(id, checked) => onChange(id, checked)}
        />
      );
    case 'Bool':
      return (
        <BooleanOption
          option={option}
          isSelected={isSelected}
          isSubmitted={isSubmitted}
          onChange={onChange}
        />
      );
    default:
      return null;
  }
}
