import { useState, useCallback } from "react";
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
  Badge,
} from "@fluentui/react-components";
import type { Quiz, QuizQuestion, QuizQuestionOption } from "../../types/api";

type Props = {
  quizId: string;
  onSaved?: (quiz: Quiz) => void;
};

interface DirtyFields {
  title?: boolean;
  description?: boolean;
  questions?: Record<string, {
    title?: boolean;
    description?: boolean;
    options?: Record<string, boolean>;
  }>;
}

interface UpdateQuizVariables {
  id?: string;
  title?: string;
  description?: string;
  questions?: Array<{
    id: string;
    title?: string;
    description?: string;
    options?: Array<{ id: string; text: string }>;
  }>;
}

export function QuizEditor({ quizId, onSaved }: Props) {
  const { data: quiz, isLoading } = useQuiz(quizId);
  const updateMutation = useUpdateQuiz(quizId);
  const toast = useToast();

  const [editedQuiz, setEditedQuiz] = useState<Quiz | null>(null);
  const [originalQuiz, setOriginalQuiz] = useState<Quiz | null>(null);
  const [dirtyFields, setDirtyFields] = useState<DirtyFields>({});

  if (quiz && !editedQuiz) {
    setOriginalQuiz(quiz);
    setEditedQuiz(quiz);
  }

  const hasDirtyFields = useCallback((): boolean => {
    if (dirtyFields.title || dirtyFields.description) return true;
    if (dirtyFields.questions) {
      for (const qDirty of Object.values(dirtyFields.questions)) {
        if (qDirty.title || qDirty.description) return true;
        if (qDirty.options) {
          for (const oDirty of Object.values(qDirty.options)) {
            if (oDirty) return true;
          }
        }
      }
    }
    return false;
  }, [dirtyFields]);

  const updateField = <K extends keyof Quiz>(key: K, value: Quiz[K]) => {
    setEditedQuiz(prev => prev ? { ...prev, [key]: value } : null);
    setDirtyFields(prev => ({ ...prev, [key]: true }));
  };

  const updateQuestion = (index: number, patch: Partial<QuizQuestion>) => {
    if (!editedQuiz?.questions) return;
    const question = editedQuiz.questions[index];
    if (!question) return;

    setEditedQuiz(prev => {
      if (!prev?.questions) return prev;
      const questions = prev.questions.map((q, i) =>
        i === index ? { ...q, ...patch } : q,
      );
      return { ...prev, questions };
    });

    const fieldUpdates: Record<string, boolean> = {};
    if ('title' in patch) fieldUpdates.title = true;
    if ('description' in patch) fieldUpdates.description = true;

    setDirtyFields(prev => ({
      ...prev,
      questions: {
        ...prev.questions,
        [question.id]: {
          ...prev.questions?.[question.id],
          ...fieldUpdates,
        },
      },
    }));
  };

  const updateOption = (qIndex: number, oIndex: number, text: string) => {
    if (!editedQuiz?.questions) return;
    const question = editedQuiz.questions[qIndex];
    const option = question?.options?.[oIndex];
    if (!question || !option) return;

    setEditedQuiz(prev => {
      if (!prev?.questions) return prev;
      const questions = prev.questions.map((q, i) => {
        if (i !== qIndex) return q;
        const options = q.options?.map((opt, oi) =>
          oi === oIndex ? { ...opt, text } : opt,
        );
        return { ...q, options };
      });
      return { ...prev, questions };
    });

    setDirtyFields(prev => ({
      ...prev,
      questions: {
        ...prev.questions,
        [question.id]: {
          ...prev.questions?.[question.id],
          options: {
            ...prev.questions?.[question.id]?.options,
            [option.id]: true,
          },
        },
      },
    }));
  };

  const buildPayload = (): UpdateQuizVariables => {
    if (!editedQuiz) return {};

    const payload: UpdateQuizVariables = {};

    if (dirtyFields.title) {
      payload.title = editedQuiz.title;
    }
    if (dirtyFields.description) {
      payload.description = editedQuiz.description;
    }

    if (dirtyFields.questions) {
      const dirtyQuestions = Object.entries(dirtyFields.questions)
        .filter(([, qDirty]) =>
          qDirty.title || qDirty.description ||
          (qDirty.options && Object.values(qDirty.options).some(Boolean))
        )
        .map(([qId, qDirty]) => {
          const question = editedQuiz.questions?.find(q => q.id === qId);
          if (!question) return null;

          const qPayload: { 
            id: string; 
            title?: string; 
            description?: string; 
            options?: Array<{ id: string; text: string }> 
          } = { id: qId };

          if (qDirty.title) qPayload.title = question.title;
          if (qDirty.description) qPayload.description = question.description;

          if (qDirty.options) {
            const dirtyOptions = Object.entries(qDirty.options)
              .filter(([, isDirty]) => isDirty)
              .map(([oId]) => {
                const opt = question.options?.find(o => o.id === oId);
                if (!opt) return null;
                return { id: oId, text: opt.text };
              })
              .filter((o): o is { id: string; text: string } => o !== null);

            if (dirtyOptions.length > 0) {
              qPayload.options = dirtyOptions;
            }
          }

          return qPayload;
        })
        .filter((q): q is NonNullable<typeof q> => q !== null);

      if (dirtyQuestions.length > 0) {
        payload.questions = dirtyQuestions;
      }
    }

    return payload;
  };

  const handleSave = async () => {
    if (!editedQuiz) return;

    const payload = buildPayload();

    if (!hasDirtyFields()) {
      toast.info("No changes to save");
      return;
    }

    try {
      const updated = await updateMutation.mutateAsync(payload);
      toast.success("Saved");
      setDirtyFields({});
      setOriginalQuiz(updated);
      if (onSaved) onSaved(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast.error(msg);
      console.error("Failed to save quiz", err);
    }
  };

  const handleReset = () => {
    if (originalQuiz) {
      setEditedQuiz(originalQuiz);
      setDirtyFields({});
    }
  };

  if (isLoading || !editedQuiz) {
    return (
      <div style={{ padding: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <Spinner size="small" />
        <span>Loading editor...</span>
      </div>
    );
  }

  const hasChanges = hasDirtyFields();

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <Title2>Edit Quiz</Title2>
        {hasChanges && <Badge appearance="filled" color="warning">Unsaved changes</Badge>}
      </div>

      <Card style={{ padding: "1.5rem", marginBottom: "1rem" }}>
        <Field label="Title" style={{ marginBottom: "1rem" }}>
          <Input
            value={editedQuiz.title ?? ""}
            onChange={(_, v) => updateField("title", v.value)}
          />
        </Field>

        <Field label="Description">
          <Textarea
            value={editedQuiz.description ?? ""}
            onChange={(_, v) => updateField("description", v.value)}
            resize="vertical"
          />
        </Field>
      </Card>

      <Divider style={{ margin: "1.5rem 0" }} />

      {(editedQuiz.questions || []).map((question, qi) => (
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

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Button
          appearance="primary"
          onClick={handleSave}
          disabled={updateMutation.isPending || !hasChanges}
          size="large"
        >
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
        {hasChanges && (
          <Button
            appearance="subtle"
            onClick={handleReset}
            disabled={updateMutation.isPending}
            size="large"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}

export default QuizEditor;
