import {
  Badge,
  Body1,
  Card,
  Text,
  Title3,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import type { QuestionAttemptDetail, QuizQuestion } from "../../types/api";
import { TYPOGRAPHY } from "../../styles/layoutRhythm";

interface QuestionResultCardProps {
  question: QuizQuestion;
  result: QuestionAttemptDetail;
}

const useStyles = makeStyles({
  card: {
    ...shorthands.padding(tokens.spacingHorizontalL),
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.sectionBottom, 0),
  },
  section: { ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.sectionBottom, 0) },
  title: {
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.titleBottomCompact, 0),
  },
  mutedText: { color: TYPOGRAPHY.mutedForeground },
  subsection: {
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.subsectionBottom, 0),
  },
  sectionHeading: {
    display: "block",
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.titleBottomCompact, 0),
  },
  list: {
    ...shorthands.margin(0),
    paddingLeft: "1.25rem",
  },
  listItemMuted: { color: tokens.colorNeutralForeground1 },
  listItemCorrect: { color: tokens.colorPaletteGreenForeground1 },
  explanation: {
    ...shorthands.padding(tokens.spacingHorizontalM),
    ...shorthands.borderLeft("4px", "solid", tokens.colorBrandStroke1),
    backgroundColor: tokens.colorNeutralBackground2,
  },
  explanationTitle: {
    color: tokens.colorBrandForeground1,
    display: "block",
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.titleBottomCompact, 0),
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    ...shorthands.padding(tokens.spacingVerticalS, 0, 0, 0),
    ...shorthands.borderTop("1px", "solid", tokens.colorNeutralStroke1),
  },
});

export function QuestionResultCard({
  question,
  result,
}: QuestionResultCardProps) {
  const styles = useStyles();
  const correctOptions = question.options?.filter((opt) => opt.correct) || [];
  const userSelectedOptions =
    question.options?.filter((opt) =>
      result.user_selected_option_ids.includes(opt.id),
    ) || [];

  return (
    <Card className={styles.card}>
      <div className={styles.section}>
        <Title3 className={styles.title}>{question.title}</Title3>
        {question.description && (
          <Body1 className={styles.mutedText}>{question.description}</Body1>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.subsection}>
          <Text weight="semibold" className={styles.sectionHeading}>
            Your Answer{userSelectedOptions.length > 1 ? "s" : ""}:
          </Text>
          {userSelectedOptions.length > 0 ? (
            <ul className={styles.list}>
              {userSelectedOptions.map((opt) => (
                <li key={opt.id} className={styles.listItemMuted}>
                  {opt.text}
                </li>
              ))}
            </ul>
          ) : (
            <Text className={styles.mutedText}>No answer selected</Text>
          )}
        </div>

        <div className={styles.subsection}>
          <Text weight="semibold" className={styles.sectionHeading}>
            Correct Answer{correctOptions.length > 1 ? "s" : ""}:
          </Text>
          <ul className={styles.list}>
            {correctOptions.map((opt) => (
              <li key={opt.id} className={styles.listItemCorrect}>
                {opt.text}
              </li>
            ))}
          </ul>
        </div>

        {result.explanation && (
          <Card className={styles.explanation}>
            <Text weight="semibold" className={styles.explanationTitle}>
              Explanation
            </Text>
            <Body1>{result.explanation}</Body1>
          </Card>
        )}
      </div>

      <div className={styles.footer}>
        <Badge
          appearance="filled"
          color={result.is_correct ? "success" : "danger"}
        >
          {result.is_correct ? "Correct" : "Incorrect"}
        </Badge>
        <Text size={400} weight="bold">
          {result.points_earned}/1 point
        </Text>
      </div>
    </Card>
  );
}
