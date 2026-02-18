import { Checkbox } from "@fluentui/react-components";
import type { QuizQuestionOptionForTaking, QuizQuestionOption } from "../../types/api";

interface MultiChoiceOptionsProps {
  options: (QuizQuestionOptionForTaking | QuizQuestionOption)[];
  selectedValues: string[];
  disabled: boolean;
  onChange: (optionId: string, isChecked: boolean) => void;
}

export function MultiChoiceOptions({
  options,
  selectedValues,
  disabled,
  onChange,
}: MultiChoiceOptionsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {options.map((option) => (
        <Checkbox
          key={option.id}
          label={option.text}
          checked={selectedValues.includes(option.id)}
          onChange={(_, data) => {
            if (!disabled) onChange(option.id, data.checked === true);
          }}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
