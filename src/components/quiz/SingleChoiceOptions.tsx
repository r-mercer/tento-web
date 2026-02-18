import { RadioGroup, Radio } from "@fluentui/react-components";
import type { QuizQuestionOptionForTaking, QuizQuestionOption } from "../../types/api";

interface SingleChoiceOptionsProps {
  options: (QuizQuestionOptionForTaking | QuizQuestionOption)[];
  selectedValue: string | undefined;
  disabled: boolean;
  onChange: (optionId: string) => void;
}

export function SingleChoiceOptions({
  options,
  selectedValue,
  disabled,
  onChange,
}: SingleChoiceOptionsProps) {
  return (
    <RadioGroup
      value={selectedValue}
      onChange={(_, data) => {
        if (!disabled && data.value) onChange(data.value);
      }}
      disabled={disabled}
    >
      {options.map((option) => (
        <Radio key={option.id} value={option.id} label={option.text} />
      ))}
    </RadioGroup>
  );
}
