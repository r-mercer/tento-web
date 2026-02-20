import { gql } from 'graphql-request';

export const ALL_QUIZZES_QUERY = gql`
  query GetAllQuizzes {
    quizzes {
      id
      name
      created_by_user_id: createdByUserId
      title
      description
      question_count: questionCount
      required_score: requiredScore
      attempt_limit: attemptLimit
      topic
      status
      url
      created_at: createdAt
      modified_at: modifiedAt
    }
  }
`;

export const GET_QUIZ_QUERY = gql`
  query GetQuiz($id: ID!) {
    quiz(id: $id) {
      id
      name
      created_by_user_id: createdByUserId
      title
      description
      question_count: questionCount
      required_score: requiredScore
      attempt_limit: attemptLimit
      topic
      status
      url
      created_at: createdAt
      modified_at: modifiedAt
      questions {
        id
        title
        description
        question_type: questionType
        order
        topic
        options {
          id
          text
          correct
          explanation
        }
      }
    }
  }
`;

export const USER_QUIZZES_QUERY = gql`
  query GetUserQuizzes($userId: ID!) {
    userQuizzes(userId: $userId) {
      id
      name
      created_by_user_id: createdByUserId
      title
      description
      question_count: questionCount
      required_score: requiredScore
      attempt_limit: attemptLimit
      topic
      status
      url
      created_at: createdAt
      modified_at: modifiedAt
    }
  }
`;

export const QUIZ_FOR_TAKING_QUERY = gql`
  query GetQuizForTaking($id: ID!) {
    quizForTaking(id: $id) {
      id
      name
      title
      description
      question_count: questionCount
      required_score: requiredScore
      topic
      status
      url
      created_at: createdAt
      questions {
        id
        title
        description
        question_type: questionType
        option_count: optionCount
        order
        topic
        options {
          id
          text
        }
      }
    }
  }
`;

export const QUIZ_FOR_RESULTS_QUERY = gql`
  query GetQuizForResults($id: ID!) {
    quizForResults(id: $id) {
      id
      name
      created_by_user_id: createdByUserId
      title
      description
      question_count: questionCount
      required_score: requiredScore
      attempt_limit: attemptLimit
      topic
      status
      questions {
        id
        title
        description
        question_type: questionType
        order
        topic
        options {
          id
          text
          correct
          explanation
        }
      }
    }
  }
`;

export const QUIZ_ATTEMPTS_QUERY = gql`
  query GetQuizAttempts($quizId: ID, $offset: Int, $limit: Int) {
    quizAttempts(quizId: $quizId, offset: $offset, limit: $limit) {
      data {
        id
        quiz_id: quizId
        points_earned: pointsEarned
        total_possible: totalPossible
        passed
        attempt_number: attemptNumber
        submitted_at: submittedAt
      }
      pagination {
        offset
        limit
        total
      }
    }
  }
`;

export const QUIZ_ATTEMPT_QUERY = gql`
  query GetQuizAttempt($attemptId: ID!) {
    quizAttempt(attemptId: $attemptId) {
      attempt {
        id
        quiz_id: quizId
        points_earned: pointsEarned
        total_possible: totalPossible
        passed
        attempt_number: attemptNumber
        submitted_at: submittedAt
      }
      quiz {
        id
        name
        created_by_user_id: createdByUserId
        title
        description
        question_count: questionCount
        required_score: requiredScore
        attempt_limit: attemptLimit
        topic
        status
        questions {
          id
          title
          description
          question_type: questionType
          order
          options {
            id
            text
            correct
            explanation
          }
        }
      }
      questionResults {
        question_id: questionId
        user_selected_option_ids: userSelectedOptionIds
        correct_option_ids: correctOptionIds
        is_correct: isCorrect
        points_earned: pointsEarned
        explanation
      }
    }
  }
`;

// ============================================================================
// Quiz Attempt Mutations
// ============================================================================

export const SUBMIT_QUIZ_ATTEMPT_MUTATION = gql`
  mutation SubmitQuizAttempt($input: SubmitQuizAttemptInput!) {
    submitQuizAttempt(input: $input) {
      id
      quiz_id: quizId
      points_earned: pointsEarned
      total_possible: totalPossible
      passed
      attempt_number: attemptNumber
      submitted_at: submittedAt
    }
  }
`;

export const UPDATE_QUIZ_MUTATION = gql`
  mutation UpdateQuiz($input: UpdateQuizInput!) {
    updateQuiz(input: $input) {
      id
      title
      description
      questions {
        id
        title
        description
        options {
          id
          text
        }
      }
    }
  }
`;
