import {
  Body1,
  Card,
  Text,
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { TYPOGRAPHY } from "../../styles/layoutRhythm";

interface ExplanationCardProps {
  explanation?: string;
  isCorrect?: boolean;
  isVisible: boolean;
}

const useStyles = makeStyles({
  card: {
    ...shorthands.margin(TYPOGRAPHY.spacing.subtitleTop, 0, 0, 0),
    ...shorthands.padding(tokens.spacingHorizontalM),
    ...shorthands.borderLeft("4px", "solid", tokens.colorNeutralStroke1),
  },
  cardCorrect: {
    backgroundColor: tokens.colorPaletteGreenBackground1,
    borderLeftColor: tokens.colorPaletteGreenBorder2,
  },
  cardIncorrect: {
    backgroundColor: tokens.colorPaletteRedBackground1,
    borderLeftColor: tokens.colorPaletteRedBorder2,
  },
  label: {
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.titleBottomCompact, 0),
  },
});

export function ExplanationCard({
  explanation,
  isCorrect,
  isVisible,
}: ExplanationCardProps) {
  const styles = useStyles();

  if (!isVisible || !explanation) {
    return null;
  }

  const icon = isCorrect ? "✓" : "✗";
  const label = isCorrect ? "Correct!" : "Incorrect";

  return (
    <Card
      className={mergeClasses(
        styles.card,
        isCorrect ? styles.cardCorrect : styles.cardIncorrect,
      )}
    >
      <Text weight="semibold" className={styles.label}>
        {icon} {label}
      </Text>
      <Body1>{explanation}</Body1>
    </Card>
  );
}
