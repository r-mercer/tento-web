import { GraphQLClient } from "graphql-request";
import { API_BASE_URL, ENDPOINTS } from "../utils/constants";
import { storage } from "../utils/storage";
import { authEvents } from "../utils/auth-events";

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

  client.requestConfig.responseMiddleware = async (response) => {
    const isError = "response" in response && response.response?.status === 401;
    const hasAuthError = "errors" in response && 
      response.errors?.some(
        (e) => e.extensions?.code === "UNAUTHENTICATED" || 
               e.message?.toLowerCase().includes("unauthorized") ||
               e.message?.toLowerCase().includes("401")
      );

    if (isError || hasAuthError) {
      authEvents.emit("session-expired", { reason: "graphql-auth-error" });
    }
  };

  return client;
}

export const graphqlClient = createGraphQLClient();

export async function executeGraphQLQuery<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const data = await graphqlClient.request<T>(query, variables);
  return data;
}

export default graphqlClient;
