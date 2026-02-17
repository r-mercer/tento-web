import { gql } from 'graphql-request';

// ============================================================================
// Quiz Queries
// ============================================================================

export const ALL_QUIZZES_QUERY = gql`
  query GetAllQuizzes {
    quizzes {
      id
      name
      created_by_user_id
      title
      description
      question_count
      required_score
      attempt_limit
      topic
      status
      url
      created_at
      modified_at
    }
  }
`;

export const GET_QUIZ_QUERY = gql`
  query GetQuiz($id: ID!) {
    quiz(id: $id) {
      id
      name
      created_by_user_id
      title
      description
      question_count
      required_score
      attempt_limit
      topic
      status
      url
      created_at
      modified_at
      questions {
        id
        title
        description
        question_type
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
      created_by_user_id
      title
      description
      question_count
      required_score
      attempt_limit
      topic
      status
      url
      created_at
      modified_at
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
      question_count
      required_score
      topic
      status
      url
      created_at
      questions {
        id
        title
        description
        question_type
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
      created_by_user_id
      title
      description
      question_count
      required_score
      attempt_limit
      topic
      status
      url
      created_at
      modified_at
      questions {
        id
        title
        description
        question_type
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
        quiz_id
        points_earned
        total_possible
        passed
        attempt_number
        submitted_at
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
        quiz_id
        points_earned
        total_possible
        passed
        attempt_number
        submitted_at
      }
      quiz {
        id
        name
        created_by_user_id
        title
        description
        question_count
        required_score
        attempt_limit
        topic
        status
        questions {
          id
          title
          description
          question_type
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
        question_id
        user_selected_option_ids
        correct_option_ids
        is_correct
        points_earned
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
      quiz_id
      points_earned
      total_possible
      passed
      attempt_number
      submitted_at
    }
  }
`;
