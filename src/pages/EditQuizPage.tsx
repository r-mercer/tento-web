import React from "react";
import { useParams } from "react-router-dom";
import { QuizEditor } from "../components/quiz/QuizEditor";
import styles from "../components/quiz/quiz.module.css";

export function EditQuizPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) return <div className={styles.quizForm}>Quiz not found</div>;

  return (
    <div className={styles.quizForm}>
      <QuizEditor quizId={id} />
    </div>
  );
}

export default EditQuizPage;
