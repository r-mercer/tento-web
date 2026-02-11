import { GraphQLClient } from 'graphql-request';
import { API_BASE_URL, ENDPOINTS } from '../utils/constants';
import { storage } from '../utils/storage';

// ============================================================================
// GraphQL Client Configuration
// ============================================================================

/**
 * Create a GraphQL client with dynamic authentication headers
 */
function createGraphQLClient(): GraphQLClient {
  const client = new GraphQLClient(`${API_BASE_URL}${ENDPOINTS.GRAPHQL}`, {
    headers: {},
  });

  // Add request middleware to inject authorization header
  client.requestConfig.requestMiddleware = async (request) => {
    const token = storage.getAccessToken();
    
    if (token) {
      return {
        ...request,
        headers: {
          ...request.headers,
          Authorization: `Bearer ${token}`,
        },
      };
    }
    
    return request;
  };

  return client;
}

// ============================================================================
// GraphQL Client Instance
// ============================================================================

export const graphqlClient = createGraphQLClient();

// ============================================================================
// GraphQL Query Helper
// ============================================================================

/**
 * Execute a GraphQL query with automatic token injection
 */
export async function executeGraphQLQuery<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  try {
    const data = await graphqlClient.request<T>(query, variables);
    return data;
  } catch (error) {
    console.error('GraphQL query error:', error);
    throw error;
  }
}

// ============================================================================
// Export
// ============================================================================

export default graphqlClient;
