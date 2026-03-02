import { GraphiQL } from "graphiql";
import { createGraphiQLFetcher } from "@graphiql/toolkit";
import { makeStyles } from "@fluentui/react-components";
import { storage } from "../utils/storage";
import { API_BASE_URL, ENDPOINTS } from "../utils/constants";
import "graphiql/graphiql.css";

const useStyles = makeStyles({
  root: {
    height: "100vh",
  },
});

export function GraphQLPlaygroundPage() {
  const styles = useStyles();
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
    <main id="content" className={styles.root}>
      <GraphiQL fetcher={fetcher} />
    </main>
  );
}
