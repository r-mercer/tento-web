import { RadioGroup, Radio } from "@fluentui/react-components";
import type { QuizQuestionOptionForTaking, QuizQuestionOption } from "../../types/api";

interface BooleanOptionsProps {
  options: (QuizQuestionOptionForTaking | QuizQuestionOption)[];
  selectedValue: string | undefined;
  disabled: boolean;
  onChange: (optionId: string) => void;
}

export function BooleanOptions({
  options,
  selectedValue,
  disabled,
  onChange,
}: BooleanOptionsProps) {
  return (
    <RadioGroup
      value={selectedValue}
      onChange={(_, data) => {
        if (!disabled && data.value) onChange(data.value);
      }}
      disabled={disabled}
      layout="horizontal"
    >
      {options.map((option) => (
        <Radio key={option.id} value={option.id} label={option.text} />
      ))}
    </RadioGroup>
  );
}
