import { ProgressBar, Text } from "@fluentui/react-components";

interface ProgressIndicatorProps {
  current: number;
  total: number;
  answered: number;
}

export function ProgressIndicator({ current, total, answered }: ProgressIndicatorProps) {
  const percentage = (current / total) * 100;

  return (
    <div style={{ marginBottom: "1rem" }}>
      <Text style={{ display: "block", marginBottom: "0.5rem" }}>
        Question {current} of {total} ({answered} answered)
      </Text>
      <ProgressBar value={percentage / 100} style={{ height: "8px" }} />
    </div>
  );
}
