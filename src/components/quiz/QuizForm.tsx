import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./quiz.module.css";
import { PrimaryButton, DefaultButton } from "@fluentui/react";
import {
  useQuizForTaking,
  useQuizForResults,
  useSubmitQuizAttempt,
} from "../../hooks/api/useQuizAttempts";
import { ProgressIndicator } from "./ProgressIndicator";
import { QuestionCard } from "./QuestionCard";
import { ResultsView } from "./ResultsView";
import { ROUTES } from "../../utils/constants";
import type {
  QuizAttemptResponse,
  SubmitQuizAttemptPayload,
  QuestionAnswerSubmission,
} from "../../types/api";

interface QuizFormProps {
  quizId: string;
  onAttemptComplete?: (attempt: QuizAttemptResponse) => void;
}

/**
 * Main quiz form component - manages all quiz state and flow
 */
export function QuizForm({ quizId, onAttemptComplete }: QuizFormProps) {
  const navigate = useNavigate();

  // Quiz data
  const { data: quizForTaking, isLoading, error } = useQuizForTaking(quizId);
  const { data: quizForResults } = useQuizForResults(
    quizId,
    false, // Initially disabled
  );

  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, string[]>>(
    new Map(),
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attempt, setAttempt] = useState<QuizAttemptResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [shouldFetchResults, setShouldFetchResults] = useState(false);

  // Submission mutation
  const submitMutation = useSubmitQuizAttempt();

  // Count answered questions
  const answeredCount = useMemo(() => {
    let count = 0;
    if (quizForTaking?.questions) {
      quizForTaking.questions.forEach((q) => {
        if (userAnswers.has(q.id)) {
          count++;
        }
      });
    }
    return count;
  }, [userAnswers, quizForTaking?.questions]);

  // Shuffle questions for subsequent attempts
  const shuffledQuestions = useMemo(() => {
    if (!quizForTaking?.questions) return [];

    const questions = [...quizForTaking.questions];

    // Only shuffle on subsequent attempts (attempt_number > 1)
    if (attemptNumber > 1) {
      // Fisher-Yates shuffle
      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }
    }

    return questions;
  }, [quizForTaking?.questions, attemptNumber]);

  // Get current question from shuffled list
  const currentQuestionData =
    shuffledQuestions.length > 0
      ? shuffledQuestions[currentQuestionIndex]
      : null;

  // Handle answer change
  const handleAnswerChange = (optionId: string, isChecked?: boolean) => {
    if (isSubmitted || !currentQuestionData) return;

    const questionId = currentQuestionData.id;
    const currentAnswers = userAnswers.get(questionId) || [];

    let newAnswers: string[];

    if (
      currentQuestionData.question_type === "Single" ||
      currentQuestionData.question_type === "Bool"
    ) {
      // Single choice or boolean - replace answer
      newAnswers = [optionId];
    } else {
      // Multi-choice - toggle answer
      if (isChecked) {
        newAnswers = [...currentAnswers, optionId];
      } else {
        newAnswers = currentAnswers.filter((id) => id !== optionId);
      }
    }

    setUserAnswers((prev) => new Map(prev).set(questionId, newAnswers));
  };

  // Handle next question
  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Handle previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!quizForTaking || !shuffledQuestions) return;

    // Build submission payload
    const answers: QuestionAnswerSubmission[] = shuffledQuestions.map(
      (question) => ({
        question_id: question.id,
        selected_option_ids: userAnswers.get(question.id) || [],
      }),
    );

    const payload: SubmitQuizAttemptPayload = {
      quiz_id: quizId,
      answers,
    };

    try {
      const result = await submitMutation.mutateAsync(payload);
      setAttempt(result);
      setIsSubmitted(true);
      setShouldFetchResults(true);
      onAttemptComplete?.(result);
    } catch (err) {
      console.error("Failed to submit quiz:", err);
    }
  };

  // Enable results fetching after submission
  useEffect(() => {
    if (shouldFetchResults && quizForResults) {
      setShowResults(true);
    }
  }, [shouldFetchResults, quizForResults]);

  // Handle retake
  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers(new Map());
    setIsSubmitted(false);
    setAttempt(null);
    setShowResults(false);
    setShouldFetchResults(false);
    setAttemptNumber(attemptNumber + 1);
  };

  // Handle review
  const handleReview = () => {
    navigate(ROUTES.QUIZ_HISTORY(quizId));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.quizForm}>
        <div className={styles.loadingSpinner}>Loading quiz...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.quizForm}>
        <div className={styles.errorMessage}>
          Failed to load quiz. Please try again later.
        </div>
      </div>
    );
  }

  // Results view after submission
  if (showResults && attempt && quizForResults) {
    return (
      <div className={styles.quizForm}>
        <div className={styles.quizFormContainer}>
          <div className={styles.quizFormHeader}>
            <h1 className={styles.quizFormTitle}>{quizForResults.name}</h1>
            <p className={styles.quizFormDescription}>
              {quizForResults.description}
            </p>
          </div>
          <ResultsView
            attempt={attempt}
            quiz={quizForResults}
            onRetake={handleRetake}
            onReview={handleReview}
          />
        </div>
      </div>
    );
  }

  // Quiz form - taking state
  if (!quizForTaking || !currentQuestionData) {
    return null;
  }

  const isLastQuestion = currentQuestionIndex === shuffledQuestions.length - 1;
  const userAnswerIds = userAnswers.get(currentQuestionData.id) || [];

  return (
    <div className={styles.quizForm}>
      <div className={styles.quizFormContainer}>
        <div className={styles.quizFormHeader}>
          <h1 className={styles.quizFormTitle}>{quizForTaking.name}</h1>
          <p className={styles.quizFormDescription}>
            {quizForTaking.description}
          </p>
        </div>

        <ProgressIndicator
          current={currentQuestionIndex + 1}
          total={shuffledQuestions.length}
          answered={answeredCount}
        />

        <QuestionCard
          question={currentQuestionData}
          userAnswerIds={userAnswerIds}
          isSubmitted={false}
          onAnswerChange={handleAnswerChange}
        />

        <div className={styles.navigationButtons}>
          <DefaultButton
            className={`${styles.button} ${styles["button--secondary"]}`}
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            type="button"
          >
            Previous
          </DefaultButton>

          {isLastQuestion ? (
            <PrimaryButton
              className={`${styles.button} ${styles["button--primary"]}`}
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              type="button"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Quiz"}
            </PrimaryButton>
          ) : (
            <PrimaryButton
              className={`${styles.button} ${styles["button--primary"]}`}
              onClick={handleNext}
              type="button"
            >
              Next
            </PrimaryButton>
          )}
        </div>

        {submitMutation.isError && (
          <div className={styles.errorMessage}>
            Failed to submit quiz. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}
