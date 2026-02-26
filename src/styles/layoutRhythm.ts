import { tokens } from "@fluentui/react-components";

export const LAYOUT = {
  pagePadding: "clamp(1rem, 3vw, 2.5rem)",
  navPadding: "clamp(1rem, 3vw, 2rem)",
  maxWidth: {
    narrow: "560px",
    form: "600px",
    content: "800px",
    hero: "900px",
    wide: "1200px",
    resultCard: "500px",
    dashboardActions: "460px",
  },
  grid: {
    recentCardMin: "260px",
    quizCardMin: "320px",
    statMin: "140px",
  },
} as const;

export const TYPOGRAPHY = {
  mutedForeground: tokens.colorNeutralForeground3,
  spacing: {
    titleBottom: tokens.spacingVerticalXS,
    titleBottomCompact: tokens.spacingVerticalXXS,
    subtitleTop: tokens.spacingVerticalXS,
    subtitleBottom: tokens.spacingVerticalM,
    sectionBottom: tokens.spacingVerticalM,
    subsectionBottom: tokens.spacingVerticalS,
    headerBottom: {
      compact: tokens.spacingVerticalL,
      standard: tokens.spacingVerticalXL,
    },
  },
} as const;
