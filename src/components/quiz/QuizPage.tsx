import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { QuizForm } from "./QuizForm";
import { Body1, Spinner, MessageBar, MessageBarBody } from "@fluentui/react-components";
import type { QuizAttemptResponse } from "../../types/api";

export function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();

  if (!id) {
    return (
      <div style={{ padding: "2rem" }}>
        <MessageBar intent="error">
          <MessageBarBody>Quiz not found</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div style={{ padding: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Spinner size="small" />
        <Body1>Loading...</Body1>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: "2rem" }}>
        <MessageBar intent="warning">
          <MessageBarBody>Please log in to take this quiz</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  const handleAttemptComplete = (attempt: QuizAttemptResponse) => {
    console.log("Quiz attempt completed:", attempt);
  };

  return <QuizForm quizId={id} onAttemptComplete={handleAttemptComplete} />;
}
