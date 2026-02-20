import { Card, Title2, Body1 } from "@fluentui/react-components";
import { SingleChoiceOptions } from "./SingleChoiceOptions";
import { MultiChoiceOptions } from "./MultiChoiceOptions";
import { BooleanOptions } from "./BooleanOptions";
import type { QuizQuestionForTaking, QuizQuestion } from "../../types/api";

interface QuestionCardProps {
  question: QuizQuestionForTaking | QuizQuestion;
  userAnswerIds: string[];
  isSubmitted: boolean;
  onAnswerChange: (optionId: string, isChecked?: boolean) => void;
}

export function QuestionCard({
  question,
  userAnswerIds,
  isSubmitted,
  onAnswerChange,
}: QuestionCardProps) {
  const options = question.options || [];
  const selectedValue = userAnswerIds.length > 0 ? userAnswerIds[0] : undefined;

  const questionType = (() => {
    const t = question.question_type?.toUpperCase();
    if (t === "SINGLE") return "Single";
    if (t === "MULTI") return "Multi";
    if (t === "BOOL") return "Bool";
    return "Single";
  })();

  const renderOptions = () => {
    switch (questionType) {
      case "Single":
        return (
          <SingleChoiceOptions
            options={options}
            selectedValue={selectedValue}
            disabled={isSubmitted}
            onChange={(optionId) => onAnswerChange(optionId)}
          />
        );
      case "Bool":
        return (
          <BooleanOptions
            options={options}
            selectedValue={selectedValue}
            disabled={isSubmitted}
            onChange={(optionId) => onAnswerChange(optionId)}
          />
        );
      case "Multi":
        return (
          <MultiChoiceOptions
            options={options}
            selectedValues={userAnswerIds}
            disabled={isSubmitted}
            onChange={(optionId, isChecked) => onAnswerChange(optionId, isChecked)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card style={{ padding: "1.5rem", marginBottom: "1rem" }}>
      <Title2 style={{ marginBottom: "0.25rem" }}>{question.title}</Title2>
      {question.description && (
        <Body1 style={{ color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
          {question.description}
        </Body1>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {renderOptions()}
      </div>
    </Card>
  );
}
