import { gql } from 'graphql-request';

// ============================================================================
// Quiz Queries
// ============================================================================

export const ALL_QUIZZES_QUERY = gql`
  query GetAllQuizzes {
    quizzes {
      id
      name
      createdByUserId
      title
      description
      questionCount
      requiredScore
      attemptLimit
      topic
      status
      url
      createdAt
      modifiedAt
    }
  }
`;

export const GET_QUIZ_QUERY = gql`
  query GetQuiz($id: ID!) {
    quiz(id: $id) {
      id
      name
      createdByUserId
      title
      description
      questionCount
      requiredScore
      attemptLimit
      topic
      status
      url
      createdAt
      modifiedAt
      questions {
        id
        title
        description
        questionType
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
      createdByUserId
      title
      description
      questionCount
      requiredScore
      attemptLimit
      topic
      status
      url
      createdAt
      modifiedAt
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
      questionCount
      requiredScore
      topic
      status
      url
      createdAt
      questions {
        id
        title
        description
        questionType
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
      createdByUserId
      title
      description
      questionCount
      requiredScore
      attemptLimit
      topic
      status
      url
      createdAt
      modifiedAt
      questions {
        id
        title
        description
        questionType
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
        quizId
        pointsEarned
        totalPossible
        passed
        attemptNumber
        submittedAt
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
        quizId
        pointsEarned
        totalPossible
        passed
        attemptNumber
        submittedAt
      }
      quiz {
        id
        name
        createdByUserId
        title
        description
        questionCount
        requiredScore
        attemptLimit
        topic
        status
        questions {
          id
          title
          description
          questionType
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
        questionId
        userSelectedOptionIds
        correctOptionIds
        isCorrect
        pointsEarned
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
      quizId
      pointsEarned
      totalPossible
      passed
      attemptNumber
      submittedAt
    }
  }
`;
