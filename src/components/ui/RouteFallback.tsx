import { Body1, Spinner } from "@fluentui/react-components";

export function RouteFallback() {
  return (
    <div
      style={{
        padding: "clamp(1rem, 3vw, 2.5rem)",
        display: "flex",
        alignItems: "center",
        gap: "var(--spacingHorizontalM)",
      }}
      role="status"
      aria-live="polite"
    >
      <Spinner size="small" />
      <Body1>Loading page...</Body1>
    </div>
  );
}
