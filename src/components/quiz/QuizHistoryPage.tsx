import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { QuizAttemptsList } from "./QuizAttemptsList";
import { AttemptDetailView } from "./AttemptDetailView";
import { Title1, Body1 } from "@fluentui/react-components";

export function QuizHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | undefined>();

  if (!id) {
    return (
      <div style={{ padding: "2rem" }}>
        <Body1>Quiz not found</Body1>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div style={{ padding: "2rem" }}>
        <Body1>Loading...</Body1>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: "2rem" }}>
        <Body1>Please log in to view attempt history</Body1>
      </div>
    );
  }

  if (selectedAttemptId) {
    return (
      <AttemptDetailView
        attemptId={selectedAttemptId}
        onBack={() => setSelectedAttemptId(undefined)}
      />
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Title1>Quiz Attempt History</Title1>
        <Body1 style={{ color: "var(--color-text-secondary)", display: "block", marginTop: "0.5rem" }}>
          View all your attempts and detailed results for this quiz
        </Body1>
      </div>

      <QuizAttemptsList
        quizId={id}
        onSelectAttempt={setSelectedAttemptId}
        selectedAttemptId={selectedAttemptId}
      />
    </div>
  );
}
