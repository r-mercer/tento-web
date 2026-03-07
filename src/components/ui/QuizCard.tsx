import {
  Title3,
  Body2,
  Text,
  Badge,
  Button,
} from "@fluentui/react-components";
import { ROUTES } from "../../utils/constants";
import { formatPassThreshold } from "../../utils/quizScoring";
import { AppCard } from "./AppCard";
import type { Quiz, QuizStatus } from "../../types/api";

const statusColors: Record<QuizStatus, "success" | "warning" | "important" | "informative" | "subtle" | "danger"> = {
  Ready: "success",
  Draft: "warning",
  Complete: "informative",
  Pending: "danger",
};

function getStatusBadgeColor(status: QuizStatus) {
  return statusColors[status] || "subtle";
}

interface QuizCardProps {
  quiz: Quiz;
}

export function QuizCard({ quiz }: QuizCardProps) {
  const passThreshold = formatPassThreshold(
    quiz.requiredScore,
    quiz.questionCount,
  );

  return (
    <AppCard
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacingVerticalM)",
      }}
    >
      <div>
        <Title3 style={{ marginBottom: "var(--spacingVerticalXS)" }}>{quiz.name}</Title3>
        {quiz.title && (
          <Body2 style={{ color: "var(--colorNeutralForeground2)", display: "block", marginTop: "var(--spacingVerticalXS)" }}>
            {quiz.title}
          </Body2>
        )}
      </div>

      <div style={{ display: "flex", gap: "var(--spacingHorizontalM)", fontSize: "var(--fontSizeBase200)", color: "var(--colorNeutralForeground2)" }}>
        <Text>{quiz.questionCount} questions</Text>
        <Text>{passThreshold} to pass</Text>
      </div>

      <div style={{ display: "flex", gap: "var(--spacingHorizontalS)" }}>
        <Badge appearance="filled" color={getStatusBadgeColor(quiz.status)}>
          {quiz.status}
        </Badge>
      </div>

      <div style={{ display: "flex", gap: "var(--spacingHorizontalS)" }}>
        <Button
          appearance="primary"
          as="a"
          href={ROUTES.QUIZ_TAKE(quiz.id)}
          style={{ flex: 1 }}
        >
          Take Quiz
        </Button>
        <Button appearance="outline" as="a" href={ROUTES.QUIZ_EDIT(quiz.id)}>
          Edit
        </Button>
      </div>
    </AppCard>
  );
}
