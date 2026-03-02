import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateQuizDraft } from "../hooks/api/useQuizzes";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../utils/constants";
import { calculatePassPercentage } from "../utils/quizScoring";
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
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { LAYOUT, TYPOGRAPHY } from "../styles/layoutRhythm";

const useStyles = makeStyles({
  page: {
    ...shorthands.padding(LAYOUT.pagePadding),
    maxWidth: LAYOUT.maxWidth.form,
    ...shorthands.margin(0, "auto"),
  },
  header: {
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.headerBottom.standard, 0),
  },
  subtitle: {
    color: TYPOGRAPHY.mutedForeground,
    display: "block",
    ...shorthands.margin(TYPOGRAPHY.spacing.subtitleTop, 0, 0, 0),
  },
  cardForm: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
  },
  gridRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: tokens.spacingHorizontalM,
  },
  actions: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
    justifyContent: "flex-end",
    ...shorthands.margin(tokens.spacingVerticalM, 0, 0, 0),
  },
});

export function CreateQuizPage() {
  const styles = useStyles();
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
  const requiredScorePercentage = calculatePassPercentage(
    formData.required_score,
    formData.question_count,
  );

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
    <main id="content" className={styles.page}>
      <header className={styles.header}>
        <Title1>Create New Quiz</Title1>
        <Body1 className={styles.subtitle}>
          Create a quiz draft from a URL. The AI will generate questions
          automatically.
        </Body1>
      </header>

      <form onSubmit={handleSubmit}>
        <AppCard className={styles.cardForm}>
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

          <div className={styles.gridRow}>
            <Field
              label="Number of Questions"
              required
              validationState={errors.question_count ? "error" : "none"}
              validationMessage={errors.question_count}
            >
              <SpinButton
                value={formData.question_count}
                onChange={(_e, data) =>
                  handleInputChange("question_count", data.value ?? 1)
                }
                min={1}
                max={50}
              />
            </Field>

            <Field
              label="Passing Score"
              required
              validationState={errors.required_score ? "error" : "none"}
              validationMessage={errors.required_score}
              hint={`${requiredScorePercentage}% of total marks (${formData.required_score}/${formData.question_count})`}
            >
              <SpinButton
                value={formData.required_score}
                onChange={(_e, data) =>
                  handleInputChange("required_score", data.value ?? 0)
                }
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
                onChange={(_e, data) =>
                  handleInputChange("attempt_limit", data.value ?? 1)
                }
                min={1}
                max={10}
              />
            </Field>
          </div>

          <div className={styles.actions}>
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
              {createQuizMutation.isPending
                ? "Creating..."
                : "Create Quiz Draft"}
            </Button>
          </div>

          {createQuizMutation.isError && (
            <MessageBar intent="error">
              <MessageBarBody>
                Failed to create quiz draft. Please try again.
              </MessageBarBody>
            </MessageBar>
          )}
        </AppCard>
      </form>
    </main>
  );
}
