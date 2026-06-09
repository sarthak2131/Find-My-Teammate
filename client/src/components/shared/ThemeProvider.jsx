import useTheme from "../../hooks/useTheme";

/** Applies saved theme to document on every route (including auth pages). */
export default function ThemeProvider({ children }) {
  useTheme();
  return children;
}
