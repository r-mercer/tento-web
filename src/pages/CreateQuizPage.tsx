import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateQuizDraft } from "../hooks/api/useQuizzes";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../utils/constants";
import { AppCard } from "../components/ui/AppCard";
import type { CreateQuizDraftRequest } from "../types/api";
import {
  Field,
  Input,
  SpinButton,
  Button,
  Title1,
  Body1,
  MessageBar,
  MessageBarBody,
} from "@fluentui/react-components";

export function CreateQuizPage() {
  const navigate = useNavigate();
  const createQuizMutation = useCreateQuizDraft();
  const { user } = useAuth();

  const [formData, setFormData] = useState<CreateQuizDraftRequest>({
    name: "",
    created_by_user_id: user?.id || "",
    question_count: 5,
    required_score: 3,
    attempt_limit: 3,
    url: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateQuizDraftRequest, string>>
  >({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateQuizDraftRequest, string>> = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "Quiz name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Quiz name must be 100 characters or less";
    }

    if (formData.question_count < 1) {
      newErrors.question_count = "Must have at least 1 question";
    } else if (formData.question_count > 50) {
      newErrors.question_count = "Cannot exceed 50 questions";
    }

    if (formData.required_score < 0) {
      newErrors.required_score = "Required score cannot be negative";
    } else if (formData.required_score > formData.question_count) {
      newErrors.required_score = "Required score cannot exceed question count";
    }

    if (formData.attempt_limit < 1) {
      newErrors.attempt_limit = "Must allow at least 1 attempt";
    } else if (formData.attempt_limit > 10) {
      newErrors.attempt_limit = "Cannot exceed 10 attempts";
    }

    if (!formData.url || formData.url.trim().length === 0) {
      newErrors.url = "URL is required";
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = "Must be a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createQuizMutation.mutateAsync(formData);
      navigate(ROUTES.QUIZZES);
    } catch (error) {
      console.error("Failed to create quiz draft:", error);
    }
  };

  const handleInputChange = (
    field: keyof CreateQuizDraftRequest,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem" }}>
        <Title1>Create New Quiz</Title1>
        <Body1
          style={{ color: "var(--color-text-secondary)", display: "block", marginTop: "0.5rem" }}
        >
          Create a quiz draft from a URL. The AI will generate questions automatically.
        </Body1>
      </header>

      <form onSubmit={handleSubmit}>
        <AppCard style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <Field
            label="Quiz Name"
            required
            validationState={errors.name ? "error" : "none"}
            validationMessage={errors.name}
            hint="Give your quiz a descriptive name (max 100 characters)"
          >
            <Input
              value={formData.name}
              onChange={(_e, data) => handleInputChange("name", data.value)}
              placeholder="e.g., React Fundamentals Quiz"
              maxLength={100}
            />
          </Field>

          <Field
            label="Source URL"
            required
            validationState={errors.url ? "error" : "none"}
            validationMessage={errors.url}
            hint="Provide a URL for the AI to generate quiz questions from"
          >
            <Input
              type="url"
              value={formData.url}
              onChange={(_e, data) => handleInputChange("url", data.value)}
              placeholder="https://example.com/article"
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            <Field
              label="Number of Questions"
              required
              validationState={errors.question_count ? "error" : "none"}
              validationMessage={errors.question_count}
            >
              <SpinButton
                value={formData.question_count}
                onChange={(_e, data) => handleInputChange("question_count", data.value ?? 1)}
                min={1}
                max={50}
              />
            </Field>

            <Field
              label="Passing Score"
              required
              validationState={errors.required_score ? "error" : "none"}
              validationMessage={errors.required_score}
            >
              <SpinButton
                value={formData.required_score}
                onChange={(_e, data) => handleInputChange("required_score", data.value ?? 0)}
                min={0}
                max={formData.question_count}
              />
            </Field>

            <Field
              label="Attempt Limit"
              required
              validationState={errors.attempt_limit ? "error" : "none"}
              validationMessage={errors.attempt_limit}
            >
              <SpinButton
                value={formData.attempt_limit}
                onChange={(_e, data) => handleInputChange("attempt_limit", data.value ?? 1)}
                min={1}
                max={10}
              />
            </Field>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
            <Button
              appearance="secondary"
              onClick={() => navigate(ROUTES.QUIZZES)}
              disabled={createQuizMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              appearance="primary"
              type="submit"
              disabled={createQuizMutation.isPending}
            >
              {createQuizMutation.isPending ? "Creating..." : "Create Quiz Draft"}
            </Button>
          </div>

          {createQuizMutation.isError && (
            <MessageBar intent="error">
              <MessageBarBody>Failed to create quiz draft. Please try again.</MessageBarBody>
            </MessageBar>
          )}
        </AppCard>
      </form>
    </div>
  );
}
