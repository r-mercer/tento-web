import { useParams } from "react-router-dom";
import { QuizEditor } from "../components/quiz/QuizEditor";
import styles from "../components/quiz/quiz.module.css";

export function EditQuizPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) return <main id="content" className={styles.quizForm}>Quiz not found</main>;

  return (
    <main id="content" className={styles.quizForm}>
      <QuizEditor quizId={id} />
    </main>
  );
}

export default EditQuizPage;
