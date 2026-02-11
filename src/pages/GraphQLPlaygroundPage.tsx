import { GraphiQL } from 'graphiql';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { storage } from '../utils/storage';
import { API_BASE_URL, ENDPOINTS } from '../utils/constants';
import 'graphiql/graphiql.css';

export function GraphQLPlaygroundPage() {
  // Create fetcher with authentication
  const fetcher = createGraphiQLFetcher({
    url: `${API_BASE_URL}${ENDPOINTS.GRAPHQL}`,
    fetch: async (input, init) => {
      const token = storage.getAccessToken();
      
      return fetch(input, {
        ...init,
        headers: {
          ...init?.headers,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
    },
  });

  return (
    <div style={{ height: '100vh' }}>
      <GraphiQL fetcher={fetcher} />
    </div>
  );
}
