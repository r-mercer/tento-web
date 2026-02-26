import {
  Card,
  mergeClasses,
  makeStyles,
  shorthands,
  tokens,
  type CardProps,
} from "@fluentui/react-components";
import type { ReactNode } from "react";

interface AppCardProps extends CardProps {
  children: ReactNode;
}

const useStyles = makeStyles({
  root: {
    ...shorthands.padding(tokens.spacingHorizontalL),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
  },
});

export function AppCard({ children, ...props }: AppCardProps) {
  const styles = useStyles();

  return (
    <Card {...props} className={mergeClasses(styles.root, props.className)}>
      {children}
    </Card>
  );
}
