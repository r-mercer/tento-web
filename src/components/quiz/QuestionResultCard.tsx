import { Card, Title3, Body1, Text, Badge } from "@fluentui/react-components";
import type { QuestionAttemptDetail, QuizQuestion } from "../../types/api";

interface QuestionResultCardProps {
  question: QuizQuestion;
  result: QuestionAttemptDetail;
}

export function QuestionResultCard({ question, result }: QuestionResultCardProps) {
  const correctOptions = question.options?.filter((opt) => opt.correct) || [];
  const userSelectedOptions = question.options?.filter((opt) =>
    result.user_selected_option_ids.includes(opt.id)
  ) || [];

  return (
    <Card style={{ padding: "1.5rem", marginBottom: "1rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <Title3 style={{ marginBottom: "0.25rem" }}>{question.title}</Title3>
        {question.description && (
          <Body1 style={{ color: "var(--color-text-secondary)" }}>
            {question.description}
          </Body1>
        )}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.75rem" }}>
          <Text weight="semibold" style={{ display: "block", marginBottom: "0.25rem" }}>
            Your Answer{userSelectedOptions.length > 1 ? "s" : ""}:
          </Text>
          {userSelectedOptions.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
              {userSelectedOptions.map((opt) => (
                <li key={opt.id} style={{ color: "var(--color-text-primary)" }}>
                  {opt.text}
                </li>
              ))}
            </ul>
          ) : (
            <Text style={{ color: "var(--color-text-secondary)" }}>No answer selected</Text>
          )}
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <Text weight="semibold" style={{ display: "block", marginBottom: "0.25rem" }}>
            Correct Answer{correctOptions.length > 1 ? "s" : ""}:
          </Text>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {correctOptions.map((opt) => (
              <li key={opt.id} style={{ color: "var(--color-success)" }}>
                {opt.text}
              </li>
            ))}
          </ul>
        </div>

        {result.explanation && (
          <Card
            style={{
              padding: "0.75rem",
              borderLeft: "4px solid var(--color-primary)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <Text
              weight="semibold"
              style={{ color: "var(--color-primary)", display: "block", marginBottom: "0.25rem" }}
            >
              Explanation
            </Text>
            <Body1>{result.explanation}</Body1>
          </Card>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "0.75rem",
          borderTop: "1px solid var(--color-border)",
        }}
      >
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
