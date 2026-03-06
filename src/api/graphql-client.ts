import { GraphQLClient } from "graphql-request";
import { API_BASE_URL, ENDPOINTS } from "../utils/constants";
import { storage } from "../utils/storage";
import { authEvents } from "../utils/auth-events";
import { refreshSessionToken } from "../utils/token-refresh";

function createGraphQLClient(): GraphQLClient {
  const client = new GraphQLClient(`${API_BASE_URL}${ENDPOINTS.GRAPHQL}`, {
    headers: {},
  });

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

export const graphqlClient = createGraphQLClient();

const isAuthError = (error: unknown): boolean => {
  if (error instanceof Response) {
    return error.status === 401;
  }
  
  if (error && typeof error === "object" && "response" in error) {
    const err = error as { response?: { status?: number } };
    if (err.response?.status === 401) {
      return true;
    }
  }

  if (error && typeof error === "object") {
    const err = error as { errors?: Array<{ extensions?: { code?: string }; message?: string }> };
    if (err.errors?.some(
      (e) => e.extensions?.code === "UNAUTHENTICATED" || 
             e.message?.toLowerCase().includes("unauthorized") ||
             e.message?.toLowerCase().includes("401")
    )) {
      return true;
    }
  }
  
  return false;
};

export async function executeGraphQLQuery<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  let retry = false;
  
  try {
    const data = await graphqlClient.request<T>(query, variables);
    return data;
  } catch (error) {
    if (!retry && isAuthError(error)) {
      retry = true;
      
      try {
        const newAccessToken = await refreshSessionToken();
        
        const headers: Record<string, string> = {
          ...(graphqlClient.requestConfig.headers || {}),
          Authorization: `Bearer ${newAccessToken}`,
        };
        
        (graphqlClient.requestConfig as { headers: Record<string, string> }).headers = headers;
        
        return await graphqlClient.request<T>(query, variables);
      } catch {
        authEvents.emit("session-expired", { reason: "graphql-auth-error" });
        throw error;
      }
    }
    
    console.error("GraphQL Query Error:", {
      query: query.substring(0, 100),
      variables,
      error,
    });
    throw error;
  }
}

export default graphqlClient;
