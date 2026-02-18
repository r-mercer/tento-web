import { Card, type CardProps } from "@fluentui/react-components";
import type { ReactNode } from "react";

interface AppCardProps extends CardProps {
  children: ReactNode;
}

export function AppCard({ children, ...props }: AppCardProps) {
  return (
    <Card
      style={{
        padding: "1.5rem",
        borderRadius: "8px",
        ...props.style,
      }}
      {...props}
    >
      {children}
    </Card>
  );
}
