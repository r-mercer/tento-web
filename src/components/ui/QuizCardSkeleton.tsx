import { AppCard } from "./AppCard";
import { LAYOUT } from "../../styles/layoutRhythm";

interface QuizCardSkeletonProps {
  count?: number;
}

export function QuizCardSkeleton({ count = 3 }: QuizCardSkeletonProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(${LAYOUT.grid.recentCardMin}, 1fr))`,
        gap: "var(--spacingHorizontalL)",
        marginTop: "var(--spacingVerticalM)",
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading quizzes"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <AppCard
          key={index}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacingVerticalM)",
            minHeight: "180px",
          }}
          aria-hidden="true"
        >
          <div
            style={{
              height: "12px",
              width: "55%",
              backgroundColor: "var(--colorNeutralBackground3)",
              borderRadius: "var(--borderRadiusMedium)",
            }}
          />
          <div
            style={{
              height: "12px",
              width: "100%",
              backgroundColor: "var(--colorNeutralBackground3)",
              borderRadius: "var(--borderRadiusMedium)",
            }}
          />
          <div
            style={{
              height: "10px",
              width: "35%",
              backgroundColor: "var(--colorNeutralBackground3)",
              borderRadius: "var(--borderRadiusMedium)",
            }}
          />
          <div style={{ display: "flex", gap: "var(--spacingHorizontalS)", marginTop: "auto" }}>
            <div
              style={{
                height: "32px",
                flex: 1,
                backgroundColor: "var(--colorNeutralBackground3)",
                borderRadius: "var(--borderRadiusMedium)",
              }}
            />
            <div
              style={{
                height: "32px",
                flex: 1,
                backgroundColor: "var(--colorNeutralBackground3)",
                borderRadius: "var(--borderRadiusMedium)",
              }}
            />
          </div>
        </AppCard>
      ))}
    </div>
  );
}
