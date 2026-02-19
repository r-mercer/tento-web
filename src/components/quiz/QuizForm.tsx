import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Spinner,
  Title1,
  Body1,
  MessageBar,
  MessageBarBody,
} from "@fluentui/react-components";
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

export function QuizForm({ quizId, onAttemptComplete }: QuizFormProps) {
  const navigate = useNavigate();

  const { data: quizForTaking, isLoading, error } = useQuizForTaking(quizId);
  const { data: quizForResults, refetch: refetchResults } = useQuizForResults(quizId, false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, string[]>>(new Map());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attempt, setAttempt] = useState<QuizAttemptResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [shouldFetchResults, setShouldFetchResults] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  const submitMutation = useSubmitQuizAttempt();

  const answeredCount = useMemo(() => {
    let count = 0;
    if (quizForTaking?.questions) {
      quizForTaking.questions.forEach((q) => {
        if (userAnswers.has(q.id)) count++;
      });
    }
    return count;
  }, [userAnswers, quizForTaking?.questions]);

  const shuffledQuestions = useMemo(() => {
    if (!quizForTaking?.questions) return [];
    const questions = [...quizForTaking.questions];

    if (attemptNumber > 1) {
      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }
    }
    return questions;
  }, [quizForTaking?.questions, attemptNumber]);

  const currentQuestionData =
    shuffledQuestions.length > 0 ? shuffledQuestions[currentQuestionIndex] : null;

  const handleAnswerChange = (optionId: string, isChecked?: boolean) => {
    if (isSubmitted || !currentQuestionData) return;

    const questionId = currentQuestionData.id;
    const currentAnswers = userAnswers.get(questionId) || [];
    let newAnswers: string[];

    if (
      currentQuestionData.question_type === "Single" ||
      currentQuestionData.question_type === "Bool"
    ) {
      newAnswers = [optionId];
    } else {
      if (isChecked) {
        newAnswers = [...currentAnswers, optionId];
      } else {
        newAnswers = currentAnswers.filter((id) => id !== optionId);
      }
    }

    setUserAnswers((prev) => new Map(prev).set(questionId, newAnswers));
  };

  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quizForTaking || !shuffledQuestions) return;

    const answers: QuestionAnswerSubmission[] = shuffledQuestions.map((question) => ({
      question_id: question.id,
      selected_option_ids: userAnswers.get(question.id) || [],
    }));

    const payload: SubmitQuizAttemptPayload = { quiz_id: quizId, answers };

    try {
      const result = await submitMutation.mutateAsync(payload);
      setAttempt(result);
      setIsSubmitted(true);
      setShouldFetchResults(true);
      setIsLoadingResults(true);
      
      // Trigger a fresh fetch of results to avoid stale data
      await refetchResults();
      
      onAttemptComplete?.(result);
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      setIsLoadingResults(false);
    }
  };

  useEffect(() => {
    if (shouldFetchResults && quizForResults && isLoadingResults) {
      setIsLoadingResults(false);
      setShowResults(true);
    }
  }, [shouldFetchResults, quizForResults, isLoadingResults]);

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers(new Map());
    setIsSubmitted(false);
    setAttempt(null);
    setShowResults(false);
    setShouldFetchResults(false);
    setIsLoadingResults(false);
    setAttemptNumber(attemptNumber + 1);
  };

  const handleReview = () => {
    navigate(ROUTES.QUIZ_HISTORY(quizId));
  };

  if (isLoading) {
    return (
      <div style={{ padding: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <Spinner size="small" />
        <Body1>Loading quiz...</Body1>
      </div>
    );
  }

  if (isLoadingResults) {
    return (
      <div style={{ padding: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <Spinner size="small" />
        <Body1>Loading results...</Body1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <MessageBar intent="error">
          <MessageBarBody>Failed to load quiz. Please try again later.</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  if (showResults && attempt && quizForResults) {
    return (
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Title1 style={{ marginBottom: "0.5rem" }}>{quizForResults.name}</Title1>
          <Body1 style={{ color: "var(--color-text-secondary)" }}>
            {quizForResults.description}
          </Body1>
        </div>
        <ResultsView
          attempt={attempt}
          quiz={quizForResults}
          onRetake={handleRetake}
          onReview={handleReview}
        />
      </div>
    );
  }

  if (!quizForTaking || !currentQuestionData) {
    return null;
  }

  const isLastQuestion = currentQuestionIndex === shuffledQuestions.length - 1;
  const userAnswerIds = userAnswers.get(currentQuestionData.id) || [];

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Title1 style={{ marginBottom: "0.5rem" }}>{quizForTaking.name}</Title1>
        <Body1 style={{ color: "var(--color-text-secondary)" }}>
          {quizForTaking.description}
        </Body1>
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

      <div style={{ display: "flex", gap: "1rem", justifyContent: "space-between", marginTop: "1.5rem" }}>
        <Button
          appearance="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        {isLastQuestion ? (
          <Button
            appearance="primary"
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Quiz"}
          </Button>
        ) : (
          <Button appearance="primary" onClick={handleNext}>
            Next
          </Button>
        )}
      </div>

      {submitMutation.isError && (
        <MessageBar intent="error" style={{ marginTop: "1rem" }}>
          <MessageBarBody>Failed to submit quiz. Please try again.</MessageBarBody>
        </MessageBar>
      )}
    </div>
  );
}
