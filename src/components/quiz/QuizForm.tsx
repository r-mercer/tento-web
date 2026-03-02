import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Title1,
  Body1,
  MessageBar,
  MessageBarBody,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import { LAYOUT, TYPOGRAPHY } from "../../styles/layoutRhythm";
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

const useStyles = makeStyles({
  loadingRow: {
    ...shorthands.padding(LAYOUT.pagePadding),
    display: "flex",
    flexDirection: "column",
    gap: TYPOGRAPHY.spacing.sectionBottom,
  },
  loadingCard: {
    width: "100%",
    maxWidth: LAYOUT.maxWidth.content,
    ...shorthands.padding(tokens.spacingHorizontalL),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backgroundColor: tokens.colorNeutralBackground2,
    display: "flex",
    flexDirection: "column",
    gap: TYPOGRAPHY.spacing.subtitleTop,
  },
  skeletonLine: {
    height: "12px",
    width: "100%",
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  },
  skeletonLineShort: {
    height: "12px",
    width: "45%",
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  },
  skeletonAnswerRow: {
    display: "flex",
    flexDirection: "column",
    gap: TYPOGRAPHY.spacing.subtitleTop,
    ...shorthands.margin(TYPOGRAPHY.spacing.subtitleTop, 0, 0, 0),
  },
  page: {
    ...shorthands.padding(LAYOUT.pagePadding),
    maxWidth: LAYOUT.maxWidth.content,
    ...shorthands.margin(0, "auto"),
  },
  header: {
    ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.headerBottom.compact, 0),
  },
  title: { ...shorthands.margin(0, 0, TYPOGRAPHY.spacing.titleBottom, 0) },
  mutedText: { color: TYPOGRAPHY.mutedForeground },
  smallErrorDetail: {
    ...shorthands.margin(tokens.spacingVerticalXXS, 0, 0, 0),
    fontSize: tokens.fontSizeBase200,
  },
  messageBottom: { ...shorthands.margin(0, 0, tokens.spacingVerticalM, 0) },
  navActions: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
    justifyContent: "space-between",
    ...shorthands.margin(tokens.spacingVerticalL, 0, 0, 0),
  },
  messageTop: { ...shorthands.margin(tokens.spacingVerticalM, 0, 0, 0) },
});

export function QuizForm({ quizId, onAttemptComplete }: QuizFormProps) {
  const styles = useStyles();
  const navigate = useNavigate();

  const { data: quizForTaking, isLoading, error } = useQuizForTaking(quizId);
  const {
    data: quizForResults,
    refetch: refetchResults,
    error: resultsError,
  } = useQuizForResults(quizId, false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, string[]>>(() => {
    if (typeof window === "undefined") return new Map();
    try {
      const saved = localStorage.getItem(`quiz-progress-${quizId}`);
      return saved ? new Map(JSON.parse(saved)) : new Map();
    } catch {
      return new Map();
    }
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attempt, setAttempt] = useState<QuizAttemptResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [shouldFetchResults, setShouldFetchResults] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitMutation = useSubmitQuizAttempt();

  // Debug logging
  console.log("[QuizForm] quizForTaking:", quizForTaking);
  console.log("[QuizForm] questions:", quizForTaking?.questions);
  console.log(
    "[QuizForm] question types:",
    quizForTaking?.questions?.map((q) => q.questionType),
  );
  console.log("[QuizForm] quizForResults:", quizForResults);
  console.log("[QuizForm] isLoadingResults:", isLoadingResults);
  console.log("[QuizForm] resultsError:", resultsError);

  // Persist answers to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && userAnswers.size > 0) {
      localStorage.setItem(
        `quiz-progress-${quizId}`,
        JSON.stringify(Array.from(userAnswers.entries())),
      );
    }
  }, [userAnswers, quizId]);

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
    shuffledQuestions.length > 0
      ? shuffledQuestions[currentQuestionIndex]
      : null;

  const handleAnswerChange = (optionId: string, isChecked?: boolean) => {
    if (isSubmitted || !currentQuestionData) return;

    const questionId = currentQuestionData.id;
    const currentAnswers = userAnswers.get(questionId) || [];
    let newAnswers: string[];

    if (
      currentQuestionData.questionType === "Single" ||
      currentQuestionData.questionType === "Bool"
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

  const handleSubmitClick = () => {
    if (!quizForTaking || !shuffledQuestions) return;

    const unansweredCount = shuffledQuestions.length - answeredCount;
    if (unansweredCount > 0) {
      setShowSubmitDialog(true);
    } else {
      executeSubmit();
    }
  };

  const executeSubmit = async () => {
    if (!quizForTaking || !shuffledQuestions) return;

    setShowSubmitDialog(false);

    const answers: QuestionAnswerSubmission[] = shuffledQuestions.map(
      (question) => ({
        questionId: question.id,
        selectedOptionIds: userAnswers.get(question.id) || [],
      }),
    );

    const payload: SubmitQuizAttemptPayload = { quizId: quizId, answers };

    console.log("[QuizForm] Submitting payload:", payload);

    setSubmitError(null);

    try {
      const result = await submitMutation.mutateAsync(payload);
      setAttempt(result);
      setIsSubmitted(true);
      setShouldFetchResults(true);
      setIsLoadingResults(true);

      // Clear localStorage on successful submission
      localStorage.removeItem(`quiz-progress-${quizId}`);

      // Trigger a fresh fetch of results to avoid stale data
      await refetchResults();

      onAttemptComplete?.(result);
    } catch (err: unknown) {
      console.error("Failed to submit quiz:", err);
      setIsLoadingResults(false);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to submit quiz. Please try again.";
      setSubmitError(errorMessage);
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
    // Clear localStorage when retaking
    localStorage.removeItem(`quiz-progress-${quizId}`);
  };

  const handleReview = () => {
    navigate(ROUTES.QUIZ_HISTORY(quizId));
  };

  if (isLoading) {
    return (
      <div className={styles.loadingRow} role="status" aria-live="polite">
        <Body1 className={styles.mutedText}>Loading quiz...</Body1>
        <div className={styles.loadingCard} aria-hidden="true">
          <div className={styles.skeletonLineShort} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonAnswerRow}>
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingResults) {
    return (
      <div className={styles.loadingRow} role="status" aria-live="polite">
        <Body1 className={styles.mutedText}>Loading results...</Body1>
        <div className={styles.loadingCard} aria-hidden="true">
          <div className={styles.skeletonLineShort} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Quiz loading error:", error);
    return (
      <main className={styles.page}>
        <MessageBar intent="error" aria-live="assertive">
          <MessageBarBody>
            Failed to load quiz. Please try again later.
            {error?.message && (
              <div className={styles.smallErrorDetail}>
                Error: {error.message}
              </div>
            )}
          </MessageBarBody>
        </MessageBar>
      </main>
    );
  }

  if (showResults && attempt && quizForResults) {
    return (
      <main className={styles.page} aria-labelledby="quiz-results-title">
        <div className={styles.header}>
          <Title1 id="quiz-results-title" className={styles.title}>
            {quizForResults.name}
          </Title1>
          <Body1 className={styles.mutedText}>
            {quizForResults.description}
          </Body1>
        </div>
        <ResultsView
          attempt={attempt}
          quiz={quizForResults}
          onRetake={handleRetake}
          onReview={handleReview}
        />
      </main>
    );
  }

  if (!quizForTaking || !currentQuestionData) {
    return null;
  }

  const isLastQuestion = currentQuestionIndex === shuffledQuestions.length - 1;
  const userAnswerIds = userAnswers.get(currentQuestionData.id) || [];
  const unansweredCount = shuffledQuestions.length - answeredCount;

  return (
    <>
      <Dialog
        open={showSubmitDialog}
        onOpenChange={(_, data) => setShowSubmitDialog(data.open)}
      >
        <DialogSurface>
          <DialogTitle>Unanswered Questions</DialogTitle>
          <DialogBody>
            You have {unansweredCount} unanswered question
            {unansweredCount === 1 ? "" : "s"}. Are you sure you want to submit?
          </DialogBody>
          <DialogActions>
            <Button
              appearance="outline"
              onClick={() => setShowSubmitDialog(false)}
            >
              Continue Editing
            </Button>
            <Button appearance="primary" onClick={executeSubmit}>
              Submit Anyway
            </Button>
          </DialogActions>
        </DialogSurface>
      </Dialog>

      <main className={styles.page} aria-labelledby="quiz-taking-title">
        <div className={styles.header}>
          <Title1 id="quiz-taking-title" className={styles.title}>
            {quizForTaking.name}
          </Title1>
          <Body1 className={styles.mutedText}>
            {quizForTaking.description}
          </Body1>
        </div>

        <ProgressIndicator
          current={currentQuestionIndex + 1}
          total={shuffledQuestions.length}
          answered={answeredCount}
        />

        {submitError && (
          <MessageBar
            intent="error"
            className={styles.messageBottom}
            aria-live="assertive"
          >
            <MessageBarBody>{submitError}</MessageBarBody>
          </MessageBar>
        )}

        <QuestionCard
          question={currentQuestionData}
          userAnswerIds={userAnswerIds}
          isSubmitted={false}
          onAnswerChange={handleAnswerChange}
        />

        <div className={styles.navActions}>
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
              onClick={handleSubmitClick}
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
          <MessageBar
            intent="error"
            className={styles.messageTop}
            aria-live="assertive"
          >
            <MessageBarBody>
              Failed to submit quiz. Please try again.
            </MessageBarBody>
          </MessageBar>
        )}
      </main>
    </>
  );
}
