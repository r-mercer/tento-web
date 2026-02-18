import { useMemo } from "react";
import { useQuiz, useUpdateQuiz } from "../../hooks/api/useQuizzes";
import { useToast } from "../ui/ToastProvider";
import {
  Field,
  Input,
  Textarea,
  Button,
  Title2,
  Title3,
  Spinner,
  Divider,
  Card,
} from "@fluentui/react-components";
import type { Quiz, QuizQuestion, QuizQuestionOption } from "../../types/api";

type Props = {
  quizId: string;
  onSaved?: (quiz: Quiz) => void;
};

export function QuizEditor({ quizId, onSaved }: Props) {
  const { data: quiz, isLoading } = useQuiz(quizId);
  const updateMutation = useUpdateQuiz(quizId);

  const toast = useToast();

  const localQuiz = useMemo(() => quiz, [quiz]);

  if (isLoading || !localQuiz) {
    return (
      <div style={{ padding: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <Spinner size="small" />
        <span>Loading editor...</span>
      </div>
    );
  }

  const updateField = <K extends keyof Quiz>(key: K, value: Quiz[K]) => {
    updateMutation.mutate({ [key]: value } as Partial<Quiz>);
  };

  const updateQuestion = (index: number, patch: Partial<QuizQuestion>) => {
    if (!localQuiz.questions) return;
    const questions = localQuiz.questions.map((q, i) =>
      i === index ? { ...q, ...patch } : q,
    );
    updateMutation.mutate({ questions } as Partial<Quiz>);
  };

  const updateOption = (qIndex: number, oIndex: number, text: string) => {
    if (!localQuiz.questions) return;
    const questions = localQuiz.questions.map((q, i) => {
      if (i !== qIndex) return q;
      const options = q.options?.map((opt, oi) =>
        oi === oIndex ? { ...opt, text } : opt,
      );
      return { ...q, options };
    });
    updateMutation.mutate({ questions } as Partial<Quiz>);
  };

  const handleSave = async () => {
    if (!localQuiz) return;

    const payload = {
      id: localQuiz.id,
      title: localQuiz.title,
      description: localQuiz.description,
      questions:
        localQuiz.questions?.map((q) => ({
          id: q.id,
          title: q.title,
          description: q.description,
          options: q.options?.map((o) => ({ id: o.id, text: o.text })) ?? [],
        })) ?? [],
    };

    try {
      const updated = await updateMutation.mutateAsync(payload);
      toast.success("Saved");
      if (onSaved) onSaved(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast.error(msg);
      console.error("Failed to save quiz", err);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <Title2 style={{ marginBottom: "1.5rem" }}>Edit Quiz</Title2>

      <Card style={{ padding: "1.5rem", marginBottom: "1rem" }}>
        <Field label="Title" style={{ marginBottom: "1rem" }}>
          <Input
            value={localQuiz.title ?? ""}
            onChange={(_, v) => updateField("title", v.value)}
          />
        </Field>

        <Field label="Description">
          <Textarea
            value={localQuiz.description ?? ""}
            onChange={(_, v) => updateField("description", v.value)}
            resize="vertical"
          />
        </Field>
      </Card>

      <Divider style={{ margin: "1.5rem 0" }} />

      {(localQuiz.questions || []).map((question, qi) => (
        <Card key={question.id} style={{ padding: "1.5rem", marginBottom: "1rem" }}>
          <Title3 style={{ marginBottom: "1rem" }}>Question {qi + 1}</Title3>

          <Field label="Question Title" style={{ marginBottom: "1rem" }}>
            <Input
              value={question.title ?? ""}
              onChange={(_, v) => updateQuestion(qi, { title: v.value })}
            />
          </Field>

          <Field label="Question Description" style={{ marginBottom: "1rem" }}>
            <Textarea
              value={question.description ?? ""}
              onChange={(_, v) => updateQuestion(qi, { description: v.value })}
              resize="vertical"
            />
          </Field>

          <Field label="Options">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
              {question.options?.map((opt: QuizQuestionOption, oi: number) => (
                <Input
                  key={opt.id}
                  value={opt.text ?? ""}
                  onChange={(_, v) => updateOption(qi, oi, v.value)}
                  placeholder={`Option ${oi + 1}`}
                />
              ))}
            </div>
          </Field>
        </Card>
      ))}

      <Button
        appearance="primary"
        onClick={handleSave}
        disabled={updateMutation.isPending}
        size="large"
      >
        {updateMutation.isPending ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}

export default QuizEditor;
