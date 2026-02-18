import { useEffect, useState } from "react";
import { useQuiz, useUpdateQuiz } from "../../hooks/api/useQuizzes";
import { useToast } from "../ui/ToastProvider";
import { Input, Textarea, Button } from '@fluentui/react-components';
import type { Quiz, QuizQuestion, QuizQuestionOption } from "../../types/api";

type Props = {
  quizId: string;
  onSaved?: (quiz: Quiz) => void;
};

export function QuizEditor({ quizId, onSaved }: Props) {
  const { data: quiz, isLoading } = useQuiz(quizId);
  const updateMutation = useUpdateQuiz(quizId);

  const toast = useToast();

  const [localQuiz, setLocalQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    if (quiz) setLocalQuiz(quiz);
  }, [quiz]);

  if (isLoading || !localQuiz) return <div>Loading editor...</div>;

  function updateField<K extends keyof Quiz>(key: K, value: Quiz[K]) {
    setLocalQuiz((q) => (q ? { ...q, [key]: value } : q));
  }

  function updateQuestion(index: number, patch: Partial<QuizQuestion>) {
    setLocalQuiz((q) => {
      if (!q || !q.questions) return q;
      const questions = q.questions.map((qq, i) =>
        i === index ? { ...qq, ...patch } : qq,
      );
      return { ...q, questions } as Quiz;
    });
  }

  function updateOption(qIndex: number, oIndex: number, text: string) {
    setLocalQuiz((q) => {
      if (!q || !q.questions) return q;
      const questions = q.questions.map((qq, i) => {
        if (i !== qIndex) return qq;
        const options = qq.options.map((opt, oi) =>
          oi === oIndex ? { ...opt, text } : opt,
        );
        return { ...qq, options } as QuizQuestion;
      });
      return { ...q, questions } as Quiz;
    });
  }

  async function handleSave() {
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
    } catch (err: any) {
      const msg = err?.message || "Save failed";
      toast.error(msg);
      console.error("Failed to save quiz", err);
    }
  }

  return (
    <div>
      <h2>Edit Quiz</h2>

      {/* toast notifications shown via ToastProvider */}

      <div>
        <label>Title</label>
        <Input
          value={localQuiz.title ?? ""}
          onChange={(_, v) => updateField("title", v?.value ?? "")}
        />
      </div>

      <div>
        <label>Description</label>
        <Textarea
          value={localQuiz.description ?? ""}
          onChange={(_, v) => updateField("description", v?.value ?? "")}
        />
      </div>

      <hr />

      {(localQuiz.questions || []).map((question, qi) => (
        <div
          key={question.id}
          style={{ border: "1px solid #eee", padding: 8, marginBottom: 8 }}
        >
          <div>
            <label>Question Title</label>
            <Input
              value={question.title ?? ""}
              onChange={(_, v) => updateQuestion(qi, { title: v?.value ?? "" })}
            />
          </div>

          <div>
            <label>Question Description</label>
            <Textarea
              value={question.description ?? ""}
              onChange={(_, v) => updateQuestion(qi, { description: v?.value ?? "" })}
            />
          </div>

          <div>
            <strong>Options</strong>
            {question.options?.map((opt: QuizQuestionOption, oi: number) => (
              <div key={opt.id} style={{ marginLeft: 8 }}>
                <Input
                  value={opt.text ?? ""}
                  onChange={(_, v) => updateOption(qi, oi, v?.value ?? "")}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 12 }}>
        <Button appearance="primary" onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

export default QuizEditor;
