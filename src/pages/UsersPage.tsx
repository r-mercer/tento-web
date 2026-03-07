import { Title1, Body1 } from "@fluentui/react-components";
import { pageStyles } from "../styles/pageStyles";

export function UsersPage() {
  const styles = pageStyles();

  return (
    <main id="content" className={`${styles.pageBase} ${styles.pageMax1200}`}>
      <Title1>Users</Title1>
      <Body1 style={{ marginTop: "var(--spacingVerticalS)" }}>
        Users list coming soon...
      </Body1>
    </main>
  );
}
