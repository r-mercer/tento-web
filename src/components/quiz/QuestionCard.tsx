import {
  Body1,
  Card,
  Title2,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { SingleChoiceOptions } from "./SingleChoiceOptions";
import { MultiChoiceOptions } from "./MultiChoiceOptions";
import { BooleanOptions } from "./BooleanOptions";
import type { QuizQuestionForTaking, QuizQuestion } from "../../types/api";
import { TYPOGRAPHY } from "../../styles/layoutRhythm";

interface QuestionCardProps {
  question: QuizQuestionForTaking | QuizQuestion;
  userAnswerIds: string[];
  isSubmitted: boolean;
  onAnswerChange: (optionId: string, isChecked?: boolean) => void;
}

const useStyles = makeStyles({
  card: {
    ...shorthands.padding(tokens.spacingHorizontalL),
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.sectionBottom, 0),
  },
  title: {
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.titleBottomCompact, 0),
  },
  description: {
    color: TYPOGRAPHY.mutedForeground,
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.subtitleBottom, 0),
  },
  options: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
  },
});

export function QuestionCard({
  question,
  userAnswerIds,
  isSubmitted,
  onAnswerChange,
}: QuestionCardProps) {
  const styles = useStyles();
  const options = question.options || [];
  const selectedValue = userAnswerIds.length > 0 ? userAnswerIds[0] : undefined;

  const questionType = (() => {
    const t = question.questionType?.toUpperCase();
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
            onChange={(optionId, isChecked) =>
              onAnswerChange(optionId, isChecked)
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className={styles.card}>
      <Title2 className={styles.title}>{question.title}</Title2>
      {question.description && (
        <Body1 className={styles.description}>{question.description}</Body1>
      )}
      <div className={styles.options}>{renderOptions()}</div>
    </Card>
  );
}
