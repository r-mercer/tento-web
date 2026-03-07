import { makeStyles } from "@fluentui/react-components";
import { LAYOUT } from "./layoutRhythm";

export const pageStyles = makeStyles({
  pageBase: {
    padding: LAYOUT.pagePadding,
    margin: "0 auto",
  },
  pageMax560: {
    maxWidth: LAYOUT.maxWidth.narrow,
  },
  pageMax900: {
    maxWidth: LAYOUT.maxWidth.hero,
  },
  pageMax1200: {
    maxWidth: LAYOUT.maxWidth.wide,
  },
  pageMax800: {
    maxWidth: LAYOUT.maxWidth.content,
  },
  centeredColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "var(--spacingVerticalM)",
    minHeight: "100vh",
    justifyContent: "center",
  },
});
