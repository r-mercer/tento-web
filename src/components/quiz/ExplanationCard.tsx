import { Card, Text, Body1 } from "@fluentui/react-components";

interface ExplanationCardProps {
  explanation?: string;
  isCorrect?: boolean;
  isVisible: boolean;
}

export function ExplanationCard({ explanation, isCorrect, isVisible }: ExplanationCardProps) {
  if (!isVisible || !explanation) {
    return null;
  }

  const icon = isCorrect ? "✓" : "✗";
  const label = isCorrect ? "Correct!" : "Incorrect";

  return (
    <Card
      style={{
        marginTop: "0.5rem",
        padding: "0.75rem",
        backgroundColor: isCorrect ? "var(--color-success-bg, #efe)" : "var(--color-error-bg, #fee)",
        borderLeft: `4px solid ${isCorrect ? "var(--color-success, #060)" : "var(--color-error, #c00)"}`,
      }}
    >
      <Text weight="semibold" style={{ marginBottom: "0.25rem" }}>
        {icon} {label}
      </Text>
      <Body1>{explanation}</Body1>
    </Card>
  );
}
