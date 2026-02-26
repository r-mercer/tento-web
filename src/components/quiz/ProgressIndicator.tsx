import {
  ProgressBar,
  Text,
  makeStyles,
  shorthands,
} from "@fluentui/react-components";
import { TYPOGRAPHY } from "../../styles/layoutRhythm";

interface ProgressIndicatorProps {
  current: number;
  total: number;
  answered: number;
}

const useStyles = makeStyles({
  root: { ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.sectionBottom, 0) },
  label: {
    display: "block",
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.titleBottom, 0),
  },
  bar: { height: "8px" },
});

export function ProgressIndicator({
  current,
  total,
  answered,
}: ProgressIndicatorProps) {
  const styles = useStyles();
  const percentage = (answered / total) * 100;

  return (
    <div className={styles.root}>
      <Text className={styles.label}>
        Question {current} of {total} ({answered} answered)
      </Text>
      <ProgressBar value={percentage / 100} className={styles.bar} />
    </div>
  );
}
