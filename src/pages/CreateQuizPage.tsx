import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateQuizDraft } from "../hooks/api/useQuizzes";
import { ROUTES } from "../utils/constants";
import styles from "./CreateQuizPage.module.css";
import type { CreateQuizDraftRequest } from "../types/api";

export function CreateQuizPage() {
  const navigate = useNavigate();
  const createQuizMutation = useCreateQuizDraft();

  const [formData, setFormData] = useState<CreateQuizDraftRequest>({
    name: "",
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
      const createdQuiz = await createQuizMutation.mutateAsync(formData);

      // Navigate to the quiz detail or quizzes list
      navigate(ROUTES.QUIZ_DETAIL(createdQuiz.id));
    } catch (error) {
      console.error("Failed to create quiz draft:", error);
    }
  };

  const handleInputChange = (
    field: keyof CreateQuizDraftRequest,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className={styles.createQuizPage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Create New Quiz</h1>
          <p className={styles.subtitle}>
            Create a quiz draft from a URL. The AI will generate questions
            automatically.
          </p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Quiz Name <span className={styles.required}>*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
              placeholder="e.g., React Fundamentals Quiz"
              maxLength={100}
            />
            {errors.name && (
              <span className={styles.errorText}>{errors.name}</span>
            )}
            <span className={styles.helperText}>
              Give your quiz a descriptive name (max 100 characters)
            </span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="url" className={styles.label}>
              Source URL <span className={styles.required}>*</span>
            </label>
            <input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => handleInputChange("url", e.target.value)}
              className={`${styles.input} ${errors.url ? styles.inputError : ""}`}
              placeholder="https://example.com/article"
            />
            {errors.url && (
              <span className={styles.errorText}>{errors.url}</span>
            )}
            <span className={styles.helperText}>
              Provide a URL for the AI to generate quiz questions from
            </span>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="question_count" className={styles.label}>
                Number of Questions <span className={styles.required}>*</span>
              </label>
              <input
                id="question_count"
                type="number"
                min="1"
                max="50"
                value={formData.question_count}
                onChange={(e) =>
                  handleInputChange("question_count", parseInt(e.target.value))
                }
                className={`${styles.input} ${errors.question_count ? styles.inputError : ""}`}
              />
              {errors.question_count && (
                <span className={styles.errorText}>
                  {errors.question_count}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="required_score" className={styles.label}>
                Passing Score <span className={styles.required}>*</span>
              </label>
              <input
                id="required_score"
                type="number"
                min="0"
                max={formData.question_count}
                value={formData.required_score}
                onChange={(e) =>
                  handleInputChange("required_score", parseInt(e.target.value))
                }
                className={`${styles.input} ${errors.required_score ? styles.inputError : ""}`}
              />
              {errors.required_score && (
                <span className={styles.errorText}>
                  {errors.required_score}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="attempt_limit" className={styles.label}>
                Attempt Limit <span className={styles.required}>*</span>
              </label>
              <input
                id="attempt_limit"
                type="number"
                min="1"
                max="10"
                value={formData.attempt_limit}
                onChange={(e) =>
                  handleInputChange("attempt_limit", parseInt(e.target.value))
                }
                className={`${styles.input} ${errors.attempt_limit ? styles.inputError : ""}`}
              />
              {errors.attempt_limit && (
                <span className={styles.errorText}>{errors.attempt_limit}</span>
              )}
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => navigate(ROUTES.QUIZZES)}
              className={styles.buttonSecondary}
              disabled={createQuizMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.buttonPrimary}
              disabled={createQuizMutation.isPending}
            >
              {createQuizMutation.isPending
                ? "Creating..."
                : "Create Quiz Draft"}
            </button>
          </div>

          {createQuizMutation.isError && (
            <div className={styles.errorMessage}>
              Failed to create quiz draft. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
